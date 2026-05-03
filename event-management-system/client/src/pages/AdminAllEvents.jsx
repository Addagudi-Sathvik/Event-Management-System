import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAllEvents, deleteEvent, approveEvent, rejectEvent } from "../api/admin.api";
import { getAdminStats } from "../api/admin.api";

const statusColors = {
  pending: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  approved: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
  rejected: "bg-rose-400/20 text-rose-400 border-rose-400/30",
};

const statusIcons = {
  pending: "⏳",
  approved: "✅",
  rejected: "❌",
};

export default function AdminAllEvents() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [actioning, setActioning] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsRes = await getAllEvents();
        const statsRes = await getAdminStats();
        console.log("All Events API:", eventsRes);
        console.log("Stats API:", statsRes);
        setEvents(eventsRes.data?.events || eventsRes.events || eventsRes.data || []);
        setStats(statsRes.data?.stats || statsRes.stats || statsRes.data || statsRes || {});
      } catch (error) {
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEvents = events.filter((event) =>
    filterStatus === "all" || event.status === filterStatus
  );

  const handleAction = async (eventId, action) => {
    setActioning((prev) => ({ ...prev, [eventId]: true }));
    try {
      if (action === "delete") {
        await deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
        toast.success("Event deleted");
      } else if (action === "approve") {
        await approveEvent(eventId);
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, status: "approved" } : e))
        );
        toast.success("Event approved");
      } else if (action === "reject") {
        const reason = prompt("Rejection reason:");
        if (reason) {
          await rejectEvent(eventId, reason);
          setEvents((prev) =>
            prev.map((e) => (e._id === eventId ? { ...e, status: "rejected" } : e))
          );
          toast.success("Event rejected");
        }
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setActioning((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            All Events
          </h2>
          <p className="text-slate-400 mt-1">
            Manage {filteredEvents.length} events ({stats.totalEvents || 0} total)
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-white backdrop-blur hover:bg-white/20 transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending ({stats.pendingEvents || 0})</option>
          <option value="approved">Approved ({stats.approvedEvents || 0})</option>
          <option value="rejected">Rejected ({stats.rejectedEvents || 0})</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <motion.div
          className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-700/50 bg-slate-900/50 min-h-[400px] flex flex-col items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-3xl">
            📭
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No events {filterStatus !== "all" && `(${filterStatus})`} found
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            All events are managed and up to date. Create or approve new ones to see them here.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl hover:border-white/20 hover:shadow-2xl transition-all hover:bg-white/10"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={event.bannerImageURL}
                    alt={event.name}
                    className="w-32 h-32 rounded-2xl object-cover lg:w-48 lg:h-48"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white truncate group-hover:text-indigo-300">
                      {event.name}
                    </h3>
                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[event.status]}`}>
                      {statusIcons[event.status]} {event.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-4 line-clamp-2">{event.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400 mb-6">
                    <div>
                      <span className="block font-semibold text-white">Date</span>
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="block font-semibold text-white">Venue</span>
                      {event.venue}
                    </div>
                    <div>
                      <span className="block font-semibold text-white">Capacity</span>
                      {event.currentRegisteredCount}/{event.maxSeatCapacity}
                    </div>
                    <div>
                      <span className="block font-semibold text-white">Organizer</span>
                      {event.organizerId?.name}
                    </div>
                  </div>
                  {event.rejectionReason && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <span className="text-rose-400 font-medium">Reject Reason: </span>
                      <span className="text-sm">{event.rejectionReason}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2 lg:pt-0 lg:ml-8 lg:pl-8 border-l border-white/10">
                  {event.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(event._id, "approve")}
                        disabled={actioning[event._id]}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {actioning[event._id] ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(event._id, "reject")}
                        disabled={actioning[event._id]}
                        className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleAction(event._id, "delete")}
                    disabled={actioning[event._id]}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {actioning[event._id] ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
