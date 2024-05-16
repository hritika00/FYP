const router = require("express").Router();
const userController = require('../controllers/userController');
const authGuard = require("../middleware/authGuard");

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/getUserListForAdmin', authGuard, userController.getUserListForAdmin)
router.get('/getOwnerListForAdmin', authGuard, userController.getOwnerListForAdmin)
router.put('/update/:id', authGuard, userController.updateUserById)
router.delete('/delete/:id', authGuard, userController.deleteUserById)

module.exports = router;