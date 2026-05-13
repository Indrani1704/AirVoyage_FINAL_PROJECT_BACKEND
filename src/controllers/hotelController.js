const Hotel = require("../models/Hotel");
const cloudinary = require("../config/cloudinary");

// CREATE
exports.createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create({
      name: req.body.name,
      location: req.body.location,
      pricePerNight: req.body.pricePerNight,
      rating: req.body.rating,
      maxGuests: req.body.maxGuests,
      bedType: req.body.bedType,
      amenities: req.body.amenities?.split(",") || [],
      image: req.file?.path?.replace(/\\/g, "/"), // ✅ FIX
    });

    res.json(hotel);
  } catch (err) {
    console.log("CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });

    res.json(hotels);
  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateHotel = async (req, res) => {
  try {
    const existing = await Hotel.findById(req.params.id);

    let imageUrl = existing.image;

    if (req.file) {
      // 🔥 DELETE OLD IMAGE
      if (existing.image) {
        const publicId = existing.image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      }

      imageUrl = req.file.path;
    }

    const updated = await Hotel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: imageUrl,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel?.image) {
      const publicId = hotel.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      await cloudinary.uploader.destroy(publicId);
    }

    await Hotel.findByIdAndDelete(req.params.id);

    res.json({ message: "Hotel deleted" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// controllers/hotelController.js

exports.searchHotels = async (req, res) => {
  try {
    const { location, guests, checkIn, checkOut } = req.query;

    let hotels = await Hotel.find({
      location: { $regex: location || "", $options: "i" },
      maxGuests: { $gte: Number(guests || 1) }, // ✅ guest filter
    });

    // ✅ DATE FILTER (SMART)
    if (checkIn && checkOut) {
      hotels = hotels.filter((h) => {
        if (!h.bookings || h.bookings.length === 0) return true;

        return !h.bookings.some((b) => {
          return (
            new Date(checkIn) <= new Date(b.endDate) &&
            new Date(checkOut) >= new Date(b.startDate)
          );
        });
      });
    }

    res.json(hotels);
  } catch (err) {
    console.log("SEARCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};