import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { registerApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await registerApi(form);
      login(data);
      toast.success("Account created!");
      if (data.user.role === "organizer") navigate("/organizer/dashboard");
      else navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl"
      >
        <h1 className="mb-5 text-2xl font-bold">Create Account</h1>
        <input
          name="name"
          placeholder="Full Name"
          required
          onChange={onChange}
          className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={onChange}
          className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 chars)"
          required
          minLength={8}
          onChange={onChange}
          className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
        />
        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="mb-4 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
        >
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>
        <button
          disabled={loading}
          className="w-full rounded-xl bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
