const express = require("express");
const router = express.Router();
const Sales = require("../models/Sale");
const Discounts = require("../models/Discount");
const DiscountUser = require("../models/DiscountUser");
require("dotenv").config();
const {
  uploadDiscount,
  uploadToCloudinary,
} = require("../middlewares/uploadImage/uploads");
const verifyToken = require("../middlewares/Auth/verifyToken");
const authPage = require("../middlewares/Auth/authoziration");
const BASE_URL = process.env.BASE_URL;

// Get all sales
router.get("/sale", async (req, res) => {
  try {
    const salesList = await Sales.find().sort({ createdAt: -1 });
    // console.log(salesList)
    res.json(salesList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get all discounts
router.get("/discount", async (req, res) => {
  try {
    const discountsList = await Discounts.find().sort({ createdAt: -1 });
    res.json(discountsList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// lấy all discount cả người dùng
router.get("/myDiscount", async (req, res) => {
  try {
    const userId = req.user._id;

    const discountList = await DiscountUser.find({ user: userId })
      .populate("discount")
      .sort({ createdAt: -1 });

    res.json(discountList);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách mã của người dùng:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// lấy chi tiết khuyêns mãi
router.get("/:id", async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id);

    if (!sales) return res.status(404).json({ message: "Sales not found" });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// lấy chi tiết discount
router.get("/discount/:id", async (req, res) => {
  try {
    const discount = await Discounts.findById(req.params.id);
    if (!discount)
      return res.status(404).json({ message: "Discount not found" });
    res.json(discount);
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
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // Kiểm tra dateEnd phải sau dateStart
    if (new Date(dateEnd) <= new Date(dateStart)) {
      return res
        .status(402)
        .json({ message: "Ngày kết thúc phải sau ngày bắt đầu." });
    }

    const existingSale = await Sales.findOne({ name });
    if (existingSale) {
      return res.status(409).json({ message: "Tên khuyến mãi đã tồn tại." });
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

    res
      .status(201)
      .json({ message: "Thêm khuyến mãi thành công!", sale: newSale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm khuyến mãi", error });
  }
});

// Thêm mới discount
router.post(
  "/discount",
  uploadDiscount.single("image"),
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const {
        name,
        type,
        dateStart,
        dateEnd,
        minimumOrder,
        discount,
        minimizeOrder,
        count,
      } = req.body;
      // Validate dữ liệu
      if (
        !name ||
        !type ||
        !dateStart ||
        !dateEnd ||
        !minimumOrder ||
        !discount ||
        !minimizeOrder ||
        !count
      ) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin." });
      }

      // Kiểm tra dateEnd phải sau dateStart
      if (new Date(dateEnd) <= new Date(dateStart)) {
        return res
          .status(402)
          .json({ message: "Ngày kết thúc phải sau ngày bắt đầu." });
      }
      let image = { link: "", alt: name };

      if (req.file) {
        const cloudinaryUrl = await uploadToCloudinary(
          req.file,
          "discounts",
          "discount"
        );
        discountImg.link = cloudinaryUrl;
        discountImg.alt = name;
      }

      // Tạo mới Sale
      const newDiscount = new Discounts({
        name,
        type,
        dateStart,
        dateEnd,
        minimumOrder,
        discount,
        minimizeOrder,
        count,
        image,
      });

      console.log(newDiscount);

      await newDiscount.save();

      res.status(201).json({
        message: "Thêm mã giảm giá thành công!",
        discount: newDiscount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi thêm mã giảm giá", error });
    }
  }
);

// Update sale Promise((resolve, reject) => {
router.put("/:id", async (req, res) => {
  try {
    const { name, dateStart, dateEnd, discount, product } = req.body;

    // Validate dữ liệu
    if (!name || !dateStart || !dateEnd || !discount || !product) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const updateData = {
      name,
      dateStart,
      dateEnd,
      discount,
      product,
    };

    const updatedSale = await Sales.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(updatedSale);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.put(
  "/discount/:id",
  uploadDiscount.single("image"),
  verifyToken,
  authPage(["admin", "mod"]),
  async (req, res) => {
    try {
      const {
        name,
        type,
        dateStart,
        dateEnd,
        minimumOrder,
        discount,
        minimizeOrder,
        count,
      } = req.body;

      if (
        !name ||
        !type ||
        !dateStart ||
        !dateEnd ||
        !minimumOrder ||
        !discount ||
        !minimizeOrder ||
        !count
      ) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin." });
      }

      let image = { link: "", alt: name };

      if (req.file) {
        const cloudinaryUrl = await uploadToCloudinary(
          req.file,
          "discounts",
          "discount"
        );
        discountImg.link = cloudinaryUrl;
        discountImg.alt = name;
      }

      const updateData = {
        name,
        type,
        dateStart,
        dateEnd,
        minimumOrder,
        discount,
        minimizeOrder,
        count,
        image,
      };

      const updatedDiscount = await Discounts.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedDiscount) {
        return res.status(404).json({ message: "Discount not found" });
      }

      res.json({
        message: "Cập nhật mã giảm giá thành công!",
        discount: updatedDiscount,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete sale
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Sales.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Sales not found" });
    res.json({ message: "Sales deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete discount
router.delete("/discount/:id", async (req, res) => {
  try {
    const deletedDiscount = await Discounts.findByIdAndDelete(req.params.id);
    if (!deletedDiscount)
      return res.status(404).json({ message: "Discount not found" });
    // Xóa tất cả các DiscountUser liên quan đến discount này
    await DiscountUser.deleteMany({ discount: req.params.id });
    res.json({ message: "Xóa mã giảm giá thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Lưu discount cho người dùng
router.post("/saveDiscount", async (req, res) => {
  try {
    const userId = req.user._id;
    const { discountId } = req.body;

    if (!discountId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu discountId" });
    }

    const existed = await DiscountUser.findOne({
      user: userId,
      discount: discountId,
    });
    if (existed) {
      return res
        .status(200)
        .json({ success: false, message: "Bạn đã lưu mã này rồi." });
    }

    const discount = await Discounts.findOneAndUpdate(
      { _id: discountId, count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { new: true }
    );

    if (!discount) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết lượt sử dụng hoặc không tồn tại.",
      });
    }

    const saved = new DiscountUser({
      user: userId,
      discount: discountId,
    });
    await saved.save();

    return res
      .status(200)
      .json({ success: true, message: "Lưu mã thành công!" });
  } catch (err) {
    console.error("Lỗi khi lưu mã:", err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
