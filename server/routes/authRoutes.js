const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
	loginPage,
	loginManager,
	logoutManager,
} = require("../controllers/authController");

const router = express.Router();

router.get('/login', loginPage);
router.post("/login", loginManager);
router.post("/logout", verifyToken, logoutManager);

module.exports = router;
