// const jwt = require("jsonwebtoken");
// const StoreManager = require("../models/storeManager");

// const verifyToken = async (req, res, next) => {
// 	try {
// 		const authHeader = req.headers.authorization;
// 		if (!authHeader || !authHeader.startsWith("Bearer ")) {
// 			return res.status(401).json({ error: "Authorization token required." });
// 		}

// 		const token = authHeader.split(" ")[1];

// 		const decoded = jwt.verify(token, process.env.JWT_SECRET);
// 		const manager = await StoreManager.findById(decoded.managerId).select(
// 			"name email store"
// 		);

// 		if (!manager) {
// 			return res
// 				.status(401)
// 				.json({ error: "Unauthorized. Manager not found." });
// 		}

// 		req.manager = manager;
// 		next();
// 	} catch (error) {
// 		return res.status(401).json({ error: "Invalid or expired token." });
// 	}
// };

// module.exports = {
// 	verifyToken,
// };

const jwt = require("jsonwebtoken");

// Middleware to protect routes by checking JWT from cookie
const verifyToken = (req, res, next) => {
	try {
		// Look for token in cookies (or fall back to Authorization header)
		const token =
			req.cookies.authToken ||
			(req.headers.authorization && req.headers.authorization.split(" ")[1]);
		if (!token) {
			// Not logged in
			return res.redirect("/walmart/auth/login");
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.manager = {
			id: decoded.managerId,
			email: decoded.email,
			store: decoded.store,
		};
		next();
	} catch (err) {
		// Invalid token
		return res.redirect("/walmart/auth/login");
	}
};

module.exports = { verifyToken };
