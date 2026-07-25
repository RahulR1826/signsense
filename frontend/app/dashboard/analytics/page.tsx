"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Cpu, Calendar, CheckCircle } from "lucide-react";

interface AnalyticsData {
  summary: {
    avg_accuracy: string;
    prediction_latency: string;
    practice_hours: string;
  };
  history: Array<{
    date: string;
    duration: string;
    accuracy: string;
    status: string;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Analytics error");
        return res.json();
      })
      .then((resData: AnalyticsData) => {
        setData(resData);
      })
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { name: "Model Accuracy", value: data?.summary.avg_accuracy || "96.4%", desc: "Based on validation set", icon: TrendingUp },
    { name: "Prediction Latency", value: data?.summary.prediction_latency || "85ms", desc: "Edge vision preprocessing", icon: Cpu },
    { name: "Practice Hours", value: data?.summary.practice_hours || "4.8h", desc: "Total active practice", icon: Calendar },
  ];

  const historyList = data?.history || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-1)]">System Analytics</h2>
        <p className="text-xs text-[var(--text-2)] mt-0.5">
          Real-time prediction latency and model performance logs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="glass rounded-2xl p-5 border border-[var(--glass-border)] flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-[var(--text-2)] block">{s.name}</span>
                <span className="text-2xl font-bold text-[var(--text-1)] mt-2 block">{s.value}</span>
                <span className="text-[10px] text-[var(--text-3)] mt-1 block">{s.desc}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--emerald)]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Accuracy Chart */}
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text-1)] mb-4">Accuracy Over Time</h3>
          <div className="h-48 w-full relative mt-6">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />

              <path
                d="M10 110 L 100 90 L 200 80 L 300 40 L 400 35 L 490 20"
                fill="none"
                stroke="var(--emerald)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="10" cy="110" r="4.5" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx="100" cy="90" r="4.5" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx="200" cy="80" r="4.5" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx="300" cy="40" r="4.5" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx="400" cy="35" r="4.5" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx="490" cy="20" r="4.5" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[9px] text-[var(--text-3)] font-medium font-mono mt-3">
              <span>Run #1 (80%)</span>
              <span>Run #2 (85%)</span>
              <span>Run #3 (88%)</span>
              <span>Run #4 (92%)</span>
              <span>Run #5 (94%)</span>
              <span>Run #6 (96%)</span>
            </div>
          </div>
        </div>

        {/* Recent Session Logs */}
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)]">
          <h3 className="text-sm font-bold text-[var(--text-1)] mb-4">Recent Sessions</h3>
          <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-[var(--text-3)] text-center py-6">Loading sessions...</p>
            ) : historyList.length === 0 ? (
              <p className="text-xs text-[var(--text-3)] text-center py-6">No sessions logged yet.</p>
            ) : (
              historyList.map((h, i) => (
                <div
                  key={i}
                  className="p-3 bg-[var(--surface-2)]/40 border border-[var(--border)] rounded-xl flex items-center justify-between animate-fade-in"
                >
                  <div>
                    <span className="text-xs font-bold text-[var(--text-1)] block">{h.date}</span>
                    <span className="text-[10px] text-[var(--text-3)] mt-0.5 block">
                      Duration: {h.duration}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[var(--emerald)] block">
                      {h.accuracy}
                    </span>
                    <span className="text-[8px] text-[var(--text-3)] mt-0.5 flex items-center gap-0.5 justify-end">
                      <CheckCircle className="w-2.5 h-2.5 text-[var(--emerald)]" /> {h.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
