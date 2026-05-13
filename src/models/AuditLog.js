const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  action: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  data: Object
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditSchema);