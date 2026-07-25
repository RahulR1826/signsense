"use client";

import { useThemeStore, useNotificationStore } from "@/lib/store";
import { Settings, Camera, Mic, Volume2, Globe, Shield, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [camera, setCamera] = useState("Default Integrated Webcam");
  const [microphone, setMicrophone] = useState("System Default Mic Input");
  const [speechLanguage, setSpeechLanguage] = useState("English (US)");
  const [speechRate, setSpeechRate] = useState("1.0");

  const handleSave = () => {
    addNotification("Settings Saved", "Application and device parameters have been updated.", "success");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-1)]">Application Configuration</h2>
        <p className="text-xs text-[var(--text-2)] mt-0.5">
          Manage hardware devices, voice properties, and accessibility modes.
        </p>
      </div>

      <div className="glass rounded-3xl border border-[var(--glass-border)] bg-[var(--surface)]/30 p-6 space-y-6">
        {/* Camera Selection */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-[var(--emerald)]" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-[var(--text-1)] block">Video Camera Device</label>
            <select
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text-1)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[var(--emerald)] transition-colors"
            >
              <option>Default Integrated Webcam</option>
              <option>External USB Camera</option>
              <option>Virtual Camera OBS</option>
            </select>
          </div>
        </div>

        {/* Microphone Selection */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 text-[var(--emerald)]" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-[var(--text-1)] block">Microphone Device</label>
            <select
              value={microphone}
              onChange={(e) => setMicrophone(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text-1)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[var(--emerald)] transition-colors"
            >
              <option>System Default Mic Input</option>
              <option>External USB Podcast Mic</option>
              <option>Bluetooth Headset Microphone</option>
            </select>
          </div>
        </div>

        {/* Text to Speech Voice Selection */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-5 h-5 text-[var(--emerald)]" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-1)] block">Text-to-Speech Output Voice</label>
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text-1)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[var(--emerald)] transition-colors"
              >
                <option>English (US) - Male Voice</option>
                <option>English (US) - Female Voice</option>
                <option>English (UK) - Female Voice</option>
                <option>Spanish (ES) - Neutral Voice</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-2)] font-semibold">
                <span>Voice Speed Rate</span>
                <span>{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(e.target.value)}
                className="w-full h-1 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--emerald)]"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-[var(--emerald)]" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-[var(--text-1)] block">Interface Styling Mode</label>
              <span className="text-xs text-[var(--text-3)]">Toggle Light/Dark layout colorway.</span>
            </div>
            <button
              onClick={toggleTheme}
              className="btn-ghost px-4 py-2 text-xs rounded-xl"
            >
              Set to {theme === "dark" ? "Light Theme" : "Dark Theme"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="btn-primary px-8 py-3.5 rounded-xl text-sm font-bold cursor-pointer"
          >
            Save Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
}
