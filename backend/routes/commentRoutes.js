const router = require("express").Router();
const commentController = require("../controllers/commentController")
const authGuard = require("../middleware/authGuard");

router.post("/create", authGuard, commentController.createComment);

module.exports = router;
