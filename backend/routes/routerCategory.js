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
    const categories = await Category.findById(req.params.id);
    if (!categories) {
      return res.status(404).send("Không tìm thấy danh mục sản phẩm.");
    }

    const products = await Product.find({ productCategory: categories })
      .populate("productCategory", "nameCategory")
      .populate("productUnit", "nameUnit")
      .populate("productManufacturer", "nameManufacturer")
      .populate("productOrigin", "nameOrigin")
      .lean();
    if (!products) {
      return res.status(404).send("Không tìm thấy sản phẩm trong danh mục.");
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
