const express = require("express");
const router = express.Router();

const {
  createCar,
  getCars,
  updateCar,
  deleteCar,
  searchCars, // ✅ IMPORTANT
} = require("../controllers/carController");

const upload = require("../middleware/upload");

// 🔥 SMART SEARCH
router.get("/search", searchCars);

// CRUD
router.post("/", upload.single("image"), createCar);
router.get("/", getCars);
router.put("/:id", upload.single("image"), updateCar);
router.delete("/:id", deleteCar);

module.exports = router;