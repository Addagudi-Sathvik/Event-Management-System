import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
  }),
};

export default function EventCard({ event, index }) {
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, boxShadow: "0 0 32px rgba(16,185,129,0.32)" }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl transition-all duration-500"
    >
      <img
        src={event.bannerImageURL}
        alt={event.name}
        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="space-y-3 p-5">
        <h2 className="text-xl font-semibold text-white">{event.name}</h2>
        <p className="line-clamp-2 text-sm text-slate-300">{event.description}</p>
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span>
            {event.currentRegisteredCount}/{event.maxSeatCapacity} seats
          </span>
        </div>
        <Link
          to={`/events/${event._id}`}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
        >
          View Details
        </Link>
      </div>
    </motion.article>
  );
}
