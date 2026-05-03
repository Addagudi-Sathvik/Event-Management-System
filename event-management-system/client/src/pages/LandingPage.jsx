import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getUpcomingEvents } from "../api/event.api";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await getUpcomingEvents();
        const limited = data.slice(0, 6); // Featured: 6 max
        const withImages = limited.map((event, index) => ({
          ...event,
          bannerImageURL:
            event.bannerImageURL ||
            `https://source.unsplash.com/1600x900/?${encodeURIComponent(
              event.name + ",event"
            )}&sig=${index + 1}`,
        }));
        setFeaturedEvents(withImages);
      } catch (error) {
        if (error.response?.status >= 400 && error.response?.status < 600) {
          toast.error(error.response?.data?.message || "Failed to load featured events");
        } else {
          console.error("Featured events error:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const steps = [
    { num: "01", title: "Discover Events", desc: "Browse upcoming events by date, location, and interests.", icon: "🔍" },
    { num: "02", title: "Secure Registration", desc: "Reserve seats instantly with capacity control and QR ticket.", icon: "🎫" },
    { num: "03", title: "Attend & Feedback", desc: "Scan token at entry, rate experience with sentiment analysis.", icon: "⭐" },
  ];

  const roles = [
    { role: "Attendee", desc: "Find and join amazing events effortlessly.", icon: "👥" },
    { role: "Organizer", desc: "Manage events, track attendance, export analytics.", icon: "📊" },
    { role: "Admin", desc: "Approve events and oversee platform quality.", icon: "👨‍💼" },
  ];

  const features = [
    { title: "Token Attendance", desc: "Unique JWT tokens prevent duplicate check-ins.", icon: "🔐" },
    { title: "Real-time Seats", desc: "Atomic booking prevents overbooking.", icon: "🎯" },
    { title: "Analytics Dashboard", desc: "No-shows, trends, CSV export for organizers.", icon: "📈" },
    { title: "Smart Feedback", desc: "AI sentiment analysis + keyword trends.", icon: "🤖" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/50 to-black text-white">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-10 top-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-emerald-500/20 blur-3xl"
      />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        {/* Hero Section */}
        <section className="grid items-center gap-16 pb-24 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-400/20 to-indigo-400/20 px-4 py-1.5 text-sm font-semibold text-emerald-300 backdrop-blur-xl">
              🚀 Next-Gen Event Platform
            </span>
            <h1 className="mt-6 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-7xl lg:text-6xl">
              Discover, Manage, and
              <br />
              <span className="from-emerald-400 via-indigo-400 to-purple-400 bg-gradient-to-r bg-clip-text text-transparent">
                Experience Events Seamlessly
              </span>
            </h1>
            <p className="mt-6 text-xl text-slate-300 md:text-2xl">
              Token-based entry, seat control, real-time analytics, and AI feedback. Built for scale.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/events"
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-bold text-slate-900 shadow-2xl hover:from-emerald-400 transition-all duration-300 hover:shadow-emerald-500/25 hover:-translate-y-1"
              >
                Explore Events
              </Link>
              <Link
                to="/register"
                className="rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-xl hover:bg-white/20 hover:border-white/40 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { label: "Active Events", value: "500+" },
              { label: "Happy Users", value: "25K+" },
              { label: "Avg Rating", value: "4.95" },
              { label: "Uptime", value: "99.99%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-emerald-400/50 transition-all"
              >
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide group-hover:text-emerald-300">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-black text-white group-hover:text-emerald-400">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-400">
              Three simple steps from discovery to unforgettable experiences.
            </p>
          </motion.div>
          <div className="mx-auto mt-20 grid max-w-6xl gap-8 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl hover:border-emerald-400/50 hover:bg-white/10 transition-all duration-500 hover:shadow-2xl"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400/20 to-indigo-400/20 text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="mb-2 text-3xl font-black text-emerald-400 group-hover:text-emerald-300">
                  {step.num}
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-300">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Role-Based */}
        <section className="pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
              Perfect for Everyone
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-400">
              Tailored experiences whether you're attending, organizing, or managing.
            </p>
          </motion.div>
          <div className="mx-auto mt-20 grid max-w-6xl gap-8 lg:grid-cols-3">
            {roles.map((roleData, i) => (
              <motion.div
                key={roleData.role}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl hover:border-purple-400/50 hover:bg-white/10 transition-all hover:shadow-2xl"
              >
                <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-r from-purple-400/20 to-indigo-400/20 text-3xl shadow-xl group-hover:scale-110">
                  {roleData.icon}
                </div>
                <h3 className="mb-4 text-3xl font-black text-white">{roleData.role}</h3>
                <p className="text-xl text-slate-300">{roleData.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
              Power-packed Features
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-400">
              Everything you need for flawless event management.
            </p>
          </motion.div>
          <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl hover:border-indigo-400/50 hover:bg-white/10 transition-all hover:shadow-2xl hover:shadow-indigo-500/25"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-400/20 to-purple-400/20 text-2xl shadow-lg group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Events */}
        <section className="pb-24">
          <div className="mb-12 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h2 className="text-4xl font-black md:text-5xl">Featured Events</h2>
              <p className="text-xl text-slate-400">Handpicked just for you</p>
            </motion.div>
            <Link
              to="/events"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl hover:bg-white/20 transition-all"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill().map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white/5 p-6" />
              ))}
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-24">
              <div className="mx-auto h-24 w-24 rounded-2xl bg-white/10 p-6">
                🎟️
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">No featured events yet</h3>
              <p className="mt-2 text-slate-400">Check back soon for exciting updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event, i) => (
                <motion.article
                  key={event._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover={{ y: -12, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                  viewport={{ once: true }}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl transition-all duration-500 hover:border-emerald-400/50 hover:bg-white/20"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.bannerImageURL}
                      alt={event.name}
                      className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-lg backdrop-blur-sm">
                      {event.currentRegisteredCount}/{event.maxSeatCapacity}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="mb-3 text-xl font-bold text-white line-clamp-2 group-hover:text-emerald-300">
                      {event.name}
                    </h3>
                    <p className="mb-4 text-sm text-slate-400 line-clamp-2">{event.description}</p>
                    <div className="mb-6 flex items-center gap-4 text-xs text-slate-500">
                      <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      <span>📍 {event.venue}</span>
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-semibold text-slate-900 shadow-lg hover:from-emerald-400 transition-all duration-300 hover:shadow-emerald-500/50 hover:-translate-y-1"
                    >
                      View Details →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-4xl"
          >
            <h2 className="bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl">
              Ready to Start?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-xl text-slate-300">
              Join thousands of organizers and attendees creating memorable experiences.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-indigo-600 px-10 py-5 text-xl font-bold text-slate-900 shadow-2xl hover:from-emerald-400 hover:shadow-emerald-500/50 hover:-translate-y-2 transition-all duration-500"
              >
                Create Free Account
              </Link>
              <Link
                to="/events"
                className="rounded-2xl border-2 border-white/30 bg-white/10 px-10 py-5 text-xl font-bold text-white backdrop-blur-xl hover:border-white/50 hover:bg-white/20 transition-all duration-300"
              >
                Browse Events
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-xl py-12">
          <div className="mx-auto max-w-7xl px-6 text-center text-slate-500">
            <div className="mb-8">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                EventFlow
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
              <div>
                <h4 className="mb-4 font-semibold text-white">Product</h4>
                <ul className="space-y-2">
                  <li><Link to="/events" className="hover:text-emerald-400 transition-colors">Events</Link></li>
                  <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-white">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                  <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-white">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-white">Connect</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Twitter</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Discord</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-white/10 pt-8 text-xs">
              <p>&copy; 2024 EventFlow. All rights reserved. Built with ❤️ for events.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

