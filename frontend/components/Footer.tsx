"use client";

import Link from "next/link";
import { Hand } from "lucide-react";

export default function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Live Demo", href: "/demo" },
        { name: "AI Tech", href: "/ai-technology" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Accessibility Mission", href: "/about#mission" },
        { name: "Careers", href: "#" },
        { name: "Press Kit", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Settings", href: "#" },
        { name: "Security Audit", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Help Center", href: "#" },
        { name: "Status Page", href: "#" },
        { name: "Contact Support", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--border)] py-16 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Hand className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[var(--text-1)]">SignSense</span>
            </Link>
            <p className="text-[var(--text-2)] text-sm leading-relaxed">
              Real-time sign language recognition to break communication barriers.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-[var(--text-1)] font-semibold text-sm mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="text-[var(--text-2)] text-sm hover:text-[var(--text-1)] transition-colors"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-3)] text-sm">
            © {new Date().getFullYear()} SignSense, Inc. All rights reserved.
          </p>
          <p className="text-[var(--text-3)] text-sm flex items-center gap-1.5">
            Made with <span className="text-red-500">♥</span> for global accessibility
          </p>
        </div>
      </div>
    </footer>
  );
}
