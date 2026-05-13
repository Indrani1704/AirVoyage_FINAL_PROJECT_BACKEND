const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["flight", "hotel", "car"],
      required: true,
    },

    // ✈️ FLIGHT
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
    },
    seats: [
      {
        seatNumber: String,
        price: Number,
      },
    ],

    // 🏨 HOTEL
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },

    // 🚗 CAR
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },

    totalAmount: Number,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },

    paymentId: String,
    orderId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);