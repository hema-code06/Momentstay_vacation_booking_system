const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["UPI", "Card", "Net Banking", "Pay at Property"] },
    paymentStatus: { type: String, enum: ["paid", "pending"] },
    amountPaid: { type: Number },
    paymentId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
