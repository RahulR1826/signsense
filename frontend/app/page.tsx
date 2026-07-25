"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Hand, Video, ArrowRight, ShieldCheck, Heart, Sparkles, MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center dot-grid pt-[72px] overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-blob pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-emerald-500/20 text-xs font-semibold text-[var(--emerald)] mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            AI-Powered · Client-Side Processing · Inclusive Design
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-up">
            Two-Way Video Calls With<br />
            <span className="gradient-text">Sign Language AI</span><br />
            Built In
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg text-[var(--text-2)] leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            SignSense translates American Sign Language gestures directly into speech, and transcribes spoken replies back to text captions — all client-side with complete privacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/login" className="btn-primary px-8 py-4 text-sm font-bold flex items-center justify-center gap-1.5 rounded-2xl">
              Get Started Free <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link href="/demo" className="btn-ghost px-8 py-4 text-sm font-semibold flex items-center justify-center gap-1.5 rounded-2xl">
              Open Web Sandbox
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 flex items-center justify-center gap-3 text-xs text-[var(--text-2)] animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex -space-x-2">
              {["#10b981", "#8b5cf6", "#3b82f6", "#f59e0b", "#ef4444"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg)]" style={{ background: c }} />
              ))}
            </div>
            <span>Empowering individuals in <strong className="text-[var(--text-1)]">35+</strong> accessibility networks</span>
          </div>

          {/* Interactive Mock Call Preview */}
          <div className="mt-16 relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent z-10 pointer-events-none h-40" />
            <div className="glass border border-white/5 rounded-3xl p-2.5 shadow-2xl glow-emerald max-w-4xl mx-auto">
              <div className="bg-[#0b0b12] rounded-2xl overflow-hidden border border-white/5">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-black/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  <span className="mx-auto text-[10px] text-[var(--text-3)] font-mono">signsense.io/call/guest-room</span>
                </div>
                
                {/* Fake Call Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-black/25 min-h-[300px]">
                  <div className="relative rounded-2xl overflow-hidden bg-[#0d0d18] border border-[var(--emerald)]/20 min-h-[220px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl font-bold text-[var(--emerald)]">
                      JD
                    </div>
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-lg bg-black/60">
                      You (Signing "Hello")
                    </span>
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-500/10 text-[var(--emerald)] border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      ✋ Hello
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden bg-[#0d0d18] border border-white/5 min-h-[220px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl font-bold text-purple-400">
                      AC
                    </div>
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-lg bg-black/60">
                      Alex Chen (Speaking)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Sections linking to Sub-pages */}
      <section className="py-20 max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-6">
        {[
          {
            title: "Client-Side Processing",
            desc: "All hand landmark analysis is executed locally inside your browser via MediaPipe. We value complete user privacy.",
            icon: ShieldCheck,
            href: "/features",
          },
          {
            title: "Bi-directional Flow",
            desc: "Flow 1 converts sign gestures into voice, and Flow 2 captures voice responses into readable caption boards.",
            icon: Sparkles,
            href: "/how-it-works",
          },
          {
            title: "Accessibility Driven",
            desc: "SignSense is designed with and for the accessibility community, prioritizing low latency and direct call links.",
            icon: Heart,
            href: "/about",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/20 flex flex-col justify-between space-y-4 hover:border-[var(--emerald)]/30 hover:scale-[1.01] transition-all"
            >
              <div className="space-y-3">
                <Icon className="w-6 h-6 text-[var(--emerald)]" />
                <h3 className="text-base font-bold text-[var(--text-1)]">{item.title}</h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{item.desc}</p>
              </div>
              <div>
                <Link href={item.href} className="text-xs font-semibold text-[var(--emerald)] hover:underline flex items-center gap-0.5">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      <Footer />
    </div>
  );
}
