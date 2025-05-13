const express = require("express");
const router = express.Router();
const Manufacturer = require("../models/Manufacturer");
router.get("/", async (req, res) => {
  try {
    const categories = await Manufacturer.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send("Lỗi khi lấy hãng sản xuất.");
  }
});


// Thêm mới origin
router.post("/", async (req, res) => {
  try {
    const { nameManufacturer, description } = req.body;

    // Validate dữ liệu
    if (!nameManufacturer || !description ) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const existingManufacturer = await Manufacturer.findOne({ nameManufacturer });
    if (existingManufacturer) {
      return res.status(409).json({ message: "Hãng sản xuất đã tồn tại." });
    }

    // Tạo mới Sale
    const newManufacturer = new Manufacturer({
      nameManufacturer,
      description,
    });

    await newManufacturer.save();

    res.status(201).json({ message: "Thêm hãng sản xuất thành công!", manufacturer: newManufacturer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm hãng sản xuất", error });
  }
});

// Update origin
  
router.put("/:id", async (req, res) => {
  try {
    const { nameManufacturer, description } = req.body;

    // Validate dữ liệu
    if (!nameManufacturer || !description ) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }
  
      const updateData = {
        nameManufacturer,
        description,
      };
  
      const updatedOManufacturer = await Manufacturer.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!updatedOManufacturer) {
        return res.status(404).json({ message: "Manufacturer not found" });
      }
  
      res.json(updatedOManufacturer);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  });

// Delete manufacturer
router.delete("/:id", async (req, res) => {
  try {
    console.log("cx vao day r", req.params.id)
    const deleted = await Manufacturer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Manufacturer not found" });
    res.json({ message: "Manufacturer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
