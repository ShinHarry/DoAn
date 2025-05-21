const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Bạn cần đăng nhập." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);

    req.user = {
      _id: decoded.userId,
      userRole: decoded.role,
      userAvatar: decoded.userAvatar || null,
    };

    next();
  } catch (err) {
    // Phân biệt lỗi rõ ràng hơn (hết hạn vs sai token)
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token đã hết hạn." });
    }
    return res.status(403).json({ message: "Token không hợp lệ." });
  }
};

module.exports = verifyToken;
