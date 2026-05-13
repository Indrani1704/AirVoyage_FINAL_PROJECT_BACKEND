const router =
  require("express").Router();

const ctrl =
  require("../controllers/bookingController");

/* ================= MY BOOKINGS ================= */

router.get(
  "/my-bookings",
  ctrl.getMyBookings
);

/* ================= GET ALL BOOKINGS ================= */

router.get(
  "/",
  ctrl.getBookings
);

/* ================= CREATE ORDER ================= */

router.post(
  "/create-order",
  ctrl.createOrder
);

/* ================= VERIFY PAYMENT ================= */

router.post(
  "/verify",
  ctrl.verifyPayment
);

/* ================= CANCEL BOOKING ================= */

router.put(
  "/cancel/:id",
  ctrl.cancelBooking
);

module.exports =
  router;