const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StoreManagerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
		},
		store: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
			unique: true,
		},
	},
	{ timestamps: true }
);

// Password hashing
StoreManagerSchema.pre("save", async function (next) {
	if (this.$locals.skipHashing) return next();
	if (!this.isModified("password")) return next();
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

StoreManagerSchema.methods.comparePassword = async function (candidate) {
	return await bcrypt.compare(candidate, this.password);
};

const StoreManager =
	mongoose.models.StoreManager ||
	mongoose.model("StoreManager", StoreManagerSchema);
module.exports = StoreManager;
