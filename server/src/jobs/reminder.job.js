const cron = require("node-cron");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { sendEventReminderEmail } = require("../utils/email.service");

function getTomorrowRange() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const start = new Date(tomorrow);
  start.setHours(0, 0, 0, 0);

  const end = new Date(tomorrow);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

async function runReminderJob() {
  try {
    const { start, end } = getTomorrowRange();
    const events = await Event.find({ date: { $gte: start, $lte: end } }).select(
      "_id name date venue"
    );

    for (const event of events) {
      const registrations = await Registration.find({ eventId: event._id }).populate(
        "attendeeId",
        "name email"
      );

      for (const registration of registrations) {
        try {
          if (!registration.attendeeId?.email) continue;
          await sendEventReminderEmail({
            to: registration.attendeeId.email,
            attendeeName: registration.attendeeId.name || "Attendee",
            eventName: event.name,
            eventDate: event.date,
            eventVenue: event.venue,
          });
        } catch (error) {
          console.error("Reminder email failed:", error.message);
        }
      }
    }
  } catch (error) {
    console.error("Reminder cron failed:", error.message);
  }
}

exports.startReminderCron = () => {
  cron.schedule("0 9 * * *", runReminderJob);
};
