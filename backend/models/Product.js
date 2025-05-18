const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productImgs: [
      {
        link: { type: String, required: true },
        alt: { type: String },
      },
    ],
    productUnitPrice: { type: Number, required: true },
    productSupPrice: { type: Number },
    productDescription: { type: String, required: true },
    productQuantity: { type: Number, required: true },
    productSoldQuantity: { type: Number, required: true },
    productWarranty: { type: Number, required: true },
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    productUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    productManufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
      required: true,
    },
    productOrigin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Origin",
      required: true,
    },
    productStatus: {
      type: String,
      enum: ["available", "out_of_stock"],
      default: "available",
    },
    productAvgRating: { type: Number, default: 0 },
    productRatings: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }
],

  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
