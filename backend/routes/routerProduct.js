require("dotenv").config();
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { uploadProduct } = require("../middlewares/uploadImage/uploads");
const BASE_URL = process.env.BASE_URL;

//API lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    const { page, limit } = req.query;
    const products = await Product.find()
      .populate("productCategory", "nameCategory")
      .populate("productUnit", "nameUnit")
      .populate("productManufacturer", "nameManufacturer")
      .populate("productOrigin", "nameOrigin")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    const total = await Product.countDocuments();
    res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API tìm kiếm
router.get("/search", async (req, res) => {
  try {
    const { page, limit, q } = req.query;
    console.log("query", req.query);
    console.log("page", page);
    console.log("limit", limit);
    console.log("q", q);

    const query = q ? { productName: new RegExp(q, "i") } : {};
    const products = await Product.find(query)
      .populate("productCategory", "nameCategory")
      .populate("productUnit", "nameUnit")
      .populate("productManufacturer", "nameManufacturer")
      .populate("productOrigin", "nameOrigin")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    const total = await Product.countDocuments(query);

    res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API lấy chi tiết sản phẩm theo ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("productCategory", "nameCategory")
      .populate("productUnit", "nameUnit")
      .populate("productManufacturer", "nameManufacturer")
      .populate("productOrigin", "nameOrigin")
      .lean();

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// API thêm sản phẩm mới
router.post("/", uploadProduct.array("productImgs", 10), async (req, res) => {
  try {
    const {
      productName,
      productUnitPrice,
      productSupPrice,
      productQuantity = 0,
      productWarranty = 12,
      productStatus,
      productCategory,
      productUnit,
      productOrigin,
      productManufacturer,
      productDescription,
      productSoldQuantity = 0,
      productAvgRating = 0,
    } = req.body;

    let productImgs = [];
    if (req.files && req.files.length > 0) {
      productImgs = req.files.map((file) => ({
        link: `${BASE_URL}public/products/${file.filename}`,
        alt: productName,
      }));
    }

    const newProduct = new Product({
      productName,
      productUnitPrice,
      productSupPrice,
      productQuantity,
      productWarranty,
      productStatus,
      productCategory,
      productDescription,
      productManufacturer,
      productOrigin,
      productUnit,
      productSoldQuantity,
      productAvgRating,
      productImgs: productImgs,
    });
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công!", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm sản phẩm", error });
  }
});

// API cập nhật sản phẩm
router.put("/:id", uploadProduct.array("productImgs", 10), async (req, res) => {
  try {
    const updatedData = req.body;

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let newImgs = [];
    if (req.files && req.files.length > 0) {
      newImgs = req.files.map((file) => ({
        link: `${BASE_URL}public/products/${file.filename}`,
        alt: req.body.productName,
      }));
    }

    updatedData.productImgs =
      newImgs.length > 0 ? newImgs : existingProduct.productImgs;

    console.log(req.body);
    console.log(req.files);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API xóa sản phẩm
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Xóa sản phẩm thành công", deletedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
