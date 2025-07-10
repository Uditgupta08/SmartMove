const mongoose = require("mongoose");

const StoreDistanceSchema = new mongoose.Schema(
	{
		storeA: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
		},
		storeB: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
		},
		cost: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{ timestamps: true }
);

StoreDistanceSchema.index({ storeA: 1, storeB: 1 }, { unique: true });

const StoreDistance =
	mongoose.models.StoreDistance ||
	mongoose.model("StoreDistance", StoreDistanceSchema);
module.exports = StoreDistance;
