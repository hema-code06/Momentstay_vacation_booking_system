const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const compression = require("compression");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const reviewRoutes = require("./routes/review.js");

const app = express();
const path = require("path");

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(compression());
app.use(express.static("public", { maxAge: "1d", etag: false }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "public/uploads")));

// ─── REQUEST LOGGER ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () =>
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`)
  );
  next();
});

// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.status(200).json({ status: "success", message: "Server is running 🚀" })
);
app.use("/api/auth", authRoutes);
app.use("/api/properties", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

// ─── 404 HANDLER ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// ─── MONGOOSE CONFIG & SERVER START ──────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}
mongoose.set("strictQuery", true);

const PORT = process.env.PORT || 3001;

if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL is not set. Check your .env file.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "MomentStay",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port: ${PORT}`)
    );
  })
  .catch((err) => {
    console.error(`❌ Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  });

module.exports = app;
