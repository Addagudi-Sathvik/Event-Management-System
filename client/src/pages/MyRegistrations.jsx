import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getUserRegistrations, cancelRegistrationForEvent } from '../api/registration.api';
import { Link } from 'react-router-dom';

export default function MyRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState({});

  useEffect(() => {
    if (!user) {
      setError('Please login to view registrations');
      setLoading(false);
      return;
    }
    loadRegistrations();
  }, [user]);

  const loadRegistrations = async () => {
    try {
      setError(null);
      const data = await getUserRegistrations();
      setRegistrations(data.registrations || data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load registrations');
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    if (!confirm('Cancel this registration? Seat will be freed.')) return;
    try {
      setCancelling(prev => ({...prev, [eventId]: true}));
      await cancelRegistrationForEvent(eventId);
      toast.success('Registration cancelled');
      loadRegistrations();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(prev => ({...prev, [eventId]: false}));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-slate-400">Loading your registrations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-red-400 text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={loadRegistrations}
            className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-slate-400 text-center">
          <h2 className="text-xl font-bold mb-4">Login Required</h2>
          <Link to="/login" className="text-indigo-400 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!registrations.length) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-4xl text-center py-20">
          <h1 className="mb-4 text-3xl font-bold text-white">My Registrations</h1>
          <p className="text-slate-400 mb-8">No registrations found.</p>
          <Link 
            to="/events" 
            className="inline-block bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-400"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="mx-auto max-w-4xl"
      >
        <h1 className="mb-8 text-3xl font-bold text-white">My Registrations ({registrations.length})</h1>
        <div className="grid gap-6">
          {registrations.map((reg) => {
            return (
              <motion.div 
                key={reg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link to={`/events/${reg.eventId?._id || reg.eventId}`} className="hover:text-indigo-400 block">
                      <h3 className="text-xl font-bold">{reg.eventId?.name || 'Event'}</h3>
                    </Link>
                    <p className="text-slate-400">
                      {new Date(reg.eventId?.date || reg.createdAt).toLocaleDateString()} | {reg.eventId?.time || 'TBD'}
                    </p>
                    <p className="text-slate-400">{reg.eventId?.venue || 'TBD'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[140px]">
                    <div className="text-sm font-mono bg-slate-800 px-3 py-1 rounded-lg text-emerald-400">
                      {reg.token || reg.confirmationNumber || 'N/A'}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      reg.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      reg.status === 'used' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {reg.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    {reg.status === 'active' && (
                      <button
                        onClick={() => handleCancel(reg.eventId?._id || reg.eventId)}
                        disabled={cancelling[reg.eventId?._id || reg.eventId]}
                        className="text-xs bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold disabled:opacity-50"
                      >
                        {cancelling[reg.eventId?._id || reg.eventId] ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

