const moment = require("moment");
const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotels",
  },
  adultCount: {
    type: Number,
    required: true,
  },
  childCount: {
    type: Number,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  date: {
    type: Date,
    default: moment(),
  },
  isPaid: {
    type: Boolean,
    default: false,
  }
});

const bookings = mongoose.model("bookings", bookingSchema);
module.exports = bookings;
