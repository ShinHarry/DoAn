const express = require("express");
const router = express.Router();
const News = require("../models/New");
const User = require("../models/User");
require("dotenv").config();
const {
  uploadBanner,
  uploadToCloudinary,
} = require("../middlewares/uploadImage/uploads");
const verifyToken = require("../middlewares/Auth/verifyToken");
const authPage = require("../middlewares/Auth/authoziration");

const BASE_URL = process.env.BASE_URL;

//Get all mod admin
router.get(
  "/name",
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const users = await User.find({
        userRole: { $in: ["mod", "admin"] },
      })
        .select("_id userName")
        .sort({ createdAt: -1 });

      // console.log(users)
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get all news
router.get("/", async (req, res) => {
  try {
    const newsList = await News.find()
      .populate({ path: "author", select: "userName" })
      .sort({ createdAt: -1 })
      .lean();

    res.json(newsList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create news
router.post(
  "/",
  verifyToken,
  authPage(["admin", "mod"]),
  uploadBanner.single("newImage"),
  async (req, res) => {
    try {
      const { title, summary, content, author, state } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Ảnh banner (newImage) là bắt buộc." });
      }

      // Upload lên Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(
        req.file,
        "banners",
        "banner"
      );

      const newImage = {
        link: cloudinaryUrl, // Link Cloudinary
        alt: title,
      };

      const newNews = new News({
        title,
        summary,
        content,
        author,
        state: state === "true",
        newImage,
      });

      await newNews.save();

      res
        .status(201)
        .json({ message: "Thêm banner thành công!", banner: newNews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi thêm banner", error });
    }
  }
);

// Get news detail
router.get(
  "/:id",
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const news = await News.findById(req.params.id)
        .populate({ path: "author", select: "userName" })
        .lean();

      if (!news) return res.status(404).json({ message: "Banner not found" });

      res.json(news);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update news
router.put(
  "/:id",
  verifyToken,
  authPage(["admin", "mod"]),
  uploadBanner.single("newImage"),
  async (req, res) => {
    try {
      const { title, summary, content, author, state } = req.body;

      const updateData = {
        title,
        summary,
        content,
        author,
        state: state === "true",
      };

      if (req.file) {
        // Upload ảnh mới lên Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(
          req.file,
          "banners",
          "banner"
        );

        updateData.newImage = {
          link: cloudinaryUrl,
          alt: title,
        };
      }

      const updatedNews = await News.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedNews)
        return res.status(404).json({ message: "News not found" });

      res.json(updatedNews);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  }
);

// Delete news
router.delete(
  "/:id",
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const deleted = await News.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "News not found" });
      res.json({ message: "News deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
