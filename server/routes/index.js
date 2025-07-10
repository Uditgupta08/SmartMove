const express = require("express");
const router = express.Router();

// Auth routes
const authRoutes = require("./authRoutes");
router.use("/auth", authRoutes);

// Inventory routes
const inventoryRoutes = require("./inventoryRoutes");
router.use("/inventory", inventoryRoutes);

// Item routes
const itemRoutes = require("./itemRoutes");
router.use("/items", itemRoutes);

// Store distance routes
const storeDistanceRoutes = require("./storeDistanceRoutes");
router.use("/store-distances", storeDistanceRoutes);

// Store manager routes
const storeManagerRoutes = require("./storeManagerRoutes");
router.use("/managers", storeManagerRoutes);

// Store routes
const storeRoutes = require("./storeRoutes");
router.use("/stores", storeRoutes);

// Suggestion routes
const suggestionRoutes = require("./suggestionRoutes");
router.use("/suggestions", suggestionRoutes);

// Transfer request routes
const transferRequestRoutes = require("./transferRequestRoutes");
router.use("/transfer-requests", transferRequestRoutes);

module.exports = router;
