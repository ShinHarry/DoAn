const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderDetails: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        productImage: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
      },
    ],
    shippingAddress: { type: String, required: true },
    shippingMethod: { type: String, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    subTotalPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["processing", "confirmed", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
