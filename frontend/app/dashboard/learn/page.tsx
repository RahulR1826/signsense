"use client";

import { useState } from "react";
import { useNotificationStore } from "@/lib/store";
import { BookOpen, Star, Trophy, ArrowRight, Award, Compass } from "lucide-react";

export default function LearnPage() {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [selectedTab, setSelectedTab] = useState<"alphabet" | "words">("alphabet");

  const letters = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  
  const commonWords = [
    { word: "Hello", desc: "Open palm moving down from the forehead like a salute" },
    { word: "Thank you", desc: "Flat hand touch mouth then move down and forward to target" },
    { word: "Please", desc: "Flat hand rubbing chest in circular motion" },
    { word: "Yes", desc: "Squeeze hand in a fist and nod it down and up" },
    { word: "No", desc: "Index and middle fingers tapping thumb twice" },
    { word: "Help", desc: "Closed fist on top of flat palm, moving upward" },
  ];

  const badges = [
    { title: "First Sign", desc: "Learn your first ASL letter", unlocked: true },
    { title: "Spelling Bee", desc: "Spell 10 words correctly", unlocked: true },
    { title: "Perfect Run", desc: "Score 100% on a word practice session", unlocked: false },
    { title: "10-Day Streak", desc: "Practice consistently for 10 days", unlocked: false },
  ];

  const handlePractice = (item: string) => {
    addNotification("Practice Launched", `Starting ASL practice room for "${item}". Hold hand up to webcam.`, "success");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-1)]">ASL Learning Center</h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Master American Sign Language gestures and test your accuracy.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-2)]">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Progress: <strong className="text-[var(--text-1)]">18% Completed</strong></span>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-[var(--border)] gap-6">
        <button
          onClick={() => setSelectedTab("alphabet")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer ${
            selectedTab === "alphabet"
              ? "border-b-2 border-[var(--emerald)] text-[var(--text-1)]"
              : "text-[var(--text-3)] hover:text-[var(--text-1)]"
          }`}
        >
          Alphabet Chart
        </button>
        <button
          onClick={() => setSelectedTab("words")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer ${
            selectedTab === "words"
              ? "border-b-2 border-[var(--emerald)] text-[var(--text-1)]"
              : "text-[var(--text-3)] hover:text-[var(--text-1)]"
          }`}
        >
          Common Conversational Words
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Grid area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTab === "alphabet" ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {letters.map((char) => (
                <div
                  key={char}
                  onClick={() => handlePractice(char)}
                  className="glass rounded-xl p-4 border border-[var(--glass-border)] text-center cursor-pointer hover:border-[var(--emerald)] hover:scale-105 transition-all"
                >
                  <span className="text-2xl font-black text-[var(--text-1)] block">{char}</span>
                  <span className="text-[9px] text-[var(--emerald)] mt-1.5 font-bold uppercase tracking-wider block">
                    Practice
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {commonWords.map((item) => (
                <div
                  key={item.word}
                  onClick={() => handlePractice(item.word)}
                  className="glass rounded-2xl p-5 border border-[var(--glass-border)] space-y-2 cursor-pointer hover:border-[var(--emerald)] hover:scale-[1.01] transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--text-1)]">{item.word}</span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-3)]" />
                  </div>
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges / Achievements sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/50 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
              <Award className="w-4.5 h-4.5 text-[var(--emerald)]" />
              <h3 className="text-sm font-bold text-[var(--text-1)]">Achievements</h3>
            </div>
            <div className="space-y-4">
              {badges.map((b) => (
                <div
                  key={b.title}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    b.unlocked
                      ? "bg-[var(--surface-2)]/60 border-[var(--emerald)]/20"
                      : "bg-[var(--surface-2)]/20 border-[var(--border)] opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      b.unlocked ? "bg-amber-500/10 text-amber-500" : "bg-[var(--surface-2)] text-[var(--text-3)]"
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-1)] block">{b.title}</span>
                    <span className="text-[10px] text-[var(--text-2)] mt-0.5 block leading-relaxed">
                      {b.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
