const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		location: {
			type: String,
			required: true,
			trim: true,
		},
		latitude: {
			type: Number,
			required: true,
		},
		longitude: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

const Store = mongoose.models.Store || mongoose.model("Store", StoreSchema);
module.exports = Store;
