import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loginApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await loginApi(form);
      login(data);
      toast.success("Welcome back!");
      if (data.user.role === "organizer") navigate("/organizer/dashboard");
      else navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
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
        <h1 className="mb-5 text-2xl font-bold">Login</h1>
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
          placeholder="Password"
          required
          onChange={onChange}
          className="mb-4 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none"
        />
        <button
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="mt-4 text-sm text-slate-300">
          No account?{" "}
          <Link to="/register" className="text-emerald-400">
            Create one
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
