import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/admin/dashboard", name: "Dashboard Overview", icon: "📊" },
  { path: "/admin/pending", name: "Event Approvals", icon: "⏳" },
  { path: "/admin/events", name: "All Events", icon: "📅" },
  { path: "/admin/users", name: "User Management", icon: "👥" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/10 bg-slate-950/90 backdrop-blur-xl z-40 lg:w-72">
        <div className="p-8">
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="mt-1 text-sm text-slate-400">EventFlow Control Center</p>
        </div>
        
        <nav className="mt-8 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border border-emerald-400/30 text-emerald-300 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
