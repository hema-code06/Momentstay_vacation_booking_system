require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const path = require("path");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(compression());
// Only serves local-dev uploads; in production images come from S3
app.use("/api/uploads", express.static(path.join(__dirname, "public/uploads"), { maxAge: "1d" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () =>
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`)
  );
  next();
});

app.get("/", (req, res) => res.status(200).json({ status: "success", message: "Server is running 🚀" }));
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/properties", require("./routes/listing.js"));
app.use("/api/bookings", require("./routes/booking.js"));
app.use("/api/users", require("./routes/user.js"));
app.use("/api/reviews", require("./routes/review.js"));

app.use((req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
);

app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL is not set.");
  process.exit(1);
}

mongoose.set("strictQuery", true);

const PORT = process.env.PORT || 3001;
// Listen first so Render sees the port immediately; Mongoose buffers queries until connected
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port: ${PORT}`));

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "MomentStay",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });