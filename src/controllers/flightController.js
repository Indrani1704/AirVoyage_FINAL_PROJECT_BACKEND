const Flight = require("../models/Flight");
const logAdminAction = require("../utils/logAdminAction");

// ================= CREATE FLIGHT =================
exports.createFlight = async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      from,
      to,
      departureTime,
      arrivalTime,
      aircraft,
      economySeats,
      businessSeats,
      basePrice,
    } = req.body;

    if (!flightNumber || !from || !to) {
      return res.status(400).json({
        message: "Flight number, from & to are required",
      });
    }

    const exists = await Flight.findOne({ flightNumber });
    if (exists) {
      return res.status(400).json({
        message: "Flight already exists",
      });
    }

    const seats = [];

    for (let i = 1; i <= (businessSeats || 0); i++) {
      seats.push({
        seatNumber: `B${i}`,
        class: "business",
        price: basePrice * 2,
        isBooked: false,
      });
    }

    for (let i = 1; i <= (economySeats || 0); i++) {
      seats.push({
        seatNumber: `E${i}`,
        class: "economy",
        price: basePrice,
        isBooked: false,
      });
    }

    const flight = await Flight.create({
      flightNumber,
      airline: airline || "AirVoyage",
      from,
      to,
      departureTime,
      arrivalTime,
      aircraft,
      basePrice,
      seats,
      totalSeats: seats.length,
      seatsAvailable: seats.length,
    });

    // 🔥 LOG CREATE
    await logAdminAction({
      req,
      action: "CREATE_FLIGHT",
      module: "flights",
      severity: "medium",
      metadata: {
        flightId: flight._id,
        route: `${from}-${to}`,
      },
    });

    res.status(201).json(flight);
  } catch (err) {
    console.error("CREATE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ================= GET ALL =================
// controllers/flightController.js

exports.getFlights = async (req, res) => {
  try {
    let { from, to, date } = req.query;

    
    const normalize = (str) =>
      str.toLowerCase().replace(/\s+/g, "").trim();

    let query = {};

    if (from) {
      const f = normalize(from);
      query.from = new RegExp(f, "i");
    }

    if (to) {
      const t = normalize(to);
      query.to = new RegExp(t, "i");
    }

    // ✅ DATE FILTER (PERFECT)
    if (date) {
      const start = new Date(date + "T00:00:00.000Z");
      const end = new Date(date + "T23:59:59.999Z");

      query.departureTime = {
        $gte: start,
        $lte: end,
      };
    }

    console.log("QUERY:", query);

    // 🔥 IMPORTANT: normalize DB fields on the fly
    const flights = await Flight.find().then((docs) =>
      docs.filter((f) => {
        const dbFrom = normalize(f.from);
        const dbTo = normalize(f.to);

        const matchFrom = from ? dbFrom.includes(normalize(from)) : true;
        const matchTo = to ? dbTo.includes(normalize(to)) : true;

        const matchDate = date
          ? new Date(f.departureTime) >= new Date(date + "T00:00:00.000Z") &&
            new Date(f.departureTime) <= new Date(date + "T23:59:59.999Z")
          : true;

        return matchFrom && matchTo && matchDate;
      })
    );

    console.log("RESULT:", flights.length);

    res.json(flights);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ================= GET ONE =================
exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json(flight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= UPDATE =================
exports.updateFlight = async (req, res) => {
  try {
    // 🔥 PREVENT DUPLICATE FLIGHT NUMBER
    if (req.body.flightNumber) {
      const exists = await Flight.findOne({
        flightNumber: req.body.flightNumber,
        _id: { $ne: req.params.id }, // ignore current flight
      });

      if (exists) {
        await logAdminAction({
          req,
          action: "UPDATE_FAILED",
          module: "flights",
          severity: "high",
          metadata: {
            reason: "Duplicate flight number",
            flightNumber: req.body.flightNumber,
          },
        });

        return res.status(400).json({
          message: "Flight number already exists",
        });
      }
    }

    const updated = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      await logAdminAction({
        req,
        action: "UPDATE_FAILED",
        module: "flights",
        severity: "high",
        metadata: { reason: "Flight not found" },
      });

      return res.status(404).json({ message: "Flight not found" });
    }

    // ✅ SUCCESS LOG
    await logAdminAction({
      req,
      action: "UPDATE_FLIGHT",
      module: "flights",
      severity: "low",
      metadata: { flightId: updated._id },
    });

    res.json(updated);

  } catch (err) {
    console.error("UPDATE ERROR:", err.message);

    // 🔥 LOG ERROR ALSO
    await logAdminAction({
      req,
      action: "UPDATE_ERROR",
      module: "flights",
      severity: "high",
      metadata: { error: err.message },
    });

    res.status(500).json({ error: err.message });
  }
};


// ================= DELETE =================
exports.deleteFlight = async (req, res) => {
  try {
    const deleted = await Flight.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // 🔥 LOG DELETE
    await logAdminAction({
      req,
      action: "DELETE_FLIGHT",
      module: "flights",
      severity: "high",
      metadata: { flightId: deleted._id },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ================= ADD FOOD =================
exports.addFood = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    flight.foodOptions.push(req.body);
    await flight.save();

    res.json(flight);
  } catch (err) {
    console.error("FOOD ADD ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ================= UPDATE FOOD =================
exports.updateFood = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    const food = flight.foodOptions.id(req.params.foodId);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    Object.assign(food, req.body);

    await flight.save();
    res.json(flight);
  } catch (err) {
    console.error("FOOD UPDATE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ================= DELETE FOOD =================
exports.deleteFood = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    const food = flight.foodOptions.id(req.params.foodId);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    food.remove();

    await flight.save();
    res.json(flight);
  } catch (err) {
    console.error("FOOD DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ================= UPDATE PRICING =================
exports.updatePricing = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    flight.dynamicPricing = req.body;

    await flight.save();
    res.json(flight);
  } catch (err) {
    console.error("PRICING ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ================= SET SEATS =================
exports.setSeats = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    const seats = req.body.seats || [];

    flight.seats = seats;
    flight.totalSeats = seats.length;
    flight.seatsAvailable = seats.filter((s) => !s.isBooked).length;

    await flight.save();

    res.json(flight);
  } catch (err) {
    console.error("SEAT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

