import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { getAdminStats, getPendingEvents, approveEvent, rejectEvent } from "../api/admin.api";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          getAdminStats(),
          getPendingEvents()
        ]);
        setStats(statsRes.stats || statsRes.data?.stats);
        setPendingEvents(eventsRes.events || eventsRes.data?.events || []);
      } catch (error) {
        if (error.response?.status >= 400 && error.response?.status < 600) {
          toast.error(error.response?.data?.message || "Failed to load dashboard");
        } else {
          console.error("Dashboard error:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApprove = async (eventId) => {
    setApproving(prev => ({ ...prev, [eventId]: true }));
    try {
      await approveEvent(eventId);
      toast.success("Event approved!");
      setPendingEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approval failed");
    } finally {
      setApproving(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleReject = async (eventId) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    setApproving(prev => ({ ...prev, [eventId]: true }));
    try {
      await rejectEvent(eventId, reason);
      toast.success("Event rejected");
      setPendingEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Rejection failed");
    } finally {
      setApproving(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent md:text-5xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-xl text-slate-400">Platform overview and event moderation</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Users", value: stats.totalUsers || 0, color: "emerald" },
            { label: "Total Events", value: stats.totalEvents || 0, color: "indigo" },
            { label: "Pending Approval", value: stats.pendingEvents || 0, color: "amber" },
            { label: "Approved", value: stats.approvedEvents || 0, color: "emerald" },
            { label: "Rejected", value: stats.rejectedEvents || 0, color: "rose" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, scale: 1.02 }}
              className={`rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl hover:border-${stat.color}-400/50 transition-all`}
            >
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className="mt-2 text-4xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Pending Events */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Pending Events ({pendingEvents.length})</h2>
            <Link
              to="users"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 font-semibold text-white backdrop-blur hover:bg-white/20 transition-all"
            >
              Manage Users
            </Link>
          </div>

          {pendingEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border-4 border-dashed border-emerald-400/30 bg-emerald-400/5 p-16 text-center"
            >
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-emerald-400/20 p-4">
                ✅
              </div>
              <h3 className="text-2xl font-bold text-emerald-400">No pending events</h3>
              <p className="mt-2 text-slate-400">All events are approved and live!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {pendingEvents.map((event, i) => (
                <motion.div
                  key={event._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="group relative rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/5 to-slate-800/50 p-8 backdrop-blur-xl hover:border-amber-400/60 transition-all hover:shadow-2xl"
                >
                  <div className="absolute -right-2 -top-2 flex gap-2">
                    <button
                      onClick={() => handleApprove(event._id)}
                      disabled={approving[event._id]}
                      className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-900 shadow-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {approving[event._id] ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(event._id)}
                      disabled={approving[event._id]}
                      className="rounded-xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-lg hover:bg-rose-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Reject
                    </button>
                  </div>

                  <img
                    src={event.bannerImageURL}
                    alt={event.name}
                    className="h-40 w-full rounded-2xl object-cover mb-6"
                  />
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-slate-400 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>📍 {event.venue}</span>
                    <span>👤 {event.organizerId?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-amber-400">
                      {event.currentRegisteredCount}/{event.maxSeatCapacity} seats
                    </span>
                    <span className="text-xs uppercase tracking-wide text-slate-500 bg-slate-700 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

