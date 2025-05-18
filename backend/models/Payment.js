const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  PaymentName: { type: String, required: true },
  PaymentImg: {
    link: { type: String, required: true },
    alt: { type: String, required: true },
  },
  PaymentDescription: { type: String, required: true },
});

module.exports = mongoose.model("Payment", PaymentSchema);
