// ================= backend/controllers/bookingController.js =================

const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const mongoose =
  require("mongoose");

const logAdminAction =
  require("../utils/logAdminAction");

/* ================= CREATE ORDER ================= */
exports.createOrder = async (req, res) => {

  try {

    const amount =
      Number(req.body.amount);

    console.log(
      "BACKEND RECEIVED RUPEES:",
      amount
    );

    // ✅ Convert rupees to paise

    const razorpayAmount =
      Math.round(amount * 100);

    console.log(
      "RAZORPAY PAISE:",
      razorpayAmount
    );

    const order =
      await razorpay.orders.create({

        amount:
          razorpayAmount,

        currency:"INR",

      });

    res.status(200).json({

      success:true,

      order,

    });

  } catch (err) {

    console.log(
      "CREATE ORDER ERROR:",
      err
    );

    res.status(500).json({

      success:false,

      message:err.message,

    });

  }

};
/* ================= VERIFY PAYMENT ================= */
exports.verifyPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    const sign =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expected =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_SECRET
        )
        .update(sign)
        .digest("hex");

    if (expected !== razorpay_signature) {

      return res.status(400).json({
        message:
          "Payment verification failed",
      });

    }
console.log(
  "BOOKING DATA:",
  bookingData
);

console.log(
  "BOOKING USER ID:",
  bookingData.userId
);
    const booking =
      await Booking.create({

        ...bookingData,

        userId:
          bookingData.userId,

        paymentStatus:
          "paid",

        bookingStatus:
          "confirmed",

        paymentId:
          razorpay_payment_id,

        orderId:
          razorpay_order_id,

      });

    /* ================= BOOK SEATS ================= */

    const flight =
      await Flight.findById(
        booking.flightId
      );

    if (flight) {

      flight.seats =
        flight.seats.map((s) => {

          const found =
            booking.seats?.find(
              (b) =>
                b.seatNumber ===
                s.seatNumber
            );

          if (found) {

            return {
              ...s.toObject(),
              isBooked: true,
            };

          }

          return s;

        });

      await flight.save();

    }

    /* ================= LOG ================= */

    await logAdminAction({

      req,

      action:
        "CREATE_BOOKING",

      module:
        "booking",

      severity:
        "medium",

      metadata: {

        bookingId:
          booking._id,

        amount:
          booking.totalAmount,

      },

    });

    res.json({
      success: true,
      booking,
    });

  } catch (err) {

    console.log(
      "VERIFY PAYMENT ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });

  }

};

/* ================= GET BOOKINGS ================= */
/* ================= GET BOOKINGS ================= */

exports.getBookings = async (req, res) => {

  try {

    const bookings =
      await Booking.find()

        .populate({
          path: "userId",
          select:
            "name email role",
        })

        .populate({
          path: "flightId",
        })

        .sort({
          createdAt: -1,
        });

    res.status(200).json({

      success: true,

      bookings,

    });

  } catch (err) {

    console.log(
      "GET BOOKINGS ERROR:",
      err
    );

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};
/* ================= CANCEL BOOKING ================= */
exports.cancelBooking = async (req, res) => {

  try {

    const booking =
      await Booking.findById(
        req.params.id
      ).populate("flightId");

    if (!booking) {

      return res.status(404).json({
        message:
          "Booking not found",
      });

    }

    if (
      booking.bookingStatus ===
      "cancelled"
    ) {

      return res.json({
        message:
          "Already cancelled",
      });

    }

    const flightDate =
      new Date(
        booking.flightId
          ?.departureTime
      );

    const now =
      new Date();

    const diffDays =
      Math.ceil(
        (flightDate - now) /
          (1000 *
            60 *
            60 *
            24)
      );

    let refund = 0;

    if (
      req.body.cancelledBy ===
      "admin"
    ) {

      refund =
        booking.totalAmount;

    } else {

      if (diffDays > 30) {

        refund =
          booking.totalAmount *
          0.8;

      } else if (
        diffDays > 15
      ) {

        refund =
          booking.totalAmount *
          0.5;

      } else {

        refund = 0;

      }

    }

    booking.bookingStatus =
      "cancelled";

    booking.paymentStatus =
      "refunded";

    await booking.save();

    /* ================= FREE SEATS ================= */

    const flight =
      await Flight.findById(
        booking.flightId?._id
      );

    if (flight) {

      flight.seats =
        flight.seats.map((s) => {

          const found =
            booking.seats?.find(
              (b) =>
                b.seatNumber ===
                s.seatNumber
            );

          if (found) {

            return {
              ...s.toObject(),
              isBooked: false,
            };

          }

          return s;

        });

      await flight.save();

    }

    /* ================= LOG ================= */

    await logAdminAction({

      req,

      action:
        "CANCEL_BOOKING",

      module:
        "booking",

      severity:
        "high",

      metadata: {

        bookingId:
          booking._id,

        refund,

        cancelledBy:
          req.body.cancelledBy ||
          "user",

      },

    });

    res.json({

      success: true,

      refundAmount:
        refund,

    });

  } catch (err) {

    console.log(
      "CANCEL ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });

  }

};

/* ================= HOTEL RECEIPT ================= */
// exports.downloadHotelInvoice =
//   async (req, res) => {

//     const PDFDocument =
//       require("pdfkit");

//     try {

//       const booking =
//         await HotelBooking.findById(
//           req.params.id
//         );

//       const doc =
//         new PDFDocument();

//       res.setHeader(
//         "Content-Type",
//         "application/pdf"
//       );

//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename=hotel-invoice.pdf`
//       );

//       doc.pipe(res);

//       doc
//         .fontSize(24)
//         .text(
//           "HOTEL BOOKING INVOICE",
//           {
//             align:"center",
//           }
//         );

//       doc.moveDown();

//       doc.text(
//         `Hotel: ${booking.hotelName}`
//       );

//       doc.text(
//         `Location: ${booking.location}`
//       );

//       doc.text(
//         `Guest: ${booking.fullName}`
//       );

//       doc.text(
//         `Check In: ${booking.checkIn}`
//       );

//       doc.text(
//         `Check Out: ${booking.checkOut}`
//       );

//       doc.text(
//         `Rooms: ${booking.rooms}`
//       );

//       doc.text(
//         `Guests: ${booking.guests}`
//       );

//       doc.text(
//         `Payment ID: ${booking.paymentId}`
//       );

//       doc.text(
//         `Total Paid: ₹${booking.totalAmount}`
//       );

//       doc.moveDown();

//       doc
//         .fontSize(18)
//         .text(
//           "Thank you for booking with AirVoyage",
//           {
//             align:"center",
//           }
//         );

//       doc.end();

//     } catch (err) {

//       console.log(err);

//       res.status(500).json({
//         success:false,
//       });

//     }

//   };

// /* ================= CAB RECEIPT ================= */
// exports.downloadCabReceipt =
//   async (req, res) => {

//     try {

//       const booking =
//         await Booking.findById(
//           req.params.id
//         );

//       const doc =
//         new PDFDocument();

//       res.setHeader(
//         "Content-Type",
//         "application/pdf"
//       );

//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename=cab-receipt.pdf`
//       );

//       doc.pipe(res);

//       doc
//         .fontSize(24)
//         .text(
//           "Cab Receipt"
//         );

//       doc.moveDown();

//       doc.text(
//         `Booking ID: ${booking._id}`
//       );

//       doc.text(
//         `Pickup: ${booking.pickup}`
//       );

//       doc.text(
//         `Drop: ${booking.drop}`
//       );

//       doc.text(
//         `Amount: ₹${booking.price}`
//       );

//       doc.end();

//     } catch (error) {

//       console.log(error);

//     }

//   };

/* ================= GET MY BOOKINGS ================= */

// GET MY BOOKINGS


/* ================= GET MY BOOKINGS ================= */

exports.getMyBookings =
  async (req, res) => {

    try {

      const { userId } =
        req.query;

      console.log(
        "REQ USER:",
        userId
      );

      if (!userId) {

        return res.status(400).json({

          message:
            "User ID required",

        });

      }

      const bookings =
        await Booking.find({

          userId:
            new mongoose.Types.ObjectId(
              userId
            ),

          bookingType:
            "flight",

        })

          .populate("flightId")

          .sort({
            createdAt: -1,
          });

      console.log(
        "FILTERED BOOKINGS:",
        bookings
      );

      res.json(bookings);

    } catch (err) {

      console.log(
        "MY BOOKINGS ERROR:",
        err
      );

      res.status(500).json({

        message:
          "Server Error",

      });

    }

};