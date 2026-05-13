const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    location: String,
    pricePerNight: Number,
    rating: Number,
    image: String,

    // ✅ NEW FIELDS
    maxGuests: Number, // max people allowed
    bedType: String,   // Single / Double / Triple / Family

    amenities: [String], // wifi, ac, pool etc

    // ✅ AVAILABILITY
    bookings: [
      {
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);