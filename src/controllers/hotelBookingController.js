// controllers/hotelBookingController.js

const HotelBooking =
  require("../models/HotelBooking");

const PDFDocument =
  require("pdfkit");

/* ================= CREATE ================= */

exports.createHotelBooking =
  async (req, res) => {

    try {

      const booking =
        await HotelBooking.create(
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

        message:
          err.message,

      });

    }

  };

/* ================= MY BOOKINGS ================= */

exports.getMyHotelBookings =
  async (req, res) => {

    try {

      const bookings =
        await HotelBooking.find({

          userId:
            req.query.userId,

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

        message:
          err.message,

      });

    }

  };

/* ================= PDF ================= */

exports.downloadHotelInvoice =
  async (req, res) => {

    try {

      const booking =
        await HotelBooking.findById(
          req.params.id
        );

      if (!booking) {

        return res.status(404).json({

          success:false,

          message:
            "Booking not found",

        });

      }

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
        "attachment; filename=hotel-invoice.pdf"
      );

      doc.pipe(res);

      doc
        .fontSize(26)
        .fillColor("#8B0000")
        .text(
          "HOTEL INVOICE",
          {
            align:"center",
          }
        );

      doc.moveDown(2);

      doc
        .fontSize(14)
        .fillColor("#111");

      doc.text(
        `Guest: ${booking.fullName}`
      );

      doc.text(
        `Hotel: ${booking.hotelName}`
      );

      doc.text(
        `Location: ${booking.location}`
      );

      doc.text(
        `Check In: ${booking.checkIn}`
      );

      doc.text(
        `Check Out: ${booking.checkOut}`
      );

      doc.text(
        `Rooms: ${booking.rooms}`
      );

      doc.text(
        `Guests: ${booking.guests}`
      );

      doc.text(
        `Payment ID: ${booking.paymentId}`
      );

      doc.moveDown();

      doc
        .fontSize(22)
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
  /* ================= GET ALL HOTEL BOOKINGS ================= */

exports.getAllHotelBookings =
  async (req, res) => {

    try {

      const bookings =
        await HotelBooking.find()
          .sort({
            createdAt:-1,
          });

      res.status(200).json({

        success:true,

        bookings,

      });

    } catch(err){

      res.status(500).json({

        success:false,

        message:err.message,

      });

    }

  };