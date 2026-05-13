const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  type: { type: String, enum: ["flat", "percent"] },
  value: Number,
  expiry: Date,
  minAmount: Number
});

module.exports = mongoose.model("Coupon", couponSchema);