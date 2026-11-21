const mongoose = require("mongoose");

const required = (type) => ({ type, required: true });

const ListingSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: required(String),
    type: required(String),
    streetAddress: required(String),
    aptSuite: { type: String, default: "", trim: true },
    city: required(String),
    province: required(String),
    country: required(String),
    guestCount: required(Number),
    bedroomCount: required(Number),
    bedCount: required(Number),
    bathroomCount: required(Number),
    amenities: { type: [String], default: [] },
    listingPhotoPaths: [{ type: String }],
    title: required(String),
    description: required(String),
    highlight: required(String),
    price: required(Number),
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", ListingSchema);
