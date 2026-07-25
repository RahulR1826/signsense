"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const tiers = [
    {
      name: "Developer Starter",
      price: "$0",
      desc: "Perfect for testing and contribution to the ASL models.",
      cta: "Launch Sandbox",
      href: "/dashboard",
      features: [
        "Access to web sandbox simulator",
        "Local MediaPipe hand visualizer",
        "Dataset capture and export",
        "Community support",
      ],
      highlight: false,
    },
    {
      name: "Professional Accessibility",
      price: "$19",
      desc: "For daily personal communication and extended calling.",
      cta: "Start Free Trial",
      href: "/login",
      features: [
        "Unlimited live studio translation",
        "Text to Speech output enabled",
        "Continuous speech recognition",
        "Conversation history logs storage",
        "Priority customer support",
      ],
      highlight: true,
    },
    {
      name: "Enterprise Inclusion",
      price: "Custom",
      desc: "Organizations demanding custom AI models and integrations.",
      cta: "Contact Sales",
      href: "/contact",
      features: [
        "Custom vocabulary model training",
        "SSO and directory integration",
        "SLA availability guarantee",
        "Dedicated accounts manager",
        "On-premise deployment option",
      ],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-5xl mx-auto space-y-16 dot-grid">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            Billing Tiers
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Predictable Plans
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            Free developer sandboxes and premium subscriptions for personal or corporate calls.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-3xl p-8 flex flex-col justify-between border ${
                t.highlight
                  ? "bg-gradient-to-b from-emerald-950/20 to-transparent border-[var(--emerald)] shadow-[0_0_40px_rgba(52,211,153,0.1)]"
                  : "glass border-[var(--glass-border)] bg-[var(--surface)]/20"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-bold bg-[var(--emerald)] text-black uppercase tracking-wider">
                  Popular Option
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-2)] block">{t.name}</span>
                  <div className="flex items-baseline mt-2">
                    <span className="text-4xl font-extrabold text-[var(--text-1)]">{t.price}</span>
                    {t.price !== "Custom" && (
                      <span className="text-xs text-[var(--text-3)] ml-1">/month</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-2)] mt-2 leading-relaxed">{t.desc}</p>
                </div>

                <ul className="space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-[var(--text-2)]">
                      <Check className="w-4 h-4 text-[var(--emerald)] flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={t.href}
                  className={`w-full block text-center py-3 rounded-xl text-xs font-bold transition-all ${
                    t.highlight ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
