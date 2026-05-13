const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/superadmin/controller");
const { protect } = require("../middleware/auth");
const permit = require("../middleware/permission");
const Booking = require("../models/Booking");

// RBAC
router.get("/rbac", ctrl.getRBAC);
router.post("/toggle-admin", ctrl.toggleAdmin);
router.post("/permission", ctrl.togglePermission);
router.post("/toggle-admin", ctrl.toggleAdmin);
router.get(
  "/advanced-analytics",
  ctrl.getAdvancedAnalytics
);
router.get("/security",  ctrl.getSecurityData);
router.get("/logs",  ctrl.getLogs);

router.get("/backup", ctrl.backupData);
router.post("/restore", ctrl.restoreData);
router.delete("/gdpr/:userId", ctrl.deleteUserData);
router.get("/audit-logs", ctrl.getAuditLogs);




router.get("/analytics", async (req, res) => {
  try {

    const bookings = await Booking.find({});

    // TOTAL BOOKINGS
    const totalBookings = bookings.length;

    // TOTAL REVENUE
    const totalRevenue = bookings.reduce((sum, item) => {
      return sum + Number(item.totalAmount || 0);
    }, 0);

    // CANCELLED BOOKINGS
    const cancelledBookings = bookings.filter(
      (item) =>
        item.bookingStatus &&
        item.bookingStatus.toLowerCase() === "cancelled"
    ).length;

    // CANCELLATION RATE
    const cancellationRate =
      totalBookings > 0
        ? Number(
            (
              (cancelledBookings / totalBookings) *
              100
            ).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      success: true,
      totalRevenue,
      totalBookings,
      cancellationRate,
    });

  } catch (error) {

    console.log("ANALYTICS ERROR =", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;