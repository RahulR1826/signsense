"use client";

import Link from "next/link";
import { Hand, ArrowRight, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LegacyHandtestPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center p-6 text-center relative dot-grid">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md glass border border-[var(--glass-border)] rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Hand className="w-6 h-6 text-white" />
        </div>
        
        <div className="space-y-2">
          <span className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-[var(--emerald)] font-bold w-fit mx-auto">
            <Sparkles className="w-3 h-3" /> Upgraded Landmark Module
          </span>
          <h2 className="text-xl font-bold text-[var(--text-1)]">Sign Recognition Sandbox</h2>
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            The dataset capture module and hand landmark tracking have been moved into the main user dashboard layout for a unified testing environment.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard/recognition"
            className="w-full btn-primary py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Go to Recognition Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}