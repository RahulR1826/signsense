"use client";

import { useThemeStore } from "@/lib/store";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Sync mounted state to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("signsense-theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme("dark");
      }
    }
  }, [setTheme]);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl glass border border-white/5 flex items-center justify-center text-current hover:text-[var(--emerald)] hover:border-[var(--border-glow)] transition-all cursor-pointer"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px] text-[#8b8ba8] hover:text-amber-400 transition-colors" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-slate-700 hover:text-indigo-600 transition-colors" />
      )}
    </button>
  );
}
