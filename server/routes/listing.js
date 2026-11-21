const router = require("express").Router();
const mongoose = require("mongoose");
const { uploadToS3, deleteS3Photos } = require("../config/s3");
const verifyToken = require("../middleware/auth");
const Listing = require("../models/Listing");

const upload = uploadToS3("properties");
const MAX_PHOTOS = 15;
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
const toArray = (v) => [].concat(v || []);
const pickFields = (body) =>
  Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const errorStatus = (err) => (["ValidationError", "CastError"].includes(err.name) ? 400 : 500);

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
    const filter = req.query.category ? { category: req.query.category } : {};
    const listings = await Listing.find(filter).populate("creator", "-password");
    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch properties!" });
  }
});

router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  try {
    if (search === "all") {
      return res.status(200).json(await Listing.find().populate("creator", "-password"));
    }
    const regex = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const listings = await Listing.find({
      $or: [{ category: regex }, { title: regex }, { city: regex }, { province: regex }, { country: regex }],
    }).populate("creator", "-password");
    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch properties!" });
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(404).json({ message: "Property not found!" });
    }
    const listing = await Listing.findById(listingId).populate("creator", "-password");
    if (!listing) return res.status(404).json({ message: "Property not found!" });
    res.status(200).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch property details!" });
  }
});

router.put("/:listingId", verifyToken, uploadPhotos, async (req, res) => {
  const newPaths = (req.files || []).map(photoPath);
  try {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
      await deleteS3Photos(newPaths);
      return res.status(404).json({ message: "Property not found!" });
    }
    const listing = await Listing.findById(listingId);
    if (!listing) {
      await deleteS3Photos(newPaths);
      return res.status(404).json({ message: "Property not found!" });
    }
    if (listing.creator?.toString() !== req.user.id) {
      await deleteS3Photos(newPaths);
      return res.status(403).json({ message: "You are not authorized to edit this listing." });
    }

    let requested = [];
    try {
      requested = JSON.parse(req.body.existingPhotos || "[]");
    } catch {
      requested = [];
    }

    const keptPhotos = (Array.isArray(requested) ? requested : []).filter((p) =>
      listing.listingPhotoPaths.includes(p)
    );
    const removedPhotos = listing.listingPhotoPaths.filter((p) => !keptPhotos.includes(p));
    const photos = [...keptPhotos, ...newPaths];

    if (photos.length === 0) {
      return res.status(400).json({ message: "At least one photo is required." });
    }

    Object.assign(listing, pickFields(req.body), {
      amenities: toArray(req.body.amenities),
      listingPhotoPaths: photos,
    });
    await listing.save();
    await deleteS3Photos(removedPhotos); // only after the DB save succeeded

    res.status(200).json({ message: "Listing updated successfully", listing });
  } catch (err) {
    console.error("PUT error:", err);
    await deleteS3Photos(newPaths);
    const status = errorStatus(err);
    res.status(status).json({
      message: status === 400 ? err.message : "Failed to update property details!",
    });
  }
});

router.delete("/:listingId", verifyToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(404).json({ message: "Property not found!" });
    }
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Property not found!" });
    if (listing.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this listing." });
    }
    await Listing.findByIdAndDelete(listingId);
    await deleteS3Photos(listing.listingPhotoPaths);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete property!" });
  }
});

module.exports = router;