const mongoose = require("mongoose");

const PaymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String ,required: true},
    description : { type: String , required: true },
    paymentType : { type: String , required: true },


  },

);

module.exports = mongoose.model("Paymentmethod", PaymentMethodSchema);