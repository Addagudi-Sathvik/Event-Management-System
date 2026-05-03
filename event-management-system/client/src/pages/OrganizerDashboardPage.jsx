import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  getOrganizerStats,
  getEventAttendees,
  exportAttendeesCSV,
  getOrganizerAnalytics,
} from "../api/dashboard.api";
import SentimentDashboard from "../components/SentimentDashboard";

const statCards = [
  { key: "totalEvents", label: "Total Events", glow: "from-indigo-500/30 to-indigo-300/5" },
  { key: "activeEvents", label: "Active Events", glow: "from-emerald-500/30 to-emerald-300/5" },
  { key: "totalTicketsSold", label: "Tickets Sold", glow: "from-cyan-500/30 to-cyan-300/5" },
];

export default function OrganizerDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({ perEvent: [], dailyTrend: [] });
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrganizerStats();
        const analyticsData = await getOrganizerAnalytics();
        setSummary(data.summary);
        setEvents(data.events);
        setAnalytics(analyticsData);
        if (data.events.length > 0) setSelectedEventId(data.events[0]._id);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    const loadAttendees = async () => {
      try {
        setTableLoading(true);
        const data = await getEventAttendees(selectedEventId);
        setAttendees(data.attendees);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load attendees.");
      } finally {
        setTableLoading(false);
      }
    };
    loadAttendees();
  }, [selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((e) => e._id === selectedEventId),
    [events, selectedEventId]
  );

  const onExport = async () => {
    if (!selectedEventId) return;
    try {
      await exportAttendeesCSV(selectedEventId);
      toast.success("CSV export started.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "CSV export failed.");
    }
  };

  if (loading) return <div className="p-8 text-slate-200">Loading dashboard...</div>;

  const occupancyData = analytics.perEvent.slice(0, 5).map((item) => ({
    name: item.name,
    value: item.seatOccupancyPercent,
  }));

  const pieColors = ["#34d399", "#818cf8", "#06b6d4", "#f59e0b", "#f472b6"];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.2),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.2),transparent_30%)]" />
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-4xl font-extrabold"
        >
          Organizer Dashboard
        </motion.h1>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.glow} p-5 backdrop-blur-xl`}
            >
              <p className="text-sm text-slate-300">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">{summary?.[card.key] ?? 0}</p>
            </motion.div>
          ))}
        </section>

        <SentimentDashboard eventId={selectedEventId} />

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold">Registrations Per Event</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.perEvent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="currentRegisteredCount" fill="#34d399" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold">Seat Occupancy (%)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          <h3 className="mb-4 text-lg font-semibold">Daily Registration Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <label className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none"
              >
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onExport}
              disabled={!selectedEventId}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Export to CSV
            </button>
          </div>

          {selectedEvent && (
            <p className="mb-4 text-sm text-slate-300">
              <span className="font-semibold text-white">{selectedEvent.name}</span> -{" "}
              {selectedEvent.currentRegisteredCount}/{selectedEvent.maxSeatCapacity} seats
            </p>
          )}

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Attendee</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Confirmation</th>
                  <th className="px-4 py-3">Registered At</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-300">
                        Loading attendees...
                      </td>
                    </tr>
                  ) : attendees.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                        No attendees yet.
                      </td>
                    </tr>
                  ) : (
                    attendees.map((a) => (
                      <motion.tr
                        key={a.registrationId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-white/10 bg-slate-950/30"
                      >
                        <td className="px-4 py-3">{a.attendeeName}</td>
                        <td className="px-4 py-3">{a.attendeeEmail}</td>
                        <td className="px-4 py-3 font-mono text-emerald-300">{a.confirmationNumber}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {new Date(a.registrationDate).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
