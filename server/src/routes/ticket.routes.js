const express = require("express");
const { verifyTicket } = require("../controllers/ticket.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/verify", protect, authorizeRoles("organizer"), verifyTicket);

module.exports = router;
