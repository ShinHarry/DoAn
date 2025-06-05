// const multer = require("multer");
// const path = require("path");

// // Hàm kiểm tra file là ảnh
// const isImage = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) cb(null, true);
//   else cb(new Error("Chỉ hình ảnh mới được chấp nhận"), false);
// };

// // Cấu hình lưu ảnh sản phẩm
// const productStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/products");
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `product-${Date.now()}${ext}`);
//   },
// });

// // Cấu hình lưu ảnh user
// const userStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `user-${Date.now()}${ext}`);
//   },
// });

// // Cấu hình lưu ảnh banner
// const bannerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/banners");
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, `banner-${Date.now()}${ext}`);
//   },
// });

// // Cấu hình lưu ảnh category
// const categoryStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/category");
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `category-${Date.now()}${ext}`);
//   },
// });

// // Tạo các middleware upload
// const uploadProduct = multer({ storage: productStorage, fileFilter: isImage });
// const uploadUser = multer({ storage: userStorage, fileFilter: isImage });
// const uploadBanner = multer({ storage: bannerStorage, fileFilter: isImage });
// const uploadCategory = multer({
//   storage: categoryStorage,
//   fileFilter: isImage,
// });

// module.exports = {
//   uploadProduct,
//   uploadUser,
//   uploadBanner,
//   uploadCategory,
// };

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../../utils/cloudinary");

const isImage = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new Error("Chỉ hình ảnh được chấp nhận"), false);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "temp_uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadProduct = multer({ storage, fileFilter: isImage });
const uploadUser = multer({ storage, fileFilter: isImage });
const uploadBanner = multer({ storage, fileFilter: isImage });
const uploadCategory = multer({ storage, fileFilter: isImage });
// const uploadDiscount = multer({ storage: discountStorage, fileFilter: isImages });
const uploadDiscount = multer({ storage, fileFilter: isImage });

const uploadToCloudinary = async (file, folder, namePrefix) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    public_id: `${namePrefix}-${Date.now()}`,
  });
  fs.unlinkSync(file.path); // Xoá file tạm
  return result.secure_url;
};

const uploadMultipleToCloudinary = async (files, folder, namePrefix) => {
  const uploads = files.map((file) =>
    uploadToCloudinary(file, folder, namePrefix)
  );
  return Promise.all(uploads);
};
// thêm để test discount
// Hàm kiểm tra file là ảnh
const isImages = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new Error("Chỉ hình ảnh mới được chấp nhận"), false);
};
// Cấu hình lưu ảnh discount
// const discountStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/discounts");
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, `discount-${Date.now()}${ext}`);
//   },
// });
//hết test

module.exports = {
  uploadProduct,
  uploadUser,
  uploadBanner,
  uploadCategory,
  uploadDiscount, //test
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
