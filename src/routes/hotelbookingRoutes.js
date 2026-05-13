const express =
  require("express");

const router =
  express.Router();

const {

  createHotelBooking,

  getMyHotelBookings,

  downloadHotelInvoice,

  getAllHotelBookings,

} = require(
  "../controllers/hotelBookingController"
);

/* ================= CREATE HOTEL BOOKING ================= */

router.post(
  "/create",
  createHotelBooking
);

/* ================= GET MY HOTEL BOOKINGS ================= */

router.get(
  "/my-bookings",
  getMyHotelBookings
);

/* ================= DOWNLOAD HOTEL INVOICE ================= */

router.get(
  "/invoice/:id",
  downloadHotelInvoice
);
router.get(
  "/",
  getAllHotelBookings
);
module.exports =
  router;