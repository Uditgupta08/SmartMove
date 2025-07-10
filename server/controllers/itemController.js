const Item = require("../models/item");

const createItem = async (req, res, next) => {
	try {
		const { sku, name, description, costPrice, salePrice } = req.body;

		if (!sku || !name) {
			return res.status(400).json({ error: "SKU and name are required." });
		}

		const item = await Item.create({
			sku: sku.trim().toUpperCase(),
			name: name.trim(),
			description: description?.trim() || "",
			costPrice: costPrice,
			salePrice: salePrice,
		});

		res.status(201).json({ success: true, data: item });
	} catch (error) {
		next(error);
	}
};

const listItems = async (req, res, next) => {
	try {
		const items = await Item.find().lean();
		res.json({ success: true, data: items });
	} catch (error) {
		next(error);
	}
};

const getItemById = async (req, res, next) => {
	try {
		const item = await Item.findById(req.params.id);
		if (!item) return res.status(404).json({ error: "Item not found." });
		res.json({ success: true, data: item });
	} catch (error) {
		next(error);
	}
};

const updateItem = async (req, res, next) => {
	try {
		const { sku, name, description, costPrice, salePrice } = req.body;
		const update = {};
		if (sku) update.sku = sku.trim().toUpperCase();
		if (name) update.name = name.trim();
		if (description != null) update.description = description.trim();
		if(costPrice) update.costPrice = costPrice;
		if(salePrice) update.salePrice = salePrice;

		const item = await Item.findByIdAndUpdate(req.params.id, update, {
			new: true,
			runValidators: true,
		});

		if (!item) return res.status(404).json({ error: "Item not found." });
		res.json({ success: true, data: item });
	} catch (error) {
		next(error);
	}
};

const deleteItem = async (req, res, next) => {
	try {
		const item = await Item.findByIdAndDelete(req.params.id);
		if (!item) return res.status(404).json({ error: "Item not found." });
		res.json({ success: true, message: "Item deleted." });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createItem,
	listItems,
	getItemById,
	updateItem,
	deleteItem,
};
