const router = require("express").Router();
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const verifyToken = require("../middleware/auth");

const REVIEWER_FIELDS = "username profileImagePath";

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    const text = typeof comment === "string" ? comment.trim() : "";

    if (!mongoose.isValidObjectId(listingId) || !rating || !text) {
      return res.status(400).json({ message: "listingId, rating, and comment are required." });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    if (!(await Listing.exists({ _id: listingId }))) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const review =
      (await Review.findOne({ listingId, userId: req.user.id })) ||
      new Review({ listingId, userId: req.user.id });
    review.rating = numRating;
    review.comment = text;
    await review.save();
    await review.populate("userId", REVIEWER_FIELDS);

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit review." });
  }
});

router.get("/listing/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
      return res.json({ reviews: [], averageRating: 0, totalReviews: 0 });
    }

    const reviews = await Review.find({ listingId })
      .populate("userId", REVIEWER_FIELDS)
      .sort({ createdAt: -1 });

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    res.json({
      reviews,
      averageRating: reviews.length ? Math.round((total / reviews.length) * 10) / 10 : 0,
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
});

module.exports = router;
