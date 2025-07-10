const jwt = require("jsonwebtoken");
const StoreManager = require("../models/storeManager");

const verifyToken = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Authorization token required." });
		}

		const token = authHeader.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const manager = await StoreManager.findById(decoded.managerId).select(
			"name email store"
		);

		if (!manager) {
			return res
				.status(401)
				.json({ error: "Unauthorized. Manager not found." });
		}

		req.manager = manager;
		next();
	} catch (error) {
		return res.status(401).json({ error: "Invalid or expired token." });
	}
};

module.exports = {
	verifyToken,
};
