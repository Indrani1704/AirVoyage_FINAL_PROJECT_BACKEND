const mongoose =
  require("mongoose");

const carBookingSchema =
  new mongoose.Schema(
    {

      bookingType:{
        type:String,
        default:"cab",
      },

      userId:{
        type:
          mongoose.Schema.Types.ObjectId,

        ref:"User",
      },

      passengerName:String,

      email:String,

      phone:String,

      pickup:String,

      drop:String,

      startDate:String,

      endDate:String,

      pickupTime:String,

      passengers:Number,

      cabType:String,

      driver:String,

      totalAmount:Number,

      paymentId:String,

      orderId:String,

      paymentStatus:{
        type:String,
        default:"paid",
      },

      bookingStatus:{
        type:String,
        default:"confirmed",
      },

    },
    {
      timestamps:true,
    }
  );

module.exports =
  mongoose.model(
    "CarBooking",
    carBookingSchema
  );