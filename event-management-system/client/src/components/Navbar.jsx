import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
        <Link to="/" className="text-lg font-bold tracking-wide text-emerald-400">
          EventFlow
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link to="/" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
            Home
          </Link>
          <Link to="/events" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
            Events
          </Link>
          <Link to="/about" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
            About
          </Link>

{user?.role === "organizer" && (
            <>
              <Link to="/organizer/create-event" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
                Create Event
              </Link>
              <Link to="/organizer/dashboard" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
                Dashboard
              </Link>
              <Link to="/organizer/scan-ticket" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
                Scan QR
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1.5 font-semibold text-white hover:from-purple-400 hover:to-indigo-400">
              Admin Panel
            </Link>
          )}


          {!user ? (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Join
              </Link>
            </>
          ) : (
            <>
              <span className="hidden text-slate-300 sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
