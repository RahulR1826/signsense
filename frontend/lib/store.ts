import { create } from "zustand";

// ─── Theme Store ──────────────────────────────────────────────────
interface ThemeState {
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark", // default to dark
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        if (nextTheme === "dark") {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
        localStorage.setItem("signsense-theme", nextTheme);
      }
      return { theme: nextTheme };
    }),
  setTheme: (theme) =>
    set(() => {
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        if (theme === "dark") {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
        localStorage.setItem("signsense-theme", theme);
      }
      return { theme };
    }),
}));

// ─── Notification Store ──────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  timestamp: Date;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: AppNotification["type"]) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (title, message, type = "info") =>
    set((state) => {
      const newNotification: AppNotification = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        message,
        type,
        timestamp: new Date(),
      };
      // Keep only latest 10 notifications
      const updated = [newNotification, ...state.notifications].slice(0, 10);
      return { notifications: updated };
    }),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}));

// ─── Conversations Store ──────────────────────────────────────────
export interface ConversationItem {
  id: string;
  speaker: "Deaf User" | "Hearing User";
  text: string;
  timestamp: string;
  confidence?: number;
}

interface ConversationState {
  conversations: ConversationItem[];
  addMessage: (speaker: ConversationItem["speaker"], text: string, confidence?: number) => void;
  clearHistory: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [
    { id: "1", speaker: "Hearing User", text: "Hello! Nice to meet you.", timestamp: "12:30 PM" },
    { id: "2", speaker: "Deaf User", text: "Nice to meet you", timestamp: "12:31 PM", confidence: 0.94 },
    { id: "3", speaker: "Hearing User", text: "Can you show me how SignSense works?", timestamp: "12:31 PM" },
    { id: "4", speaker: "Deaf User", text: "Yes", timestamp: "12:32 PM", confidence: 0.98 },
  ],
  addMessage: (speaker, text, confidence) =>
    set((state) => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const newItem: ConversationItem = {
        id: Math.random().toString(36).substring(2, 9),
        speaker,
        text,
        timestamp,
        confidence,
      };
      return { conversations: [...state.conversations, newItem] };
    }),
  clearHistory: () => set({ conversations: [] }),
}));
