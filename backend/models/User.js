const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String },
    userEmail: { type: String },
    userNameAccount: { type: String },
    userPassword: { type: String },
    userPhone: { type: Number },
    userBirthday: { type: Date },
    userGender: { type: String },
    userRole: { type: String },
    userStatus: { type: String },
    userPoint: { type: Number },
    userAvatar: {
      link: { type: String },
      alt: { type: String },
    },
    cart: {
      type: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
          }, // ID riêng cho mỗi cart item
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number, default: 1 },
          unitPrice: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    userAddress: {
      type: [
        {
          fullName: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          address: { type: String, required: true },
          city: { type: String, required: true },
          country: { type: String, required: true },
          _id: false
        }
      ],
      default: [],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
