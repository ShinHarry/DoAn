const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const { uploadUser } = require("../middlewares/uploadImage/uploads");
const verifyToken = require("../middlewares/Auth/verifyToken");

// Get list of users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add new user
router.post("/", uploadUser.single("avatar"), async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      userNameAccount,
      userPassword,
      userPhone,
      userBirthday,
      userGender,
      userRole,
      userStatus,
      userPoint,
    } = req.body;

    const avatar = req.file
      ? { link: `/public/user/${req.file.filename}`, alt: "User Avatar" }
      : null;
    const user = new User({
      userName,
      userEmail,
      userNameAccount,
      userPassword,
      userPhone,
      userBirthday,
      userGender,
      userRole,
      userStatus,
      userPoint,
      userAvatar: avatar ? [avatar] : [],
      cart: [],
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user
router.put("/:userId", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete("/:userId", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
