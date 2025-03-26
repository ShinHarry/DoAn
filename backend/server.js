const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const db = require("./config/db");

dotenv.config(); // Load biến môi trường từ .env
const app = express();
const PORT = process.env.PORT || 5000;
const productRouter = require("./routes/productRoutes");

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
db.connect();

// Use routes
app.use("/api/products", productRouter);

const fs = require("fs");
// Kiểm tra và tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Created uploads directory");
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Server Running

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
