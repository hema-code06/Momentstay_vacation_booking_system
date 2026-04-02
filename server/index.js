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

app.use(cors());
app.use(express.json());
app.use(compression());
app.use(
  express.static("public", {
    maxAge: "1d",
    etag: false,
  }),
);

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const time = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${time}ms`);
  });

  next();
});

app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running 🚀",
  });
});
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

app.post("/feedback/create", async (req, res) => {
  try {
    console.log(`Feedback received from ${req.ip} at ${req.url}:`, req.body);
    res.status(200).json({ message: "Feedback received" });
  } catch (error) {
    console.error(`Error in feedback route (${req.method} ${req.url}):`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

mongoose.set("strictQuery", true);

// MongoDB Connection
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "MomentStay",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port: ${PORT}`));
  })
  .catch((err) => {
    console.error(`❌Error connecting to MongoDB: ${err}`);
  });

app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ message: "Something went wrong" });
});
