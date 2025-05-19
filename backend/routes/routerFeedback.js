const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

router.post("/", async (req, res) => {
  try {
    const { product, user, order, comment,rating } = req.body;

    if (!comment || comment.length < 30) {
      return res.status(400).json({ message: "Phản hồi phải có ít nhất 30 ký tự" });
    }

    const newFeedback = new Feedback({ product, user, order, comment, rating });
    await newFeedback.save();

    res.status(201).json({ message: "Đã thêm bình luận thành công", feedback: newFeedback });
  } catch (error) {
     console.error("Lỗi khi lưu feedback:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ product: req.params.productId })
      .populate("user", "userName userAvatar")
      .populate({
          path: "product",
          select: "productRatings",
        })      
      .sort({ createdAt: -1 });
      const feedbacksWithUserRating = feedbacks.map(fb => {
        const userIdStr = fb.user._id?.toString();
        const productRatings = fb.product?.productRatings || [];

        const userRatingObj = productRatings.find(r => {
          return r.userId?.toString() === userIdStr;
        });

        return {
          ...fb.toObject(),
          userRating: userRatingObj?.rating ?? null
        };
      })

    console.log(feedbacks)
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
