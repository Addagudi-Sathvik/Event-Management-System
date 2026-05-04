const Registration = require("../models/Registration");

// Check if user is registered for specific event
exports.checkRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const registration = await Registration.findOne({ eventId, attendeeId: userId })
      .populate('eventId', 'name date time venue')
      .populate('attendeeId', 'name email');
    
    if (!registration) {
      return res.json({
        registered: false,
        message: 'Not registered for this event.'
      });
    }

    res.json({
      registered: true,
      registration: {
        id: registration._id,
        token: registration.token,
        confirmationNumber: registration.token,
        ticketToken: registration.ticketToken,
        status: registration.status,
        attended: registration.attended,
        qrCodeData: registration.qrCodeData,
        registrationDate: registration.registrationDate,
        event: registration.eventId,
        attendee: registration.attendeeId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all registrations for user (history)
exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await Registration.find({ attendeeId: userId })
      .populate('eventId', 'name date time venue bannerImageURL currentRegisteredCount maxSeatCapacity')
      .populate('attendeeId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      registrations,
      total: registrations.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

