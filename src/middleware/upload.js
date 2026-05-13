const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "airvoyage",

    public_id: `car_${Date.now()}_${Math.floor(Math.random() * 10000)}`,

    format: file.mimetype.split("/")[1],

    transformation: [
      { width: 800, height: 500, crop: "fill" },
      { quality: "auto", fetch_format: "auto" },
    ],
  }),
});

module.exports = multer({ storage });