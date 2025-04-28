const express = require("express");
const router = express.Router();
const Sales = require("../models/Sale");
require("dotenv").config();
const BASE_URL = process.env.BASE_URL;

// Get all sales
router.get("/", async (req, res) => {
  try {
    const salesList = await Sales.find().sort({ createdAt: -1 });
    res.json(salesList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// lấy chi tiết
router.get("/:id", async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id)

    if (!sales) return res.status(404).json({ message: "Sales not found" });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thêm mới khuyến mãi
router.post("/", async (req, res) => {
  try {
    const { name, dateStart, dateEnd, discount, product } = req.body;

    // Validate dữ liệu
    if (!name || !dateStart || !dateEnd || !discount || !product) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // Tạo mới Sale
    const newSale = new Sales({
      name,
      dateStart,
      dateEnd,
      discount,
      product,
    });

    await newSale.save();

    res.status(201).json({ message: "Thêm khuyến mãi thành công!", sale: newSale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm khuyến mãi", error });
  }
});


// Update sale Promise((resolve, reject) => {
  
  router.put("/:id", async (req, res) => {
    try {
      const { name, dateStart, dateEnd, discount, product } = req.body;
  
      const updateData = {
        name,
        dateStart,
        dateEnd,
        discount,
        product,
      };
  
      const updatedSale = await Sales.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
  
      res.json(updatedSale);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  });
// Delete sales
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Sales.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Sales not found" });
    res.json({ message: "Sales deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;