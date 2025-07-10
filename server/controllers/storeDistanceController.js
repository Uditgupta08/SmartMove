const StoreDistance = require("../models/storeDistance");

const upsertDistance = async (req, res, next) => {
	try {
		let { storeA, storeB, cost } = req.body;
		if (!storeA || !storeB || cost == null) {
			return res
				.status(400)
				.json({ error: "storeA, storeB, and cost are required." });
		}

		storeA = storeA.trim();
		storeB = storeB.trim();

		const entry = await StoreDistance.findOneAndUpdate(
			{ storeA, storeB },
			{ cost },
			{ upsert: true, new: true, runValidators: true }
		);

		res.json({ success: true, data: entry });
	} catch (error) {
		next(error);
	}
};

const listDistances = async (req, res, next) => {
	try {
		const list = await StoreDistance.find()
			.populate("storeA storeB", "name location")
			.lean();
		res.json({ success: true, data: list });
	} catch (error) {
		next(error);
	}
};

const getDistanceByStores = async (req, res, next) => {
	try {
		let { storeA, storeB } = req.params;

		if (!storeA || !storeB) {
			return res
				.status(400)
				.json({ error: "storeA and storeB params are required." });
		}

		storeA = storeA.trim();
		storeB = storeB.trim();

		const entry = await StoreDistance.findOne({ storeA, storeB });
		if (!entry) {
			return res.status(404).json({ error: "Cost entry not found." });
		}

		res.json({ success: true, data: entry });
	} catch (error) {
		next(error);
	}
};

const deleteDistance = async (req, res, next) => {
	try {
		const { id } = req.params;
		const entry = await StoreDistance.findByIdAndDelete(id);
		if (!entry) {
			return res.status(404).json({ error: "Cost entry not found." });
		}
		res.json({ success: true, message: "Cost entry deleted." });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	upsertDistance,
	listDistances,
	getDistanceByStores,
	deleteDistance,
};
