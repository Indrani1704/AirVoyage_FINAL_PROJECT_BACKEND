module.exports = (moduleName, action) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      // ✅ SUPERADMIN BYPASS
      if (req.user.role?.name === "superadmin") {
        return next();
      }

      const permissions = req.user.role?.permissions || [];

      const allowed = permissions.some(
        (p) =>
          p.module === moduleName &&
          p.actions?.includes(action)
      );

      if (!allowed) {
        return res.status(403).json({
          msg: `Access denied: ${moduleName}:${action}`,
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ msg: "Permission error" });
    }
  };
};