const router = require("express").Router();
const hotelController = require('../controllers/hotelController');
const authGuard = require("../middleware/authGuard");
const upload = require('../middleware/upload');

router.post('/add', authGuard, hotelController.addHotel)
router.get('/get', authGuard, hotelController.fetchHotels)
router.get('/getById/:id', authGuard, hotelController.fetchHotelById)
router.put('/update/:id', authGuard, hotelController.updateHotelById)
router.delete('/delete/:id', authGuard, hotelController.deleteHotelById)
router.post('/search', authGuard, hotelController.search);
router.get('/getHotelsForAdmin', authGuard, hotelController.fetchHotelForAdmin)
router.put('/change-status/:id', authGuard, hotelController.changeStatus)

module.exports = router