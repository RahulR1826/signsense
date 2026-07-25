"use client";

import Link from "next/link";
import {
  Video,
  Hand,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useConversationStore } from "@/lib/store";

export default function DashboardHome() {
  const conversations = useConversationStore((s) => s.conversations).slice(-3);

  const stats = [
    {
      name: "Conversations Helped",
      value: "42",
      change: "+12% this week",
      icon: MessageSquare,
      color: "var(--emerald)",
    },
    {
      name: "Signs Recognized",
      value: "1,248",
      change: "+28% this week",
      icon: Hand,
      color: "var(--purple)",
    },
    {
      name: "Practice Time",
      value: "180 min",
      change: "5 day streak",
      icon: Clock,
      color: "var(--blue)",
    },
    {
      name: "Average Accuracy",
      value: "96.4%",
      change: "+0.8% training run",
      icon: TrendingUp,
      color: "var(--emerald)",
    },
  ];

  const quickActions = [
    {
      title: "Launch Live Studio",
      desc: "Start a real-time speech and sign translation session.",
      href: "/dashboard/communication",
      icon: Video,
      color: "from-emerald-500/10 to-emerald-500/20 border-emerald-500/20 text-[var(--emerald)]",
    },
    {
      title: "Sign Recognition",
      desc: "Test MediaPipe detection and capture new sign datasets.",
      href: "/dashboard/recognition",
      icon: Hand,
      color: "from-purple-500/10 to-purple-500/20 border-purple-500/20 text-purple-400",
    },
    {
      title: "Learn ASL Alphabet",
      desc: "Practice cards, track milestones, and earn achievements.",
      href: "/dashboard/learn",
      icon: BookOpen,
      color: "from-blue-500/10 to-blue-500/20 border-blue-500/20 text-blue-400",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-1)]">
            Welcome back, Jane
          </h2>
          <p className="text-sm text-[var(--text-2)] mt-1">
            Here's the summary of your SignSense translation activity.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 text-sm font-semibold">
          <Flame className="w-4 h-4 fill-amber-500" />
          <span>5 Day Training Streak!</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="glass rounded-2xl p-5 border border-[var(--glass-border)] shadow-md hover:border-emerald-500/25 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-2)]">{stat.name}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[var(--text-1)]">{stat.value}</span>
                <span className="block text-[10px] text-[var(--emerald)] mt-1 font-medium">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6 border border-[var(--glass-border)]">
            <h3 className="text-sm font-bold text-[var(--text-1)] mb-4">Quick Studio Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`flex flex-col p-4 rounded-xl border bg-gradient-to-b hover:scale-[1.02] transition-all cursor-pointer ${action.color}`}
                  >
                    <Icon className="w-6 h-6 mb-3" />
                    <span className="text-sm font-bold text-[var(--text-1)]">{action.title}</span>
                    <span className="text-xs text-[var(--text-2)] mt-1 leading-relaxed">
                      {action.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Usage Chart Mock */}
          <div className="glass rounded-2xl p-6 border border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-1)]">Translation Minutes</h3>
                <p className="text-xs text-[var(--text-2)] mt-0.5">Daily translation workload</p>
              </div>
              <span className="text-xs text-[var(--emerald)] font-mono font-bold">AVG 45m/day</span>
            </div>
            {/* Custom SVG Line Chart */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(52,211,153,0.2)" />
                    <stop offset="100%" stopColor="rgba(52,211,153,0)" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />

                {/* Fill Area */}
                <path
                  d="M0 120 C 50 110, 100 80, 150 95 C 200 110, 250 40, 300 55 C 350 70, 400 30, 450 15 L 450 150 L 0 150 Z"
                  fill="url(#chartGrad)"
                />
                {/* Line Path */}
                <path
                  d="M0 120 C 50 110, 100 80, 150 95 C 200 110, 250 40, 300 55 C 350 70, 400 30, 450 15"
                  fill="none"
                  stroke="var(--emerald)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Data Points */}
                <circle cx="150" cy="95" r="4" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="1.5" />
                <circle cx="250" cy="40" r="4" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="1.5" />
                <circle cx="300" cy="55" r="4" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="1.5" />
                <circle cx="450" cy="15" r="4" fill="var(--emerald)" stroke="var(--surface)" strokeWidth="1.5" />
              </svg>
              {/* X Axis Labels */}
              <div className="flex justify-between text-[9px] text-[var(--text-3)] font-medium font-mono mt-3">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity & Logs */}
        <div className="space-y-6">
          {/* Recent Transcripts */}
          <div className="glass rounded-2xl p-6 border border-[var(--glass-border)] flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-1)]">Recent Messages</h3>
              <Link
                href="/dashboard/history"
                className="text-xs text-[var(--emerald)] hover:underline flex items-center gap-0.5 font-semibold"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4 flex-1">
              {conversations.map((c) => (
                <div key={c.id} className="p-3 bg-[var(--surface-2)]/40 border border-[var(--border)] rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      className={`font-semibold ${
                        c.speaker === "Deaf User" ? "text-[var(--emerald)]" : "text-blue-400"
                      }`}
                    >
                      {c.speaker}
                    </span>
                    <span className="text-[var(--text-3)]">{c.timestamp}</span>
                  </div>
                  <p className="text-xs text-[var(--text-1)] leading-relaxed">{c.text}</p>
                  {c.confidence && (
                    <div className="text-[9px] text-[var(--text-3)] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[var(--emerald)]" />
                      <span>{Math.round(c.confidence * 100)}% Confidence</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
