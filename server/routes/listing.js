const router = require("express").Router();
const mongoose = require("mongoose");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { uploadToS3, s3 } = require("../config/s3");
const verifyToken = require("../middleware/auth");

const Listing = require("../models/Listing");

const upload = uploadToS3("properties");

router.post("/create", verifyToken, upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, title, description, highlight, price,
    } = req.body;

    const amenityList = [].concat(amenities || []);

    const listingPhotos = req.files;

    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const listingPhotoPaths = listingPhotos.map(
      (file) => file.location || `/uploads/${file.filename}`
    );

    const newListing = new Listing({
      creator: req.user.id, category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities: amenityList, listingPhotoPaths, title, description, highlight, price,
    });

    await newListing.save();
    res.status(200).json(newListing);
  } catch (err) {
    res.status(409).json({ message: "Failed to create Property!", error: err.message });
    console.log(err);
  }
});

router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    const listings = qCategory
      ? await Listing.find({ category: qCategory }).populate("creator", "-password")
      : await Listing.find().populate("creator", "-password");
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch property!", error: err.message });
    console.error(err);
  }
});

router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  try {
    if (search === "all") {
      const listings = await Listing.find().populate("creator", "-password");
      return res.status(200).json(listings);
    }

    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = { $regex: safeSearch, $options: "i" };

    const listings = await Listing.find({
      $or: [
        { category: regex },
        { title: regex },
        { city: regex },
        { province: regex },
        { country: regex },
      ],
    }).populate("creator", "-password");

    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch property!", error: err.message });
    console.error(err);
  }
});

router.get("/:listingId", async (req, res) => {
  const { listingId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(404).json({ message: "Property not found!" });
    }
    const listing = await Listing.findById(listingId).populate("creator", "-password");
    if (!listing) {
      return res.status(404).json({ message: "Property not found!" });
    }
    res.status(200).json(listing);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Property not found!" });
    }
    res.status(500).json({ message: "Failed to fetch property details!", error: err.message });
  }
});

router.put("/:listingId", verifyToken, upload.array("listingPhotos"), async (req, res) => {
  const { listingId } = req.params;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Property not found!" });
    }

    if (listing.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to edit this listing." });
    }

    let keptPhotos = [];
    if (req.body.existingPhotos) {
      try {
        keptPhotos = Array.isArray(req.body.existingPhotos)
          ? req.body.existingPhotos
          : JSON.parse(req.body.existingPhotos);
      } catch {
        keptPhotos = [];
      }
    }

    const removedPhotos = listing.listingPhotoPaths.filter(
      (url) => !keptPhotos.includes(url)
    );

    if (process.env.S3_BUCKET_NAME && removedPhotos.length > 0) {
      const s3Photos = removedPhotos.filter(
        (url) => typeof url === "string" && url.includes(".amazonaws.com/")
      );
      const deletePromises = s3Photos.map((photoUrl) => {
        const rawKey = photoUrl.split(".amazonaws.com/")[1]?.split("?")[0];
        const key = rawKey ? decodeURIComponent(rawKey) : null;
        if (!key) return Promise.resolve();
        return s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          })
        );
      });
      await Promise.allSettled(deletePromises).catch((err) =>
        console.error("S3 deletion warning:", err)
      );
    }

    const newPhotoPaths =
      req.files && req.files.length > 0
        ? req.files.map((file) => file.location || `/uploads/${file.filename}`)
        : [];

    const updatedPhotoPaths = [...keptPhotos, ...newPhotoPaths];

    if (updatedPhotoPaths.length === 0) {
      return res.status(400).json({ message: "At least one photo is required." });
    }

    const {
      category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, title, description, highlight, price,
    } = req.body;
    const amenityList = [].concat(amenities || []);
    Object.assign(listing, {
      category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities: amenityList, title, description, highlight, price,
      listingPhotoPaths: updatedPhotoPaths,
    });

    await listing.save();

    res.status(200).json({ message: "Listing updated successfully", listing });
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ message: "Failed to update property details!", error: err.message });
  }
});

router.delete("/:listingId", verifyToken, async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Property not found!" });
    }

    if (listing.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this listing." });
    }

    if (process.env.S3_BUCKET_NAME && listing.listingPhotoPaths?.length > 0) {
      const s3Photos = listing.listingPhotoPaths.filter(
        (url) => typeof url === "string" && url.includes(".amazonaws.com/")
      );
      const deletePromises = s3Photos.map((photoUrl) => {
        const rawKey = photoUrl.split(".amazonaws.com/")[1]?.split("?")[0];
        const key = rawKey ? decodeURIComponent(rawKey) : null;
        if (!key) return Promise.resolve();
        return s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          })
        );
      });
      await Promise.allSettled(deletePromises).catch((err) =>
        console.error("S3 deletion warning:", err)
      );
    }

    await Listing.findByIdAndDelete(listingId);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete property!", error: err.message });
  }
});

module.exports = router;