const AdminLog = require("../models/AdminLog");

module.exports = async ({ req, action, module, severity, metadata }) => {
  try {
    await AdminLog.create({
      admin: req.user?.email || "unknown",
      action,
      module,
      severity,
      metadata,
    });
  } catch (err) {
    console.log("Log error:", err.message);
  }
};