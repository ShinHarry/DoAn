const express = require("express");
const router = express.Router();
const Origin = require("../models/Origin");
router.get("/", async (req, res) => {
  try {
    const categories = await Origin.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send("Lỗi khi lấy nơi xuất xứ.");
  }
});

// Thêm mới origin
router.post("/", async (req, res) => {
  try {
    const { nameOrigin, description, phone, address, email } = req.body;

    // Validate dữ liệu
    if (!nameOrigin || !description || !phone || !address || !email) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const existingOrigin = await Origin.findOne({ nameOrigin });
    if (existingOrigin) {
      return res.status(409).json({ message: "Nơi xuất xứ đã tồn tại." });
    }

    // Tạo mới Sale
    const newOrigin = new Origin({
      nameOrigin,
      description,
      phone,
      address,
      email,
    });

    await newOrigin.save();

    res.status(201).json({ message: "Thêm nơi xuất xứ thành công!", origin: newOrigin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm nơi xuất xứ", error });
  }
});

// Update origin
  
  router.put("/:id", async (req, res) => {
    try {
      console.log("cx vao day r", req.body)
     const { nameOrigin, description, phone, address, email } = req.body;

    // Validate dữ liệu
    if (!nameOrigin || !description || !phone || !address || !email) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }
  
      const updateData = {
        nameOrigin,
        description,
        phone,
        address,
        email,
      };
  
      const updatedOrigin = await Origin.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!updatedOrigin) {
        return res.status(404).json({ message: "Origin not found" });
      }
  
      res.json(updatedOrigin);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  });

// Delete origin
router.delete("/:id", async (req, res) => {
  try {
    console.log("cx vao day r", req.params.id)
    const deleted = await Origin.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Origins not found" });
    res.json({ message: "Origins deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
