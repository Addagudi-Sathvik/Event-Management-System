import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import EventCard from "../components/EventCard";
import { getUpcomingEvents } from "../api/event.api";

export default function DiscoverEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getUpcomingEvents();
        const withImages = data.map((event, index) => ({
          ...event,
          bannerImageURL:
            event.bannerImageURL ||
            `https://source.unsplash.com/1600x900/?${encodeURIComponent(
              event.name + ",event,conference,stage"
            )}&sig=${index + 1}`,
        }));
        setEvents(withImages);
      } catch (error) {
        if (error.response?.status >= 400 && error.response?.status < 600) {
          toast.error(error.response?.data?.message || "Failed to load events");
        } else {
          console.error("Events load error:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between pb-8">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-white/10" />
          <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill().map((_, i) => (
            <div key={i} className="animate-pulse space-y-4 rounded-2xl bg-white/10 p-6">
              <div className="h-52 w-full rounded-xl bg-white/20" />
              <div className="space-y-2">
                <div className="h-6 w-3/4 rounded bg-white/20" />
                <div className="h-4 w-full rounded bg-white/20" />
                <div className="h-4 w-3/4 rounded bg-white/20" />
              </div>
              <div className="h-10 w-full rounded-xl bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 py-12 text-white">
      <main className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black md:text-5xl">All Events</h1>
            <p className="mt-2 text-xl text-slate-400">Browse upcoming events</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto mb-8 inline-block rounded-2xl bg-white/10 p-12 backdrop-blur-xl">
              📅
            </div>
            <h2 className="text-3xl font-bold text-white">No events found</h2>
            <p className="mt-4 text-xl text-slate-400">Check back soon for new events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
