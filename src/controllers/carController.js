const Car = require("../models/Car");
const cloudinary = require("../config/cloudinary");

// CREATE
exports.createCar = async (req, res) => {
  try {
    const car = await Car.create({
      name: req.body.name,
      brand: req.body.brand,
      location: req.body.location, // ✅ IMPORTANT
      fuelType: req.body.fuelType,
      seats: req.body.seats,
      pricePerDay: req.body.pricePerDay,
      image: req.file?.path,
    });

    res.json(car);
  } catch (err) {
    console.log("CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// GET
exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// UPDATE
exports.updateCar = async (req, res) => {
  try {
    const existing = await Car.findById(req.params.id);

    // 🔥 DELETE OLD IMAGE
    if (req.file && existing?.image) {
      const publicId = existing.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`airvoyage/${publicId}`);
    }

    const updated = await Car.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.file && { image: req.file.path }),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// DELETE
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    // 🔥 DELETE FROM CLOUDINARY
    if (car?.image) {
      const publicId = car.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`airvoyage/${publicId}`);
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({ message: "Car deleted" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// controllers/carController.js

exports.searchCars = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.query;

    let cars = await Car.find({
      location: { $regex: location || "", $options: "i" },
    });

    // ✅ DATE AVAILABILITY FILTER
    if (startDate && endDate) {
      cars = cars.filter((car) => {
        if (!car.bookings || car.bookings.length === 0) return true;

        return !car.bookings.some((b) => {
          return (
            new Date(startDate) <= new Date(b.endDate) &&
            new Date(endDate) >= new Date(b.startDate)
          );
        });
      });
    }

    res.json(cars);
  } catch (err) {
    console.log("CAR SEARCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};