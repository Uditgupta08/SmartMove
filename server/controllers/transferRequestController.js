const TransferRequest = require("../models/transferRequest");
const Inventory = require("../models/inventory");
const mongoose = require("mongoose");

const createRequest = async (req, res, next) => {
	try {
		const { toStore, itemId, quantity } = req.body;
		const fromStore = req.manager.store;
		const requestedBy = req.manager._id;

		const inv = await Inventory.findOne({ store: fromStore, item: itemId });
		if (!inv || inv.quantity < quantity) {
			return res
				.status(400)
				.json({ error: "Insufficient stock to create request." });
		}

		const tr = await TransferRequest.create({
			fromStore,
			toStore,
			requestedBy,
			items: [{ item: mongoose.Types.ObjectId(itemId), quantity }],
		});

		res.status(201).json({ success: true, data: tr });
	} catch (error) {
		next(error);
	}
};

const receiverReject = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (!tr) return res.status(404).json({ error: "Not found." });
		if (tr.toStore.toString() !== req.manager.store.toString())
			return res.status(403).json({ error: "Forbidden." });
		if (tr.status !== "pending")
			return res.status(400).json({ error: "Cannot reject now." });

		tr.status = "rejected";
		tr.decisionAt = Date.now();
		await tr.save();

		res.json({ success: true, data: tr });
	} catch (error) {
		next(error);
	}
};

const receiverAccept = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (!tr) return res.status(404).json({ error: "Not found." });
		if (tr.toStore.toString() !== req.manager.store.toString())
			return res.status(403).json({ error: "Forbidden." });
		if (tr.status !== "pending")
			return res.status(400).json({ error: "Cannot accept now." });

		tr.status = "accepted";
		tr.decisionAt = Date.now();
		await tr.save();

		res.json({ success: true, data: tr });
	} catch (error) {
		next(error);
	}
};

const markOutForDelivery = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (!tr) return res.status(404).json({ error: "Not found." });
		if (tr.fromStore.toString() !== req.manager.store.toString())
			return res.status(403).json({ error: "Forbidden." });
		if (tr.status !== "accepted")
			return res
				.status(400)
				.json({ error: "Only accepted requests can be dispatched." });

		const { item, quantity } = tr.items[0];
		const inv = await Inventory.findOne({ store: tr.fromStore, item });
		inv.quantity -= quantity;
		await inv.save();

		tr.status = "out_for_delivery";
		tr.decisionAt = Date.now();
		await tr.save();

		res.json({ success: true, data: tr });
	} catch (error) {
		next(error);
	}
};

const markReceived = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (!tr) return res.status(404).json({ error: "Not found." });
		if (tr.toStore.toString() !== req.manager.store.toString())
			return res.status(403).json({ error: "Forbidden." });
		if (tr.status !== "out_for_delivery")
			return res
				.status(400)
				.json({ error: "Only out_for_delivery requests can be received." });

		const { item, quantity } = tr.items[0];
		const inv = await Inventory.findOneAndUpdate(
			{ store: tr.toStore, item },
			{ $inc: { quantity } },
			{ new: true, upsert: true }
		);

		tr.status = "received";
		tr.decisionAt = Date.now();
		await tr.save();

		res.json({ success: true, data: inv });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createRequest,
	receiverReject,
	receiverAccept,
	markOutForDelivery,
	markReceived,
};
