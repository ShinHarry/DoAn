const express = require("express");
const router = express.Router();
const News = require("../models/New");
require("dotenv").config();
const { uploadBanner } = require("../middlewares/uploadImage/uploads");
const BASE_URL = process.env.BASE_URL;

// Get all news
router.get("/", async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create news

router.post("/", uploadBanner.single("newImage"), async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      author,
      state,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Ảnh banner (newImage) là bắt buộc." });
    }

    const newImage = {
      link: `${BASE_URL}public/banners/${req.file.filename}`, // Đường dẫn public ảnh
      alt: title, // alt lấy từ title
    };
    
    console.log(newImage)

    const newNews = new News({
      title,
      summary,
      content,
      author,
      state: state === 'true',
      newImage, // lưu object image vào banner
    });

    await newNews.save();

    res.status(201).json({ message: "Thêm banner thành công!", banner: newNews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm banner", error });
  }
});

// lấy chi tiết
router.get("/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id)

    if (!news) return res.status(404).json({ message: "Banner not found" });

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update new Promise((resolve, reject) => {
  
  router.put("/:id", uploadBanner.single("newImage"), async (req, res) => {
    try {
      const { title, summary, content, author, state } = req.body;
  
      const updateData = {
        title,
        summary,
        content,
        author,
        state: state === 'true',
      };
  
      if (req.file) {
        updateData.newImage = {
          link: `${BASE_URL}public/banners/${req.file.filename}`,
          alt: title,
        };
      }
  
      const updatedNews = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!updatedNews) return res.status(404).json({ message: "News not found" });
  
      res.json(updatedNews);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  });

// Delete news
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "News not found" });
    res.json({ message: "News deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;