const router = require("express").Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");
const verifyToken = require("../middleware/auth");

router.get("/:userId/trips", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "You are not authorized to view these trips." });
    }
    const trips = await Booking.find({ customerId: userId }).populate(
      "customerId hostId listingId",
    );
    res.status(202).json(trips);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find trips!", error: err.message });
  }
});

router.patch("/:userId/:listingId", verifyToken, async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "You are not authorized to edit this wish list." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const listing = await Listing.findById(listingId).populate("creator", "-password");
    if (!listing) {
      return res.status(404).json({ message: "Property not found!" });
    }

    const favoriteListing = user.wishList.find(
      (item) => item._id.toString() === listingId,
    );

    if (favoriteListing) {
      user.wishList = user.wishList.filter(
        (item) => item._id.toString() !== listingId,
      );
      await user.save();
      res.status(200).json({
        message: "Property is removed from wish list",
        wishList: user.wishList,
      });
    } else {
      user.wishList.push(listing);
      await user.save();
      res.status(200).json({
        message: "Property is added to wish list",
        wishList: user.wishList,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: err.message });
  }
});

router.get("/:userId/properties", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "You are not authorized to view these properties." });
    }
    const properties = await Listing.find({ creator: userId }).populate(
      "creator",
    );
    res.status(202).json(properties);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find Property!", error: err.message });
  }
});

router.get("/:userId/reservations", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "You are not authorized to view these reservations." });
    }
    const reservations = await Booking.find({
      $or: [{ hostId: userId }, { customerId: userId }],
    }).populate("customerId hostId listingId");

    res.status(202).json(reservations);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find reservations!", error: err.message });
  }
});

module.exports = router;