const express = require("express");
const { 
  getPendingEvents, 
  approveEvent, 
  rejectEvent, 
  getAllUsers, 
  getAdminStats, 
  deleteEvent 
} = require("../controllers/admin.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(protect); // All admin routes require auth

router.get("/stats", authorizeRoles("admin"), getAdminStats);
router.get("/pending-events", authorizeRoles("admin"), getPendingEvents);
router.get("/users", authorizeRoles("admin"), getAllUsers);
router.get("/events", authorizeRoles("admin"), require("../controllers/admin.controller").getAllEvents);

router.patch("/events/:eventId/approve", authorizeRoles("admin"), approveEvent);
router.patch("/events/:eventId/reject", authorizeRoles("admin"), rejectEvent);
router.delete("/events/:eventId", authorizeRoles("admin"), deleteEvent);

router.put("/users/:userId/block", authorizeRoles("admin"), require("../controllers/admin.controller").blockUser);
router.put("/users/:userId/unblock", authorizeRoles("admin"), require("../controllers/admin.controller").unblockUser);

module.exports = router;

