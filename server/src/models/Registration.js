const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    attendeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      alias: "userId",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled'],
      default: 'active',
      index: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    qrCodeData: {
      type: String,
      default: "",
    },
    ticketToken: {
      type: String,
      default: "",
      index: true,
    },
    attended: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

registrationSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);

