const Event = require("../models/Event");
const User = require("../models/User");

// Get pending events for admin approval
exports.getPendingEvents = async (req, res, next) => {
  try {
    const pendingEvents = await Event.find({ status: "pending" })
      .populate("organizerId", "name email")
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      count: pendingEvents.length,
      events: pendingEvents
    });
  } catch (error) {
    next(error);
  }
};

// Approve event (make visible)
exports.approveEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOneAndUpdate(
      { _id: eventId, status: "pending" },
      { status: "approved" },
      { new: true }
    ).populate("organizerId", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found or already processed." });
    }

    return res.status(200).json({
      message: "Event approved successfully",
      event
    });
  } catch (error) {
    next(error);
  }
};

// Reject event
exports.rejectEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: eventId, status: "pending" },
      { 
        status: "rejected",
        rejectionReason: reason || "No reason provided"
      },
      { new: true }
    ).populate("organizerId", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found or already processed." });
    }

    return res.status(200).json({
      message: "Event rejected",
      event
    });
  } catch (error) {
    next(error);
  }
};

// Get all users for admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Get all events for admin (with status filter support)
exports.getAllEvents = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const events = await Event.find(query)
      .populate("organizerId", "name email")
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};


// Admin dashboard stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, pendingEvents, approvedEvents, rejectedEvents] = await Promise.all([
      User.countDocuments({}),
      Event.countDocuments({}),
      Event.countDocuments({ status: "pending" }),
      Event.countDocuments({ status: "approved" }),
      Event.countDocuments({ status: "rejected" })
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalEvents,
        pendingEvents,
        approvedEvents,
        rejectedEvents,
        pendingPercentage: totalEvents > 0 ? Math.round((pendingEvents / totalEvents) * 100) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete event (admin override)
exports.deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// Block user
exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User blocked successfully",
      user
    });
  } catch (error) {
    next(error);
  }
};

// Unblock user
exports.unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User unblocked successfully",
      user
    });
  } catch (error) {
    next(error);
  }
};

