const router = require("express").Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const verifyToken = require("../middleware/auth");

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found." });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: "Please provide a valid date range." });
    }

    const nights = Math.max(1, Math.round(
      (end - start) / (1000 * 60 * 60 * 24)
    ));
    const pricePerNight = Number(listing.price) || 0;
    const trustedTotalPrice = nights * pricePerNight;
    const overlap = await Booking.exists({
      listingId,
      startDate: { $lt: end },
      endDate: { $gt: start },
    });
    if (overlap) {
      return res.status(409).json({ message: "These dates are already booked." });
    }
    const newBooking = new Booking({
      customerId: req.user.id,
      hostId: listing.creator || req.user.id,
      listingId,
      startDate: start,
      endDate: end,
      totalPrice: trustedTotalPrice,
    });
    await newBooking.save();
    res.status(200).json(newBooking);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ message: "Failed to create a new Booking!", error: err.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listingId")
      .exec();
    if (!booking) {
      return res.status(404).json({ message: "Booking not found!" });
    }
    if (
      booking.customerId?.toString() !== req.user.id &&
      booking.hostId?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "You are not authorized to view this booking." });
    }
    res.status(200).json(booking);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error retrieving booking!", error: err.message });
  }
});

router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    if (existingBooking.customerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the guest who made this booking can reschedule it." });
    }

    const { startDate, endDate } = req.body;
    const listing = await Listing.findById(existingBooking.listingId);
    if (!listing) {
      return res.status(404).json({ message: "Property not found!" });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: "Please provide a valid date range." });
    }

    const overlap = await Booking.exists({
      _id: { $ne: existingBooking._id },
      listingId: existingBooking.listingId,
      startDate: { $lt: end },
      endDate: { $gt: start },
    });
    if (overlap) {
      return res.status(409).json({ message: "These dates are already booked." });
    }
    const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { startDate: start, endDate: end, totalPrice: nights * Number(listing.price) },
      { new: true },
    );
    res.status(200).json(updatedBooking);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error updating booking!", error: err.message });
  }
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    const isOwner =
      existingBooking.customerId?.toString() === req.user.id ||
      existingBooking.hostId?.toString() === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "You are not authorized to delete this booking." });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error deleting booking!", error: err.message });
  }
});

module.exports = router;
