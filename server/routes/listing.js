const router = require("express").Router();
const mongoose = require("mongoose");
const { uploadToS3, deleteS3Photos } = require("../config/s3");
const verifyToken = require("../middleware/auth");
const Listing = require("../models/Listing");

const upload = uploadToS3("properties");
const MAX_PHOTOS = 15;
const HOST_FIELDS = "username profileImagePath";
const FIELDS = [
  "category", "type", "streetAddress", "aptSuite", "city", "province", "country",
  "guestCount", "bedroomCount", "bedCount", "bathroomCount",
  "title", "description", "highlight", "price",
];

const uploadPhotos = (req, res, next) =>
  upload.array("listingPhotos", MAX_PHOTOS)(req, res, (err) => {
    if (!err) return next();
    console.error("Upload error:", err);
    const known = {
      LIMIT_FILE_SIZE: "Each photo must be under 10 MB.",
      LIMIT_UNEXPECTED_FILE: `You can upload up to ${MAX_PHOTOS} photos.`,
    };
    res.status(400).json({ message: known[err.code] || err.message || "Photo upload failed." });
  });

const photoPath = (file) => file.location || `/uploads/${file.filename}`;
const toArray = (value) => [].concat(value || []);
const pickFields = (body) =>
  Object.fromEntries(FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const errorStatus = (err) => (["ValidationError", "CastError"].includes(err.name) ? 400 : 500);

router.param("listingId", (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(404).json({ message: "Property not found!" })
);

router.post("/create", verifyToken, uploadPhotos, async (req, res) => {
  const newPaths = (req.files || []).map(photoPath);
  try {
    if (newPaths.length === 0) {
      return res.status(400).json({ message: "Please upload at least one photo." });
    }
    const listing = await Listing.create({
      ...pickFields(req.body),
      creator: req.user.id,
      amenities: toArray(req.body.amenities),
      listingPhotoPaths: newPaths,
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error("Create error:", err);
    await deleteS3Photos(newPaths);
    const status = errorStatus(err);
    res.status(status).json({
      message: status === 400 ? err.message : "Failed to create property!",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = req.query.category ? { category: String(req.query.category) } : {};
    res.json(await Listing.find(filter).populate("creator", HOST_FIELDS));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch properties!" });
  }
});

router.get("/search/:search", async (req, res) => {
  try {
    const { search } = req.params;
    if (search === "all") {
      return res.json(await Listing.find().populate("creator", HOST_FIELDS));
    }
    const regex = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const listings = await Listing.find({
      $or: [{ category: regex }, { title: regex }, { city: regex }, { province: regex }, { country: regex }],
    }).populate("creator", HOST_FIELDS);
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch properties!" });
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId).populate("creator", HOST_FIELDS);
    if (!listing) return res.status(404).json({ message: "Property not found!" });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch property details!" });
  }
});

router.put("/:listingId", verifyToken, uploadPhotos, async (req, res) => {
  const newPaths = (req.files || []).map(photoPath);
  const reject = async (status, message) => {
    await deleteS3Photos(newPaths);
    return res.status(status).json({ message });
  };

  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return reject(404, "Property not found!");
    if (listing.creator?.toString() !== req.user.id) {
      return reject(403, "You are not authorized to edit this listing.");
    }

    let requested = [];
    try {
      requested = JSON.parse(req.body.existingPhotos || "[]");
    } catch {
      requested = [];
    }

    const keptPhotos = (Array.isArray(requested) ? requested : []).filter((photo) =>
      listing.listingPhotoPaths.includes(photo)
    );
    const removedPhotos = listing.listingPhotoPaths.filter((photo) => !keptPhotos.includes(photo));
    const photos = [...keptPhotos, ...newPaths];

    if (photos.length === 0) return reject(400, "At least one photo is required.");

    Object.assign(listing, pickFields(req.body), {
      amenities: toArray(req.body.amenities),
      listingPhotoPaths: photos,
    });
    await listing.save();
    await deleteS3Photos(removedPhotos);

    res.json({ message: "Listing updated successfully", listing });
  } catch (err) {
    console.error("Update error:", err);
    await deleteS3Photos(newPaths);
    const status = errorStatus(err);
    res.status(status).json({
      message: status === 400 ? err.message : "Failed to update property details!",
    });
  }
});

router.delete("/:listingId", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Property not found!" });
    if (listing.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this listing." });
    }
    await listing.deleteOne();
    await deleteS3Photos(listing.listingPhotoPaths);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete property!" });
  }
});

module.exports = router;
