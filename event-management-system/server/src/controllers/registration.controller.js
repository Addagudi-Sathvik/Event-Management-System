const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");
const generateConfirmation = require("../utils/generateConfirmation");
const { sendRegistrationEmail } = require("../utils/email.service");

exports.registerForEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const attendeeId = req.user.id;
    const { eventId } = req.params;

    const existing = await Registration.findOne({ eventId, attendeeId }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ message: "You are already registered for this event." });
    }

    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: ["$currentRegisteredCount", "$maxSeatCapacity"] },
      },
      { $inc: { currentRegisteredCount: 1 } },
      { new: true, session }
    );

    if (!event) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Registration failed: Event is full." });
    }

    let saved = null;
    for (let i = 0; i < 5; i += 1) {
      try {
        saved = await Registration.create(
          [
            {
              eventId,
              attendeeId,
              confirmationNumber: generateConfirmation(),
              registrationDate: new Date(),
            },
          ],
          { session }
        );
        break;
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }

    if (!saved) {
      throw new Error("Could not generate unique confirmation number.");
    }

    const ticketPayload = {
      registrationId: saved[0]._id.toString(),
      eventId: event._id.toString(),
      attendeeId: attendeeId.toString(),
    };
    const ticketToken = jwt.sign(ticketPayload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    const qrCodeData = await QRCode.toDataURL(ticketToken);

    saved[0].ticketToken = ticketToken;
    saved[0].qrCodeData = qrCodeData;
    await saved[0].save({ session });

    await session.commitTransaction();

    const io = req.app.get("io");
    if (io) {
      io.emit("seatUpdate", {
        eventId: event._id.toString(),
        currentRegisteredCount: event.currentRegisteredCount,
        maxSeatCapacity: event.maxSeatCapacity,
      });
    }

    const attendee = await User.findById(attendeeId).select("name email");
    sendRegistrationEmail({
      to: attendee?.email,
      attendeeName: attendee?.name || "Attendee",
      eventName: event.name,
      eventDate: event.date,
      eventVenue: event.venue,
      qrCodeData,
    }).catch((err) => console.error("Registration email failed:", err.message));

    return res.status(201).json({
      message: "Registration successful",
      registration: saved[0],
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.cancelRegistration = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const attendeeId = req.user.id;
    const { eventId } = req.params;

    const registration = await Registration.findOneAndDelete({
      eventId,
      attendeeId,
    }).session(session);

    if (!registration) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Registration not found." });
    }

    const event = await Event.findOneAndUpdate(
      { _id: eventId, currentRegisteredCount: { $gt: 0 } },
      { $inc: { currentRegisteredCount: -1 } },
      { new: true, session }
    );

    await session.commitTransaction();

    const io = req.app.get("io");
    if (io && event) {
      io.emit("seatUpdate", {
        eventId: event._id.toString(),
        currentRegisteredCount: event.currentRegisteredCount,
        maxSeatCapacity: event.maxSeatCapacity,
      });
    }

    return res.status(200).json({ message: "Registration cancelled." });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
