require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category"); // Giả sử bạn có model Category
const Origin = require("../models/Origin"); // Giả sử bạn có model Origin
const Manufacturer = require("../models/Manufacturer");
const { uploadProduct } = require("../middlewares/uploadImage/uploads");
const BASE_URL = process.env.BASE_URL;

//API lấy danh sách sản phẩm
// router.get("/", async (req, res) => {
//   try {
//     const { page, limit } = req.query;
//     const products = await Product.find()
//       .populate("productCategory", "nameCategory")
//       .populate("productUnit", "nameUnit")
//       .populate("productManufacturer", "nameManufacturer")
//       .populate("productOrigin", "nameOrigin")
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .lean();
//     const total = await Product.countDocuments();
//     res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 12,
//       search = "",
//       category,
//       origin,
//       manufacturer,
//       sortBy = "productName",
//       sortOrder = "asc",
//     } = req.query;

//     const query = {};

//     // Search filter
//     if (search) {
//       query.productName = { $regex: search, $options: "i" }; // Case-insensitive search
//     }

//     // Category filter (Assuming category is an ObjectId)
//     if (category && mongoose.Types.ObjectId.isValid(category)) {
//       query.productCategory = category;
//     }

//     // Origin filter (Assuming origin is an ObjectId)
//     if (origin && mongoose.Types.ObjectId.isValid(origin)) {
//       query.productOrigin = origin;
//     }

//     // Manufacturer filter (Assuming manufacturer is an ObjectId)
//     if (manufacturer && mongoose.Types.ObjectId.isValid(manufacturer)) {
//       query.productManufacturer = manufacturer;
//     }

//     // Sorting configuration
//     const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

//     // Fetch total count
//     const total = await Product.countDocuments(query);

//     // Fetch paginated and sorted products
//     const products = await Product.find(query)
//       .populate("productCategory productManufacturer productOrigin productUnit")
//       .sort(sort)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({
//       products,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//     });
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
//   }
// });
router.get("/", async (req, res) => {
  const {
    page,
    limit,
    category,
    origin,
    manufacturer,
    sortBy = "productName",
    sortOrder = "asc",
    minPrice,
    maxPrice,
  } = req.query;

  const query = {};

  // Lọc danh mục
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.productCategory = category;
  }

  // Lọc xuất xứ
  if (origin && mongoose.Types.ObjectId.isValid(origin)) {
    query.productOrigin = origin;
  }

  // Lọc nhà sản xuất
  if (manufacturer && mongoose.Types.ObjectId.isValid(manufacturer)) {
    query.productManufacturer = manufacturer;
  }

  // 👉 Lọc theo khoảng giá
  if (minPrice || maxPrice) {
    query.productUnitPrice = {};
    if (minPrice) {
      query.productUnitPrice.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.productUnitPrice.$lte = parseFloat(maxPrice);
    }
  }

  // Sắp xếp
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // Lấy dữ liệu
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("productCategory productManufacturer productOrigin productUnit")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    products,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  });
});
// API tìm kiếm
router.get("/search", async (req, res) => {
  try {
    const { page, limit, q } = req.query;
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
      productQuantity,
      productWarranty,
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
