"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Cpu, Layers, Hand, GitFork } from "lucide-react";

export default function AITechnologyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-16 dot-grid">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            Architecture
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Our Machine Learning Pipeline
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            How SignSense processes coordinates on the edge for low latency.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/30 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
              <Hand className="w-5 h-5 text-[var(--emerald)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-1)]">1. Landmark Processing</h3>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              MediaPipe Tasks-Vision runs client-side to track 21 hand landmarks. Each landmark maps onto X, Y, and Z axes, compiling into a precise 63-coordinate floating point vector.
            </p>
          </div>

          <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/30 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[var(--emerald)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-1)]">2. Neural Network Classification</h3>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              A Keras/TensorFlow model loads inside the local python pipeline (or fallback web execution module). The 63 coordinates feed directly into dense layers, outputting prediction confidence distributions.
            </p>
          </div>
        </div>

        {/* Pipeline Flow illustration */}
        <div className="glass rounded-3xl p-8 border border-[var(--glass-border)] space-y-6">
          <h3 className="text-base font-bold">The Real-Time Process</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] w-full md:w-auto">
              <span className="text-xs font-bold text-white block">Raw Video Stream</span>
              <span className="text-[10px] text-[var(--text-2)] block mt-0.5">Local Camera</span>
            </div>
            <GitFork className="w-4 h-4 text-[var(--emerald)] rotate-90 md:rotate-0" />
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] w-full md:w-auto">
              <span className="text-xs font-bold text-white block">63 Hand Floats</span>
              <span className="text-[10px] text-[var(--text-2)] block mt-0.5">MediaPipe Mapping</span>
            </div>
            <GitFork className="w-4 h-4 text-[var(--emerald)] rotate-90 md:rotate-0" />
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] w-full md:w-auto">
              <span className="text-xs font-bold text-white block">Dense Classifier</span>
              <span className="text-[10px] text-[var(--text-2)] block mt-0.5">Neural Net Prediction</span>
            </div>
            <GitFork className="w-4 h-4 text-[var(--emerald)] rotate-90 md:rotate-0" />
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] w-full md:w-auto">
              <span className="text-xs font-bold text-[var(--emerald)] block">Speech Output</span>
              <span className="text-[10px] text-[var(--text-2)] block mt-0.5">Text & Audio synthesiser</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
