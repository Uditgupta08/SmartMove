const StoreManager = require("../models/storeManager");
const jwt = require("jsonwebtoken");

const loginPage = (req, res) => {
	res.render("login", { error: null });
};

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
		res.cookie("authToken", token, { httpOnly: true, maxAge: 86400000 });

		// res.json({
		// 	success: true,
		// 	token,
		// 	manager: {
		// 		id: manager._id,
		// 		name: manager.name,
		// 		email: manager.email,
		// 		store: manager.store,
		// 	},
		// });
		return res.redirect("/walmart/suggestions/dashboard");
	} catch (error) {
		next(error);
	}
};

const logoutManager = async (req, res, next) => {
	try {
		req.session.destroy((err) => {
			if (err) return next(err);
			res.clearCookie("connect.sid");
			res.clearCookie("authToken");
			res.redirect("/walmart/auth/login");
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	loginPage,
	loginManager,
	logoutManager,
};
