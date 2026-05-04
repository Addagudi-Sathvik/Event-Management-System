const Registration = require("../models/Registration");

exports.verifyTicket = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "token is required." });
    }

    const registration = await Registration.findOne({ token }).populate("attendeeId", "name email");

    if (!registration) {
      return res.status(404).json({ message: "Invalid ticket" });
    }

    if (registration.status === 'used') {
      return res.status(409).json({ message: "Already used" });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: "Registration cancelled." });
    }

    registration.status = 'used';
    registration.attended = true;
    await registration.save();
    
    return res.status(200).json({
      message: "Check-in successful",
      attendee: registration.attendeeId,
      token: registration.token,
      confirmationNumber: registration.token,
      status: registration.status,
    });
  } catch (error) {
    next(error);
  }
};

