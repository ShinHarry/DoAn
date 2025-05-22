const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const db = require("./config/db");
const cookieParser = require("cookie-parser");

const verifyToken = require("./middlewares/Auth/verifyToken");
const authPage = require("./middlewares/Auth/authoziration");
const RouterProduct = require("./routes/routerProduct");
const RouterUser = require("./routes/routerUser");
const RouterCart = require("./routes/routerCart");
const RouterCategory = require("./routes/routerCategory");
const RouterManufacturer = require("./routes/routerManufacturer");
const RouterOrigin = require("./routes/routerOrigin");
const RouterUnit = require("./routes/routerUnit");
const routerAuth = require("./routes/routerAuth");
const RouterNew = require("./routes/routerNew");
const RouterSale = require("./routes/routerSale");
const paymentMethodRouter = require("./routes/routerPaymentMethod");
const orderRouter = require("./routes/routerOrder");
const orderManagerRouter = require("./routes/orderManager");
const paymentRouter = require("./routes/routerPayment");
const statisticsRouter = require("./routes/routerStatistics");
const routerWishlist = require("./routes/routerWishlist");
const routerCategoryManager = require("./routes/CategoryManage");
const routerFeedback = require("./routes/routerFeedback");
const routerAdmin = require("./routes/routerAdmin");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://smarket.io.vn",
      "https://smarket.io.vn",
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.CLIENT_UR,
    ],

    credentials: true,
  })
);

// Connect to MongoDB
db.connect();

// Use routes
app.use("/api/admindashboard", verifyToken, authPage(["admin"]), routerAdmin);

app.use("/api/category", verifyToken, authPage(["mod"]), routerCategoryManager);

app.use("/api/users", RouterUser);
app.use("/api/carts", verifyToken, RouterCart);
app.use("/api/sales", verifyToken, RouterSale);

app.use("/api/orderM", orderManagerRouter);
app.use("/api/products", RouterProduct);
app.use("/api/categories", RouterCategory);
app.use("/api/manufacturers", RouterManufacturer);
app.use("/api/origins", RouterOrigin);
app.use("/api/units", RouterUnit);
app.use("/api/auth", routerAuth);
app.use("/api/news", RouterNew);
app.use("/api/orders", verifyToken, orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/wishlist", routerWishlist);
app.use("/api/feedback", routerFeedback);
app.use("/api/", paymentMethodRouter);
app.use("/public", express.static(path.join(__dirname, "public")));

// Server Running
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
