const router = require("express").Router();
const ctrl = require("../controllers/userController");

// GET USERS
router.get("/", ctrl.getUsers);

// BLOCK / UNBLOCK
router.put("/block/:id", ctrl.toggleBlock);

// USER BOOKINGS
router.get("/:id/bookings", ctrl.getUserBookings);

module.exports = router;