const express = require("express");
const router = express.Router();
const {
  createHotel,
  getHotels,
  updateHotel,
  deleteHotel,
  searchHotels, // ✅ IMPORTANT
} = require("../controllers/hotelController");

const upload = require("../middleware/upload");

// 🔥 SEARCH (SMART FILTER)
router.get("/search", searchHotels);

// NORMAL CRUD
router.post("/", upload.single("image"), createHotel);
router.get("/", getHotels);
router.put("/:id", upload.single("image"), updateHotel);
router.delete("/:id", deleteHotel);

module.exports = router;