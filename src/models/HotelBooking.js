const mongoose =
  require("mongoose");

const hotelBookingSchema =
  new mongoose.Schema(
    {

      bookingType: {
        type: String,
        default: "hotel",
      },

      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },

      hotelId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Hotel",
      },

      hotelName: String,

      location: String,

      fullName: String,

      email: String,

      phone: String,

      rooms: Number,

      guests: Number,

      checkIn: String,

      checkOut: String,

      checkInTime: String,

      checkOutTime: String,

      requests: String,

      totalAmount: Number,

      paymentId: String,

      orderId: String,

      paymentStatus: {
        type: String,
        default: "paid",
      },

      bookingStatus: {
        type: String,
        default: "confirmed",
      },

    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "HotelBooking",
    hotelBookingSchema
  );