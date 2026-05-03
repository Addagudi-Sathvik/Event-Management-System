const express = require("express");
const {
  createEvent,
  getAllUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  createEventFeedback,
  getEventSentimentSummary,
} = require("../controllers/event.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/", getAllUpcomingEvents);
router.get("/upcoming", getAllUpcomingEvents);
router.get("/:id", getEventById);
router.post("/:id/feedback", protect, authorizeRoles("attendee"), createEventFeedback);
router.get("/:id/sentiment-summary", protect, authorizeRoles("organizer"), getEventSentimentSummary);

router.post("/", protect, authorizeRoles("organizer"), createEvent);
router.put("/:id", protect, authorizeRoles("organizer"), updateEvent);
router.delete("/:id", protect, authorizeRoles("organizer"), deleteEvent);

module.exports = router;
