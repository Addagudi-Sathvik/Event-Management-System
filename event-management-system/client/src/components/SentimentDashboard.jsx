import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { toast } from "react-hot-toast";
import { getEventSentimentSummary } from "../api/event.api";

export default function SentimentDashboard({ eventId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getEventSentimentSummary(eventId);
        setSummary(data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load sentiment summary.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const gaugeData = useMemo(
    () => [{ name: "positive", value: summary?.positivePercent || 0, fill: "#22c55e" }],
    [summary]
  );

  return (
    <section className="mb-8 rounded-2xl border border-cyan-400/15 bg-[#041229] p-5 shadow-[0_0_40px_rgba(6,182,212,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyan-100">Sentiment Intelligence</h3>
        {summary && (
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
            {summary.positiveFeedbackPercentage}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-300">Loading sentiment summary...</p>
      ) : !summary ? (
        <p className="text-sm text-slate-400">No sentiment data yet.</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-200/75">Sentiment Gauge</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="65%"
                  outerRadius="100%"
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                  barSize={20}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#dbeafe"
                    className="text-xl font-bold"
                  >
                    {summary.positivePercent}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-slate-300">Total Reviews: {summary.totalReviews}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-cyan-200/75">Key Words</p>
            {summary.topKeywords.length === 0 ? (
              <p className="text-sm text-slate-400">No keywords available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {summary.topKeywords.map((item) => (
                  <span
                    key={item.word}
                    className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"
                  >
                    {item.word} ({item.count})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-cyan-200/75">
              Recent Negative Comments
            </p>
            {summary.recentNegativeComments.length === 0 ? (
              <p className="text-sm text-slate-400">No negative comments.</p>
            ) : (
              <div className="space-y-3">
                {summary.recentNegativeComments.map((item, idx) => (
                  <motion.div
                    key={`${item.createdAt}-${idx}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border p-3 text-sm ${
                      item.isHighlyNegative
                        ? "border-red-400/40 bg-red-500/15 text-red-100"
                        : "border-white/10 bg-slate-900/40 text-slate-200"
                    }`}
                  >
                    <p>{item.comment}</p>
                    <p className="mt-1 text-xs opacity-80">
                      {item.reviewerName} | score {item.score}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
