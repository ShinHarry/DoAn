require("dotenv").config();
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { uploadCategory } = require("../middlewares/uploadImage/uploads");
const BASE_URL = process.env.BASE_URL;

// API lấy tất cả danh mục
router.get("/", async (req, res) => {
  try {
    const { page, limit } = req.query;
    const categories = await Category.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    const total = await Category.countDocuments();
    res.json({ categories, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API lấy danh mục theo id
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API thêm danh mục mới (upload 1 ảnh)
router.post("/", uploadCategory.single("image"), async (req, res) => {
  try {
    const { nameCategory, description = "" } = req.body;

    let categoryImg = { link: "", alt: nameCategory };
    if (req.file) {
      categoryImg.link = `${BASE_URL}public/category/${req.file.filename}`;
      categoryImg.alt = nameCategory;
    }

    const newCategory = new Category({
      nameCategory,
      description,
      CategoryImg: categoryImg,
    });

    await newCategory.save();
    res.status(201).json({ message: "Thêm danh mục thành công!", category: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm danh mục", error: error.message });
  }
});

// API cập nhật danh mục (upload 1 ảnh)
router.put("/:id", uploadCategory.single("image"), async (req, res) => {
  try {
    const updatedData = req.body;

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (req.file) {
      updatedData.CategoryImg = {
        link: `${BASE_URL}public/category/${req.file.filename}`,
        alt: updatedData.nameCategory || existingCategory.nameCategory,
      };
    } else {
      // giữ nguyên ảnh cũ nếu không upload mới
      updatedData.CategoryImg = existingCategory.CategoryImg;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API xóa danh mục
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Xóa danh mục thành công", deletedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
