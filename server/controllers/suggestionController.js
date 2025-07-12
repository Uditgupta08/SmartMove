// // controllers/suggestionsController.js

// const Inventory = require("../models/inventory");
// const Store = require("../models/store");
// const StoreDistance = require("../models/storeDistance");
// const TransferRequest = require("../models/transferRequest");

// // GET /walmart/suggestions/dashboard
// async function getExpiringSuggestions(req, res, next) {
// 	try {
// 		const managerStore = req.manager.store;
// 		const days = parseInt(req.query.days, 10) || 7;
// 		const search = (req.query.search || "").trim().toLowerCase();
// 		const sort = req.query.sort;
// 		const now = new Date();
// 		const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

// 		// avoid duplicates
// 		const activeStatuses = ["pending", "accepted", "out_for_delivery"];
// 		const pendingReqs = await TransferRequest.find({
// 			fromStore: managerStore,
// 			status: { $in: activeStatuses },
// 		}).lean();

// 		const pendingItemIds = new Set(
// 			pendingReqs.flatMap((tr) =>
// 				(tr.items || []).map((i) => i.item.toString())
// 			)
// 		);

// 		// expiring inventory
// 		let expiring = await Inventory.find({
// 			store: managerStore,
// 			quantity: { $gt: 0 },
// 			expirationDate: { $lte: cutoff },
// 		})
// 			.populate("item")
// 			.lean();

// 		expiring = expiring.filter(
// 			(inv) => !pendingItemIds.has(inv.item._id.toString())
// 		);

// 		if (search) {
// 			expiring = expiring.filter((inv) =>
// 				inv.item.name.toLowerCase().includes(search)
// 			);
// 		}

// 		// all other stores
// 		const otherStores = await Store.find({ _id: { $ne: managerStore } }).lean();
// 		if (!otherStores.length) {
// 			return res.status(400).json({ error: "No other stores available." });
// 		}

// 		// build suggestions with proper awaits
// 		const suggestions = [];
// 		for (const inv of expiring) {
// 			let bestStore = null;
// 			let minCost = Infinity;

// 			for (const st of otherStores) {
// 				// **correct async call** for Mongoose
// 				const costEntry = await StoreDistance.findOne({
// 					storeA: managerStore,
// 					storeB: st._id,
// 				}).lean();

// 				const thisCost = costEntry?.cost ?? 0;
// 				if (thisCost < minCost) {
// 					minCost = thisCost;
// 					bestStore = st;
// 				}
// 			}

// 			const cost = inv.item.costPrice || 0;
// 			const sale = inv.item.salePrice || 0;
// 			const profit = (sale - cost) * inv.quantity;
// 			const expiresIn = Math.ceil(
// 				(inv.expirationDate - now) / (1000 * 60 * 60 * 24)
// 			);
// 			const lossIfNotTransferred = cost * inv.quantity;
// 			const netProfitIfTransferred = profit - minCost;

// 			suggestions.push({
// 				item: { _id: inv.item._id, sku: inv.item.sku, name: inv.item.name },
// 				quantity: inv.quantity,
// 				expiresIn,
// 				suggestedStore: { id: bestStore._id, name: bestStore.name },
// 				netProfitIfTransferred,
// 				lossIfNotTransferred,
// 			});
// 		}

// 		// sorting
// 		if (sort === "expiry") {
// 			suggestions.sort((a, b) => a.expiresIn - b.expiresIn);
// 		} else if (sort === "profit") {
// 			suggestions.sort(
// 				(a, b) => b.netProfitIfTransferred - a.netProfitIfTransferred
// 			);
// 		}

// 		return res.render("dashboard", { suggestions, sort });
// 	} catch (err) {
// 		next(err);
// 	}
// }

// module.exports = { getExpiringSuggestions };

// controllers/suggestionsController.js

const Inventory = require("../models/inventory");
const Store = require("../models/store");
const StoreDistance = require("../models/storeDistance");
const TransferRequest = require("../models/transferRequest");

// GET /walmart/suggestions/dashboard
async function getExpiringSuggestions(req, res, next) {
	try {
		const managerStore = req.manager.store;
		const days = parseInt(req.query.days, 10) || 7;
		const search = (req.query.search || "").trim().toLowerCase();
		const sort = req.query.sort;
		const now = new Date();
		const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

		// avoid duplicates
		const activeStatuses = ["pending", "accepted", "out_for_delivery"];
		const pendingReqs = await TransferRequest.find({
			fromStore: managerStore,
			status: { $in: activeStatuses },
		}).lean();

		const pendingItemIds = new Set(
			pendingReqs.flatMap((tr) =>
				(tr.items || []).map((i) => i.item.toString())
			)
		);

		// expiring inventory
		let expiring = await Inventory.find({
			store: managerStore,
			quantity: { $gt: 0 },
			expirationDate: { $lte: cutoff },
		})
			.populate("item")
			.lean();

		expiring = expiring.filter(
			(inv) => !pendingItemIds.has(inv.item._id.toString())
		);

		if (search) {
			expiring = expiring.filter((inv) =>
				inv.item.name.toLowerCase().includes(search)
			);
		}

		// all other stores
		const otherStores = await Store.find({ _id: { $ne: managerStore } }).lean();
		if (!otherStores.length) {
			return res.status(400).json({ error: "No other stores available." });
		}

		// preload distances in one go
		const storeIds = otherStores.map((st) => st._id);
		const distances = await StoreDistance.find({
			storeA: managerStore,
			storeB: { $in: storeIds },
		})
			.select("storeB cost")
			.lean();

		const costMap = new Map();
		distances.forEach((d) => costMap.set(d.storeB.toString(), d.cost));

		// build suggestions without per-store queries
		const suggestions = expiring.map((inv) => {
			let bestStore = null;
			let minCost = Infinity;

			for (const st of otherStores) {
				const thisCost = costMap.get(st._id.toString()) ?? 0;
				if (thisCost < minCost) {
					minCost = thisCost;
					bestStore = st;
				}
			}

			const cost = inv.item.costPrice || 0;
			const sale = inv.item.salePrice || 0;
			const profit = (sale - cost) * inv.quantity;
			const expiresIn = Math.ceil(
				(inv.expirationDate - now) / (1000 * 60 * 60 * 24)
			);
			const lossIfNotTransferred = cost * inv.quantity;
			const netProfitIfTransferred = profit - minCost;

			return {
				item: { _id: inv.item._id, sku: inv.item.sku, name: inv.item.name },
				quantity: inv.quantity,
				expiresIn,
				suggestedStore: { id: bestStore._id, name: bestStore.name },
				netProfitIfTransferred,
				lossIfNotTransferred,
			};
		});

		// sorting
		if (sort === "expiry") {
			suggestions.sort((a, b) => a.expiresIn - b.expiresIn);
		} else if (sort === "profit") {
			suggestions.sort(
				(a, b) => b.netProfitIfTransferred - a.netProfitIfTransferred
			);
		}

		return res.render("dashboard", { suggestions, sort });
	} catch (err) {
		next(err);
	}
}

module.exports = { getExpiringSuggestions };
