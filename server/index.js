const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const compression = require("compression");

const app = express();

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const reviewRoutes = require("./routes/review.js");

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(compression());
app.use(
  express.static("public", {
    maxAge: "1d",
    etag: false,
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const time = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${time}ms`);
  });
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running 🚀",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/properties", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

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
