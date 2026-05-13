const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    admin: String,
    action: String,
    module: String,
    severity: String,
    metadata: Object,
  },
  {
    timestamps: true, // 🔥 THIS IS MANDATORY
  }
);

module.exports = mongoose.model("AdminLog", adminLogSchema);