const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token không được cung cấp." });
    }

    const decoded = jwt.verify(token, process.env.secret_token);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      avatar: decoded.userAvatar || null, // phòng trường hợp không có
      idCard: decoded.idCard || null, // phòng trường hợp không có
    };

    next();
  } catch (error) {
    console.error("verifyToken Error:", error);
    return res
      .status(403)
      .json({ success: false, message: "Token không hợp lệ hoặc hết hạn." });
  }
};

module.exports = verifyToken;
