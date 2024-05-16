const users = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bookings = require("../model/bookingModel");

const registerUser = async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, isHotelOwner, password } = req.body;
  try {
    const generateSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, generateSalt);
    const newuser = new users({
      firstName,
      lastName,
      email,
      isHotelOwner,
      password: encryptedPassword,
    });
    newuser.save();
    res.json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "User registration failed",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Please enter all fields",
      });
    }

    const user = await users.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: `User not found`,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET);

    res.status(200).json({
      success: true,
      token: token,
      message: `Welcome ${user.firstName}`,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getUserListForAdmin = async (req, res) => {
  try {
    const userList = await users.find({ isAdmin: false, isHotelOwner: false });
    res.json({
      success: true,
      data: userList,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Couldnot fetch",
    });
  }
};

const getOwnerListForAdmin = async (req, res) => {
  try {
    const ownerList = await users.find({ isHotelOwner: true });
    res.json({
      success: true,
      data: ownerList,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Couldnot fetch",
    });
  }
};

const updateUserById = async (req, res) => {
  try {
    const updatedUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    await users.findByIdAndUpdate(req.params.id, updatedUser);
    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Couldnot fetch",
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userBookings = await bookings.find({ user: req.params.id });
    await Promise.all(
      userBookings.map(async (booking) => {
        await bookings.findByIdAndDelete(booking._id);
      })
    );
    await users.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Couldnot fetch",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserListForAdmin,
  updateUserById,
  deleteUserById,
  getOwnerListForAdmin,
};
