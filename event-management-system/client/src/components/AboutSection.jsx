import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  "Smart event discovery with admin-approved listings",
  "Secure token-based registration system",
  "Real-time analytics for organizers",
  "Centralized admin control and moderation",
  "Seat capacity management to prevent overbooking",
];

export default function AboutSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-950/50 to-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent">
            About EventFlow
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-slate-300 leading-relaxed">
            EventFlow is a modern event management and registration platform designed to simplify how events are created, managed, and experienced. 
            It connects organizers and attendees through a secure, scalable, and user-friendly system, ensuring every event is well-managed and easily accessible.
          </p>
        </motion.div>

        {/* Key Features Grid */}
        <div className="mx-auto mt-20 max-w-4xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-emerald-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500"
              >
                <div className="mb-3 h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-400/20 to-indigo-400/20 flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform">
                  0{i + 1}
                </div>
                <p className="text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                  {feature}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-24 max-w-4xl"
        >
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <motion.div
              whileHover={{ y: -8 }}
              className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black/30 p-10 backdrop-blur-xl hover:border-emerald-400/50 hover:shadow-2xl transition-all duration-500"
            >
              <h3 className="mb-6 inline-block rounded-2xl bg-emerald-400/20 px-6 py-3 text-2xl font-black text-emerald-300 group-hover:bg-emerald-400/30 transition-all">
                Our Mission
              </h3>
              <p className="text-xl text-slate-200 leading-relaxed">
                To deliver a secure and efficient platform that makes event management seamless for organizers and effortless for attendees.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black/30 p-10 backdrop-blur-xl hover:border-indigo-400/50 hover:shadow-2xl transition-all duration-500"
            >
              <h3 className="mb-6 inline-block rounded-2xl bg-indigo-400/20 px-6 py-3 text-2xl font-black text-indigo-300 group-hover:bg-indigo-400/30 transition-all">
                Our Vision
              </h3>
              <p className="text-xl text-slate-200 leading-relaxed">
                To become a reliable and scalable event ecosystem where discovering and managing events is simple, transparent, and efficient.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

