import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAllUsers, blockUser, unblockUser } from "../api/admin.api";

const roleColors = {
  admin: "bg-purple-400/20 text-purple-400 border-purple-400/30",
  organizer: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
  attendee: "bg-slate-400/20 text-slate-400 border-slate-400/30",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data.users || data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, isCurrentlyBlocked) => {
    setActioning((prev) => ({ ...prev, [userId]: true }));
    try {
      if (isCurrentlyBlocked) {
        await unblockUser(userId);
        toast.success("User unblocked");
      } else {
        await blockUser(userId);
        toast.success("User blocked");
      }
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isBlocked: !isCurrentlyBlocked } : user
        )
      );
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setActioning((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          User Management
        </h2>
        <p className="text-slate-400 mt-1">Manage {users.length} users</p>
      </div>

      {users.length === 0 ? (
        <motion.div
          className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-700/50 bg-slate-900/50"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-3xl">
            👥
          </div>
          <h3 className="text-2xl font-bold text-slate-300 mb-2">No users found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Platform users will appear here once they register.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl hover:border-white/20 hover:shadow-2xl transition-all hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
                    {user.role.toUpperCase()}
                  </span>
                  {user.isBlocked ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-400/30">
                      BLOCKED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-slate-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                <div className="flex-1" />
                <button
                  onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                  disabled={actioning[user._id]}
                  className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all whitespace-nowrap ${
                    user.isBlocked
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900"
                      : "bg-rose-500 hover:bg-rose-400 text-white"
                  } disabled:opacity-50`}
                >
                  {actioning[user._id]
                    ? "Processing..."
                    : user.isBlocked
                    ? "Unblock"
                    : "Block User"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
