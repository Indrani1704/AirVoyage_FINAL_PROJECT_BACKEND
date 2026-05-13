const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

const rateLimiter =
  require("./middleware/rateLimiter");

const errorHandler =
  require("./middleware/errorHandler");

const carBookingRoutes =
  require("./routes/carBookingRoutes");

const hotelBookingRoutes =
  require("./routes/hotelbookingRoutes");

const path =
  require("path");

const app =
  express();

/* ================= HTTP SERVER ================= */

const server =
  http.createServer(app);

/* ================= SOCKET.IO ================= */

const io =
  new Server(server, {

    cors: {

      origin: "*",

      methods: [
        "GET",
        "POST",
      ],

    },

  });

/* ================= ONLINE USERS ================= */

const onlineUsers = {};

/* ================= SOCKET CONNECTION ================= */

io.on(
  "connection",
  (socket) => {

    console.log(
      "SOCKET CONNECTED:",
      socket.id
    );

    /* ================= JOIN ================= */

    socket.on(
      "join",
      (userId) => {

        onlineUsers[userId] =
          socket.id;

        console.log(
          "USER JOINED:",
          userId
        );

      }
    );

    /* ================= SEND MESSAGE ================= */

    socket.on(
      "send_message",
      (data) => {

        console.log(
          "MESSAGE:",
          data
        );

        /*
          data = {
            userId,
            userName,
            sender,
            message
          }
        */

        /* ================= SEND TO USER ================= */

        if (
          data.userId &&
          onlineUsers[data.userId]
        ) {

          io.to(
            onlineUsers[
              data.userId
            ]
          ).emit(
            "receive_message",
            data
          );

        }

        /* ================= SEND TO ADMINS ================= */

        io.emit(
          "receive_message",
          data
        );

      }
    );

    /* ================= DISCONNECT ================= */

    socket.on(
      "disconnect",
      () => {

        console.log(
          "SOCKET DISCONNECTED:",
          socket.id
        );

        for (
          let userId
          in onlineUsers
        ) {

          if (
            onlineUsers[userId]
            === socket.id
          ) {

            delete onlineUsers[
              userId
            ];

            break;

          }

        }

      }
    );

  }
);

/* ================= MIDDLEWARE ================= */

app.use(cors());

app.use(express.json());

app.use(helmet());

app.use(rateLimiter);

/* ================= UPLOADS ================= */

app.use(
  "/uploads",

  express.static(
    path.join(
      __dirname,
      "..",
      "uploads"
    )
  )
);

/* ================= ROUTES ================= */

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/flights",
  require("./routes/flightRoutes")
);

app.use(
  "/api/bookings",
  require("./routes/bookingRoutes")
);

app.use(
  "/api/payments",
  require("./routes/paymentRoutes")
);

app.use(
  "/api/coupons",
  require("./routes/couponRoutes")
);

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

app.use(
  "/api/analytics",
  require("./routes/analyticsRoutes")
);

app.use(
  "/api/admin",
  require("./routes/adminRoutes")
);

app.use(
  "/api/superadmin",
  require("./routes/superAdminRoutes")
);

app.use(
  "/api/cars",
  require("./routes/carRoutes")
);

app.use(
  "/api/hotels",
  require("./routes/hotelRoutes")
);

app.use(
  "/api/hotel-bookings",
  hotelBookingRoutes
);

app.use(
  "/api/car-bookings",
  carBookingRoutes
);

/* ================= HEALTH ================= */

app.get(
  "/",
  (req, res) => {

    res.send(
      "SkyBook+ API Running "
    );

  }
);

/* ================= ERROR ================= */

app.use(errorHandler);

/* ================= EXPORT ================= */

module.exports = {
  app,
  server,
  io,
};