const router = require("express").Router();
const Booking = require("../models/Booking");
const verifyToken = require("../middleware/auth");

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice } =
      req.body;
    const newBooking = new Booking({
      customerId,
      hostId,
      listingId,
      startDate,
      endDate,
      totalPrice,
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
      return res.status(404).json({ message: "Booking not found!!" });
    }
    res.status(200).json(booking);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error retrieving booking!!!", error: err.message });
  }
});

router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found!!" });
    }

    const isOwner =
      existingBooking.customerId.toString() === req.user.id ||
      existingBooking.hostId.toString() === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "You are not authorized to update this booking." });
    }

    const { startDate, endDate, totalPrice } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { startDate, endDate, totalPrice },
      { new: true },
    );

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error updating booking!!!", error: err.message });
  }
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found!!" });
    }

    const isOwner =
      existingBooking.customerId.toString() === req.user.id ||
      existingBooking.hostId.toString() === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "You are not authorized to delete this booking." });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error deleting booking!!!", error: err.message });
  }
});

module.exports = router;
