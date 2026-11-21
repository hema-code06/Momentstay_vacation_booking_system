const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadToS3, deleteS3Photos } = require("../config/s3");
const User = require("../models/User");

const upload = uploadToS3("profiles");

const uploadProfile = (req, res, next) =>
  upload.single("profileImage")(req, res, (err) => {
    if (!err) return next();
    console.error("Upload error:", err);
    res.status(400).json({
      message: err.code === "LIMIT_FILE_SIZE" ? "Image must be under 10 MB." : err.message,
    });
  });

const publicUser = async (user) => {
  await user.populate({
    path: "wishList",
    populate: { path: "creator", select: "username profileImagePath" },
  });
  const data = user.toObject();
  delete data.password;
  return data;
};

router.post("/register", uploadProfile, async (req, res) => {
  const { username, email, password } = req.body;
  const profileImage = req.file;
  const profileImagePath = profileImage && (profileImage.location || `/uploads/${profileImage.filename}`);

  try {
    if (!username || !email || !password) {
      await deleteS3Photos([profileImagePath]);
      return res.status(400).json({ message: "Username, email, and password are required." });
    }
    if (password.length < 6) {
      await deleteS3Photos([profileImagePath]);
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (!profileImage) {
      return res.status(400).json({ message: "Profile image is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail })) {
      await deleteS3Photos([profileImagePath]);
      return res.status(409).json({ message: "User already exists!" });
    }

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      profileImagePath,
    });

    res.status(201).json({ message: "User registered successfully!", user: await publicUser(user) });
  } catch (err) {
    console.error("Register error:", err);
    await deleteS3Photos([profileImagePath]);
    res.status(500).json({ message: "Registration failed!" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: await publicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed!" });
  }
});

module.exports = router;
