const mongoose = require('mongoose');

const cartProductSchema = new mongoose.Schema({

   product:{ type : mongoose.Schema.ObjectId, ref: 'Product'},

   image:{ type: String, require: true },

   price : { type: Number, require: true },

   quantity : { type: Number, default: 1 },

   subTotal:{ type: Number, require: true },
   
   userId : { type: mongoose.Schema.ObjectId , ref: 'User' }
},{
    timestamps: true
   }
);

module.exports = mongoose.model('Cartproduct', cartProductSchema);