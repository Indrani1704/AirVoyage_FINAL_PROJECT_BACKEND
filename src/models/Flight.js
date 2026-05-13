const mongoose = require("mongoose");

// 🎟 Seat Config
const seatSchema = new mongoose.Schema({
  seatNumber: String,
  class: {
    type: String,
    enum: ["economy", "business"],
    default: "economy",
  },
  price: Number,
  isBooked: { type: Boolean, default: false },
});

// 💰 Dynamic Pricing
const pricingSchema = new mongoose.Schema({
  daysBefore: Number,
  price: Number,
});

// 🍱 Food
const foodSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const flightSchema = new mongoose.Schema(
  {
    airline: { type: String, default: "AirVoyage" },

    flightNumber: {
      type: String,
      required: true,
      unique: true,
    },

    from: String,
    to: String,

    departureTime: Date,
    arrivalTime: Date,

    aircraft: String, // Airbus A320

    basePrice: Number,

    seats: [seatSchema],

    totalSeats: Number,
    seatsAvailable: Number,

    dynamicPricing: [pricingSchema],

    foodOptions: [foodSchema],

    status: {
      type: String,
      enum: ["scheduled", "delayed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flight", flightSchema);