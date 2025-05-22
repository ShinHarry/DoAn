const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const { uploadUser } = require("../middlewares/uploadImage/uploads");
const verifyToken = require("../middlewares/Auth/verifyToken");
const authPage = require("../middlewares/Auth/authoziration");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");

dotenv.config();

const BASE_URL = process.env.BASE_URL;

router.get(
  "/me",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-userPassword");
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }
      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
);

router.put(
  "/:userId",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  uploadUser.single("userAvatar"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const { userName, userEmail, userPhone, userGender, userBirthday } =
        req.body;

      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      const duplicatedUser = await User.findOne({
        $or: [{ userEmail: userEmail }, { userPhone: userPhone }],
        _id: { $ne: userId },
      });
      if (duplicatedUser) {
        return res
          .status(400)
          .json({ message: "Email hoặc số điện thoại đã tồn tại!" });
      }

      const updatedData = {
        userName,
        userEmail: userEmail,
        userPhone: userPhone,
        userGender: userGender,
        userBirthday: userBirthday,
      };

      if (req.file) {
        updatedData.userAvatar = [
          {
            name: userName,
            link: `${BASE_URL}public/users/${req.file.filename}`,
          },
        ];
      }

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
  }
);
// Delete user
// router.delete("/:userId", verifyToken, async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.userId);
//     if (!deletedUser)
//       return res.status(404).json({ message: "User not found" });
//     res.json({ message: "User deleted successfully", deletedUser });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// GET /api/users/me/addresses
router.get(
  "/:userId/addresses",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select("userAddress");
      console.log("user", req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại." });
      }
      res.json({ success: true, addresses: user.userAddress || [] });
    } catch (error) {
      console.error("Get Addresses Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi khi lấy danh sách địa chỉ." });
    }
  }
);

// POST /api/users/me/addresses
router.post(
  "/me/addresses",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  async (req, res) => {
    const { fullName, phoneNumber, address, city, country, userId } = req.body;
    console.log("req.body", req.body);
    console.log("userId", userId);

    if (!fullName || !phoneNumber || !address || !city || !country) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin địa chỉ.",
      });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại." });
      }

      const newAddress = {
        fullName,
        phoneNumber,
        address,
        city,
        country,
      };

      user.userAddress.push(newAddress);
      await user.save();
      res.status(201).json({
        success: true,
        message: "Thêm địa chỉ thành công!",
        address: user.userAddress[user.userAddress.length - 1],
      });
    } catch (error) {
      console.error("Add Address Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi khi thêm địa chỉ." });
    }
  }
);

// DELETE /api/users/me/addresses
router.delete(
  "/me/addresses",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  async (req, res) => {
    // lấy addressId từ request body
    const { addressId, userId } = req.body;
    if (!addressId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ID địa chỉ trong yêu cầu." });
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID địa chỉ không hợp lệ." });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại." });
      }

      const initialLength = user.userAddress.length;
      // lọc address cần xóa
      user.userAddress = user.userAddress.filter(
        (addr) => addr._id.toString() !== addressId
      );

      // kiểm tra xem có thật sự bị xóa không
      if (user.userAddress.length === initialLength) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy địa chỉ để xóa." });
      }

      await user.save();
      res.json({ success: true, message: "Xóa địa chỉ thành công!" });
    } catch (error) {
      console.error("Delete Address Error:", error);
      res.status(500).json({ success: false, message: "Lỗi khi xóa địa chỉ." });
    }
  }
);

// PUT /api/users/me/addresses
router.put(
  "/me/addresses",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  async (req, res) => {
    const { addressId, fullName, phoneNumber, address, city, country, userId } =
      req.body;
    if (!addressId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ID địa chỉ." });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại." });
      }

      const addressIndex = user.userAddress.findIndex(
        (addr) => addr._id.toString() === addressId
      );
      if (addressIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Địa chỉ không tồn tại." });
      }

      user.userAddress[addressIndex] = {
        _id: addressId,
        fullName,
        phoneNumber,
        address,
        city,
        country,
      };
      await user.save();

      res.json({
        success: true,
        message: "Cập nhật địa chỉ thành công!",
        address: user.userAddress[addressIndex],
      });
    } catch (error) {
      console.error("Update Address Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi khi cập nhật địa chỉ." });
    }
  }
);

router.put(
  "/:userId/change-password",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.userPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.userPassword = hashedPassword;
      await user.save();
      res.status(200).json({ message: "Đổi mật khẩu thành công." });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      res.status(500).json({ message: "Đã xảy ra lỗi khi đổi mật khẩu." });
    }
  }
);

router.get(
  "/:userId",
  verifyToken,
  authPage(["admin", "mod", "cus"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
module.exports = router;
