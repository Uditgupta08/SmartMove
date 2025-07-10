const Inventory = require("../models/inventory");
const Store = require("../models/store");
const Item = require("../models/item");

const upsertInventory = async (req, res, next) => {
	try {
		const { store, item, quantity, expirationDate } = req.body;

		if (!store || !item || quantity == null || !expirationDate) {
			return res
				.status(400)
				.json({ error: "store, item, and quantity are required." });
		}

		const entry = await Inventory.findOneAndUpdate(
			{ store, item },
			{ quantity, expirationDate },
			{ upsert: true, new: true, runValidators: true }
		);

		res.status(200).json({ success: true, data: entry });
	} catch (error) {
		next(error);
	}
};

const getInventoryByStore = async (req, res, next) => {
	try {
		const { storeId } = req.params;

		const entries = await Inventory.find({ store: storeId })
			.populate("item", "sku name")
			.select("item quantity updatedAt")
			.lean();

		res.json({ success: true, data: entries });
	} catch (error) {
		next(error);
	}
};

const getInventoryEntry = async (req, res, next) => {
	try {
		const { storeId, itemId } = req.params;
		const entry = await Inventory.findOne({ store: storeId, item: itemId })
			.populate("item", "sku name")
			.lean();

		if (!entry)
			return res.status(404).json({ error: "Inventory entry not found." });

		res.json({ success: true, data: entry });
	} catch (error) {
		next(error);
	}
};

const deleteInventoryEntry = async (req, res, next) => {
	try {
		const { storeId, itemId } = req.params;
		const entry = await Inventory.findOneAndDelete({
			store: storeId,
			item: itemId,
		});

		if (!entry)
			return res.status(404).json({ error: "Inventory entry not found." });

		res.json({ success: true, message: "Inventory entry deleted." });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	upsertInventory,
	getInventoryByStore,
	getInventoryEntry,
	deleteInventoryEntry,
};
