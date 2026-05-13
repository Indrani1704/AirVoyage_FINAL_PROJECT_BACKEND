const Role = require("../../models/Role");
const User = require("../../models/User");
const Booking = require("../../models/Booking");
const AdminLog = require("../../models/AdminLog");
// ================= GET USERS + ROLES =================

// GET RBAC DATA
exports.getRBAC = async (req, res) => {
  const users = await User.find().populate("role");
  const roles = await Role.find();

  res.json({ users, roles });
};

// TOGGLE ADMIN
exports.toggleAdmin = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  user.isAdmin = !user.isAdmin;
  await user.save();

  res.json(user);
};

// CHANGE ROLE
exports.updateRole = async (req, res) => {
  const { userId, roleId } = req.body;

  await User.findByIdAndUpdate(userId, { role: roleId });

  res.json({ msg: "Role updated" });
};

// TOGGLE PERMISSION
exports.togglePermission = async (req, res) => {
  const { userId, module } = req.body;

  const user = await User.findById(userId);

  let perm = user.permissions.find(p => p.module === module);

  if (!perm) {
    user.permissions.push({ module, enabled: true });
  } else {
    perm.enabled = !perm.enabled;
  }

  await user.save();

  res.json(user);
};

exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("flightId")
      .lean(); // 🔥 important (prevents weird issues)

    const totalRevenue = bookings.reduce(
      (acc, b) => acc + (b.totalAmount || 0),
      0
    );

    const totalBookings = bookings.length;

    // ✅ REGION DEMAND (SAFE)
    const regionMap = {};

    bookings.forEach((b) => {
      const region =
        b.flightId && b.flightId.from
          ? b.flightId.from
          : "Unknown";

      regionMap[region] = (regionMap[region] || 0) + 1;
    });

    const regionData = Object.entries(regionMap).map(
      ([region, count]) => ({
        region,
        count,
      })
    );

    // ✅ CANCELLATION
    const cancelled = bookings.filter(
      (b) => b.status === "cancelled"
    ).length;

    const cancellationRate =
      totalBookings > 0
        ? ((cancelled / totalBookings) * 100).toFixed(2)
        : 0;

    // ✅ FORECAST (SAFE)
    const forecast = regionData.map((d) => ({
      ...d,
      predicted: d.count + Math.floor(Math.random() * 5),
    }));

    res.json({
      totalRevenue,
      totalBookings,
      regionData,
      cancellationRate,
      forecast,
    });
  } catch (err) {
    console.error("ADV ANALYTICS ERROR:", err); // 🔥 VERY IMPORTANT
    res.status(500).json({ msg: "Analytics Error" });
  }
};



// 🔥 FRAUD DETECTION
exports.getSecurityData = async (req, res) => {
  try {
    const bookings = await Booking.find();

    const suspicious = bookings.filter(
      (b) =>
        b.totalAmount > 100000 ||
        (b.seats && b.seats.length > 5)
    );

    res.json({
      suspiciousCount: suspicious.length,
      suspicious,
    });
  } catch (err) {
    res.status(500).json({ msg: "Security error" });
  }
};

// 🔥 ADMIN LOGS
exports.getLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .sort({ time: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json([]);
  }
};


/* ================= BACKUP ================= */
exports.backupData = async (req, res) => {
  try {
    const users = await User.find();
    const bookings = await Booking.find();
    const flights = await Flight.find();

    res.json({ users, bookings, flights });
  } catch (err) {
    res.status(500).json({ msg: "Backup failed" });
  }
};

/* ================= RESTORE ================= */
exports.restoreData = async (req, res) => {
  try {
    const { users, bookings, flights } = req.body;

    if (users?.length) await User.insertMany(users);
    if (bookings?.length) await Booking.insertMany(bookings);
    if (flights?.length) await Flight.insertMany(flights);

    res.json({ msg: "Data restored successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Restore failed" });
  }
};

/* ================= GDPR DELETE ================= */
exports.deleteUserData = async (req, res) => {
  try {
    const userId = req.params.userId;

    await Booking.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    // ✅ fallback admin name (since no auth)
    await AdminLog.create({
      admin: "system",
      action: "GDPR_DELETE_USER",
      metadata: { userId },
    });

    res.json({ msg: "User data deleted (GDPR)" });
  } catch (err) {
    res.status(500).json({ msg: "GDPR delete failed" });
  }
};

/* ================= AUDIT LOGS ================= */
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: "Logs fetch failed" });
  }
};

