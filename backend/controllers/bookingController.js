const moment = require("moment");
const bookings = require("../model/bookingModel");
const stripe = require("stripe")(
  "sk_test_51PBX8MBywckB18wU5fooxYBJCESGBFlaGq9T1BrXunpynltd4RwtoKtRXVMrDwk0rZ6Qp5Qje8tyoJ4GM4Xcmiz3009mbOTP7q"
);

const createBooking = async (req, res) => {
  try {
    const { token, hotel, adultCount, childCount, checkIn, checkOut, price } =
      req.body;
    console.log(req.body);

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const charge = await stripe.paymentIntents.create({
      amount: price,
      currency: "usd",
      customer: customer.id,
      receipt_email: token.email,
      description: "Hotel Booked",
    });

    const transactionId = charge.id;

    const newBooking = new bookings({
      user: req.user.id,
      hotel,
      adultCount,
      childCount,
      checkIn,
      checkOut,
      isPaid: true,
    });
    await newBooking.save();

    res.send({
      success: true,
      message: "Payment successful and hotel booked successfully",
      data: {
        transactionId: transactionId,
      },
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

const getMyBooking = async (req, res) => {
  try {
    const booking = await bookings
      .find({ user: req.user.id })
      .populate("hotel");
    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

const deleteBookingById = async (req, res) => {
  try {
    await bookings.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Booking not deleted",
    });
  }
};

const getBookingForHotelOwner = async (req, res) => {
  try {
    const bookingsWithHotel = await bookings
      .find()
      .populate({
        path: "hotel",
        populate: { path: "addedBy" },
      })
      .populate("user");

    const bookingsForOwner = bookingsWithHotel.filter((booking) => {
      return booking.hotel.addedBy.equals(req.user.id);
    });

    res.json({
      success: true,
      data: bookingsForOwner,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

const getBookingListForAdmin = async (req, res) => {
  try {
    const booking = await bookings.find().populate("hotel").populate("user");
    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

module.exports = {
  createBooking,
  getMyBooking,
  deleteBookingById,
  getBookingForHotelOwner,
  getBookingListForAdmin,
};
