const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nameProduct: { type: String, required: true },
    description: { type: String },
    warranty: { type: Number, default: 0 }, // Bảo hành (tháng)
    quantity: { type: Number, required: true }, // Số lượng tồn kho
    quantityIn: { type: Number, required: true }, // Số lượng nhập
    priceIn: { type: Number, required: true }, // Giá nhập
    price: { type: Number, required: true }, // Giá bán
    promotional: { type: Number }, // Giá khuyến mãi (nếu có)
    status: { type: String, default: "Còn hàng" }, // Trạng thái sản phẩm
    image: { type: String }, // Ảnh chính
    gallery: [{ type: String }], // Danh sách ảnh
    sold: { type: Number, default: 0 }, // Số lượng đã bán
    liked: { type: Number, default: 0 }, // Số lượt thích
    idInvoiceIn: { type: mongoose.Schema.Types.ObjectId, ref: "InvoiceIn" }, // Hóa đơn nhập hàng
    idCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Danh mục
    idUnit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" }, // Đơn vị tính
    idManufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
    }, // Hãng sản xuất
    idOrigin: { type: mongoose.Schema.Types.ObjectId, ref: "Origin" }, // Xuất xứ
  },
  { timestamps: true }
); // Thêm createdAt và updatedAt

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
