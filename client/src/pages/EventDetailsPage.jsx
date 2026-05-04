import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sentiment from "sentiment";
import { getEventById, submitEventFeedback } from "../api/event.api";
import { registerForEvent, checkRegistration, cancelRegistrationForEvent } from "../api/registration.api";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";

const sentiment = new Sentiment();

const getLiveEmoji = (text) => {
  if (!text.trim()) return "😐";
  const { score } = sentiment.analyze(text);
  if (score > 2) return "😍";
  if (score > 0) return "🙂";
  if (score < -2) return "😞";
  if (score < 0) return "🙁";
  return "😐";
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [step, setStep] = useState(1);
  const [agree, setAgree] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registration, setRegistration] = useState(null); 

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);
        if (user && user.role === 'attendee') {
          try {
            const regData = await checkRegistration(id);
            setRegistered(regData.registered);
            if (regData.registered) {
              setRegistration(regData.registration);
            }
          } catch (regError) {
            console.log('Reg check failed:', regError);
          }
        }
      } catch (error) {
        console.error('Event load error:', error);
        setError(error.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("joinEvent", id);

    const onSeatUpdate = (payload) => {
      if (payload.eventId !== id) return;
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              currentRegisteredCount: payload.currentRegisteredCount,
              maxSeatCapacity: payload.maxSeatCapacity,
            }
          : prev
      );
    };

    socket.on("seatUpdate", onSeatUpdate);
    return () => socket.off("seatUpdate", onSeatUpdate);
  }, [socket, id]);

  const handleRegister = async () => {
    if (!user || user.role !== "attendee") {
      toast.error("Please login as attendee to register.");
      return;
    }
    if (!agree) {
      toast.error("Please accept event terms first.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerForEvent(id);
      const nextRegistration = res.registration || { token: res.token, confirmationNumber: res.token };
      toast.success(`Registered! Token: ${res.token || nextRegistration.token}`);
      setRegistered(true);
      setRegistration(nextRegistration);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              currentRegisteredCount:
                res.message === "Already registered"
                  ? prev.currentRegisteredCount
                  : prev.currentRegisteredCount + 1,
            }
          : prev
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setSubmitting(true);
      await cancelRegistrationForEvent(id);
      toast.success("Registration cancelled.");
      setRegistered(false);
      setRegistration(null);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              currentRegisteredCount: Math.max((prev.currentRegisteredCount || 1) - 1, 0),
            }
          : prev
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cancellation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "attendee") {
      toast.error("Please login as attendee to submit feedback.");
      return;
    }

    if (!feedbackComment.trim()) {
      toast.error("Please write your feedback first.");
      return;
    }

    try {
      setSubmittingFeedback(true);
      const response = await submitEventFeedback(id, { comment: feedbackComment });
      toast.success(
        `Feedback recorded (${response.feedback.sentimentType}, score: ${response.feedback.score}).`
      );
      setFeedbackComment("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Feedback submission failed.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-200">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!event) return <div className="p-8 text-red-400">Event not found (ID: {id}).</div>;

  const isFull = event.currentRegisteredCount >= event.maxSeatCapacity; 

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl"
      >
        <img src={event.bannerImageURL} alt={event.name} className="h-80 w-full object-cover" />
        <div className="grid gap-8 p-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-slate-300">{event.description}</p>
            <p className="text-slate-300">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()} |{" "}
              <strong>Time:</strong> {event.time}
            </p>
            <p className="text-slate-300">
              <strong>Venue:</strong> {event.venue}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <p className="mb-4 text-sm text-slate-300">
              Seats: <span className="font-semibold text-white">{event.currentRegisteredCount}</span>/
              {event.maxSeatCapacity}
            </p>

            {isFull ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-red-500/80 px-4 py-2 font-semibold"
              >
                Event Full
              </button>
            ) : !user || user.role !== 'attendee' ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-slate-500/80 px-4 py-2 font-semibold"
              >
                Login as Attendee to Register
              </button>
            ) : registered ? (
              <div className="space-y-4 text-center">
                <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-emerald-400 mb-2">✅ Registered!</h3>
                  <div className="text-2xl font-mono bg-black/50 px-4 py-2 rounded-lg mb-2">
                    {registration.token || registration.confirmationNumber}
                  </div>
                  <p className="text-sm text-emerald-300">Status: {registration.status.toUpperCase()}</p>
                  {registration.qrCodeData && (
                    <img src={registration.qrCodeData} alt="QR Ticket" className="mx-auto mt-4 w-32 h-32 rounded-lg" />
                  )}
                </div>
                <button
                  onClick={handleCancel}
                  className="w-full rounded-xl bg-orange-500 px-4 py-2 font-semibold hover:bg-orange-400"
                >
                  Cancel Registration
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className={`rounded-lg px-3 py-1 text-sm ${step === 1 ? "bg-indigo-500" : "bg-white/10"}`}
                  >
                    Step 1
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className={`rounded-lg px-3 py-1 text-sm ${step === 2 ? "bg-emerald-500 text-slate-950" : "bg-white/10"}`}
                  >
                    Step 2
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-slate-300">
                        Review event details and continue.
                      </p>
                      <button
                        onClick={() => setStep(2)}
                        className="w-full rounded-xl bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400"
                      >
                        Continue
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="space-y-3"
                    >
                      <label className="flex items-start gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          className="mt-1"
                        />
                        I confirm my registration details are accurate.
                      </label>
                      <button
                        onClick={handleRegister}
                        disabled={submitting}
                        className="w-full rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                      >
                        {submitting ? "Registering..." : "Confirm Registration"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 px-8 pb-8">
          <motion.form
            onSubmit={handleFeedbackSubmit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl border border-emerald-400/20 bg-slate-900/60 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Share Your Experience</h2>
                <p className="text-sm text-slate-300">
                  Your feedback helps organizers improve upcoming events.
                </p>
              </div>
              <motion.div
                key={getLiveEmoji(feedbackComment)}
                initial={{ scale: 0.7, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-4xl"
              >
                {getLiveEmoji(feedbackComment)}
              </motion.div>
            </div>

            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              rows={4}
              placeholder="Type your event feedback (e.g., Amazing sessions, great hosts...)"
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-emerald-400/50 placeholder:text-slate-500 focus:ring"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Live sentiment reacts as you type.
              </span>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
