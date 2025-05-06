const express = require("express");
const router = express.Router();
const PaymentMethod = require("../models/PaymentMethod");
require("dotenv").config();

// Get all news
router.get("/", async (req, res) => {
  try {
    const paymentList = await PaymentMethod.find();
    res.json(paymentList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;