require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const CartProduct = require("../models/CartProduct");
const verifyToken = require('../middlewares/Auth/verifyToken'); // Import verifyToken

//Áp dụng verifyToken middleware cho tất cả cart routes
router.use(verifyToken);
// Lấy cart
router.get("/", async (req, res) => {
  const userId = req.user.id; // userId người dùng
  try {
      const cartItems = await CartProduct.find({ userId: userId }) // tim theo userId
          .populate({
              path: 'product',
              select: 'productName productImgs productUnitPrice productQuantity productStatus', // truy vấn qua các bảng
              match: { productStatus: 'available' } // chỉ lấy các sp còn hàng
          })
          .lean();

      // lọc ra các sản phẩm còn tồn tại 
      const validCartItems = cartItems.filter(item => item.product);

      const cart = validCartItems.map(item => ({
          _id: item._id.toString(), // cartId
          productId: item.product._id.toString(),
          name: item.product.productName,
          image: item.product.productImgs?.[0]?.link || '',
          quantity: item.quantity,
          unitPrice: item.product.productUnitPrice,
          availableQuantity: item.product.productQuantity, // thêm số lượng còn hàng
          selected: true,
      }));

      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      res.json({ cart, totalQuantity, totalPrice });
  } catch (err) {
      console.error("Get Cart Error:", err);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy giỏ hàng' });
  }
});


module.exports = router;
