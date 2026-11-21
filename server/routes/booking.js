const router = require("express").Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const verifyToken = require("../middleware/auth");

const DAY_MS = 24 * 60 * 60 * 1000;

const parseRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const valid = !isNaN(start) && !isNaN(end) && end > start;
  return valid ? { start, end, nights: Math.max(1, Math.round((end - start) / DAY_MS)) } : null;
};

const isParticipant = (booking, userId) =>
  [booking.customerId, booking.hostId].some((id) => id?.toString() === userId);

router.param("id", (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(404).json({ message: "Booking not found!" })
);

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ message: "A valid listing ID is required." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    if (listing.creator?.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot book your own property." });
    }

    const range = parseRange(startDate, endDate);
    if (!range) return res.status(400).json({ message: "Please provide a valid date range." });

    const overlap = await Booking.exists({
      listingId,
      startDate: { $lt: range.end },
      endDate: { $gt: range.start },
    });
    if (overlap) return res.status(409).json({ message: "These dates are already booked." });

    const booking = await Booking.create({
      customerId: req.user.id,
      hostId: listing.creator,
      listingId,
      startDate: range.start,
      endDate: range.end,
      totalPrice: range.nights * Number(listing.price),
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create a new Booking!" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listingId");
    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    if (!isParticipant(booking, req.user.id)) {
      return res.status(403).json({ message: "You are not authorized to view this booking." });
    }
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving booking!" });
  }
});

router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    if (booking.customerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the guest who made this booking can reschedule it." });
    }

    const listing = await Listing.findById(booking.listingId);
    if (!listing) return res.status(404).json({ message: "Property not found!" });

    const range = parseRange(req.body.startDate, req.body.endDate);
    if (!range) return res.status(400).json({ message: "Please provide a valid date range." });

    const overlap = await Booking.exists({
      _id: { $ne: booking._id },
      listingId: booking.listingId,
      startDate: { $lt: range.end },
      endDate: { $gt: range.start },
    });
    if (overlap) return res.status(409).json({ message: "These dates are already booked." });

    booking.startDate = range.start;
    booking.endDate = range.end;
    booking.totalPrice = range.nights * Number(listing.price);
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating booking!" });
  }
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    if (!isParticipant(booking, req.user.id)) {
      return res.status(403).json({ message: "You are not authorized to delete this booking." });
    }
    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting booking!" });
  }
});

module.exports = router;
