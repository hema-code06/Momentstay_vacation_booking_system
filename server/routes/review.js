const router = require("express").Router();
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const verifyToken = require("../middleware/auth");

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;

    if (!listingId || !rating || !comment || comment.trim() === "") {
      return res
        .status(400)
        .json({ message: "listingId, rating, and comment are required." });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    let review = await Review.findOne({
      listingId,
      userId: req.user.id,
    });

    if (review) {
      review.rating = numRating;
      review.comment = comment.trim();
      await review.save();
    } else {
      review = new Review({
        listingId,
        userId: req.user.id,
        rating: numRating,
        comment: comment.trim(),
      });
      await review.save();
    }

    await review.populate("userId", "username profileImagePath");

    res.status(201).json(review);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to submit review.", error: err.message });
  }
});

router.get("/listing/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    const reviews = await Review.find({ listingId })
      .populate("userId", "username profileImagePath")
      .sort({ createdAt: -1 });

    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to fetch reviews.", error: err.message });
  }
});

module.exports = router;
