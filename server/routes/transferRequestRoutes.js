const express = require("express");
const {
	createRequest,
	receiverReject,
	receiverAccept,
	markOutForDelivery,
	markReceived,
	showOutgoing,
	showIncoming,
} = require("../controllers/transferRequestController");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/outgoing", verifyToken, showOutgoing);
router.get("/incoming", verifyToken, showIncoming);
router.post("/", verifyToken, createRequest);
router.post("/:id/reject", verifyToken, receiverReject);
router.post("/:id/accept", verifyToken, receiverAccept);
router.post("/:id/out_for_delivery", verifyToken, markOutForDelivery);
router.post("/:id/received", verifyToken, markReceived);

module.exports = router;
