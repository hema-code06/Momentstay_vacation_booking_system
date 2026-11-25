const router = require("express").Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const { notify, formatDay, rupees } = require("../utils/notify");

const DAY_MS = 24 * 60 * 60 * 1000;
const PAYMENT_METHODS = ["UPI", "Card", "Net Banking", "Pay at Property"];

const makePaymentId = () =>
  `MSP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const parseRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const valid = !isNaN(start) && !isNaN(end) && end > start;
  return valid ? { start, end, nights: Math.max(1, Math.round((end - start) / DAY_MS)) } : null;
};

const stayEnded = (booking) => booking.endDate < new Date();

const isParticipant = (booking, userId) =>
  [booking.customerId, booking.hostId].some((id) => id?.toString() === userId);

router.param("id", (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(404).json({ message: "Booking not found!" })
);

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { listingId, startDate, endDate, paymentMethod } = req.body;
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Please choose a payment method." });
    }
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

    const paidNow = paymentMethod !== "Pay at Property";
    const totalPrice = range.nights * Number(listing.price);

    const booking = await Booking.create({
      customerId: req.user.id,
      hostId: listing.creator,
      listingId,
      startDate: range.start,
      endDate: range.end,
      totalPrice,
      paymentMethod,
      amountPaid: paidNow ? totalPrice : 0,
      paymentStatus: paidNow ? "paid" : "pending",
      paymentId: paidNow ? makePaymentId() : undefined,
      paidAt: paidNow ? new Date() : undefined,
    });

    const guest = await User.findById(req.user.id).select("username");
    await notify({
      userId: listing.creator,
      type: "booking_created",
      title: "New booking",
      message: `${guest?.username || "A guest"} booked "${listing.title}" from ${formatDay(range.start)} to ${formatDay(range.end)} (${range.nights} ${range.nights === 1 ? "night" : "nights"}, ${rupees(totalPrice)}, ${paymentMethod}).`,
      link: "/host?tab=bookings",
      actionLabel: "View bookings",
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
    if (stayEnded(booking)) {
      return res.status(400).json({ message: "A completed stay cannot be changed." });
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

    const newTotal = range.nights * Number(listing.price);
    const alreadyPaid = booking.amountPaid ?? (booking.paymentStatus === "paid" ? booking.totalPrice : 0);
    const { paymentMethod } = req.body;
    let refundAmount = 0;

    if (alreadyPaid > 0) {
      if (newTotal > alreadyPaid) {
        if (!PAYMENT_METHODS.includes(paymentMethod)) {
          return res.status(400).json({ message: "Please choose a payment method for the extra amount." });
        }
        if (paymentMethod !== "Pay at Property") {
          booking.amountPaid = newTotal;
          booking.paymentMethod = paymentMethod;
          booking.paymentId = makePaymentId();
          booking.paidAt = new Date();
        } else {
          booking.amountPaid = alreadyPaid;
        }
      } else {
        refundAmount = alreadyPaid - newTotal;
        booking.amountPaid = newTotal;
      }
      booking.paymentStatus = booking.amountPaid >= newTotal ? "paid" : "pending";
    }

    booking.startDate = range.start;
    booking.endDate = range.end;
    booking.totalPrice = newTotal;
    await booking.save();

    const guest = await User.findById(req.user.id).select("username");
    await notify({
      userId: booking.hostId || listing.creator,
      type: "booking_rescheduled",
      title: "Booking rescheduled",
      message: `${guest?.username || "A guest"} moved their stay at "${listing.title}" to ${formatDay(range.start)} - ${formatDay(range.end)}.`,
      link: "/host?tab=bookings",
      actionLabel: "View bookings",
    });

    res.json({ ...booking.toObject(), refundAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating booking!" });
  }
});

router.patch("/:id/collect", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    if (booking.hostId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the host can confirm a payment." });
    }
    if (booking.paymentStatus !== "pending") {
      return res.status(400).json({ message: "No balance is due for this booking." });
    }

    const received = booking.totalPrice - (booking.amountPaid || 0);

    booking.amountPaid = booking.totalPrice;
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.paymentId = booking.paymentId || makePaymentId();
    await booking.save();

    const listing = await Listing.findById(booking.listingId).select("title");
    await notify({
      userId: booking.customerId,
      type: "payment_received",
      title: "Payment received",
      message: `The host confirmed your payment of ${rupees(received)} for "${listing?.title || "your stay"}" (${formatDay(booking.startDate)} to ${formatDay(booking.endDate)}). Your stay is now fully paid.`,
      link: `/${booking.customerId}/reservations`,
      actionLabel: "View reservation",
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error confirming the payment!" });
  }
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    if (!isParticipant(booking, req.user.id)) {
      return res.status(403).json({ message: "You are not authorized to delete this booking." });
    }
    if (stayEnded(booking)) {
      return res.status(400).json({ message: "A completed stay cannot be cancelled." });
    }

    const alreadyPaid = booking.amountPaid ?? (booking.paymentStatus === "paid" ? booking.totalPrice : 0);
    const refundAmount = booking.startDate > new Date() ? alreadyPaid : 0;

    await booking.deleteOne();

    const byHost = booking.hostId?.toString() === req.user.id;
    const [listing, canceller] = await Promise.all([
      Listing.findById(booking.listingId).select("title"),
      User.findById(req.user.id).select("username"),
    ]);
    const title = listing?.title || "the property";
    const dates = `${formatDay(booking.startDate)} to ${formatDay(booking.endDate)}`;

    if (byHost) {
      await notify({
        userId: booking.customerId,
        type: "booking_cancelled_by_host",
        title: "Your booking was cancelled by the host",
        message: `The host cancelled your stay at "${title}" (${dates}).${refundAmount > 0 ? ` A refund of ${rupees(refundAmount)} will be processed (demo).` : ""
          } You can rebook the same property or choose another stay.`,
        link: `/properties/${booking.listingId}`,
        actionLabel: "Rebook",
      });
    } else {
      await notify({
        userId: booking.hostId,
        type: "booking_cancelled_by_guest",
        title: "Booking cancelled by guest",
        message: `${canceller?.username || "A guest"} cancelled their stay at "${title}" (${dates}). Those dates are open again.`,
        link: "/host?tab=bookings",
        actionLabel: "View bookings",
      });
    }

    res.json({ message: "Booking cancelled successfully", refundAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting booking!" });
  }
});

module.exports = router;
