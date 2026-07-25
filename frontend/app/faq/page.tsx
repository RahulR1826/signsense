"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    {
      q: "Do I need a special camera to use SignSense?",
      a: "No! SignSense works with standard integrated webcams on laptops, desktops, or tablets. The system performs optimal landmark processing on standard RGB streams.",
    },
    {
      q: "Does SignSense store my video calls?",
      a: "Absolutely not. SignSense is designed around a strict local-first privacy model. MediaPipe tracking runs client-side inside your browser, meaning video streams never leave your device.",
    },
    {
      q: "Which languages are supported?",
      a: "Currently, we support American Sign Language (ASL) for Flow 1 (Sign to Text), and English for Flow 2 (Speech to Text). We are actively working on expanding to other global sign variations.",
    },
    {
      q: "Can I train the model on custom hand gestures?",
      a: "Yes! Developers can use the 'Sign Recognition' dataset builder in the dashboard to record custom landmark JSON files and retrain the classification layers.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-3xl mx-auto space-y-12 dot-grid">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            Questions
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            Find immediate answers regarding data privacy, hardware setup, and model details.
          </p>
        </div>

        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] space-y-3 bg-[var(--surface)]/20">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border-b border-[var(--border)] last:border-0 pb-3 last:pb-0 pt-3 first:pt-0"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left py-2 font-bold text-sm text-[var(--text-1)] hover:text-[var(--emerald)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-[var(--emerald)] flex-shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[var(--emerald)]" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 overflow-hidden"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs text-[var(--text-2)] leading-relaxed pl-6.5 pr-2 pb-2">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
