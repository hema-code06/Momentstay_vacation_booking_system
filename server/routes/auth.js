const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadToS3 } = require('../config/s3');

const User = require("../models/User");

const upload = uploadToS3("profiles");

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }

    const profileImage = req.file;

    if (!profileImage) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profileImagePath = profileImage.location || `/uploads/${profileImage.filename}`;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      profileImagePath,
    });

    await newUser.save();

    const userData = newUser.toObject();
    delete userData.password;

    res
      .status(200)
      .json({ message: "User registered successfully!", user: userData });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Registration failed!", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(409).json({ message: "User doesn't exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      token,
      user: userData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
