const router = require("express").Router();
const bookingController = require("../controllers/bookingController")
const authGuard = require("../middleware/authGuard");

router.post("/create", authGuard, bookingController.createBooking);
router.get("/get", authGuard, bookingController.getMyBooking);
router.get("/getForHotelOwner", authGuard, bookingController.getBookingForHotelOwner);
router.delete("/delete/:id", authGuard, bookingController.deleteBookingById);
router.get("/getListForAdmin", authGuard, bookingController.getBookingListForAdmin);

module.exports = router;
