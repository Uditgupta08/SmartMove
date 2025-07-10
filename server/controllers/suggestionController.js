// const Inventory = require("../models/inventory");
// const Store = require("../models/store");

// const getExpiringSuggestions = async (req, res, next) => {
// 	try {
// 		const managerStore = req.manager.store;
// 		const days = parseInt(req.query.days, 10) || 7;
// 		const search = (req.query.search || "").trim().toLowerCase();
// 		const sortBy = req.query.sort;
// 		const now = new Date();
// 		const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

// 		let expiring = await Inventory.find({
// 			store: managerStore,
// 			expirationDate: { $lte: cutoff },
// 		})
// 			.populate("item")
// 			.lean();

// 		if (search) {
// 			expiring = expiring.filter((inv) =>
// 				inv.item.name.toLowerCase().includes(search)
// 			);
// 		}

// 		const otherStores = await Store.find({ _id: { $ne: managerStore } }).lean();
// 		if (!otherStores.length) {
// 			return res.status(400).json({ error: "No other stores available." });
// 		}

// 		const suggestions = expiring.map((inv) => {
// 			const target =
// 				otherStores[Math.floor(Math.random() * otherStores.length)];

// 			const cost = inv.item.costPrice || 0;
// 			const sale = inv.item.salePrice || 0;
// 			const profit = (sale - cost) * inv.quantity;
// 			const expiresIn = Math.ceil(
// 				(inv.expirationDate - now) / (1000 * 60 * 60 * 24)
// 			);

// 			return {
// 				item: { sku: inv.item.sku, name: inv.item.name },
// 				quantity: inv.quantity,
// 				expiresIn,
// 				suggestedStore: {
// 					id: target._id,
// 					name: target.name,
// 				},
// 				profit,
// 				action: null,
// 			};
// 		});

// 		if (sortBy === "expiry") {
// 			suggestions.sort((a, b) => a.expiresIn - b.expiresIn);
// 		} else if (sortBy === "profit") {
// 			suggestions.sort((a, b) => b.profit - a.profit);
// 		}

// 		res.json({ success: true, data: suggestions });
// 	} catch (error) {
// 		next(error);
// 	}
// };

// module.exports = { getExpiringSuggestions };

const Inventory = require("../models/inventory");
const Store = require("../models/store");
const StoreDistance = require("../models/storeDistance");

const getExpiringSuggestions = async (req, res, next) => {
	try {
		const managerStore = req.manager.store;
		const days = parseInt(req.query.days, 10) || 7;
		const search = (req.query.search || "").trim().toLowerCase();
		const sortBy = req.query.sort;
		const now = new Date();
		const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

		let expiring = await Inventory.find({
			store: managerStore,
			expirationDate: { $lte: cutoff },
		})
			.populate("item")
			.lean();

		if (search) {
			expiring = expiring.filter((inv) =>
				inv.item.name.toLowerCase().includes(search)
			);
		}

		const otherStores = await Store.find({ _id: { $ne: managerStore } }).lean();
		if (!otherStores.length) {
			return res.status(400).json({ error: "No other stores available." });
		}

		const suggestions = [];

		for (const inv of expiring) {
			const target =
				otherStores[Math.floor(Math.random() * otherStores.length)];

			const costEntry = await StoreDistance.findOne({
				storeA: managerStore,
				storeB: target._id,
			});

			const transferCost = costEntry?.cost ?? null;

			const cost = inv.item.costPrice || 0;
			const sale = inv.item.salePrice || 0;
			const profit = (sale - cost) * inv.quantity;
			const expiresIn = Math.ceil(
				(inv.expirationDate - now) / (1000 * 60 * 60 * 24)
			);
			const lossIfNotTransferred = cost * inv.quantity;
			const netProfitIfTransferred = profit - transferCost;
			suggestions.push({
				item: { sku: inv.item.sku, name: inv.item.name },
				quantity: inv.quantity,
				expiresIn,
				suggestedStore: {
					id: target._id,
					name: target.name,
				},
				profit,
				transferCost,
				netProfitIfTransferred,
				lossIfNotTransferred,
				action: null,
			});
		}

		if (sortBy === "expiry") {
			suggestions.sort((a, b) => a.expiresIn - b.expiresIn);
		} else if (sortBy === "profit") {
			suggestions.sort((a, b) => b.profit - a.profit);
		}

		res.json({ success: true, data: suggestions });
	} catch (error) {
		next(error);
	}
};

module.exports = { getExpiringSuggestions };
