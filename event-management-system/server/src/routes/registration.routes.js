const express = require("express");
const { registerForEvent, cancelRegistration } = require("../controllers/registration.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/:eventId", protect, authorizeRoles("attendee"), registerForEvent);
router.delete("/:eventId", protect, authorizeRoles("attendee"), cancelRegistration);

module.exports = router;
