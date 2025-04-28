const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User"); // Đường dẫn model User
require("dotenv").config();

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { userNameAccount, userName, userEmail, userPassword } = req.body;

    const existingUser = await User.findOne({
      $or: [{ userEmail }, { userNameAccount }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email hoặc tên đăng nhập đã tồn tại." });
    }
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const newUser = new User({
      userName,
      userEmail,
      userNameAccount,
      userPassword: hashedPassword,
      userRole: "CUS",
      userStatus: "active",
      userPoint: 0,
      cart: [],
    });

    await newUser.save();

    res.status(200).json({ message: "Đăng ký thành công." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { userNameAccount, userPassword } = req.body;

    const user = await User.findOne({ userNameAccount });
    if (!user) {
      return res.status(400).json({ message: "Tên đăng nhập không tồn tại." });
    }

    const isPasswordValid = await bcrypt.compare(
      userPassword,
      user.userPassword
    );
    if (!isPasswordValid) {
      console.log(userPassword, user.userPassword);
      return res.status(400).json({ message: "Mật khẩu không đúng." });
    }

    // Tạo token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.userRole,
      },
      process.env.secret_token,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công.",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        userNameAccount: user.userNameAccount,
        role: user.userRole,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
  }
});

// Quên mật khẩu
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(email);

    const user = await User.findOne({ userEmail: email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email không tồn tại trong hệ thống." });
    }

    const newPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.userPassword = hashedPassword;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.userEmail,
      subject: "Mật khẩu mới của bạn",
      text: `Mật khẩu mới của bạn trên Smart Market là: ${newPassword}`,
    });

    console.log(`Mật khẩu mới cho ${email} là: ${newPassword}`);

    res.status(200).json({
      message: "Mật khẩu mới đã được tạo và gửi đến email.",
      newPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
  }
});

module.exports = router;
