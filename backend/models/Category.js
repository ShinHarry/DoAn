const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  nameCategory: { type: String, required: true },
  CategoryImg: {
    link: { type: String, required: true },
    alt: { type: String, required: true },
  },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Category", CategorySchema);
