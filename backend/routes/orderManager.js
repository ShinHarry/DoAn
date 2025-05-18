const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const CartProduct = require("../models/CartProduct");
const verifyToken = require('../middlewares/Auth/verifyToken');

// Get all orders (for admin)
router.get("/", async (req, res) => {
  try {
    const orderList = await Order.find().populate("user", "userName");

    const orders = orderList.map(item => ({
      _id: item._id,
      orderDetails: item.orderDetails,
      address: item.shippingAddress,
      phone: item.phone,
      name: item.name,
      shippingMethod: item.shippingMethod,
      shippingFee: item.shippingFee,
      subTotalPrice: item.subTotalPrice,
      totalAmount: item.totalAmount,
      orderStatus: item.orderStatus,
      paymentMethod: item.paymentMethod,
      paymentStatus: item.paymentStatus,
      date: item.createdAt,
      userName: item.user?.userName || "N/A"
    }));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.put('/:orderId/orderStatus', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Thiếu trạng thái đơn hàng' });
    }

    const validStatuses = ["processing", "confirmed", "shipped", "completed", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    // Lấy đơn hàng hiện tại
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Nếu chuyển sang 'returned' hoặc 'cancelled' lần đầu, hoàn kho
    if ((status === 'returned' || status === 'cancelled') &&
        (order.orderStatus !== 'returned' && order.orderStatus !== 'cancelled')) {

      const productUpdates = order.orderDetails.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              productQuantity: item.quantity,
              productSoldQuantity: -item.quantity
            }
          }
        }
      }));
      await Product.bulkWrite(productUpdates);
    }

    // Xác định paymentStatus mới
    let newPaymentStatus = order.paymentStatus;
    if (status === 'completed' && order.paymentMethod === 'cod') {
      newPaymentStatus = 'completed';
    }
    if (status === 'cancelled' || status === 'returned') {
      newPaymentStatus = 'failed';
    }

    // Chuẩn bị data cập nhật
    const updateData = {
      orderStatus: status,
      paymentStatus: newPaymentStatus,
    };
    if (status === 'completed') {
      updateData.completeAt = Date.now();
    }else if (status === 'returned' && order.orderStatus === 'completed') {
      updateData.completeAt = null;
    }

    // Cập nhật đơn hàng
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công', order: updatedOrder });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});






  
  
// Get order detail by orderId
router.get("/:orderId", async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId)
        .populate("user", "userName userPhone")
        .populate("orderDetails.product", "name price image")
        .lean();
  
      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }
  
      const orderDetail = {
        _id: order._id,
        user: order.user.userName,
        phone: order.user.userPhone,
        address: order.shippingAddress.fullAddress,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
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
            totalAmount: calculatedSubtotal + shippingFee,
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