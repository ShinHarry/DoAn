const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const { uploadUser } = require("../middlewares/uploadImage/uploads");
const verifyToken = require("../middlewares/Auth/verifyToken");
const mongoose = require("mongoose");

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


// ---  Routes quản lý Address--- //

// GET /api/users/me/addresses 
router.get('/me/addresses', verifyToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select('userAddress'); // chỉ lấy addresses
      if (!user) {
          return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      }
      res.json({ success: true, addresses: user.userAddress || [] });
  } catch (error) {
      console.error("Get Addresses Error:", error);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách địa chỉ.' });
  }
});

// POST /api/users/me/addresses 
router.post('/me/addresses', verifyToken, async (req, res) => {
  const { fullName, phoneNumber, address, city, country } = req.body;

  if (!fullName || !phoneNumber || !address || !city || !country) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin địa chỉ.' });
  }

  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      }

      const newAddress = {
          fullName,
          phoneNumber,
          address,
          city,
          country
      };

      user.userAddress.push(newAddress);
      await user.save();
      res.status(201).json({ 
          success: true, 
          message: 'Thêm địa chỉ thành công!', 
          address: user.userAddress[user.userAddress.length - 1] 
      });

  } catch (error) {
      console.error("Add Address Error:", error);
      res.status(500).json({ success: false, message: 'Lỗi khi thêm địa chỉ.' });
  }
});


module.exports = router;
