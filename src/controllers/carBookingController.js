const CarBooking =
  require("../models/CarBooking");

const PDFDocument =
  require("pdfkit");

/* ================= CREATE ================= */

exports.createCarBooking =
  async (req, res) => {

    try {

      const booking =
        await CarBooking.create(
          req.body
        );

      res.status(200).json({

        success:true,

        booking,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success:false,

        message:err.message,

      });

    }

  };

/* ================= GET MY BOOKINGS ================= */

exports.getMyCarBookings =
  async (req, res) => {

    try {

      const bookings =
        await CarBooking.find({

          userId:req.query.userId,

        }).sort({
          createdAt:-1,
        });

      res.status(200).json({

        success:true,

        bookings,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success:false,

      });

    }

  };

/* ================= PDF ================= */

exports.downloadCarReceipt =
  async (req, res) => {

    try {

      const booking =
        await CarBooking.findById(
          req.params.id
        );

      const doc =
        new PDFDocument({
          margin:50,
        });

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=cab-receipt.pdf"
      );

      doc.pipe(res);

      doc
        .fontSize(26)
        .fillColor("#8B0000")
        .text(
          "CAB BOOKING RECEIPT",
          {
            align:"center",
          }
        );

      doc.moveDown(2);

      doc
        .fontSize(14)
        .fillColor("#111");

      doc.text(
        `Booking ID: ${booking._id}`
      );

      doc.text(
        `Passenger: ${booking.passengerName}`
      );

      doc.text(
        `Pickup: ${booking.pickup}`
      );

      doc.text(
        `Drop: ${booking.drop}`
      );

      doc.text(
        `Pickup Time: ${booking.pickupTime}`
      );

      doc.text(
        `Cab: ${booking.cabType}`
      );

      doc.text(
        `Passengers: ${booking.passengers}`
      );

      doc.text(
        `Payment ID: ${booking.paymentId}`
      );

      doc.moveDown();

      doc
        .fontSize(24)
        .fillColor("#8B0000")
        .text(
          `Total Paid: ₹${booking.totalAmount}`
        );

      doc.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success:false,

      });

    }

  };

  /* ================= ADMIN ALL CAB BOOKINGS ================= */

exports.getAllCarBookings =
  async (req, res) => {

    try {

      const bookings =
        await CarBooking.find()

          .sort({
            createdAt: -1,
          });

      res.status(200).json({

        success: true,

        bookings,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message: err.message,

      });

    }

  };