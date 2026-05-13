const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

/* =========================================================
   CREATE ORDER
========================================================= */
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
/* =========================================================
   VERIFY PAYMENT + CREATE BOOKING
========================================================= */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    /* ================= VALIDATION ================= */

    if (!bookingData) {
      return res.status(400).json({
        success: false,
        message: "Booking data missing",
      });
    }

    if (!bookingData.userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing",
      });
    }

    if (!bookingData.flightId) {
      return res.status(400).json({
        success: false,
        message: "Flight ID missing",
      });
    }

    /* ================= VERIFY SIGNATURE ================= */

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    /* ================= CREATE BOOKING ================= */

    const booking = await Booking.create({
      bookingType: bookingData.bookingType || "flight",

      userId: bookingData.userId,

      flightId: bookingData.flightId,

      seats: bookingData.seats || [],

      totalAmount: bookingData.totalAmount || 0,

      passengerName: bookingData.passengerName || "",

      email: bookingData.email || "",

      phone: bookingData.phone || "",

      paymentStatus: "paid",

      bookingStatus: "confirmed",

      paymentId: razorpay_payment_id,

      orderId: razorpay_order_id,
    });

    /* ================= LOCK SEATS ================= */

    const flight = await Flight.findById(
      booking.flightId
    );

    if (flight) {
      flight.seats = flight.seats.map((seat) => {
        const booked = booking.seats.some(
          (s) => s.seatNumber === seat.seatNumber
        );

        if (booked) {
          return {
            ...seat.toObject(),
            isBooked: true,
          };
        }

        return seat;
      });

      await flight.save();
    }

    /* ================= GENERATE PDF ================= */

    const pdfBuffer = await generatePDF(
      booking,
      flight
    );

    /* ================= SEND EMAIL ================= */

    if (bookingData.email) {
      await sendEmail(
        bookingData.email,
        booking,
        flight,
        pdfBuffer
      );
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });
  } catch (err) {
    console.log("VERIFY PAYMENT ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   GET MY BOOKINGS
========================================================= */
/* =========================================================
   GET MY BOOKINGS
========================================================= */
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.query.userId;

    console.log("USER ID:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing",
      });
    }

    const bookings = await Booking.find({
      userId: userId,
    })
      .populate("flightId")
      .populate({
        path: "userId",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    console.log("BOOKINGS:", bookings);

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log("GET BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   GET SINGLE TICKET
========================================================= */
// =============================
// BEAUTIFUL BOARDING PASS PDF
// =============================



/* =========================================================
   GET TICKET PDF
========================================================= */

exports.getTicket = async (req, res) => {
  try {

    const booking = await Booking.findById(
      req.params.id
    )
      .populate("flightId")
      .populate({
        path: "userId",
        select: "name email",
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // PASSENGER NAME

    const passenger =
      booking.passengerName ||
      booking.userId?.name ||
      "Passenger";

    // QR DATA

    const qrData = JSON.stringify({
      bookingId: booking._id,
      passenger,
      from: booking.flightId?.from,
      to: booking.flightId?.to,
      airline: booking.flightId?.airline,
      seats: booking.seats
        ?.map((s) => s.seatNumber)
        .join(", "),
      departure:
        booking.flightId?.departureTime,
    });

    // QR IMAGE

    const qrImage =
      await QRCode.toDataURL(qrData);

    // PDF

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    // RESPONSE

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=boarding-pass-${booking._id}.pdf`
    );

    doc.pipe(res);

    /* =====================================================
       PAGE BACKGROUND
    ===================================================== */

    doc.rect(0, 0, 595, 842)
      .fill("#f4f1ea");

    /* =====================================================
       MAIN TICKET CARD
    ===================================================== */

    doc.roundedRect(
      30,
      40,
      535,
      360,
      18
    ).fill("#ffffff");

    /* =====================================================
       HEADER
    ===================================================== */

    doc.roundedRect(
      30,
      40,
      535,
      70,
      18
    ).fill("#9d0000");

    doc
      .fillColor("#ffffff")
      .fontSize(24)
      .text(
        booking.flightId?.airline ||
          "SKY WINGS",
        50,
        62
      );

    doc
      .fillColor("#ffd54f")
      .fontSize(10)
      .text(
        "AIRLINES",
        52,
        92
      );

    doc
      .fillColor("#ffffff")
      .fontSize(20)
      .text(
        "BOARDING PASS",
        340,
        70
      );

    /* =====================================================
       BOOKING ID
    ===================================================== */

    doc
      .fillColor("#555")
      .fontSize(12)
      .text(
        `Booking ID: #${booking._id
          .toString()
          .slice(0, 8)}`,
        50,
        130
      );

    /* =====================================================
       ROUTE
    ===================================================== */

    doc
      .fillColor("#777")
      .fontSize(10)
      .text("FROM", 95, 165);

    doc
      .fillColor("#b30000")
      .fontSize(34)
      .text(
        booking.flightId?.from || "DEL",
        80,
        178
      );

    doc
      .fillColor("#d4a017")
      .fontSize(24)
      .text(
        "✈",
        260,
        190
      );

    doc
      .fillColor("#777")
      .fontSize(10)
      .text("TO", 395, 165);

    doc
      .fillColor("#b30000")
      .fontSize(34)
      .text(
        booking.flightId?.to || "BLR",
        375,
        178
      );

    /* =====================================================
       INFO BOXES
    ===================================================== */

    const infoBoxes = [
      {
        title: "Passenger",
        value: passenger,
      },
      {
        title: "Seats",
        value:
          booking.seats
            ?.map(
              (s) => s.seatNumber
            )
            .join(", ") || "N/A",
      },
      {
        title: "Departure",
        value:
          booking.flightId
            ?.departureTime
            ? new Date(
                booking.flightId
                  .departureTime
              ).toLocaleTimeString()
            : "N/A",
      },
      {
        title: "Arrival",
        value:
          booking.flightId
            ?.arrivalTime
            ? new Date(
                booking.flightId
                  .arrivalTime
              ).toLocaleTimeString()
            : "N/A",
      },
    ];

    let x = 50;

    infoBoxes.forEach((box) => {

      doc.roundedRect(
        x,
        255,
        92,
        62,
        8
      )
      .fillAndStroke(
        "#fffdf7",
        "#e4c16a"
      );

      doc
        .fillColor("#777")
        .fontSize(8)
        .text(
          box.title,
          x + 8,
          267
        );

      doc
        .fillColor("#111")
        .fontSize(11)
        .text(
          box.value || "N/A",
          x + 8,
          285,
          {
            width: 75,
          }
        );

      x += 100;

    });

    /* =====================================================
       RIGHT PANEL
    ===================================================== */

    doc.rect(
      455,
      110,
      110,
      290
    ).fill("#fafafa");

    // TOTAL PAID

    doc
      .fillColor("#666")
      .fontSize(9)
      .text(
        "TOTAL PAID",
        480,
        125
      );

    doc
      .fillColor("#b30000")
      .fontSize(24)
      .text(
        `₹${booking.totalAmount}`,
        468,
        145
      );

    doc
      .fillColor("#0f9d58")
      .fontSize(11)
      .text(
        booking.bookingStatus,
        482,
        178
      );

    // QR CODE

    doc.image(
      qrImage,
      478,
      205,
      {
        width: 58,
      }
    );

    // BARCODE

    for (let i = 0; i < 28; i++) {

      doc.rect(
        475 + (i * 2),
        285,
        1,
        24
      )
      .fill("#000");

    }

    // SMALL ROUTE

    doc
      .fillColor("#111")
      .fontSize(14)
      .text(
        `${booking.flightId?.from} ✈ ${booking.flightId?.to}`,
        470,
        330
      );

    /* =====================================================
       FOOTER
    ===================================================== */

    doc.rect(
      30,
      360,
      535,
      40
    ).fill("#9d0000");

    doc
      .fillColor("#ffffff")
      .fontSize(14)
      .text(
        "Have a Safe Journey ✈",
        190,
        375
      );

    /* =====================================================
       RECEIPT PAGE
    ===================================================== */

    doc.addPage();

    doc.rect(0, 0, 595, 842)
      .fill("#f4f1ea");

    doc.roundedRect(
      50,
      60,
      495,
      520,
      18
    ).fill("#ffffff");

    // RECEIPT HEADER

    doc.rect(
      50,
      60,
      495,
      65
    ).fill("#9d0000");

    doc
      .fillColor("#ffffff")
      .fontSize(24)
      .text(
        "PAYMENT RECEIPT",
        165,
        83
      );

    // RECEIPT DATA

    const receipt = [
      [
        "Booking ID",
        booking._id.toString(),
      ],
      [
        "Passenger",
        passenger,
      ],
      [
        "Airline",
        booking.flightId?.airline,
      ],
      [
        "Route",
        `${booking.flightId?.from} → ${booking.flightId?.to}`,
      ],
      [
        "Seats",
        booking.seats
          ?.map(
            (s) => s.seatNumber
          )
          .join(", "),
      ],
      [
        "Payment ID",
        booking.paymentId,
      ],
      [
        "Amount Paid",
        `₹${booking.totalAmount}`,
      ],
      [
        "Payment Status",
        booking.paymentStatus,
      ],
      [
        "Booking Status",
        booking.bookingStatus,
      ],
    ];

    let y = 165;

    receipt.forEach((item) => {

      doc
        .fillColor("#777")
        .fontSize(12)
        .text(
          item[0],
          85,
          y
        );

      doc
        .fillColor("#111")
        .fontSize(14)
        .text(
          item[1] || "N/A",
          270,
          y,
          {
            width: 220,
          }
        );

      y += 38;

    });

    // THANK YOU

    doc
      .fillColor("#555")
      .fontSize(18)
      .text(
        "Thank you for choosing us ✈",
        135,
        500
      );

    doc.end();

  } catch (err) {

    console.log("GET TICKET ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/* =========================================================
   PDF GENERATOR
========================================================= */
const generatePDF = (booking, flight) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);

      resolve(pdfData);
    });

    doc
      .fontSize(22)
      .text("Flight Ticket", {
        align: "center",
      });

    doc.moveDown();

    doc.text(`Booking ID: ${booking._id}`);

    doc.text(
      `Passenger: ${booking.passengerName}`
    );

    doc.text(`Airline: ${flight?.airline}`);

    doc.text(
      `Route: ${flight?.from} → ${flight?.to}`
    );

    doc.text(
      `Seats: ${booking.seats
        .map((s) => s.seatNumber)
        .join(", ")}`
    );

    doc.text(
      `Amount Paid: ₹${booking.totalAmount}`
    );

    doc.text(
      `Booking Status: ${booking.bookingStatus}`
    );

    doc.end();
  });
};

/* =========================================================
   SEND EMAIL
========================================================= */
const sendEmail = async (
  to,
  booking,
  flight,
  pdfBuffer
) => {
  try {
    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user: process.env.EMAIL_USER,

          pass: process.env.EMAIL_PASS,
        },
      });

    await transporter.sendMail({
      from: `"SkyBook+" <${process.env.EMAIL_USER}>`,

      to,

      subject: "Your Flight Ticket ✈",

      html: `
        <h2>Booking Confirmed</h2>

        <p><strong>Booking ID:</strong> ${booking._id}</p>

        <p><strong>Passenger:</strong> ${booking.passengerName}</p>

        <p><strong>Airline:</strong> ${flight?.airline}</p>

        <p><strong>Route:</strong> ${flight?.from} → ${flight?.to}</p>

        <p><strong>Amount:</strong> ₹${booking.totalAmount}</p>
      `,

      attachments: [
        {
          filename: "ticket.pdf",
          content: pdfBuffer,
        },
      ],
    });

    console.log("EMAIL SENT SUCCESSFULLY");
  } catch (err) {
    console.log("EMAIL ERROR:", err.message);
  }
};

/* =========================================================
   GET SINGLE BOOKING
========================================================= */

exports.getSingleBooking = async (
  req,
  res
) => {
  try {

    const booking =
      await Booking.findById(
        req.params.id
      )
        .populate("flightId")
        .populate({
          path: "userId",
          select: "name email",
        });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {

    console.log(
      "GET SINGLE BOOKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};