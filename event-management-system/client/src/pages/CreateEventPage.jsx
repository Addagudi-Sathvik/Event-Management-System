import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createEventApi } from "../api/event.api";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    maxSeatCapacity: 10,
    bannerImageURL: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createEventApi({
        ...form,
        maxSeatCapacity: Number(form.maxSeatCapacity),
      });
      toast.success("Event created successfully.");
      navigate("/organizer/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Event creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl"
      >
        <h1 className="mb-6 text-3xl font-bold">Create New Event</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Event Name"
            required
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
          />
          <input
            name="venue"
            value={form.venue}
            onChange={onChange}
            placeholder="Venue"
            required
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={onChange}
            required
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
          />
          <input
            name="time"
            type="time"
            value={form.time}
            onChange={onChange}
            required
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
          />
          <input
            name="maxSeatCapacity"
            type="number"
            min={1}
            value={form.maxSeatCapacity}
            onChange={onChange}
            required
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
          />
          <input
            name="bannerImageURL"
            value={form.bannerImageURL}
            onChange={onChange}
            placeholder="Banner Image URL (optional)"
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
          />
        </div>

        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Event Description"
          required
          rows={5}
          className="mt-4 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </motion.form>
    </div>
  );
}
