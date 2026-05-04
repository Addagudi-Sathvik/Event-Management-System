const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    comment: {
      type: String,
      required: [true, "Feedback comment is required"],
      trim: true,
      maxlength: 1500,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    sentimentType: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
