const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
  {
    name: { type: String ,required: true , unique: true},
    image: {
      link: { type: String, required: true },
      alt: { type: String,  required: true },
    },
    type: { type: String ,required: true },
    dateStart : { type: Date , required: true },
    dateEnd: { type: Date , required: true },
    minimumOrder: { type: Number , required: true },
    discount:{ type: Number , required: true },
    minimizeOrder: { type: Number , required: true },
    count: { type: Number , required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", DiscountSchema);