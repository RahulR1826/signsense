"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useThemeStore, useNotificationStore } from "@/lib/store";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Video,
  Hand,
  Mic,
  History,
  BarChart3,
  BookOpen,
  Settings,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { theme, setTheme } = useThemeStore();
  const { notifications, dismissNotification } = useNotificationStore();

  useEffect(() => {
    // Sync the theme class on mount
    const savedTheme = localStorage.getItem("signsense-theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  const menuItems = [
    { name: "Dashboard Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Studio", href: "/dashboard/communication", icon: Video },
    { name: "Sign Recognition", href: "/dashboard/recognition", icon: Hand },
    { name: "Speech Recognition", href: "/dashboard/speech", icon: Mic },
    { name: "Chat History", href: "/dashboard/history", icon: History },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Learn ASL", href: "/dashboard/learn", icon: BookOpen },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const handleLogout = () => {
    router.push("/");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "error":
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex text-[var(--text-1)] transition-colors duration-300">
      {/* ─── DESKTOP SIDEBAR ────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-300 relative z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 justify-between border-b border-[var(--border)]">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Hand className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-tight truncate text-[var(--text-1)]">
                SignSense
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? "bg-[var(--surface-2)] text-[var(--emerald)] border-l-2 border-[var(--emerald)]"
                    : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]/50"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-[var(--emerald)]" : "text-[var(--text-3)] group-hover:text-[var(--text-1)]"}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER NAVIGATION ────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm">
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] p-4 flex flex-col z-50">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Hand className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-[var(--text-1)]">SignSense</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-[var(--text-2)] hover:text-[var(--text-1)]">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-[var(--surface-2)] text-[var(--emerald)] border-l-2 border-[var(--emerald)]"
                        : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]/50"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[var(--text-3)]" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-[var(--border)]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN DASHBOARD BODY ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-[var(--surface)] border-b border-[var(--border)] z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-[var(--text-2)] hover:text-[var(--text-1)] cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-[var(--text-1)] truncate">
              {menuItems.find((m) => m.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Switcher */}
            <ThemeToggle />

            {/* Notification Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="w-9 h-9 rounded-xl glass border border-white/5 flex items-center justify-center text-current hover:text-[var(--emerald)] hover:border-[var(--border-glow)] transition-all cursor-pointer relative"
              >
                <Bell className="w-[18px] h-[18px] text-[var(--text-2)]" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--emerald)] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass border border-[var(--glass-border)] rounded-2xl shadow-2xl p-4 z-50 bg-[var(--surface)]/95 backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border)]">
                    <span className="font-bold text-sm text-[var(--text-1)]">Notifications</span>
                    <span className="text-xs text-[var(--text-3)]">Latest {notifications.length}</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[var(--text-3)]">No new alerts</div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="flex items-start gap-2.5 p-1 rounded-lg">
                          <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-[var(--text-1)]">{n.title}</div>
                            <div className="text-[10px] text-[var(--text-2)] mt-0.5 leading-relaxed">
                              {n.message}
                            </div>
                          </div>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="text-[10px] text-[var(--text-3)] hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                  JD
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 glass border border-[var(--glass-border)] rounded-2xl shadow-2xl p-2 z-50 bg-[var(--surface)]/95 backdrop-blur-xl">
                  <div className="px-3.5 py-3 border-b border-[var(--border)]">
                    <p className="text-xs text-[var(--text-3)] font-semibold uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-[var(--text-1)] truncate mt-1">Jane Doe</p>
                    <p className="text-xs text-[var(--text-2)] truncate mt-0.5">jane@example.com</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-3.5 py-2 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]/50 rounded-xl transition-colors"
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-3.5 py-2 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]/50 rounded-xl transition-colors"
                    >
                      Account Settings
                    </Link>
                  </div>
                  <div className="border-t border-[var(--border)] pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 bg-[var(--bg)] min-h-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
