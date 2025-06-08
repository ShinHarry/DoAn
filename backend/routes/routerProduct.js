// require("dotenv").config();
// const mongoose = require("mongoose");
// const express = require("express");
// const router = express.Router();
// const Product = require("../models/Product");
// const Category = require("../models/Category");
// const Origin = require("../models/Origin");
// const Manufacturer = require("../models/Manufacturer");
// const { uploadProduct } = require("../middlewares/uploadImage/uploads");
// const verifyToken = require("../middlewares/Auth/verifyToken");
// const authPage = require("../middlewares/Auth/authoziration");
// const BASE_URL = process.env.BASE_URL;

// router.get("/", async (req, res) => {
//   const {
//     page,
//     limit,
//     category,
//     origin,
//     manufacturer,
//     sortBy = "productName",
//     sortOrder = "asc",
//     minPrice,
//     maxPrice,
//   } = req.query;

//   const query = {};

//   // Lọc danh mục
//   if (category && mongoose.Types.ObjectId.isValid(category)) {
//     query.productCategory = category;
//   }

//   // Lọc xuất xứ
//   if (origin && mongoose.Types.ObjectId.isValid(origin)) {
//     query.productOrigin = origin;
//   }

//   // Lọc nhà sản xuất
//   if (manufacturer && mongoose.Types.ObjectId.isValid(manufacturer)) {
//     query.productManufacturer = manufacturer;
//   }

//   // 👉 Lọc theo khoảng giá
//   if (minPrice || maxPrice) {
//     query.productUnitPrice = {};
//     if (minPrice) {
//       query.productUnitPrice.$gte = parseFloat(minPrice);
//     }
//     if (maxPrice) {
//       query.productUnitPrice.$lte = parseFloat(maxPrice);
//     }
//   }

//   // Sắp xếp
//   const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

//   // Lấy dữ liệu
//   const total = await Product.countDocuments(query);
//   const products = await Product.find(query)
//     .populate("productCategory productManufacturer productOrigin productUnit")
//     .sort(sort)
//     .skip((page - 1) * limit)
//     .limit(parseInt(limit));

//   res.json({
//     products,
//     total,
//     page: parseInt(page),
//     limit: parseInt(limit),
//   });
// });
// // API tìm kiếm
// router.get("/search", async (req, res) => {
//   try {
//     const { page, limit, q } = req.query;
//     const query = q ? { productName: new RegExp(q, "i") } : {};
//     const products = await Product.find(query)
//       .populate("productCategory", "nameCategory")
//       .populate("productUnit", "nameUnit")
//       .populate("productManufacturer", "nameManufacturer")
//       .populate("productOrigin", "nameOrigin")
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .lean();
//     const total = await Product.countDocuments(query);

//     res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// //Lấy data đánh giá sản phẩm
// router.get("/rating/:productId", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.productId).select(
//       "productAvgRating productRatings"
//     );
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     res.json({
//       productAvgRating: product.productAvgRating,
//       productRatings: product.productRatings,
//     });
//   } catch (error) {
//     console.error("Lỗi lấy rating sản phẩm:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // API lấy chi tiết sản phẩm theo ID
// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("productCategory", "nameCategory")
//       .populate("productUnit", "nameUnit")
//       .populate("productManufacturer", "nameManufacturer")
//       .populate("productOrigin", "nameOrigin")
//       .lean();

//     if (!product) return res.status(404).json({ message: "Product not found" });

//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// // API thêm sản phẩm mới
// router.post(
//   "/",
//   verifyToken,
//   authPage(["mod"]),
//   uploadProduct.array("productImgs", 10),
//   async (req, res) => {
//     try {
//       const {
//         productName,
//         productUnitPrice,
//         productSupPrice,
//         productQuantity,
//         productWarranty,
//         productStatus,
//         productCategory,
//         productUnit,
//         productOrigin,
//         productManufacturer,
//         productDescription,
//         productSoldQuantity = 0,
//         productAvgRating = 0,
//       } = req.body;

//       let productImgs = [];
//       if (req.files && req.files.length > 0) {
//         productImgs = req.files.map((file) => ({
//           link: `${BASE_URL}public/products/${file.filename}`,
//           alt: productName,
//         }));
//       }

//       const newProduct = new Product({
//         productName,
//         productUnitPrice,
//         productSupPrice,
//         productQuantity,
//         productWarranty,
//         productStatus,
//         productCategory,
//         productDescription,
//         productManufacturer,
//         productOrigin,
//         productUnit,
//         productSoldQuantity,
//         productAvgRating,
//         productImgs: productImgs,
//       });
//       await newProduct.save();
//       res
//         .status(201)
//         .json({ message: "Thêm sản phẩm thành công!", product: newProduct });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Lỗi khi thêm sản phẩm", error });
//     }
//   }
// );

// // API cập nhật sản phẩm
// router.put(
//   "/:id",
//   verifyToken,
//   authPage(["mod"]),
//   uploadProduct.array("productImgs", 10),
//   async (req, res) => {
//     try {
//       const updatedData = req.body;

//       const existingProduct = await Product.findById(req.params.id);
//       if (!existingProduct) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       let newImgs = [];
//       if (req.files && req.files.length > 0) {
//         newImgs = req.files.map((file) => ({
//           link: `${BASE_URL}public/products/${file.filename}`,
//           alt: req.body.productName,
//         }));
//       }

//       updatedData.productImgs =
//         newImgs.length > 0 ? newImgs : existingProduct.productImgs;

//       const updatedProduct = await Product.findByIdAndUpdate(
//         req.params.id,
//         updatedData,
//         { new: true, runValidators: true }
//       );

//       res.json(updatedProduct);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// // API xóa sản phẩm
// router.delete("/:id", verifyToken, authPage(["mod"]), async (req, res) => {
//   try {
//     const deletedProduct = await Product.findByIdAndDelete(req.params.id);
//     if (!deletedProduct)
//       return res.status(404).json({ message: "Product not found" });
//     res.json({ message: "Xóa sản phẩm thành công", deletedProduct });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;
require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const CartProduct = require("../models/CartProduct");

const verifyToken = require("../middlewares/Auth/verifyToken");
const authPage = require("../middlewares/Auth/authoziration");
const {
  uploadProduct,
  uploadMultipleToCloudinary,
} = require("../middlewares/uploadImage/uploads");

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      category,
      origin,
      manufacturer,
      sortBy = "productName",
      sortOrder = "asc",
      minPrice,
      maxPrice,
      search = "",
    } = req.query;

    const query = {};
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }
    if (category && mongoose.Types.ObjectId.isValid(category))
      query.productCategory = category;
    if (origin && mongoose.Types.ObjectId.isValid(origin))
      query.productOrigin = origin;
    if (manufacturer && mongoose.Types.ObjectId.isValid(manufacturer))
      query.productManufacturer = manufacturer;
    if (minPrice || maxPrice) {
      query.productUnitPrice = {};
      if (minPrice) query.productUnitPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.productUnitPrice.$lte = parseFloat(maxPrice);
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("productCategory productManufacturer productOrigin productUnit")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ products, total, page: +page, limit: +limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Tìm kiếm sản phẩm
router.get("/search", async (req, res) => {
  try {
    const { page = 1, limit = 10, q } = req.query;
    const query = q ? { productName: new RegExp(q, "i") } : {};

    const products = await Product.find(query)
      .populate("productCategory", "nameCategory")
      .populate("productUnit", "nameUnit")
      .populate("productManufacturer", "nameManufacturer")
      .populate("productOrigin", "nameOrigin")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({ products, total, page: +page, limit: +limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Đánh giá sản phẩm
router.get("/rating/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "productAvgRating productRatings"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      productAvgRating: product.productAvgRating,
      productRatings: product.productRatings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Chi tiết sản phẩm
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("productCategory", "nameCategory")
      .populate("productUnit", "nameUnit")
      .populate("productManufacturer", "nameManufacturer")
      .populate("productOrigin", "nameOrigin");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Thêm sản phẩm mới
router.post(
  "/",
  verifyToken,
  authPage(["admin", "mod"]),
  uploadProduct.array("productImgs", 10),
  async (req, res) => {
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
      console.log("req.files:", req.files);
      console.log("req.body.productImgs:", req.body.productImgs);

      let productImgs = [];
      if (req.files?.length > 0) {
        const urls = await uploadMultipleToCloudinary(
          req.files,
          "products",
          "product"
        );
        productImgs = urls.map((url, i) => ({
          link: url,
          alt: productName || `image-${i}`,
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
        productImgs,
      });

      await newProduct.save();
      res.status(201).json({
        message: "Thêm sản phẩm thành công!",
        product: newProduct,
      });
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT: Cập nhật sản phẩm
router.put(
  "/:id",
  verifyToken,
  authPage(["admin", "mod"]),
  uploadProduct.array("productImgs", 10),
  async (req, res) => {
    try {
      const updatedData = req.body;
      console.log("req.files:", req.files);
      console.log("req.body.productImgs:", req.body.productImgs);

      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (req.files?.length > 0) {
        const urls = await uploadMultipleToCloudinary(
          req.files,
          "products",
          "product"
        );
        updatedData.productImgs = urls.map((url, i) => ({
          link: url,
          alt: updatedData.productName || `image-${i}`,
        }));
      } else {
        updatedData.productImgs = product.productImgs;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true, runValidators: true }
      );

      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE: Xóa sản phẩm
router.delete(
  "/:id",
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const productId = req.params.id;
      // Kiểm tra trong giỏ hàng
      const isInCart = await CartProduct.findOne({ product: productId });
      if (isInCart) {
        return res.status(400).json({
          message: `Sản phẩm vẫn còn trong giỏ hàng của khách hàng ID: ${isInCart.userId}`,
        });
      }
      // Kiểm tra trong đơn hàng
      const isInOrder = await Order.findOne({ "orderDetails.product": productId });
      if (isInOrder) {
        return res.status(400).json({
          message: `Sản phẩm vẫn tồn tại trong đơn hàng của khách hàng ID: ${isInOrder.user}`,
        });
      }
      // Nếu không tồn tại trong cart hoặc order, tiến hành xóa
      const deleted = await Product.findByIdAndDelete(productId);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Xóa sản phẩm thành công", deletedProduct: deleted });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
