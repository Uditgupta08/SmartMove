const Store = require("../models/store");

const createStore = async (req, res, next) => {
	try {
		let { name, location, latitude, longitude } = req.body;
		if (!name || !location || latitude == null || longitude == null) {
			return res
				.status(400)
				.json({ error: "name, location, latitude & longitude are required." });
		}

		name = name.trim();
		location = location.trim();

		const store = await Store.create({ name, location, latitude, longitude });
		res.status(201).json({ success: true, data: store });
	} catch (error) {
		next(error);
	}
};

const listStores = async (req, res, next) => {
	try {
		const stores = await Store.find().lean();
		res.json({ success: true, data: stores });
	} catch (error) {
		next(error);
	}
};

const getStoreById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const store = await Store.findById(id);
		if (!store) {
			return res.status(404).json({ error: "Store not found." });
		}
		res.json({ success: true, data: store });
	} catch (error) {
		next(error);
	}
};

const updateStore = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updates = {};
		["name", "location", "latitude", "longitude"].forEach((field) => {
			if (req.body[field] != null) {
				updates[field] =
					typeof req.body[field] === "string"
						? req.body[field].trim()
						: req.body[field];
			}
		});

		const store = await Store.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});
		if (!store) {
			return res.status(404).json({ error: "Store not found." });
		}
		res.json({ success: true, data: store });
	} catch (error) {
		next(error);
	}
};

const deleteStore = async (req, res, next) => {
	try {
		const { id } = req.params;
		const store = await Store.findByIdAndDelete(id);
		if (!store) {
			return res.status(404).json({ error: "Store not found." });
		}
		res.json({ success: true, message: "Store deleted." });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createStore,
	listStores,
	getStoreById,
	updateStore,
	deleteStore,
};
