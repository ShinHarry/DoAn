// routes/routerUser.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { uploadUser } = require("../middlewares/uploadImage/uploads");
const verifyToken = require("../middlewares/Auth/verifyToken");
const mongoose = require("mongoose");

// Lấy danh sách người dùng
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cập nhật thông tin người dùng
router.put("/:userId", uploadUser.single("userAvatar"), async (req, res) => {
  try {
    // const { userId, userName, userEmail, userPhone, userGender, userRole } =
    //   req.body;
    const { userId, userName, userRole } = req.body;
    // Kiểm tra người dùng tồn tại
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra xem email hoặc số điện thoại đã tồn tại ở người dùng khác
    // const duplicatedUser = await User.findOne({
    //   $or: [{ userEmail: userEmail }, { userPhone: userPhone }],
    //   _id: { $ne: userId },
    // });
    // if (duplicatedUser) {
    //   return res
    //     .status(400)
    //     .json({ message: "Email hoặc số điện thoại đã tồn tại!" });
    // }

    // Chuẩn bị dữ liệu cập nhật
    const updatedData = {
      userName,
      // userEmail,
      // userPhone,
      // userGender,
      userRole,
    };

    // Nếu có ảnh đại diện mới, cập nhật ảnh
    if (req.file) {
      updatedData.userAvatar = [
        {
          name: req.file.filename,
          link: `/public/users/${req.file.filename}`,
        },
      ];
    }

    // Cập nhật người dùng
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
// Xóa người dùng
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra người dùng tồn tại
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Xóa người dùng
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi xóa người dùng" });
  }
});

module.exports = router;
