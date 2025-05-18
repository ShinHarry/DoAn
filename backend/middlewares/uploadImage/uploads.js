const multer = require("multer");
const path = require("path");

// Hàm kiểm tra file là ảnh
const isImage = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new Error("Chỉ hình ảnh mới được chấp nhận"), false);
};

// Cấu hình lưu ảnh sản phẩm
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/products");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${Date.now()}${ext}`);
  },
});

// Cấu hình lưu ảnh user
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/user");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${Date.now()}${ext}`);
  },
});

// Cấu hình lưu ảnh banner
const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/banners');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `banner-${Date.now()}${ext}`);
  }
});

// Cấu hình lưu ảnh category
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/category");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `category-${Date.now()}${ext}`);
  },
});

// Tạo các middleware upload
const uploadProduct = multer({ storage: productStorage, fileFilter: isImage });
const uploadUser = multer({ storage: userStorage, fileFilter: isImage });
const uploadBanner = multer({ storage: bannerStorage, fileFilter: isImage });
const uploadCategory = multer({ storage: categoryStorage, fileFilter: isImage });

module.exports = {
  uploadProduct,
  uploadUser,
  uploadBanner,
  uploadCategory,
};
