"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Hand, Cpu, Shield, Zap, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const specs = [
    {
      title: "Real-Time Hand Tracking",
      desc: "Uses MediaPipe Tasks-Vision web integration to extract 21 coordinates per hand at up to 60 FPS directly in-browser.",
      icon: Hand,
    },
    {
      title: "Immediate Text translation",
      desc: "Hand gestures are decoded into letter blocks or words instantly without complex installations or servers.",
      icon: Sparkles,
    },
    {
      title: "Microphone Speech Capture",
      desc: "Enables hearing participants to converse naturally while transcribing speech to readable text bubbles.",
      icon: MessageSquare,
    },
    {
      title: "Privacy First Security",
      desc: "Sign recognition is performed locally on the client's device, ensuring private data stays private.",
      icon: Shield,
    },
    {
      title: "Ultra Low Latency API",
      desc: "Fast prediction throughput ensures conversational fluidity between users without communication lag.",
      icon: Zap,
    },
    {
      title: "Machine Learning Core",
      desc: "Powered by TensorFlow model classifiers designed and trained specifically for sign translation accuracy.",
      icon: Cpu,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-5xl mx-auto space-y-16 dot-grid">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Complete Accessibility Toolbox
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            SignSense features optimized local AI modules to establish natural bi-directional communications.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="glass rounded-3xl p-6 border border-[var(--glass-border)] space-y-4 hover:border-[var(--emerald)]/30 hover:scale-[1.01] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--emerald)]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-1)]">{s.title}</h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="glass rounded-3xl p-8 border border-[var(--glass-border)] text-center space-y-4 max-w-3xl mx-auto bg-gradient-to-br from-emerald-950/10 to-transparent">
          <h3 className="text-xl font-bold">Ready to see the capabilities in action?</h3>
          <p className="text-xs text-[var(--text-2)] max-w-md mx-auto">
            Test and practice letters on our client-side demo area instantly without billing information.
          </p>
          <div className="pt-2">
            <Link href="/demo" className="btn-primary px-6 py-3 text-xs inline-block">
              Open Web Sandbox
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
