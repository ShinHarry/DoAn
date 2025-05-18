const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

router.post("/", async (req, res) => {
  try {
    const { product, user, order, comment } = req.body;

    const newFeedback = new Feedback({ product, user, order, comment });
    await newFeedback.save();

    res.status(201).json({ message: "Đã thêm bình luận thành công", feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ product: req.params.productId })
      .populate("user", "name") // chỉ lấy tên người dùng
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
