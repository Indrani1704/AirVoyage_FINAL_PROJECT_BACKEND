const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  register,
  // verifyOtp,
  login,
} = require("../controllers/authController");

/* ================= AUTH ================= */

router.post("/register", register);

// router.post("/verify-otp", verifyOtp);

router.post("/login", login);

/* ================= GET LOGGED USER ================= */

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "No authorization header",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid auth format",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    console.log("TOKEN:", token);

    if (!token || token === "undefined") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret123"
    );

    console.log("DECODED:", decoded);

    const user = await User.findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({ user });

  } catch (err) {
    console.log("JWT ERROR:", err);

    res.status(401).json({
      message: "Invalid token",
    });
  }
});

module.exports = router;