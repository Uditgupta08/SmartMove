const mongoose = require("mongoose");

const TransferRequestSchema = new mongoose.Schema(
	{
		fromStore: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
		},
		toStore: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
		},
		requestedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "StoreManager",
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected", "out_for_delivery", "received"],
			default: "pending",
		},
		decisionAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

const TransferRequest =
	mongoose.models.TransferRequest ||
	mongoose.model("TransferRequest", TransferRequestSchema);
module.exports = TransferRequest;
