const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Product = require("../models/Product");
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send("Lỗi khi lấy danh mục sản phẩm.");
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { page, limit, sortOrder = "asc" } = req.query;

    const categories = await Category.findById(req.params.id);
    if (!categories) {
      return res.status(404).send("Không tìm thấy danh mục sản phẩm.");
    }

    const skip = (page - 1) * limit;

    const sort = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find({ productCategory: categories._id })
      .populate("productCategory", "nameCategory")
      .populate("productUnit", "nameUnit")
      .populate("productManufacturer", "nameManufacturer")
      .populate("productOrigin", "nameOrigin")
      .sort({ productUnitPrice: sort })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments({
      productCategory: categories._id,
    });

    res.json({
      products,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
