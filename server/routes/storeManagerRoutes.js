const express = require("express");
const {
	registerManager,
	listManagers,
	getManagerById,
	updateManager,
	deleteManager,
} = require("../controllers/storeManagerController");

const router = express.Router();

router.get("/", listManagers);
router.get("/:id", getManagerById);
router.post("/", registerManager);
router.patch("/:id", updateManager);
router.delete("/:id", deleteManager);

module.exports = router;
