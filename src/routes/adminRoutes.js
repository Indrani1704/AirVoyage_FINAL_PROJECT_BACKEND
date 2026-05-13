const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/bookings", protect, authorize("admin"), ctrl.getAllBookings);
router.put("/block/:id", protect, authorize("admin"), ctrl.blockUser);

module.exports = router;