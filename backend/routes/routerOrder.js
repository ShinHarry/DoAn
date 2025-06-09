const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
// const User = require("../models/User");
const Product = require("../models/Product");
const CartProduct = require("../models/CartProduct");
const DiscountUser = require("../models/DiscountUser");
const verifyToken = require("../middlewares/Auth/verifyToken");

// Get all order
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
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
    discountCode,
    discount,
    paymentMethod,
  } = req.body;
  const userId = req.user._id;

  if (!orderItems || orderItems.length === 0 || !shippingAddress) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin đơn hàng." });
  }

  try {
    let calculatedSubtotal = 0;
    const populatedOrderDetails = [];
    const productIdsInOrder = [];

    // 1. Kiểm tra kho và tạo orderDetails
    for (const item of orderItems) {
      // Cập nhật số lượng sản phẩm một cách atomic tránh tranh châps
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          productQuantity: { $gte: item.quantity },
          productStatus: "available",
        },
        {
          $inc: { productQuantity: -item.quantity },
        },
        { new: true }
      );
      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.product} không tìm thấy.`);
      }
      // Cập nhật trạng thái sản phẩm nếu hết hàng
      if (product.productQuantity === 0) {
        await Product.updateOne(
          { _id: product._id },
          { productStatus: "out_of_stock" }
        );
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

      productIdsInOrder.push(product._id);
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
      totalAmount:
        calculatedSubtotal + shippingFee - discount <= 0
          ? 0
          : calculatedSubtotal + shippingFee - discount,
      discount,
      paymentMethod,
      orderStatus: "processing",
      paymentStatus: paymentMethod === "vnpay" ? "completed" : "pending",
    });

    const savedOrder = await newOrder.save();

    // 3. Xóa sản phẩm trong giỏ hàng của user
    await CartProduct.deleteMany({
      userId: userId,
      product: { $in: productIdsInOrder },
    });

    // 4. Xóa mã giảm giá đã dùng nếu có
    if (discountCode && discountCode.trim() !== "") {
      await DiscountUser.deleteOne({
        user: userId,
        discount: discountCode,
      });
    }

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
      if (order.orderStatus === "completed") {
        let productUpdates = order.orderDetails.map((item) => ({
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
      } else {
        let productUpdates = order.orderDetails.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: {
              $inc: {
                productQuantity: item.quantity,
              },
            },
          },
        }));
        await Product.bulkWrite(productUpdates);
      }
    }
    // Đánh dấu là hoàn tất → cộng số lượng đã bán
    if (status === "completed" && order.orderStatus !== "completed") {
      const productUpdates = order.orderDetails.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              productSoldQuantity: item.quantity,
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

router.post("/:orderId/rating", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { feedbacks } = req.body;

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

    for (const feedback of feedbacks) {
      const { productId, rating, comment } = feedback;

      const product = await Product.findById(productId);
      if (!product) {
        console.error("Không tìm thấy sản phẩm:", productId);
        continue;
      }
      // Lưu vào productRatings
      //   const ratingData = { userId: order.user, rating };
      // product.productRatings.push(ratingData);
      //   const total = product.productRatings.reduce((acc, cur) => acc + cur.rating, 0);
      //   const avg = total / product.productRatings.length;
      //   product.productAvgRating = parseFloat(avg.toFixed(1));
      //   await product.save();

      // Lưu vào Feedback
      const newFeedback = new Feedback({
        product: productId,
        user: order.user,
        order: order._id,
        comment,
        rating,
      });

      await newFeedback.save();
    }

    order.hasRated = true;
    await order.save();

    res.json({ message: "Đánh giá và nhận xét đã được lưu." });
  } catch (err) {
    console.error("Lỗi khi đánh giá:", err);
    res.status(500).json({ message: "Lỗi khi đánh giá.", error: err.message });
  }
});

module.exports = router;
