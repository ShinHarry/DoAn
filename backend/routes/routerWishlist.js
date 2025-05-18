const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const verifyToken = require('../middlewares/Auth/verifyToken');

// GET /api/wishlist - Lấy wishlist của người dùng
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.find({ userId });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy wishlist", error: err.message });
  }
});



// POST /api/wishlist - Thêm sản phẩm vào wishlist
router.post("/", verifyToken, async (req, res) => {
  try {
    const { productId, name, price, image } = req.body;
    const userId = req.user.id;

    if (!productId || !name || typeof price !== "number" || !image) {
      return res.status(400).json({ message: "Thiếu thông tin hoặc sai định dạng" });
    }

    const existed = await Wishlist.findOne({ productId, userId });
    if (existed) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại trong wishlist" });
    }

    const newItem = new Wishlist({ productId, name, price, image, userId });
    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi thêm vào wishlist", error: err.message });
  }
});

// DELETE /api/wishlist/:id - Xoá 1 sản phẩm khỏi wishlist
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Wishlist.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong wishlist" });
    }
    res.json({ message: "Xoá sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi xoá sản phẩm", error: err.message });
  }
});

// DELETE /api/wishlist/clear - Xoá toàn bộ wishlist của user
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await Wishlist.deleteMany({ userId });
    res.json({ message: "Xoá toàn bộ wishlist thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi xoá wishlist", error: err.message });
  }
});

module.exports = router;