const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const CartProduct = require("../models/CartProduct");
const verifyToken = require('../middlewares/Auth/verifyToken');

// Get all 
router.get("/", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const orderList = await Order.find({ user: userId })
  
        const order = orderList.map(item => ({
            _id: item._id,
            orderDetails: item.orderDetails,
            address: item.shippingAddress,
            phone: item.phone,
            name: item.name,
            shippingMethod: item.shippingMethod,
            shippingFee: item.shippingFee,
            subTotalPrice: item.subTotalPrice,
            totalAmount: item.totalAmount,
            discount : item.discount,
            orderStatus: item.orderStatus,
            paymentMethod: item.paymentMethod,
            paymentStatus: item.paymentStatus,
            date: item.createdAt,
        }));

    res.json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Get order detail by orderId
router.get("/:orderId", async (req, res) => {
    try {
        const order  = await Order.findById(req.params.orderId)

        if (!order ) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
          }
  
          const orderDetail = {
            _id: order._id,
            user: order.user,
            name: order.name,
            phone: order.phone,
            address: order.shippingAddress,
            createdAt: order.createdAt,
            shippingMethod: order.shippingMethod,
            shippingFee: order.shippingFee,
            subTotalPrice: order.subTotalPrice,
            totalAmount: order.totalAmount,
            discount : order.discount,
            orderStatus: order.orderStatus,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            items: order.orderDetails.map((item) => ({
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                productImage: item.productImage,
        }))
      };
  
      res.json(orderDetail);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

// POST /api/orders - tạo 1 đơn hàng mới
router.post('/', verifyToken, async (req, res) => {
    const { 
        name,
        phone,
        shippingAddress,
        orderItems, 
        shippingMethod,
        shippingFee,
        totalPrice,
        totalAmount,
        discount,
        paymentMethod
    } = req.body;
    const userId = req.user.id;

    if (!orderItems || orderItems.length === 0 || !shippingAddress || !totalAmount) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng.' });
    }

    try {
        let calculatedSubtotal = 0;
        const populatedOrderDetails = [];
        const productUpdates = [];
        const productIdsInOrder = orderItems.map(item => item.product);

        // 1. ktra kho và tạo productsdetail
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Sản phẩm với ID ${item.product} không tìm thấy.`);
            }
            if (product.productQuantity < item.quantity) {
                throw new Error(`Không đủ số lượng cho sản phẩm: ${product.productName}. Chỉ còn ${product.productQuantity}.`);
            }
            if (product.productStatus !== 'available') {
                 throw new Error(`Sản phẩm ${product.productName} hiện không có sẵn.`);
            }

            const itemSubTotal = product.productUnitPrice  * (1 - (product.productSupPrice || 0) / 100) * item.quantity;
            calculatedSubtotal += itemSubTotal;
            //lấy thông tin sản phẩm chi tiết
            populatedOrderDetails.push({
                product: product._id,
                productName: product.productName,
                productImage: product.productImgs?.[0]?.link || '',
                quantity: item.quantity,
                unitPrice: product.productUnitPrice,
            });

            productUpdates.push({
                updateOne: {  //cập nhật một document trong MongoDB.
                    filter: { _id: product._id },
                    update: { 
                        $inc: { //toán tử MongoDB để tăng/giảm giá trị số.
                            productQuantity: -item.quantity, 
                            productSoldQuantity: item.quantity 
                        }
                    }
                }
            });
        }
        
        // 2. tạo mới đơn hàng
        const newOrder = new Order({
            user: userId,
            orderDetails: populatedOrderDetails,
            name,
            phone,
            shippingAddress,
            shippingMethod,
            shippingFee,
            subTotalPrice: calculatedSubtotal, 
            totalAmount: calculatedSubtotal + shippingFee - discount,
            discount,
            paymentMethod,
            orderStatus: 'processing',
            paymentStatus: paymentMethod === 'vnpay' ? 'completed' : 'pending',
        });

        const savedOrder = await newOrder.save();

        // 3. cập nhật lại kho
        if (productUpdates.length > 0) {
            await Product.bulkWrite(productUpdates); //hàm thực hiện nhiều thao tác. TH này là upadateOne
        }

        // 4. làm mới giỏ hàng
        await CartProduct.deleteMany({ userId: userId, product: { $in: productIdsInOrder } });

        res.status(201).json({ 
            success: true, 
            message: 'Đặt hàng thành công!', 
            order: savedOrder 
        });

    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(error.message.includes('Không đủ số lượng') || error.message.includes('không tìm thấy') ? 400 : 500)
           .json({ success: false, message: error.message || 'Lỗi khi tạo đơn hàng.' });
    }
});



module.exports = router; 