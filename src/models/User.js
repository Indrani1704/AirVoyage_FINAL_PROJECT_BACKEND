const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },

  permissions: [
    {
      module: String,
      actions: [String],
    },
  ],

  isVerified: {
    type: Boolean,
    default: false,
  },

  isBlocked: {
    type: Boolean,
    default: false,
  },

  // otp: String,
  // otpExpire: Date,

  refreshToken: String,

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);