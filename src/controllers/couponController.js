const Coupon = require("../models/Coupon");

exports.applyCoupon = async (req, res) => {
  const { code, total } = req.body;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    return res.status(400).json({ msg: "Invalid coupon" });
  }

  // 🔥 expiry check
  if (coupon.expiry && new Date() > coupon.expiry) {
    return res.status(400).json({ msg: "Coupon expired" });
  }

  // 🔥 min amount check
  if (coupon.minAmount && total < coupon.minAmount) {
    return res
      .status(400)
      .json({ msg: "Minimum amount not reached" });
  }

  let discount =
    coupon.type === "percent"
      ? (total * coupon.value) / 100
      : coupon.value;

  res.json({
    discount,
    final: total - discount,
  });
};

// 🔥 CREATE COUPON
exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, expiry, minAmount } = req.body;

    // ✅ basic validation
    if (!code || !type || !value) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // ✅ check duplicate
    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ msg: "Coupon already exists" });
    }

    // ✅ create
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      expiry,
      minAmount,
    });

    res.status(201).json({
      msg: "Coupon created successfully",
      coupon,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};





exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.json(coupons); // ✅ MUST return array
  } catch (err) {
    res.status(500).json({ message: "Error fetching coupons" });
  }
};