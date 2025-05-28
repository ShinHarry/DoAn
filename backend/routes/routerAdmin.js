const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { uploadUser } = require("../middlewares/uploadImage/uploads");

const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    // const { userId, userName, userEmail, userPhone, userGender, userRole } =
    //   req.body;
    const { userId, userName, userRole, userStatus } = req.body;
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
      userStatus,
    };

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
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
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
