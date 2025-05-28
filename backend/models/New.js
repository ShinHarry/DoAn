const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String ,required: true},
    summary : { type: String , required: true },
    content: { type: String , required: true },
    newImage: 
        {
          link: { type: String, required: true },
          alt: { type: String },
        },
    author: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
     },

    state: { type: Boolean, default: true , required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("New", NewsSchema);