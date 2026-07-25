"use client";

import { useNotificationStore } from "@/lib/store";
import { User, Mail, Key } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [memberSince, setMemberSince] = useState("2026");
  const [loading, setLoading] = useState(true);

  // Load user profile from API on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Profile error");
        return res.json();
      })
      .then((data) => {
        setName(data.name);
        setEmail(data.email);
        setStreakCount(data.streak_count);
        setMemberSince(data.member_since);
      })
      .catch((err) => console.error("Failed to load user profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        const data = await res.json();
        setName(data.name);
        setEmail(data.email);
        addNotification("Profile Updated", "Your information was successfully saved to the database.", "success");
      } else {
        addNotification("Update Failed", "Could not save profile details.", "error");
      }
    } catch (err) {
      console.error(err);
      addNotification("Network Error", "Could not connect to profile API.", "error");
    }
  };

  // Avatar initials getter
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-1)]">User Profile</h2>
        <p className="text-xs text-[var(--text-2)] mt-0.5">
          Configure details on your account profile card.
        </p>
      </div>

      <div className="glass rounded-3xl border border-[var(--glass-border)] bg-[var(--surface)]/35 p-6 space-y-6">
        {/* Avatar Profile Box */}
        <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_4px_16px_rgba(139,92,246,0.25)]">
            {loading ? "..." : getInitials(name)}
          </div>
          <div>
            <span className="text-base font-bold text-[var(--text-1)] block">
              {loading ? "Loading profile..." : name}
            </span>
            <span className="text-xs text-[var(--text-3)] block mt-0.5">
              Practice Streak: <strong className="text-[var(--emerald)]">{streakCount} days</strong> · Member since {memberSince}
            </span>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-2)] block">Full Name</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                <User className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full Name"
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-2)] block">Email Address</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-2)] block">Change Password</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                <Key className="h-4.5 w-4.5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] opacity-60 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50"
            >
              Update Profile Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
