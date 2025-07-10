const express = require("express");
const {
	createStore,
	listStores,
	getStoreById,
	updateStore,
	deleteStore,
} = require("../controllers/storeController");

const router = express.Router();

router.get("/", listStores);
router.get("/:id", getStoreById);
router.post("/", createStore);
router.patch("/:id", updateStore);
router.delete("/:id", deleteStore);

module.exports = router;
