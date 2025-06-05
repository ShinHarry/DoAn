const mongoose = require("mongoose");

const DiscountUserSchema = new mongoose.Schema(
  {
    user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
    discount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Discount",
          required: true,
        },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discountuser", DiscountUserSchema);