const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
