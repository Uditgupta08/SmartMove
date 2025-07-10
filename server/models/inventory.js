const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
	{
		store: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
		},
		item: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Item",
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 0,
		},
		expirationDate: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true }
);

InventorySchema.index({ store: 1, item: 1 }, { unique: true });

const Inventory =
	mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
module.exports = Inventory;
