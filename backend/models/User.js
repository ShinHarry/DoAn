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
    userAddress: {
      type: [
        {
          fullName: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          address: { type: String, required: true },
          city: { type: String, required: true },
          country: { type: String, required: true },
          _id:{ type: mongoose.Schema.Types.ObjectId, auto: true }
        }
      ],
      default: [],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
