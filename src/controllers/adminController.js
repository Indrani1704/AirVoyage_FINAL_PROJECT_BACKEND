const Booking = require("../models/Booking");
const User = require("../models/User");
const logAdminAction = require("../utils/logAdminAction");

exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find().populate("user flight");
  res.json(bookings);
};



exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, {
      blocked: true,
    });

    // 🔥 LOG HERE
    await logAdminAction({
      req,
      action: "BLOCK_USER",
      module: "users",
      severity: "high",
      metadata: { userId },
    });

    res.json({ msg: "User blocked" });
  } catch (err) {
    res.status(500).json({ msg: "Block error" });
  }
};