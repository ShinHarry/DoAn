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

// Thêm sản phẩm vào giỏ hoặc cập nhật số lượng nếu có
router.post("/", async (req, res) => {
    // console.log("da vaod ay")
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm hoặc số lượng không hợp lệ.' });
    }

    try {
        // Kiểm tra xem sản phẩm có tồn tại và có sẵn không
        const product = await Product.findById(productId);
        if (!product || product.productStatus !== 'available') {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại hoặc đã hết hàng.' });
        }

        if (quantity > product.productQuantity) {
             return res.status(400).json({ success: false, message: `Số lượng tồn kho không đủ. Chỉ còn ${product.productQuantity} sản phẩm.` });
        }

        let cartItem = await CartProduct.findOne({ userId: userId, product: productId });

        if (cartItem) {
            //Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
            const newQuantity = cartItem.quantity + quantity;
             if (newQuantity > product.productQuantity) {
                return res.status(400).json({ success: false, message: `Số lượng tồn kho không đủ. Chỉ còn ${product.productQuantity} sản phẩm.` });
            }
            cartItem.quantity = newQuantity;
            await cartItem.save();
             // truy vấn thông tin sản phẩm từ bẳng khác
            await cartItem.populate({
                path: 'product',
                select: 'productName productImgs productUnitPrice productQuantity'
            });
             res.json({
                success: true,
                message: 'Cập nhật số lượng thành công!',
                cartItem: { //trả về get /
                     _id: cartItem._id.toString(),
                     productId: cartItem.product._id.toString(),
                     name: cartItem.product.productName,
                     image: cartItem.product.productImgs?.[0]?.link || '',
                     quantity: cartItem.quantity,
                     unitPrice: cartItem.product.productUnitPrice,
                     availableQuantity: cartItem.product.productQuantity,
                     selected: true,
                }
            });
        } else {
            // tạo mới 
            cartItem = new CartProduct({
                userId: userId,
                product: productId,
                quantity: quantity,
            });
            await cartItem.save();
             // truy vấn thông tin sản phẩm từ bẳng khác
             await cartItem.populate({
                path: 'product',
                select: 'productName productImgs productUnitPrice productQuantity'
            });
            res.status(201).json({
                success: true,
                message: 'Thêm vào giỏ hàng thành công!',
                cartItem: { //trả về get //
                    _id: cartItem._id.toString(),
                    productId: cartItem.product._id.toString(),
                    name: cartItem.product.productName,
                    image: cartItem.product.productImgs?.[0]?.link || '',
                    quantity: cartItem.quantity,
                    unitPrice: cartItem.product.productUnitPrice,
                    availableQuantity: cartItem.product.productQuantity,
                    selected: true,
                }
             });
        }
    } catch (err) {
        console.error("Add/Update Cart Item Error:", err);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm hoặc cập nhật giỏ hàng.' });
    }
});


// cập nhật lại số lượng sản phẩm trong giỏ
router.put("/:itemId", async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ.' });
    }

    try {
        const cartItem = await CartProduct.findOne({ _id: itemId, userId: userId }).populate('product', 'productQuantity productStatus');

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại trong giỏ hàng.' });
        }

        if (!cartItem.product || cartItem.product.productStatus !== 'available') {
             return res.status(400).json({ success: false, message: 'Sản phẩm này đã hết hàng hoặc không tồn tại.' });
        }

         if (quantity > cartItem.product.productQuantity) {
            return res.status(400).json({ success: false, message: `Số lượng tồn kho không đủ. Chỉ còn ${cartItem.product.productQuantity} sản phẩm.` });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        // truy vấn thông tin sản phẩm từ bẳng khác
        await cartItem.populate({
                path: 'product',
                select: 'productName productImgs productUnitPrice productQuantity'
            });

        res.json({
            success: true,
            message: 'Cập nhật số lượng thành công!',
            cartItem: { // trả về get /
                _id: cartItem._id.toString(),
                productId: cartItem.product._id.toString(),
                name: cartItem.product.productName,
                image: cartItem.product.productImgs?.[0]?.link || '',
                quantity: cartItem.quantity,
                unitPrice: cartItem.product.productUnitPrice,
                availableQuantity: cartItem.product.productQuantity,
                selected: true,
            }
        });
    } catch (err) {
        console.error("Update Cart Item Quantity Error:", err);
         if (err.name === 'CastError') { 
            return res.status(400).json({ success: false, message: 'ID sản phẩm giỏ hàng không hợp lệ.' });
        }
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật giỏ hàng.' });
    }
});


module.exports = router;
