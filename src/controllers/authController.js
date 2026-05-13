const bcrypt = require("bcryptjs");
const User = require("../models/User");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");


// 🔸 REGISTER
exports.register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({

        message: "Missing fields",

      });

    }

    const exists =
      await User.findOne({
        email,
      });

    if (exists) {

      return res.status(400).json({

        message:
          "User already exists",

      });

    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

   const user =
  await User.create({

    name,

    email,

    password:
      hashedPassword,

    role:
      role || "user",

  });

    res.status(201).json({

      success: true,

      msg:
        "Registration successful",

      user: {

  _id:
    user._id,

  name:
    user.name,

  email:
    user.email,

  role:
    user.role,

},
     

    });

  } catch (err) {

    console.error(
      "REGISTER ERROR:",
      err
    );

    res.status(500).json({

      message:
        err.message,

    });

  }

};


// 🔸 VERIFY OTP
// exports.verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   const user = await User.findOne({ email });

//   if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
//     return res.status(400).json({ msg: "Invalid or expired OTP" });
//   }

//   user.isVerified = true;
//   user.otp = null;

//   await user.save();

//   res.json({ msg: "Email verified successfully" });
// };


// 🔸 LOGIN
exports.login = async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {

      return res.status(400).json({
        msg: "User not found",
      });

    }

    if (user.isBlocked) {

      return res.status(403).json({
        msg: "User is blocked",
      });

    }

    // 🔥 BCRYPT CHECK
    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {

      return res.status(400).json({
        msg: "Invalid credentials",
      });

    }

    // TOKENS
    const accessToken =
      generateAccessToken(
        user._id
      );

    const refreshToken =
      generateRefreshToken(
        user._id
      );

    user.refreshToken =
      refreshToken;

    await user.save();

    res.json({

      success: true,

      accessToken,

      refreshToken,

      user: {

        _id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

      },

    });

  } catch (err) {

    console.log(
      "LOGIN ERROR:",
      err
    );

    res.status(500).json({

      msg: err.message,

    });

  }

};