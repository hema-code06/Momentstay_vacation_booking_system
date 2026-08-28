const router = require("express").Router();
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { uploadToS3, s3 } = require("../config/s3");
const verifyToken = require("../middleware/auth");

const Listing = require("../models/Listing");

const upload = uploadToS3("properties");

router.post("/create", verifyToken, upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      creator, category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, title, description, highlight, price,
    } = req.body;

    const listingPhotos = req.files;

    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).send("No file uploaded.");
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.location);

    const newListing = new Listing({
      creator, category, type, streetAddress, aptSuite, city, province,
      country, guestCount, bedroomCount, bedCount, bathroomCount,
      amenities, listingPhotoPaths, title, description, highlight, price,
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
      ? await Listing.find({ category: qCategory }).populate("creator", "-password")
      : await Listing.find().populate("creator", "-password");
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
        ? await Listing.find().populate("creator", "-password")
        : await Listing.find({
          $or: [
            { category: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
          ],
        }).populate("creator", "-password");
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetching property!!", error: err.message });
    console.error(err);
  }
});

router.get("/:listingId", async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await Listing.findById(listingId).populate("creator", "-password");
    if (!listing) {
      return res.status(404).json({ message: "Properties not found!!" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetching property details!!", error: err.message });
  }
});

router.put("/:listingId", verifyToken, upload.array("listingPhotos"), async (req, res) => {
  const { listingId } = req.params;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Properties not found!" });
    }

    if (listing.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to edit this listing." });
    }

    let keptPhotos = [];
    if (req.body.existingPhotos) {
      try {
        keptPhotos = JSON.parse(req.body.existingPhotos);
      } catch {
        keptPhotos = [];
      }
    }

    const removedPhotos = listing.listingPhotoPaths.filter(
      (url) => !keptPhotos.includes(url)
    );

    if (removedPhotos.length > 0) {
      const deletePromises = removedPhotos.map((photoUrl) => {
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

    const newPhotoPaths = req.files && req.files.length > 0
      ? req.files.map((file) => file.location)
      : [];

    const updatedPhotoPaths = [...keptPhotos, ...newPhotoPaths];

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

router.delete("/:listingId", verifyToken, async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Properties not found!" });
    }

    if (listing.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this listing." });
    }

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