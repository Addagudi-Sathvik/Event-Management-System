const express = require("express");
const { registerForEvent, cancelRegistration } = require("../controllers/registration.controller");
const { checkRegistration, getUserRegistrations } = require("../controllers/registration.check");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/:eventId", protect, authorizeRoles("attendee"), registerForEvent);
router.delete("/:eventId", protect, authorizeRoles("attendee"), cancelRegistration);
router.get("/check/:eventId", protect, checkRegistration);
router.get("/my-registrations", protect, getUserRegistrations);

module.exports = router;
