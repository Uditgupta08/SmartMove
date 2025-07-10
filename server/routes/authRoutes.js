const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
	loginManager,
	logoutManager,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginManager);
router.post("/logout", verifyToken, logoutManager);

module.exports = router;
