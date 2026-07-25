"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Hand, Menu, X, LogIn } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "AI Tech", href: "/ai-technology" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-[72px] glass border-b border-[var(--glass-border)] bg-[var(--bg)]/80 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Hand className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[var(--text-1)]">SignSense</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--text-2)]">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="hover:text-[var(--text-1)] transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <ThemeToggle />
        <Link
          href="/login"
          className="text-sm font-semibold text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors px-4 py-2 flex items-center gap-1.5"
        >
          <LogIn className="w-4 h-4" /> Sign In
        </Link>
        <Link
          href="/dashboard"
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-1"
        >
          Launch App
        </Link>
      </div>

      {/* Mobile controls */}
      <div className="flex items-center gap-3 lg:hidden">
        <ThemeToggle />
        <button
          className="text-[var(--text-1)] p-2 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden absolute top-[72px] inset-x-0 glass border-b border-[var(--glass-border)] bg-[var(--bg)] p-6 flex flex-col gap-4 shadow-xl">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[var(--text-2)] hover:text-[var(--text-1)] font-medium text-base py-1"
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-[var(--border)] my-2" />
          <Link
            href="/login"
            className="text-[var(--text-2)] hover:text-[var(--text-1)] font-semibold text-base py-1 flex items-center gap-1.5"
            onClick={() => setOpen(false)}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary px-5 py-3 text-sm text-center mt-2"
            onClick={() => setOpen(false)}
          >
            Launch App
          </Link>
        </div>
      )}
    </nav>
  );
}
