const Event = require("../models/Event");
const Registration = require("../models/Registration");
const toCSV = require("../utils/csvExport");
const mongoose = require("mongoose");

exports.getOrganizerStats = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const events = await Event.find({ organizerId }).select(
      "_id name date venue maxSeatCapacity currentRegisteredCount"
    );

    const activeEvents = events.filter((e) => new Date(e.date) >= new Date()).length;
    const totalTicketsSold = events.reduce((sum, e) => sum + (e.currentRegisteredCount || 0), 0);

    return res.status(200).json({
      summary: {
        totalEvents: events.length,
        activeEvents,
        totalTicketsSold,
      },
      events,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventAttendees = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId }).select("name");
    if (!event) {
      return res.status(404).json({ message: "Event not found or unauthorized." });
    }

    const registrations = await Registration.find({ eventId })
      .populate("attendeeId", "name email")
      .sort({ createdAt: -1 });

    const attendees = registrations.map((r) => ({
      registrationId: r._id,
      attendeeName: r.attendeeId?.name || "N/A",
      attendeeEmail: r.attendeeId?.email || "N/A",
      confirmationNumber: r.confirmationNumber,
      registrationDate: r.registrationDate,
    }));

    return res.status(200).json({
      event: { id: eventId, name: event.name },
      attendees,
    });
  } catch (error) {
    next(error);
  }
};

exports.exportEventAttendeesCSV = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId }).select("name");
    if (!event) {
      return res.status(404).json({ message: "Event not found or unauthorized." });
    }

    const registrations = await Registration.find({ eventId })
      .populate("attendeeId", "name email")
      .sort({ createdAt: -1 });

    const rows = registrations.map((r) => ({
      eventName: event.name,
      attendeeName: r.attendeeId?.name || "",
      attendeeEmail: r.attendeeId?.email || "",
      confirmationNumber: r.confirmationNumber,
      registrationDate: new Date(r.registrationDate).toISOString(),
    }));

    const csv = toCSV(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendees-${event._id}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

exports.getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    const perEvent = await Event.aggregate([
      { $match: { organizerId: new mongoose.Types.ObjectId(organizerId) } },
      {
        $project: {
          name: 1,
          currentRegisteredCount: 1,
          maxSeatCapacity: 1,
          seatOccupancyPercent: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$currentRegisteredCount", { $max: ["$maxSeatCapacity", 1] }] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
      { $sort: { currentRegisteredCount: -1 } },
    ]);

    const organizerEvents = await Event.find({ organizerId }).select("_id");
    const eventIds = organizerEvents.map((e) => e._id);

    const dailyTrend = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$registrationDate" },
          },
          registrations: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", registrations: 1 } },
    ]);

    return res.status(200).json({ perEvent, dailyTrend });
  } catch (error) {
    next(error);
  }
};
