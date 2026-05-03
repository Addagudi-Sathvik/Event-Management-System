const jwt = require("jsonwebtoken");
const Registration = require("../models/Registration");

exports.verifyTicket = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ message: "qrToken is required." });
    }

    let payload;
    try {
      payload = jwt.verify(qrToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired ticket." });
    }

    const registration = await Registration.findOne({
      _id: payload.registrationId,
      eventId: payload.eventId,
      attendeeId: payload.attendeeId,
    }).populate("attendeeId", "name email");

    if (!registration) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    if (registration.attended) {
      return res.status(409).json({ message: "Ticket already scanned." });
    }

    registration.attended = true;
    await registration.save();

    return res.status(200).json({
      message: "Ticket verified. Check-in successful.",
      attendee: registration.attendeeId,
      registrationId: registration._id,
    });
  } catch (error) {
    next(error);
  }
};
