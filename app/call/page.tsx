"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

/* ────────────────────────────────────────────────────────────────
   VIDEO CALL PAGE  –  /call
   Full UI only (no WebRTC backend). Demonstrates:
   - Local webcam stream
   - Participant grid (3 fake + 1 real)
   - Hand-sign AI caption bar
   - Control toolbar
   - Chat sidebar
   - Settings modal
──────────────────────────────────────────────────────────────── */

const ROOM_ID = "sgns-" + Math.random().toString(36).slice(2, 8).toUpperCase();

const FAKE_PARTICIPANTS = [
  { id: "p1", name: "Alex Chen",    initials: "AC", color: "#8b5cf6", caption: "Hello!",         hasSign: true  },
  { id: "p2", name: "Maria Lopez",  initials: "ML", color: "#3b82f6", caption: "",               hasSign: false },
  { id: "p3", name: "Sam Okafor",   initials: "SO", color: "#f59e0b", caption: "Nice to meet you", hasSign: true  },
];

const CHAT_HISTORY = [
  { from:"Alex Chen",   msg:"Hey everyone! 👋",             time:"22:31" },
  { from:"Maria Lopez", msg:"Hi! Can everyone see my video?", time:"22:31" },
  { from:"Sam Okafor",  msg:"Yep! All good 👍",              time:"22:32" },
  { from:"You",         msg:"Let's get started!",             time:"22:32" },
];

/* ─── Individual video tile ─────────────────────────────────────── */
function VideoTile({ participant, size = "normal" }: {
  participant: typeof FAKE_PARTICIPANTS[0],
  size?: "normal" | "large"
}) {
  const [showCaption, setShowCaption] = useState(participant.hasSign);

  useEffect(() => {
    if (!participant.hasSign) return;
    const t = setInterval(() => setShowCaption(v => !v), 3200);
    return () => clearInterval(t);
  }, [participant.hasSign]);

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#0d0d18] border border-white/5 flex items-center justify-center ${size === "large" ? "min-h-[320px]" : "min-h-[200px]"}`}>
      {/* Background glow */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 30%, ${participant.color}14 0%, transparent 65%)` }} />

      {/* Avatar */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-2"
        style={{ background: `${participant.color}22`, color: participant.color, borderColor: `${participant.color}44` }}>
        {participant.initials}
      </div>

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-white px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">{participant.name}</span>
        {showCaption && participant.caption && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm animate-fade-in"
            style={{ background: `${participant.color}25`, color: participant.color, border: `1px solid ${participant.color}40` }}>
            ✋ {participant.caption}
          </span>
        )}
      </div>

      {/* Mic indicator */}
      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
      </div>
    </div>
  );
}

/* ─── Local webcam tile ─────────────────────────────────────────── */
function LocalVideoTile({ muted, videoOff, caption }: { muted: boolean; videoOff: boolean; caption: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(() => {});
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#0d0d18] border border-emerald-500/30 min-h-[200px] glow-emerald">
      {!videoOff
        ? <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
        : <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-xl font-black text-emerald-400">You</div>
          </div>
      }

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" style={{ animation: "scanline 4s linear infinite", position: "absolute" }} />
      </div>

      {/* Caption */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-white px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm">You</span>
        {caption && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl animate-fade-in"
            style={{ background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.4)" }}>
            ✋ {caption}
          </span>
        )}
        {muted && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2.5"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="white" fill="none" strokeWidth="2.5"/></svg>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Control Button ─────────────────────────────────────────────── */
function CtrlBtn({ icon, label, active = true, danger = false, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; danger?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1.5 group transition-all`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
        danger  ? "bg-red-500/20 border border-red-500/30 hover:bg-red-500 group-hover:scale-110" :
        !active ? "bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 group-hover:scale-110" :
                  "glass border border-white/10 hover:border-emerald-500/30 hover:bg-white/5 group-hover:scale-110"
      }`}>
        {icon}
      </div>
      <span className="text-[10px] text-[#6b6b88] group-hover:text-white transition-colors font-medium">{label}</span>
    </button>
  );
}

/* ─── Chat sidebar ───────────────────────────────────────────────── */
function ChatSidebar({ onClose }: { onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState(CHAT_HISTORY);

  const send = () => {
    if (!msg.trim()) return;
    setMsgs(m => [...m, { from: "You", msg, time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]);
    setMsg("");
  };

  return (
    <div className="w-80 flex-shrink-0 glass border-l border-white/5 flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-semibold">Chat</h3>
        <button onClick={onClose} className="text-[#8b8ba8] hover:text-white transition-colors text-lg">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.from === "You" ? "items-end" : "items-start"}`}>
            <span className="text-[10px] text-[#4a4a68] mb-1">{m.from} · {m.time}</span>
            <div className={`px-3.5 py-2 rounded-2xl text-sm max-w-[90%] ${
              m.from === "You"
                ? "bg-emerald-600/30 text-white border border-emerald-500/20"
                : "bg-white/5 text-[#c0c0d8] border border-white/5"
            }`}>{m.msg}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4a4a68] focus:outline-none focus:border-emerald-500/40" />
          <button onClick={send} className="btn-primary px-4 py-2.5 rounded-xl text-sm">→</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Settings Modal ─────────────────────────────────────────────── */
function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass border border-white/10 rounded-3xl p-8 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Settings</h3>
          <button onClick={onClose} className="text-[#8b8ba8] hover:text-white text-xl">✕</button>
        </div>
        {[
          { label:"Camera",    options:["Default Webcam","External Camera"] },
          { label:"Microphone",options:["Default Mic","Headset Mic"] },
          { label:"Speaker",   options:["System Audio","Headphones"] },
        ].map(s => (
          <div key={s.label} className="mb-5">
            <label className="text-sm text-[#8b8ba8] font-medium block mb-2">{s.label}</label>
            <select className="w-full bg-[#141420] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/30">
              {s.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div className="mb-5">
          <label className="text-sm text-[#8b8ba8] font-medium block mb-2">AI Sign Detection</label>
          <div className="flex items-center gap-3">
            <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
            </div>
            <span className="text-sm text-white">Enabled</span>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl text-sm">Save Changes</button>
      </div>
    </div>
  );
}

/* ─── Main Call Page ─────────────────────────────────────────────── */
export default function CallPage() {
  const [muted,       setMuted]       = useState(false);
  const [videoOff,    setVideoOff]    = useState(false);
  const [chatOpen,    setChatOpen]    = useState(true);
  const [settingsOpen,setSettingsOpen]= useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [handCaption, setHandCaption] = useState("");

  // Cycle through fake sign captions on self tile
  const SIGNS = ["Hello","Thank you","Yes","No","Please","Good","Sorry","Help","","",""];
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { setHandCaption(SIGNS[i % SIGNS.length]); i++; }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#050508] overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 glass border-b border-white/5 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_16px_rgba(52,211,153,0.3)]">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="text-white font-bold hidden sm:block">SignSense</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-mono text-[#8b8ba8]">{ROOM_ID}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-[#8b8ba8] hidden sm:block">AI Sign Detection Active</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 ml-2">
            {FAKE_PARTICIPANTS.length + 1} participants
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(`https://signsense.io/call/${ROOM_ID.toLowerCase()}`); }}
            className="btn-ghost px-4 py-2 text-xs rounded-xl flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Link
          </button>
          <button onClick={() => setSettingsOpen(true)} className="btn-ghost px-3 py-2 text-xs rounded-xl">⚙️</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Video grid ── */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">

          {/* AI Caption bar */}
          {handCaption && (
            <div className="flex items-center gap-3 px-5 py-3 glass border border-emerald-500/20 rounded-2xl animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-lg">✋</div>
              <div>
                <span className="text-xs text-[#8b8ba8] font-medium uppercase tracking-widest block">Live Caption</span>
                <span className="text-white font-bold">{handCaption}</span>
              </div>
              <div className="ml-auto flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> AI Active
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 grid gap-3"
            style={{ gridTemplateColumns: chatOpen ? "repeat(2, 1fr)" : "repeat(2, 1fr)", gridTemplateRows: "1fr 1fr" }}>
            {/* Self */}
            <LocalVideoTile muted={muted} videoOff={videoOff} caption={handCaption} />
            {/* Others */}
            {FAKE_PARTICIPANTS.map(p => <VideoTile key={p.id} participant={p} />)}
          </div>
        </div>

        {/* ── Chat ── */}
        {chatOpen && <ChatSidebar onClose={() => setChatOpen(false)} />}
      </div>

      {/* ── Control toolbar ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 py-5 glass border-t border-white/5">
        <CtrlBtn active={!muted} onClick={() => setMuted(m => !m)} label={muted ? "Unmute" : "Mute"}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={muted ? "#ef4444" : "#34d399"} strokeWidth="2">
            {muted
              ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/></>
              : <><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></>
            }
          </svg>}
        />
        <CtrlBtn active={!videoOff} onClick={() => setVideoOff(v => !v)} label={videoOff ? "Start Video" : "Stop Video"}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={videoOff ? "#ef4444" : "#34d399"} strokeWidth="2">
            {videoOff
              ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M15 10l4.55-2.28A1 1 0 0 1 21 8.7v6.6a1 1 0 0 1-1.45.9L15 14"/><rect x="1" y="6" width="15" height="12" rx="2"/></>
              : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>
            }
          </svg>}
        />
        <CtrlBtn active={!screenShare} onClick={() => setScreenShare(s => !s)} label="Share Screen"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={screenShare ? "#8b5cf6" : "#8b8ba8"} strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>}
        />
        <CtrlBtn active={chatOpen} onClick={() => setChatOpen(c => !c)} label="Chat"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={chatOpen ? "#34d399" : "#8b8ba8"} strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>}
        />
        <CtrlBtn onClick={() => setSettingsOpen(true)} label="Settings"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b8ba8" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 22v-2M19.07 19.07l-1.41-1.41M22 12h-2"/>
          </svg>}
        />

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 mx-2" />

        {/* End call */}
        <CtrlBtn danger onClick={() => window.location.href = "/"} label="End Call"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.27 9.5a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11l-1.27 1.27"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>}
        />
      </div>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
