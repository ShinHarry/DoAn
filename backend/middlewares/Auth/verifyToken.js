const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "Bạn cần đăng nhập." });
    }

    const decoded = jwt.verify(token, process.env.secret_token);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      avatar: decoded.userAvatar || null, // phòng trường hợp không có
    };

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

module.exports = verifyToken;
