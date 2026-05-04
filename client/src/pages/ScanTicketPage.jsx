import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { verifyTicketApi } from "../api/ticket.api";

export default function ScanTicketPage() {
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await verifyTicketApi(qrToken.trim());
      setResult(data);
      toast.success(data.message);
      setQrToken("");
    } catch (error) {
      const message = error?.response?.data?.message || "Ticket verification failed.";
      toast.error(message);
      setResult({ message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onVerify}
        className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl"
      >
        <h1 className="mb-2 text-3xl font-bold">Scan QR Ticket</h1>
        <p className="mb-5 text-sm text-slate-300">
          Paste scanned ticket token here and verify attendee check-in.
        </p>
        <textarea
          value={qrToken}
          onChange={(e) => setQrToken(e.target.value)}
          rows={6}
          required
          className="w-full rounded-xl border border-white/10 bg-slate-900/70 p-3 outline-none"
          placeholder="Paste scanned qr token..."
        />
        <button
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify Ticket"}
        </button>

        {result && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm">
            <p className="font-semibold">{result.message}</p>
            {result?.attendee?.name && (
              <p className="mt-1 text-slate-300">
                Checked-in: {result.attendee.name} ({result.attendee.email})
              </p>
            )}
          </div>
        )}
      </motion.form>
    </div>
  );
}
