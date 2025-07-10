const mongoose = require("mongoose");

const TransferRequestItemSchema = new mongoose.Schema(
	{
		request: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "TransferRequest",
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
			min: 1,
		},
	},
	{ timestamps: true }
);

TransferRequestItemSchema.index({ request: 1, item: 1 }, { unique: true });

const TransferRequestItem = mongoose.models.TransferRequestItem || mongoose.model("TransferRequestItem", TransferRequestItemSchema);
module.exports = TransferRequestItem;
