const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const upload = require("../midlewares/uploads");
const mongoose = require("mongoose");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000/";

module.exports = router;
