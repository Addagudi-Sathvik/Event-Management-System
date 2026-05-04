const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Feedback = require("../models/Feedback");
const Sentiment = require("sentiment");
const fetchUnsplashImage = require("../utils/fetchUnsplashImage");

const sentiment = new Sentiment();

const getSentimentType = (score) => {
  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
};

exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      name,
      date,
      time,
      location,
      venue,
      description,
      maxSeatCapacity,
      bannerImageURL,
    } = req.body;

    const eventName = name || title;
    const eventVenue = venue || location;
    const eventTime = time || "00:00";
    const capacity = Number(maxSeatCapacity || req.body.capacity || 100);

    const resolvedBanner =
      bannerImageURL ||
      (await fetchUnsplashImage(`${eventName || "event"} ${eventVenue || "venue"} conference`));

    const event = await Event.create({
      organizerId: req.user.id,
      name: eventName,
      date,
      time: eventTime,
      venue: eventVenue,
      description,
      maxSeatCapacity: capacity,
      bannerImageURL: resolvedBanner,
    });

    return res.status(201).json({ message: "Event created", event });
  } catch (error) {
    next(error);
  }
};

exports.getAllUpcomingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ 
      status: "approved",
      date: { $gte: new Date() } 
    })
      .sort({ date: 1 })
      .populate("organizerId", "name email");

    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizerId", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    return res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizerId: req.user.id,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found or unauthorized" });
    }

    if (
      req.body.maxSeatCapacity !== undefined &&
      req.body.maxSeatCapacity < event.currentRegisteredCount
    ) {
      return res.status(400).json({
        message: `Capacity cannot be lower than current registrations (${event.currentRegisteredCount}).`,
      });
    }

    Object.assign(event, req.body);
    await event.save();

    return res.status(200).json({ message: "Event updated", event });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      organizerId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found or unauthorized" });
    }

    await Registration.deleteMany({ eventId: event._id });

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.createEventFeedback = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Feedback comment is required." });
    }

    const event = await Event.findById(eventId).select("_id");
    if (!event) return res.status(404).json({ message: "Event not found" });

    const analysis = sentiment.analyze(comment.trim());
    const score = analysis.score;
    const sentimentType = getSentimentType(score);

    const feedback = await Feedback.findOneAndUpdate(
      { eventId, userId: req.user.id },
      {
        eventId,
        userId: req.user.id,
        comment: comment.trim(),
        score,
        sentimentType,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: "Feedback submitted successfully.",
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventSentimentSummary = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const event = await Event.findById(eventId).select("organizerId");
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions." });
    }

    const [totalReviews, positiveReviews, recentNegativeComments, allComments] = await Promise.all([
      Feedback.countDocuments({ eventId }),
      Feedback.countDocuments({ eventId, sentimentType: "Positive" }),
      Feedback.find({ eventId, sentimentType: "Negative" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("comment score sentimentType createdAt")
        .populate("userId", "name"),
      Feedback.find({ eventId }).select("comment"),
    ]);

    const positivePercent = totalReviews === 0 ? 0 : Math.round((positiveReviews / totalReviews) * 100);

    const stopWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "this",
      "that",
      "was",
      "are",
      "very",
      "have",
      "had",
      "you",
      "your",
      "our",
      "from",
      "just",
      "event",
      "it",
      "its",
      "but",
      "not",
    ]);

    const keywordMap = {};
    allComments.forEach(({ comment }) => {
      comment
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))
        .forEach((word) => {
          keywordMap[word] = (keywordMap[word] || 0) + 1;
        });
    });

    const topKeywords = Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return res.status(200).json({
      totalReviews,
      positiveFeedbackPercentage: `${positivePercent}% Positive`,
      positivePercent,
      recentNegativeComments: recentNegativeComments.map((item) => ({
        comment: item.comment,
        score: item.score,
        sentimentType: item.sentimentType,
        createdAt: item.createdAt,
        reviewerName: item.userId?.name || "Anonymous",
        isHighlyNegative: item.score < -5,
      })),
      topKeywords,
    });
  } catch (error) {
    next(error);
  }
};
