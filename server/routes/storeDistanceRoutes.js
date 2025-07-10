const express = require("express");
const {
	upsertDistance,
	listDistances,
	getDistanceByStores,
	deleteDistance,
} = require("../controllers/storeDistanceController");

const router = express.Router();

router.get("/", listDistances);
router.get("/:storeA/:storeB", getDistanceByStores);
router.post("/", upsertDistance);
router.delete("/:id", deleteDistance);

module.exports = router;
