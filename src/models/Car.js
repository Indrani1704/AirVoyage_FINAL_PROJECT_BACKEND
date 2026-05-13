const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    location: String,
    pricePerDay: Number,
    fuelType: String,
    seats: Number,
    image: String,

    // ✅ ADD THIS
    bookings: [
      {
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);