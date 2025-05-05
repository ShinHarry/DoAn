const express = require("express");
require("dotenv").config();
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const { uploadUser } = require("../middlewares/uploadImage/uploads");
const verifyToken = require("../middlewares/Auth/verifyToken");
const BASE_URL = process.env.BASE_URL;

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
router.put("/:userId", uploadUser.single("userAvatar"), async (req, res) => {
  try {
    const userId = req.params.userId;
    const { userName, userEmail, userPhone, userGender, userAddress } =
      req.body;

    console.log("req.body", req.body);

    // Kiểm tra xem user tồn tại hay chưa
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra email hoặc phone đã tồn tại ở user khác
    const duplicatedUser = await User.findOne({
      $or: [{ userEmail: userEmail }, { userPhone: userPhone }],
      _id: { $ne: userId },
    });
    if (duplicatedUser) {
      return res
        .status(400)
        .json({ message: "Email hoặc số điện thoại đã tồn tại!" });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updatedData = {
      userName,
      userEmail: userEmail,
      userPhone: userPhone,
      userGender: userGender,
      userAddress: userAddress,
    };

    // Nếu có upload avatar thì cập nhật
    if (req.file) {
      updatedData.userAvatar = [
        {
          name: req.file.filename,
          link: `/public/users/${req.file.filename}`,
        },
      ];
    }

    // Thực hiện cập nhật
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Lỗi cập nhật người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật người dùng" });
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

//get address by userId
router.get("/:id/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user.userAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//add address by userId
router.post("/:id/address", async (req, res) => {
  try {
    const { province, district, street, houseNumber } = req.body;
    const user = await User.findById(req.params.id);
    user.userAddress.push({ province, district, street, houseNumber });
    await user.save();
    res.status(201).json(user.userAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//update address by userId
router.put("/:id/address/:index", async (req, res) => {
  try {
    const { province, district, street, houseNumber } = req.body;
    const user = await User.findById(req.params.id);
    user.userAddress[req.params.index] = {
      province,
      district,
      street,
      houseNumber,
    };
    await user.save();
    res.json(user.userAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//delete address by userId
router.delete("/user/:id/address/:index", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.userAddress.splice(req.params.index, 1);
    await user.save();
    res.json(user.userAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
