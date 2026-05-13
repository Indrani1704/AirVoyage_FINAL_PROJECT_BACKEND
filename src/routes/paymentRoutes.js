const router = require("express").Router();
const ctrl = require("../controllers/paymentController");


console.log("CTRL:", ctrl); // 🔥 debug

router.post("/create-order", ctrl.createOrder);
router.post("/verify",  ctrl.verifyPayment);
router.get("/my-bookings", ctrl.getMyBookings);
router.get("/ticket/:id",  ctrl.getTicket);
router.get(
  "/single-booking/:id",
  ctrl.getSingleBooking
);

module.exports = router;