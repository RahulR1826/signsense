"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Sparkles, Play, Volume2, HelpCircle, CheckCircle } from "lucide-react";
import { useNotificationStore } from "@/lib/store";

export default function DemoPage() {
  const [selectedSign, setSelectedSign] = useState("A");
  const [playing, setPlaying] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const demoItems = [
    { name: "A", category: "Alphabet", desc: "Closed fist with thumb resting on the side of index finger" },
    { name: "B", category: "Alphabet", desc: "Open flat palm with thumb folded across palm" },
    { name: "Hello", category: "Word", desc: "Palm flat moving outwards from the side of the head" },
    { name: "Thank you", category: "Word", desc: "Fingertips touching lips then moving down and forward" },
  ];

  const handlePlayDemo = () => {
    setPlaying(true);
    const item = demoItems.find((d) => d.name === selectedSign) || demoItems[0];

    // Trigger Speech Synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(item.name);
      window.speechSynthesis.speak(utterance);
    }
    
    addNotification("Demo Triggered", `Synthesizing speech for sign "${item.name}".`, "success");
    setTimeout(() => setPlaying(false), 1200);
  };

  const activeItem = demoItems.find((d) => d.name === selectedSign) || demoItems[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12 dot-grid">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            Sandbox
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Sign Language AI Sandbox
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            Select a sign below to simulate real-time landmark classification and speech synthesis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Controls Column */}
          <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[var(--text-2)] block">
                Choose Sign Gesture
              </span>
              <div className="space-y-2">
                {demoItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedSign(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      selectedSign === item.name
                        ? "bg-[var(--emerald)]/10 border-[var(--emerald)] text-white"
                        : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)] hover:border-[var(--emerald)]/30 hover:text-[var(--text-1)]"
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[9px] opacity-75 font-mono">[{item.category}]</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePlayDemo}
              disabled={playing}
              className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Speak Sign Out Loud
            </button>
          </div>

          {/* Sandbox Screen Monitor */}
          <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] md:col-span-2 flex flex-col justify-between min-h-[300px] relative overflow-hidden bg-black/60">
            {/* Visualizer screen Mock */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[var(--emerald)]/10 border-2 border-[var(--emerald)]/30 flex items-center justify-center text-4xl font-black text-white animate-pulse">
                {activeItem.name}
              </div>
            </div>

            {/* Top Indicator */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] text-[var(--emerald)] font-bold">
                <Sparkles className="w-3 h-3" /> Classification Active
              </div>
              <span className="text-[9px] text-[var(--text-3)] font-semibold uppercase tracking-wider">
                Demo Mode
              </span>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center z-10">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Translated text
              </span>
              <span className="text-base font-bold text-white mt-1 block">
                "{activeItem.name}"
              </span>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                {activeItem.desc}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
