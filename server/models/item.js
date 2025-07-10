const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
	{
		sku: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			default: "",
			trim: true,
		},
		costPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		salePrice: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{ timestamps: true }
);

const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);
module.exports = Item;
