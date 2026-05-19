const router = require("express").Router();
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { uploadToS3, s3 } = require("../config/s3");

const Listing = require("../models/Listing");
const User = require("../models/User");

const upload = uploadToS3("properties");

router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      creator, category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, title, description, highlight, highlightDesc, price,
    } = req.body;

    const listingPhotos = req.files;

    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).send("No file uploaded.");
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.location);

    const newListing = new Listing({
      creator, category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, listingPhotoPaths, title, description, highlight,
      highlightDesc, price,
    });

    await newListing.save();
    res.status(200).json(newListing);
  } catch (err) {
    res.status(409).json({ message: "Failed to create Property!!", error: err.message });
    console.log(err);
  }
});

router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    const listings = qCategory
      ? await Listing.find({ category: qCategory }).populate("creator")
      : await Listing.find().populate("creator");
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetching property!!", error: err.message });
    console.error(err);
  }
});

router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  try {
    const listings =
      search === "all"
        ? await Listing.find().populate("creator")
        : await Listing.find({
            $or: [
              { category: { $regex: search, $options: "i" } },
              { title: { $regex: search, $options: "i" } },
            ],
          }).populate("creator");
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetching property!!", error: err.message });
    console.error(err);
  }
});

router.get("/:listingId", async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await Listing.findById(listingId).populate("creator");
    if (!listing) {
      return res.status(404).json({ message: "Properties not found!!" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetching property details!!", error: err.message });
  }
});

router.put("/:listingId", upload.array("listingPhotos"), async (req, res) => {
  const { listingId } = req.params;

  // ── debug logs placed AFTER params are destructured ──
  console.log("PUT /properties/:listingId called");
  console.log("req.files count:", req.files?.length);
  console.log("req.body.existingPhotos:", req.body.existingPhotos);

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Properties not found!" });
    }

    // 1. Parse the existing photo URLs the client chose to keep
    let keptPhotos = [];
    if (req.body.existingPhotos) {
      try {
        keptPhotos = JSON.parse(req.body.existingPhotos);
      } catch {
        keptPhotos = [];
      }
    }

    // 2. Delete from S3 any photos that were removed by the user
    const removedPhotos = listing.listingPhotoPaths.filter(
      (url) => !keptPhotos.includes(url)
    );

    if (removedPhotos.length > 0) {
      const deletePromises = removedPhotos.map((photoUrl) => {
        // Fix: handle both path formats safely
        const key = photoUrl.includes(".amazonaws.com/")
          ? photoUrl.split(".amazonaws.com/")[1]
          : photoUrl;
        return s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          })
        );
      });
      await Promise.all(deletePromises);
      console.log("Deleted from S3:", removedPhotos.length, "photo(s)");
    }

    // 3. Collect URLs of newly uploaded photos
    const newPhotoPaths = req.files && req.files.length > 0
      ? req.files.map((file) => file.location)
      : [];

    console.log("New photo S3 URLs:", newPhotoPaths);

    // 4. Merge kept + new
    const updatedPhotoPaths = [...keptPhotos, ...newPhotoPaths];
    console.log("Total photos after update:", updatedPhotoPaths.length);

    // 5. Update all fields
    const {
      creator, category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, title, description, highlight, price,
    } = req.body;

    Object.assign(listing, {
      creator, category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, title, description, highlight, price,
      listingPhotoPaths: updatedPhotoPaths,
    });

    await listing.save();

    res.status(200).json({ message: "Listing updated successfully", listing });
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ message: "Failed to update property details!!", error: err.message });
  }
});

router.delete("/:listingId", async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Properties not found!" });
    }

    // Delete all photos from S3
    if (listing.listingPhotoPaths?.length > 0) {
      const deletePromises = listing.listingPhotoPaths.map((photoUrl) => {
        const key = photoUrl.includes(".amazonaws.com/")
          ? photoUrl.split(".amazonaws.com/")[1]
          : photoUrl;
        return s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          })
        );
      });
      await Promise.all(deletePromises);
    }

    await Listing.findByIdAndDelete(listingId);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete property!!", error: err.message });
  }
});

module.exports = router;