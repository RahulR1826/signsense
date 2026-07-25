"use client";

import { useNotificationStore } from "@/lib/store";
import { Search, Trash2, CheckCircle, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

interface LogItem {
  id: number;
  speaker: string;
  text: string;
  confidence?: number;
  created_at: string;
}

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [filter, setFilter] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = conversations.filter((c) =>
    c.text.toLowerCase().includes(filter.toLowerCase())
  );

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear your conversation history?")) {
      try {
        const res = await fetch("/api/history", { method: "DELETE" });
        if (res.ok) {
          setConversations([]);
          addNotification("History Cleared", "Conversation logs have been reset.", "info");
        }
      } catch (e) {
        console.error(e);
        addNotification("Error", "Failed to clear timeline history.", "error");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-1)]">Translation Logs</h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            View details and confidence scores of recent conversations.
          </p>
        </div>
        {conversations.length > 0 && (
          <button
            onClick={handleClear}
            className="btn-ghost px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 text-red-400 hover:bg-red-500/10 cursor-pointer animate-fade-in"
          >
            <Trash2 className="w-4 h-4" /> Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="relative rounded-xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search logs..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-10 pr-3 py-3 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors"
        />
      </div>

      {/* Log Feed */}
      <div className="glass rounded-3xl border border-[var(--glass-border)] bg-[var(--surface)]/30 p-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-[var(--text-3)] space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--emerald)]" />
            <p className="text-xs">Loading database logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-3)] space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-sm font-semibold">No logs found</p>
            <p className="text-xs">Start a session or update your filter query.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] space-y-4">
            {filtered.map((item, index) => (
              <div key={item.id} className={`pt-4 ${index === 0 ? "pt-0" : ""} space-y-1.5`}>
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`font-semibold ${
                      item.speaker === "Deaf User" ? "text-[var(--emerald)]" : "text-blue-400"
                    }`}
                  >
                    {item.speaker}
                  </span>
                  <span className="text-[var(--text-3)] font-mono">
                    {new Date(item.created_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-1)] leading-relaxed">{item.text}</p>
                {item.confidence !== undefined && item.confidence !== null && (
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-3)]">
                    <CheckCircle className="w-3.5 h-3.5 text-[var(--emerald)]" />
                    <span>AI Model Confidence: {Math.round(item.confidence * 100)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple loader helper inside file to avoid layout mismatches
function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
