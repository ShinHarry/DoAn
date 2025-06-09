const express = require("express");
const router = express.Router();
const Unit = require("../models/Unit");
const verifyToken = require("../middlewares/Auth/verifyToken");
const authPage = require("../middlewares/Auth/authoziration");
router.get("/", async (req, res) => {
  try {
    const response = await Unit.find();
    res.json(response);
  } catch (err) {
    res.status(500).send("Lỗi khi lấy danh mục sản phẩm.");
  }
});

router.post("/", verifyToken, authPage(["admin", "mod"]), async (req, res) => {
  try {
    const { nameUnit, description } = req.body;

    // Validate dữ liệu
    if (!nameUnit || !description) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const existingUnit = await Unit.findOne({
      nameUnit,
    });
    if (existingUnit) {
      return res.status(409).json({ message: "Đơn vị đã tồn tại." });
    }

    const newUnit = new Unit({
      nameUnit,
      description,
    });

    await newUnit.save();

    res.status(201).json({
      message: "Thêm đơn vị thành công!",
      unit: newUnit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm đơn vị", error });
  }
});

router.put(
  "/:id",
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const { nameUnit, description } = req.body;
      // Validate dữ liệu
      if (!nameUnit || !description) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin." });
      }

      const updateData = {
        nameUnit,
        description,
      };

      const updatedUnit = await Unit.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedUnit) {
        return res.status(404).json({ message: "Unit not found" });
      }

      res.json(updatedUnit);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  }
);

// Delete manufacturer
router.delete(
  "/:id",
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const deleted = await Unit.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Unit not found" });
      res.json({ message: "Unit deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
