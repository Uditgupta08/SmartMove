const StoreManager = require("../models/storeManager");
const Store = require("../models/store");
const bcrypt = require("bcryptjs");

const registerManager = async (req, res, next) => {
	try {
		let { name, email, password, store } = req.body;
		if (!name || !email || !password || !store) {
			return res
				.status(400)
				.json({ error: "name, email, password & store are required." });
		}

		name = name.trim();
		email = email.toLowerCase().trim();

		const targetStore = await Store.findById(store);
		if (!targetStore) {
			return res.status(404).json({ error: "Store not found." });
		}

		const mgr = await StoreManager.create({ name, email, password, store });
		res.status(201).json({
			success: true,
			data: {
				id: mgr._id,
				name: mgr.name,
				email: mgr.email,
				store: mgr.store,
				createdAt: mgr.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
};

const listManagers = async (req, res, next) => {
	try {
		const managers = await StoreManager.find()
			.populate("store", "name location")
			.select("name email store createdAt")
			.lean();
		res.json({ success: true, data: managers });
	} catch (error) {
		next(error);
	}
};

const getManagerById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const mgr = await StoreManager.findById(id)
			.populate("store", "name location")
			.select("name email store createdAt");
		if (!mgr) {
			return res.status(404).json({ error: "Manager not found." });
		}
		res.json({ success: true, data: mgr });
	} catch (error) {
		next(error);
	}
};

const updateManager = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updates = {};

		if (req.body.name) updates.name = req.body.name.trim();
		if (req.body.email) updates.email = req.body.email.toLowerCase().trim();
		if (req.body.password) {
			const salt = await bcrypt.genSalt(10);
			updates.password = await bcrypt.hash(req.body.password, salt);
		}

		const mgr = await StoreManager.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		}).select("name email store updatedAt");
		if (!mgr) {
			return res.status(404).json({ error: "Manager not found." });
		}
		res.json({ success: true, data: mgr });
	} catch (error) {
		next(error);
	}
};

const deleteManager = async (req, res, next) => {
	try {
		const { id } = req.params;
		const mgr = await StoreManager.findByIdAndDelete(id);
		if (!mgr) {
			return res.status(404).json({ error: "Manager not found." });
		}
		res.json({ success: true, message: "Manager deleted." });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	registerManager,
	listManagers,
	getManagerById,
	updateManager,
	deleteManager,
};
