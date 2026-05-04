const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: 120,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      index: true,
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 2000,
    },
    maxSeatCapacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1"],
    },
    currentRegisteredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bannerImageURL: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
