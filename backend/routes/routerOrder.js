const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const CartProduct = require("../models/CartProduct");
const verifyToken = require("../middlewares/Auth/verifyToken");

// Get all
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderList = await Order.find({ user: userId });

    const order = orderList.map((item) => ({
      _id: item._id,
      orderDetails: item.orderDetails,
      address: item.shippingAddress,
      phone: item.phone,
      name: item.name,
      shippingMethod: item.shippingMethod,
      shippingFee: item.shippingFee,
      subTotalPrice: item.subTotalPrice,
      totalAmount: item.totalAmount,
      discount: item.discount,
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

//Đánh giá
router.post("/:orderId/rating", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating } = req.body;

    const order = await Order.findById(orderId).populate(
      "orderDetails.product"
    );

    if (!order || order.orderStatus !== "completed") {
      return res
        .status(400)
        .json({ message: "Đơn hàng không hợp lệ hoặc chưa hoàn tất." });
    }

    if (order.hasRated) {
      return res
        .status(400)
        .json({ message: "Đơn hàng đã được đánh giá trước đó." });
    }

    for (const item of order.orderDetails) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        console.error("Không tìm thấy sản phẩm với id:", item.product._id);
        continue;
      }

      if (!product.productRatings) product.productRatings = [];

      product.productRatings.push({ userId: order.user, rating });

      const total = product.productRatings.reduce(
        (acc, cur) => acc + cur.rating,
        0
      );
      const avg = total / product.productRatings.length;
      product.productAvgRating = parseFloat(avg.toFixed(1));

      await product.save();
    }

    order.hasRated = true;
    await order.save();

    res.json({ message: "Đánh giá đã được lưu." });
  } catch (err) {
    console.error("Lỗi khi đánh giá:", err);
    res.status(500).json({ message: "Lỗi khi đánh giá.", error: err.message });
  }
});

//Cập nhật quản lý đơn hàng
router.put("/:orderId/orderStatus", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Thiếu trạng thái đơn hàng" });
    }

    const validStatuses = [
      "processing",
      "confirmed",
      "shipped",
      "completed",
      "cancelled",
      "returned",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: "Trạng thái đơn hàng không hợp lệ" });
    }

    // Lấy đơn hàng hiện tại
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Nếu chuyển sang 'returned' hoặc 'cancelled' lần đầu, hoàn kho
    if (
      (status === "returned" || status === "cancelled") &&
      order.orderStatus !== "returned" &&
      order.orderStatus !== "cancelled"
    ) {
      const productUpdates = order.orderDetails.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              productQuantity: item.quantity,
              productSoldQuantity: -item.quantity,
            },
          },
        },
      }));
      await Product.bulkWrite(productUpdates);
    }

    // Xác định paymentStatus mới
    let newPaymentStatus = order.paymentStatus;
    if (status === "completed" && order.paymentMethod === "cod") {
      newPaymentStatus = "completed";
    }
    if (status === "cancelled" || status === "returned") {
      newPaymentStatus = "failed";
    }

    // Chuẩn bị data cập nhật
    const updateData = {
      orderStatus: status,
      paymentStatus: newPaymentStatus,
    };
    if (status === "completed") {
      updateData.completeAt = new Date();
    } else if (status === "returned" && order.orderStatus === "completed") {
      updateData.completeAt = null;
    }

    // Cập nhật đơn hàng
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      message: "Cập nhật trạng thái thành công",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Get order detail by orderId
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
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
      discount: order.discount,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      hasRated: order.hasRated, // Thêm trường này
      items: order.orderDetails.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        productImage: item.productImage,
        productId: item.product,
      })),
    };
    res.json(orderDetail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders - tạo 1 đơn hàng mới
// POST /api/orders - tạo 1 đơn hàng mới
router.post("/", verifyToken, async (req, res) => {
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
    paymentMethod,
  } = req.body;
  const userId = req.user.id;

  if (
    !orderItems ||
    orderItems.length === 0 ||
    !shippingAddress ||
    !totalAmount
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin đơn hàng." });
  }

  try {
    let calculatedSubtotal = 0;
    const populatedOrderDetails = [];
    const productUpdates = [];
    const productIdsInOrder = orderItems.map((item) => item.product);

    // 1. Kiểm tra kho và tạo orderDetails
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.product} không tìm thấy.`);
      }
      if (product.productQuantity < item.quantity) {
        throw new Error(
          `Không đủ số lượng cho sản phẩm: ${product.productName}. Chỉ còn ${product.productQuantity}.`
        );
      }
      if (product.productStatus !== "available") {
        throw new Error(`Sản phẩm ${product.productName} hiện không có sẵn.`);
      }

      const itemSubTotal =
        product.productUnitPrice *
        (1 - (product.productSupPrice || 0) / 100) *
        item.quantity;
      calculatedSubtotal += itemSubTotal;

      populatedOrderDetails.push({
        product: product._id,
        productName: product.productName,
        productImage: product.productImgs?.[0]?.link || "",
        quantity: item.quantity,
        unitPrice:
          product.productUnitPrice * (1 - (product.productSupPrice || 0) / 100),
      });

      // Tính số lượng còn lại và trạng thái sản phẩm mới
      const newQuantity = product.productQuantity - item.quantity;
      const newStatus = newQuantity === 0 ? "out_of_stock" : "available";

      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $inc: {
              productQuantity: -item.quantity,
              productSoldQuantity: item.quantity,
            },
            $set: {
              productStatus: newStatus,
            },
          },
        },
      });
    }

    // 2. Tạo đơn hàng mới
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
      orderStatus: "processing",
      paymentStatus: paymentMethod === "vnpay" ? "completed" : "pending",
    });

    const savedOrder = await newOrder.save();

    // 3. Cập nhật lại kho
    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates);
    }

    // 4. Xóa sản phẩm trong giỏ hàng của user
    await CartProduct.deleteMany({
      userId: userId,
      product: { $in: productIdsInOrder },
    });

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res
      .status(
        error.message.includes("Không đủ số lượng") ||
          error.message.includes("không tìm thấy")
          ? 400
          : 500
      )
      .json({
        success: false,
        message: error.message || "Lỗi khi tạo đơn hàng.",
      });
  }
});

module.exports = router;
