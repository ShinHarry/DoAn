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
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
// Trong Product model, thêm đoạn này
ProductSchema.pre("save", function (next) {
  if (this.productQuantity === 0) {
    this.productStatus = "out_of_stock";
  } else {
    this.productStatus = "available";
  }
  next();
});

ProductSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.productQuantity !== undefined) {
    if (update.productQuantity === 0) {
      update.productStatus = "out_of_stock";
    } else {
      update.productStatus = "available";
    }
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
