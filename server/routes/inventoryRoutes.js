const express = require("express");
const {
	upsertInventory,
	getInventoryByStore,
	getInventoryEntry,
	deleteInventoryEntry,
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", upsertInventory);
router.get("/store/:storeId", getInventoryByStore);
router.get("/:storeId/:itemId", getInventoryEntry);
router.delete("/:storeId/:itemId", deleteInventoryEntry);

module.exports = router;
