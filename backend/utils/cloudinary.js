const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, folder, namePrefix) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: folder,
    public_id: `${namePrefix}-${Date.now()}`,
  });
  fs.unlinkSync(file.path); // Xoá ảnh tạm local
  return result.secure_url; // Link ảnh Cloudinary
};

module.exports = {
  uploadToCloudinary,
};
