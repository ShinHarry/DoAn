const express = require("express");
const router = express.Router();
const Manufacturer = require("../models/Manufacturer");
const verifyToken = require("../middlewares/Auth/verifyToken");
const authPage = require("../middlewares/Auth/authoziration");
router.get("/", async (req, res) => {
  try {
    const response = await Manufacturer.find();
    res.json(response);
  } catch (err) {
    res.status(500).send("Lỗi khi lấy hãng sản xuất.");
  }
});

router.post("/", verifyToken, authPage(["mod"]), async (req, res) => {
  try {
    const { nameManufacturer, description } = req.body;

    // Validate dữ liệu
    if (!nameManufacturer || !description) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const existingManufacturer = await Manufacturer.findOne({
      nameManufacturer,
    });
    if (existingManufacturer) {
      return res.status(409).json({ message: "Hãng sản xuất đã tồn tại." });
    }

    const newManufacturer = new Manufacturer({
      nameManufacturer,
      description,
    });

    await newManufacturer.save();

    res.status(201).json({
      message: "Thêm hãng sản xuất thành công!",
      manufacturer: newManufacturer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm hãng sản xuất", error });
  }
});

router.put("/:id", verifyToken, authPage(["mod"]), async (req, res) => {
  try {
    const { nameManufacturer, description } = req.body;

    // Validate dữ liệu
    if (!nameManufacturer || !description) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const updateData = {
      nameManufacturer,
      description,
    };

    const updatedOManufacturer = await Manufacturer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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
router.delete("/:id", verifyToken, authPage(["mod"]), async (req, res) => {
  try {
    const deleted = await Manufacturer.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Manufacturer not found" });
    res.json({ message: "Manufacturer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
