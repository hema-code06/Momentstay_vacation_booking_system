const router = require("express").Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");
const verifyToken = require("../middleware/auth");

const ownerOnly = (req, res, next) =>
  req.user.id === req.params.userId
    ? next()
    : res.status(403).json({ message: "You are not authorized to access this data." });

const withBookingDetails = (query) =>
  query
    .populate("customerId", "username email profileImagePath")
    .populate("hostId", "username email profileImagePath")
    .populate("listingId");

router.get("/:userId/trips", verifyToken, ownerOnly, async (req, res) => {
  try {
    const trips = await withBookingDetails(Booking.find({ customerId: req.params.userId }));
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot find trip history!" });
  }
});

router.get("/:userId/reservations", verifyToken, ownerOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await withBookingDetails(
      Booking.find({ $or: [{ hostId: userId }, { customerId: userId }] })
    );
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot find reservations details!" });
  }
});

router.patch("/:userId/:listingId", verifyToken, ownerOnly, async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(404).json({ message: "Property not found!" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    const saved = user.wishList.some((id) => id.equals(listingId));
    if (saved) {
      user.wishList.pull(listingId);
    } else {
      if (!(await Listing.exists({ _id: listingId }))) {
        return res.status(404).json({ message: "Property not found!" });
      }
      user.wishList.push(listingId);
    }
    await user.save();

    await user.populate({
      path: "wishList",
      populate: { path: "creator", select: "username profileImagePath" },
    });

    res.json({
      message: saved ? "Property is removed from wish list" : "Property is added to wish list",
      wishList: user.wishList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update wish list!" });
  }
});

module.exports = router;
