const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  class: { type: String, enum: ["economy", "business"] },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const seatMapSchema = new mongoose.Schema({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight" },
  seats: [seatSchema]
});

module.exports = mongoose.model("SeatMap", seatMapSchema);