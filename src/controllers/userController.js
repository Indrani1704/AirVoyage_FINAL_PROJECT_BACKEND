const User = require("../models/User");
const Booking = require("../models/Booking");

/* ===================================
   GET USERS
=================================== */

exports.getUsers = async (
  req,
  res
) => {

  try {

    // ONLY NORMAL USERS
    const users =
      await User.find({
        role: "user",
      })
      .select("-password");

    // ADD BOOKING DATA
    const finalUsers =
      await Promise.all(

        users.map(async (u) => {

          // USER BOOKINGS
          const bookings =
            await Booking.find({
              userId: u._id,
            });

          // TOTAL BOOKINGS
          const totalBookings =
            bookings.length;

          // LATEST BOOKING
          const latestBooking =
            bookings[
              bookings.length - 1
            ];

          return {

            ...u.toObject(),

            totalBookings,

            latestBookingStatus:
              latestBooking
                ?.bookingStatus ||
              "No Booking",

          };

        })

      );

    res.status(200).json(
      finalUsers
    );

  } catch (err) {

    console.log(
      "GET USERS ERROR:",
      err
    );

    res.status(500).json({
      success:false,
      message:err.message,
    });

  }

};

/* ===================================
   BLOCK USER
=================================== */

exports.toggleBlock = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.params.id
      );

    if(!user){

      return res.status(404).json({
        success:false,
        message:"User not found",
      });

    }

    user.isBlocked =
      !user.isBlocked;

    await user.save();

    res.status(200).json({
      success:true,
      user,
    });

  } catch (err) {

    console.log(
      "BLOCK ERROR:",
      err
    );

    res.status(500).json({
      success:false,
      message:err.message,
    });

  }

};

/* ===================================
   USER BOOKINGS
=================================== */

exports.getUserBookings = async (
  req,
  res
) => {

  try {

    const bookings =
      await Booking.find({
        userId:req.params.id,
      })

      .populate("flightId")

      .sort({
        createdAt:-1,
      });

    res.status(200).json(
      bookings
    );

  } catch (err) {

    console.log(
      "BOOKINGS ERROR:",
      err
    );

    res.status(500).json({
      success:false,
      message:err.message,
    });

  }

};