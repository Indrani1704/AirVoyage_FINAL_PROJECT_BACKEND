require("dotenv").config();

const {
  server,
} = require("./src/app");

const connectDB =
  require("./src/config/db");

const User =
  require("./src/models/User");

const startServer =
  async () => {

    try {

      /* ================= DB ================= */

      await connectDB();

      console.log(
        "🔥 Seeding default admins..."
      );

      const defaultAdmins = [

        "indrani@gmail.com",

        "admin@gmail.com",

        "admin@example.com",

      ];

      for (const email of defaultAdmins) {

        let user =
          await User.findOne({
            email,
          });

        /* CREATE */

        if (!user) {

          user =
            await User.create({

              name:
                email.split("@")[0],

              email,

              role:
                "admin",

              permissions: [

                {
                  module:
                    "flights",

                  enabled:
                    true,
                },

                {
                  module:
                    "bookings",

                  enabled:
                    true,
                },

              ],

            });

          console.log(
            `✅ Created admin: ${email}`
          );

        }

        /* UPDATE */

        else {

          user.role =
            "admin";

          user.permissions = [

            {
              module:
                "flights",

              enabled:
                true,
            },

            {
              module:
                "bookings",

              enabled:
                true,
            },

          ];

          await user.save();

          console.log(
            `🔄 Updated admin: ${email}`
          );

        }

      }

      console.log(
        "✅ Default admins ready"
      );

      /* ================= START ================= */

      const PORT =
        process.env.PORT || 5000;

      server.listen(
        PORT,
        () => {

          console.log(
            `🚀 Server running on port ${PORT}`
          );

        }
      );

    } catch (err) {

      console.error(
        "❌ Server start error:",
        err.message
      );

      process.exit(1);

    }

  };

startServer();