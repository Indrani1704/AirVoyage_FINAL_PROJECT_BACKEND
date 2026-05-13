const router =
  require("express").Router();

const ctrl =
  require(
    "../controllers/carBookingController"
  );

/* ================= CREATE ================= */

router.post(
  "/book",
  ctrl.createCarBooking
);

/* ================= USER BOOKINGS ================= */

router.get(
  "/my-bookings",
  ctrl.getMyCarBookings
);

/* ================= ADMIN BOOKINGS ================= */

router.get(
  "/admin-bookings",
  ctrl.getAllCarBookings
);

/* ================= RECEIPT ================= */

router.get(
  "/receipt/:id",
  ctrl.downloadCarReceipt
);

module.exports = router;