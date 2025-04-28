const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const db = require("./config/db");

const RouterProduct = require("./routes/routerProduct");
const RouterUser = require("./routes/routerUser");
const RouterCart = require("./routes/routerCart");
const RouterCategory = require("./routes/routerCategory");
const RouterManufacturer = require("./routes/routerManufacturer");
const RouterOrigin = require("./routes/routerOrigin");
const RouterUnit = require("./routes/routerUnit");
const routerAuth = require("./routes/routerAuth");

const RouterNew =  require("./routes/routerNew");
const verifyToken = require("./middlewares/Auth/verifyToken");
const RouterSale =  require("./routes/routerSale");
const RouterSale =  require("./routes/routerSale");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
db.connect();

// Use routes
app.use("/api/products", RouterProduct);
app.use("/api/users", RouterUser);
app.use("/api/carts", RouterCart);
app.use("/api/categories", RouterCategory);
app.use("/api/manufacturers", RouterManufacturer);
app.use("/api/origins", RouterOrigin);
app.use("/api/units", RouterUnit);
app.use("/api/auth", routerAuth);
app.use("/api/news", RouterNew);
app.use("/api/sales", RouterSale);


app.use("/public", express.static(path.join(__dirname, "public")));

// Server Running
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
