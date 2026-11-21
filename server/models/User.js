const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profileImagePath: { type: String, default: "" },
    wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
