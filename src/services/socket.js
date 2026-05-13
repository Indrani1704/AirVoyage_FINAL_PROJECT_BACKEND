// src/services/socket.js

let io;

const users = {};

const initSocket = (server) => {

  io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {

    console.log(
      "SOCKET CONNECTED:",
      socket.id
    );

    /* ================= JOIN ================= */

    socket.on(
      "join",
      (userId) => {

        console.log(
          "USER JOINED:",
          userId
        );

        users[userId] =
          socket.id;

        socket.join(userId);

        if (
          userId === "admin"
        ) {

          socket.join(
            "admin_room"
          );

          console.log(
            "ADMIN ROOM JOINED"
          );

        }

      }
    );

    /* ================= EXTRA ADMIN ================= */

    socket.on(
      "join_admin_room",
      () => {

        socket.join(
          "admin_room"
        );

        console.log(
          "ADMIN JOINED ROOM"
        );

      }
    );

    /* ================= SEND ================= */

    socket.on(
      "send_message",
      (data) => {

        console.log(
          "MESSAGE:",
          data
        );

        /* SEND TO ADMIN */

        io.to(
          "admin_room"
        ).emit(
          "receive_message",
          data
        );

        /* SEND TO USER */

        if (
          data.userId
        ) {

          io.to(
            data.userId
          ).emit(
            "receive_message",
            data
          );

        }

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

      }
    );

  });

};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
};