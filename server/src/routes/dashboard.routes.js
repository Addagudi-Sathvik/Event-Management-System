const express = require("express");
const {
  getOrganizerStats,
  getEventAttendees,
  exportEventAttendeesCSV,
  getOrganizerAnalytics,
} = require("../controllers/dashboard.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(protect, authorizeRoles("organizer"));
router.get("/stats", getOrganizerStats);
router.get("/events/:eventId/attendees", getEventAttendees);
router.get("/events/:eventId/attendees/export", exportEventAttendeesCSV);
router.get("/analytics", getOrganizerAnalytics);

module.exports = router;
