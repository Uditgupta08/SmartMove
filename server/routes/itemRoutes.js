const express = require("express");
const {
	createItem,
	listItems,
	getItemById,
	updateItem,
	deleteItem,
} = require("../controllers/itemController");

const router = express.Router();

router.post("/", createItem);
router.get("/", listItems);
router.get("/:id", getItemById);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
