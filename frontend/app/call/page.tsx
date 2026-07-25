"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/lib/store";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MessageSquare,
  Settings,
  PhoneOff,
  Copy,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const FAKE_PARTICIPANTS = [
  { id: "p1", name: "Alex Chen", initials: "AC", color: "#8b5cf6", caption: "Hello!", hasSign: true },
  { id: "p2", name: "Maria Lopez", initials: "ML", color: "#3b82f6", caption: "", hasSign: false },
  { id: "p3", name: "Sam Okafor", initials: "SO", color: "#f59e0b", caption: "Nice to meet you", hasSign: true },
];

const CHAT_HISTORY = [
  { from: "Alex Chen", msg: "Hey everyone! 👋", time: "22:31" },
  { from: "Maria Lopez", msg: "Hi! Can everyone see my video?", time: "22:31" },
  { from: "Sam Okafor", msg: "Yep! All good 👍", time: "22:32" },
  { from: "You", msg: "Let's get started!", time: "22:32" },
];

function VideoTile({ participant }: { participant: typeof FAKE_PARTICIPANTS[0] }) {
  const [showCaption, setShowCaption] = useState(participant.hasSign);

  useEffect(() => {
    if (!participant.hasSign) return;
    const t = setInterval(() => setShowCaption((v) => !v), 3200);
    return () => clearInterval(t);
  }, [participant.hasSign]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center min-h-[220px]">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${participant.color}10 0%, transparent 65%)`,
        }}
      />

      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border-2"
        style={{
          background: `${participant.color}15`,
          color: participant.color,
          borderColor: `${participant.color}30`,
        }}
      >
        {participant.initials}
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="text-[10px] font-bold text-white px-2.5 py-1 rounded-lg bg-black/60">
          {participant.name}
        </span>
        {showCaption && participant.caption && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm animate-fade-in"
            style={{
              background: `${participant.color}20`,
              color: participant.color,
              border: `1px solid ${participant.color}35`,
            }}
          >
            ✋ {participant.caption}
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <Mic className="w-3.5 h-3.5 text-[var(--emerald)]" />
      </div>
    </div>
  );
}

export default function CallPage() {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [handCaption, setHandCaption] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_HISTORY);

  const videoRef = useRef<HTMLVideoElement>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const SIGNS = ["Hello", "Thank you", "Yes", "No", "Please", "Good", "Sorry", "Help", "", "", ""];
  
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setHandCaption(SIGNS[i % SIGNS.length]);
      i++;
    }, 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (videoOff) return;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.warn("Video play error:", err));
        }
      })
      .catch(() => {});
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, [videoOff]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        from: "You",
        msg: chatInput.trim(),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)] text-[var(--text-1)] overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 glass border-b border-[var(--border)] z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="font-bold hidden sm:block">SignSense</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
            <span className="text-[10px] font-mono text-[var(--text-3)] font-bold">SGNS-ROOM-XYZ</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              addNotification("Copied Link", "Call URL copied to clipboard.", "success");
            }}
            className="btn-ghost px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </button>
        </div>
      </div>

      {/* Main Grid and Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-grow p-4 overflow-hidden flex flex-col gap-4">
          {/* Real-time sign caption overlay bar */}
          {handCaption && (
            <div className="flex items-center gap-3 px-5 py-3 glass border border-emerald-500/20 rounded-2xl animate-fade-in bg-[var(--surface)]/50">
              <div className="w-7 h-7 rounded-lg bg-[var(--emerald)]/10 border border-[var(--emerald)]/20 flex items-center justify-center text-xs">✋</div>
              <div>
                <span className="text-[9px] text-[var(--text-3)] font-bold uppercase tracking-wider block">Live Sign Caption</span>
                <span className="font-bold text-xs">{handCaption}</span>
              </div>
              <div className="ml-auto flex items-center gap-2 text-[var(--emerald)] text-[10px] font-semibold">
                <div className="w-1.5 h-1.5 bg-[var(--emerald)] rounded-full animate-pulse" /> AI Detection Running
              </div>
            </div>
          )}

          {/* Grid Container */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Local camera feed */}
            <div className="relative rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--emerald)]/25 flex items-center justify-center min-h-[220px]">
              {!videoOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1] absolute inset-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--emerald)]/10 border border-[var(--emerald)]/30 flex items-center justify-center text-xl font-bold text-[var(--emerald)]">
                  You
                </div>
              )}
              <div className="absolute bottom-3 left-3 flex items-center justify-between w-[calc(100%-24px)] z-10">
                <span className="text-[10px] font-bold text-white px-2.5 py-1 rounded-lg bg-black/60">
                  You (Local webcam)
                </span>
                {handCaption && (
                  <span className="text-[10px] font-bold bg-[var(--emerald)]/20 text-[var(--emerald)] border border-[var(--emerald)]/30 px-2.5 py-1 rounded-lg">
                    ✋ {handCaption}
                  </span>
                )}
              </div>
            </div>

            {/* Simulated participants */}
            {FAKE_PARTICIPANTS.slice(0, 3).map((p) => (
              <VideoTile key={p.id} participant={p} />
            ))}
          </div>
        </div>

        {/* Chat sidebar */}
        {chatOpen && (
          <div className="w-80 flex-shrink-0 glass border-l border-[var(--border)] flex flex-col h-full bg-[var(--surface)]/20">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <span className="font-bold text-sm">Room Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.from === "You" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] text-[var(--text-3)] mb-1">{m.from} · {m.time}</span>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      m.from === "You"
                        ? "bg-[var(--emerald)]/10 text-white border border-[var(--emerald)]/20"
                        : "bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]"
                    }`}
                  >
                    {m.msg}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="p-4 border-t border-[var(--border)] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type room message..."
                className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors"
              />
              <button type="submit" className="btn-primary px-3 py-2 rounded-xl text-xs flex items-center justify-center">
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Control Actions footer Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 py-4 glass border-t border-[var(--border)]">
        <button
          onClick={() => setMuted(!muted)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
            muted ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-[var(--surface-2)] border-[var(--border)]"
          }`}
          title="Toggle Mic"
        >
          {muted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
        </button>

        <button
          onClick={() => setVideoOff(!videoOff)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
            videoOff ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-[var(--surface-2)] border-[var(--border)]"
          }`}
          title="Toggle Camera"
        >
          {videoOff ? <VideoOff className="w-4.5 h-4.5" /> : <Video className="w-4.5 h-4.5" />}
        </button>

        <button
          onClick={() => setScreenShare(!screenShare)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
            screenShare ? "bg-purple-500/10 border-purple-500/25 text-purple-400" : "bg-[var(--surface-2)] border-[var(--border)]"
          }`}
          title="Share Screen"
        >
          <Monitor className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
            chatOpen ? "bg-[var(--emerald)]/10 border-[var(--emerald)]/20 text-[var(--emerald)]" : "bg-[var(--surface-2)] border-[var(--border)]"
          }`}
          title="Room Chat"
        >
          <MessageSquare className="w-4.5 h-4.5" />
        </button>

        <div className="w-px h-8 bg-[var(--border)] mx-1" />

        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          title="Leave Room"
        >
          <PhoneOff className="w-4.5 h-4.5" />
        </Link>
      </div>
    </div>
  );
}
