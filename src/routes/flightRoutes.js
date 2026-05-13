const router = require("express").Router();
const ctrl = require("../controllers/flightController");
const Flight = require("../models/Flight"); 

router.get("/deals", async (req, res) => {
  try {
    const flights = await Flight.find()
      .sort({ createdAt: -1 }) // latest first
      .limit(3); 

    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD
router.post("/",  ctrl.createFlight);
router.get("/", ctrl.getFlights);
router.put("/:id", ctrl.updateFlight);
router.delete("/:id", ctrl.deleteFlight);

// FOOD
router.post("/:id/food",  ctrl.addFood);
router.put("/:id/food/:foodId",  ctrl.updateFood);
router.delete("/:id/food/:foodId",  ctrl.deleteFood);

// PRICING
router.put("/:id/pricing", ctrl.updatePricing);

// SEATS
router.put("/:id/seats",  ctrl.setSeats);

module.exports = router;