const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");
const { sendRegistrationEmail } = require("../utils/email.service");

const generateEventToken = () =>
  `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

exports.registerForEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const attendeeId = req.user.id;
    const userId = attendeeId;
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid event id." });
    }

    const existing = await Registration.findOne({ attendeeId: userId, eventId }).session(session);
    if (existing) {
      if (!existing.qrCodeData && existing.token) {
        existing.qrCodeData = await QRCode.toDataURL(existing.token);
        existing.ticketToken = existing.token;
        await existing.save({ session });
      }
      await session.abortTransaction();
      return res.status(200).json({
        message: "Already registered",
        token: existing.token,
        registration: existing,
      });
    }

    const eventForRegistration = await Event.findById(eventId).session(session);
    if (!eventForRegistration) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Event not found." });
    }

    if (eventForRegistration.status !== "approved") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Registration failed: Event is not approved yet." });
    }

    if (new Date(eventForRegistration.date) < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Registration failed: Event date has passed." });
    }

    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: "approved",
        date: { $gte: new Date() },
        $expr: { $lt: ["$currentRegisteredCount", "$maxSeatCapacity"] },
      },
      { $inc: { currentRegisteredCount: 1 } },
      { new: true, session }
    );

    if (!event) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Registration failed: Event is full." });
    }

    const newRegistration = {
      eventId,
      attendeeId: userId,
      token: generateEventToken(),
      status: 'active',
      registrationDate: new Date(),
    };

    let saved = await Registration.create([newRegistration], { session });

    const qrCodeData = await QRCode.toDataURL(saved[0].token);

    saved[0].ticketToken = saved[0].token;
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
      message: "Registered successfully",
      token: saved[0].token,
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

    const registration = await Registration.findOne({ eventId, attendeeId }).session(session);
    if (!registration || registration.status === 'cancelled' || registration.status === 'used') {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot cancel this registration." });
    }

    await Registration.findOneAndDelete({ _id: registration._id }).session(session);

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

