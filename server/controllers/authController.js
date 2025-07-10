const StoreManager = require("../models/storeManager");
const jwt = require("jsonwebtoken");

const loginManager = async (req, res, next) => {
	try {
		let { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Email and password are required." });
		}

		email = email.toLowerCase().trim();

		const manager = await StoreManager.findOne({ email });
		if (!manager) {
			return res.status(404).json({ error: "Manager not found." });
		}

		const isMatch = await manager.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid credentials." });
		}

		const token = jwt.sign(
			{
				managerId: manager._id,
				email: manager.email,
				store: manager.store,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		req.session.managerId = manager._id;

		res.json({
			success: true,
			token,
			manager: {
				id: manager._id,
				name: manager.name,
				email: manager.email,
				store: manager.store,
			},
		});
	} catch (error) {
		next(error);
	}
};

const logoutManager = async (req, res, next) => {
	try {
		req.session.destroy((err) => {
			if (err) return next(err);
			res.clearCookie("connect.sid");
			res.json({ success: true, message: "Logged out successfully." });
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	loginManager,
	logoutManager,
};
