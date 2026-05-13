const router = require("express").Router();
const ctrl = require("../controllers/couponController");

// ✅ ADD THIS
router.get("/", ctrl.getCoupons);

router.post("/apply", ctrl.applyCoupon);
router.post("/create", ctrl.createCoupon);

module.exports = router;