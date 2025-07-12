const TransferRequest = require("../models/transferRequest");
const Inventory = require("../models/inventory");
const mongoose = require("mongoose");

const createRequest = async (req, res, next) => {
	try {
		const isAjax = req.get("X-Requested-With") === "XMLHttpRequest";
		if (!req.manager) {
			if (isAjax) return res.status(401).json({ error: "Not authenticated." });
			return res.redirect("/walmart/auth/login");
		}

		const { toStore, itemId, quantity } = req.body;
		const qty = parseInt(quantity, 10);
		if (isNaN(qty) || qty < 1) {
			if (isAjax)
				return res.status(400).json({ error: "Quantity must be at least 1." });
			return res.redirect("/walmart/transfer-requests/outgoing?error=Qty+>=1");
		}

		const fromStore = req.manager.store;
		const requestedBy = req.manager.id;

		const inv = await Inventory.findOne({
			store: fromStore,
			item: itemId,
		}).lean();

		if (!inv || inv.quantity < qty) {
			if (isAjax) return res.status(400).json({ error: "Insufficient stock." });
			return res.redirect(
				"/walmart/transfer-requests/outgoing?error=Insufficient+stock"
			);
		}

		// Ensure ObjectId is constructed correctly
		const itemObjectId = new mongoose.Types.ObjectId(itemId);

		const tr = await TransferRequest.create({
			fromStore,
			toStore,
			requestedBy,
			items: [{ item: itemObjectId, quantity: qty }],
		});

		const now = Date.now();
		const expiresIn = inv.expirationDate
			? Math.ceil((inv.expirationDate.getTime() - now) / (1000 * 60 * 60 * 24))
			: null;

		if (isAjax) {
			return res.json({ success: true, data: tr, expiresIn });
		}

		return res.redirect("/walmart/transfer-requests/outgoing");
	} catch (error) {
		next(error);
	}
};
const receiverReject = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (
			!tr ||
			tr.toStore.toString() !== req.manager.store.toString() ||
			tr.status !== "pending"
		) {
			return res.redirect(
				"/walmart/transfer-requests/incoming?error=Cannot+reject+request"
			);
		}

		tr.status = "rejected";
		tr.decisionAt = Date.now();
		await tr.save();

		return res.redirect("/walmart/transfer-requests/incoming");
	} catch (error) {
		next(error);
	}
};

const receiverAccept = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (
			!tr ||
			tr.toStore.toString() !== req.manager.store.toString() ||
			tr.status !== "pending"
		) {
			return res.redirect(
				"/walmart/transfer-requests/incoming?error=Cannot+accept+request"
			);
		}

		tr.status = "accepted";
		tr.decisionAt = Date.now();
		await tr.save();

		return res.redirect("/walmart/transfer-requests/incoming");
	} catch (error) {
		next(error);
	}
};

const markOutForDelivery = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (
			!tr ||
			tr.fromStore.toString() !== req.manager.store.toString() ||
			tr.status !== "accepted"
		) {
			return res.redirect(
				"/walmart/transfer-requests/outgoing?error=Cannot+dispatch+request"
			);
		}

		const { item, quantity } = tr.items[0] || {};
		const inv = await Inventory.findOne({ store: tr.fromStore, item });
		if (!inv) {
			return res.redirect(
				"/walmart/transfer-requests/outgoing?error=Inventory+item+not+found"
			);
		}

		inv.quantity -= quantity;
		await inv.save();

		tr.status = "out_for_delivery";
		tr.decisionAt = Date.now();
		await tr.save();

		return res.redirect("/walmart/transfer-requests/outgoing");
	} catch (error) {
		next(error);
	}
};

const markReceived = async (req, res, next) => {
	try {
		const tr = await TransferRequest.findById(req.params.id);
		if (
			!tr ||
			tr.toStore.toString() !== req.manager.store.toString() ||
			tr.status !== "out_for_delivery"
		) {
			return res.redirect(
				"/walmart/transfer-requests/incoming?error=Cannot+mark+received"
			);
		}

		const { item, quantity } = tr.items[0] || {};
		await Inventory.findOneAndUpdate(
			{ store: tr.toStore, item },
			{ $inc: { quantity } },
			{ new: true, upsert: true }
		);

		tr.status = "received";
		tr.decisionAt = Date.now();
		await tr.save();

		return res.redirect("/walmart/transfer-requests/incoming");
	} catch (error) {
		next(error);
	}
};

const showOutgoing = async (req, res, next) => {
	try {
		const now = new Date();
		// Fetch outgoing transfers sorted by most recent
		const outgoing = await TransferRequest.find({
			fromStore: req.manager.store,
		})
			.sort({ createdAt: -1, updatedAt: -1 })
			.populate("toStore items.item")
			.lean();

		// Filter out any without items
		const validOutgoing = outgoing.filter((tr) => tr.items && tr.items.length);

		res.render("outgoing-transfers", {
			outgoing: validOutgoing,
			error: req.query.error,
		});
	} catch (error) {
		next(error);
	}
};

const showIncoming = async (req, res, next) => {
	try {
		const now = new Date();
		// Fetch incoming transfers sorted by most recent
		const incoming = await TransferRequest.find({ toStore: req.manager.store })
			.sort({ createdAt: -1, updatedAt: -1 })
			.populate("fromStore items.item")
			.lean();

		// Filter out any without items
		const validIncoming = incoming.filter((tr) => tr.items && tr.items.length);

		// Add expiry info to each
		const incomingWithExpiry = await Promise.all(
			validIncoming.map(async (tr) => {
				const inv = await Inventory.findOne({
					store: tr.fromStore._id,
					item: tr.items[0].item._id,
				}).lean();
				tr.items[0].expiresIn = inv?.expirationDate
					? Math.ceil(
							(inv.expirationDate.getTime() - now.getTime()) /
								(1000 * 60 * 60 * 24)
					  )
					: "N/A";
				return tr;
			})
		);

		res.render("incoming-requests", {
			incoming: incomingWithExpiry,
			error: req.query.error,
		});
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
	showOutgoing,
	showIncoming,
};
