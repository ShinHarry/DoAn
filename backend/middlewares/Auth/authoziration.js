const authPage = (permissions) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json("Vui lòng đăng nhập!");
    }

    const role = user.role;

    if (!permissions.includes(role)) {
      return res
        .status(403)
        .json("Bạn không có quyền truy cập vào tài nguyên này!");
    }

    next();
  };
};

module.exports = authPage;
