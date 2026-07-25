"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Video, Volume2, Mic, Eye, FileText } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            System Flow
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            How SignSense Works
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            A comprehensive two-way pipeline bridging deaf and hearing dialogue.
          </p>
        </div>

        {/* Flow 1 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-[var(--emerald)]/10 text-[var(--emerald)] border border-[var(--emerald)]/20 px-3 py-1 rounded-full">
              Flow 1
            </span>
            <h3 className="text-lg font-bold">Deaf User to Hearing User</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                step: "1. Capture Gesture",
                desc: "User gestures towards their camera. MediaPipe maps hand coordinates in real time.",
                icon: Video,
              },
              {
                step: "2. Predict Landmark",
                desc: "Classifier model evaluates coordinates and translates them into corresponding letter text.",
                icon: FileText,
              },
              {
                step: "3. Speak Out Loud",
                desc: "Text is outputted immediately as speech synthesis (TTS) so the hearing user understands.",
                icon: Volume2,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.step}
                  className="glass rounded-2xl p-5 border border-[var(--glass-border)] bg-[var(--surface)]/20 space-y-3"
                >
                  <Icon className="w-5 h-5 text-[var(--emerald)]" />
                  <h4 className="text-sm font-bold">{f.step}</h4>
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow 2 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
              Flow 2
            </span>
            <h3 className="text-lg font-bold">Hearing User to Deaf User</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                step: "1. Capture Audio",
                desc: "The hearing user speaks into their mic. System listens via Web Speech listener APIs.",
                icon: Mic,
              },
              {
                step: "2. Transcribe Words",
                desc: "Voice data is processed and converted to text captions with high speed and accuracy.",
                icon: FileText,
              },
              {
                step: "3. Display Screen",
                desc: "Captions are appended to the user interface, letting the deaf user easily read the dialog.",
                icon: Eye,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.step}
                  className="glass rounded-2xl p-5 border border-[var(--glass-border)] bg-[var(--surface)]/20 space-y-3"
                >
                  <Icon className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold">{f.step}</h4>
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
