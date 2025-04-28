const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema(
  {
    name: { type: String ,required: true},
    dateStart : { type: Date , required: true },
    dateEnd: { type: Date , required: true },
    discount:{ type: Number , required: true },
    product: { type: String , required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SalesSchema);