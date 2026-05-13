const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ msg: "User not found" });

    if (user.isBlocked)
      return res.status(403).json({ msg: "Blocked user" });

    req.user = user;

    next();
  } catch {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};


// 🔒 ROLE CHECK
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};


// 🔥 PERMISSION CHECK
exports.checkPermission = (module, action) => {
  return (req, res, next) => {
    const has = req.user.permissions?.some(
      (p) => p.module === module && p.actions.includes(action)
    );

    if (!has) {
      return res.status(403).json({ msg: "Permission denied" });
    }

    next();
  };
};