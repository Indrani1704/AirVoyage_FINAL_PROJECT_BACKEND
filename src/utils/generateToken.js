const jwt = require("jsonwebtoken");

exports.generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "secret123",
    {
      expiresIn: "7d",
    }
  );
};

exports.generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "secret123",
    {
      expiresIn: "30d",
    }
  );
};