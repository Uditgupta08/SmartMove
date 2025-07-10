const express = require("express");
const {
	getExpiringSuggestions,
} = require("../controllers/suggestionController");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/expiring", verifyToken, getExpiringSuggestions);

module.exports = router;
