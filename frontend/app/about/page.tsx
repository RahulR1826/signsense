"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Hand, Eye, Heart, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span id="mission" className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            Our Mission
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Breaking Silence Barriers
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            Building inclusion with client-side artificial intelligence frameworks.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-[var(--glass-border)] space-y-6 bg-[var(--surface)]/20">
          <h3 className="text-lg font-bold">Why SignSense?</h3>
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            Traditional video conferencing tools assume every user shares audio and visual capabilities equally. For millions of deaf and hard-of-hearing people, this creates an immediate barrier, requiring external interpreters, chat sidebars, or awkward transcription delays.
          </p>
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            SignSense changes this by placing an on-device machine learning parser directly in the video channel. By capturing, cleaning, and translating landmarks at the edge, we enable natural conversations to proceed without middle-man servers or translation delays.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "Inclusive Design",
              desc: "Every control, form, and page is crafted with direct input from accessibility specialists.",
              icon: Heart,
            },
            {
              title: "Client-Side Privacy",
              desc: "MediaPipe landmark processing stays inside your browser. No video frames are sent to external APIs.",
              icon: Shield,
            },
            {
              title: "Direct Interaction",
              desc: "Flows are structured to offer bi-directional translations: sign-to-speech and speech-to-text.",
              icon: Hand,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass rounded-2xl p-5 border border-[var(--glass-border)] bg-[var(--surface)]/10 space-y-3"
              >
                <Icon className="w-5 h-5 text-[var(--emerald)]" />
                <h4 className="text-sm font-bold">{item.title}</h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
