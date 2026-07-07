"use client";
import Link from "next/link";
import { useState } from "react";

/* ─── Nav ─────────────────────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-[72px] glass border-b border-white/5">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M18 11V6a2 2 0 0 0-4 0v0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">SignSense</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8b8ba8]">
        {["Features","How it Works","Pricing","About"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`}
            className="hover:text-white transition-colors">{l}</a>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/call" className="btn-ghost px-5 py-2.5 text-sm">Sign in</Link>
        <Link href="/call" className="btn-primary px-5 py-2.5 text-sm">Get Started Free →</Link>
      </div>

      {/* Mobile burger */}
      <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
        <div className="w-5 h-0.5 bg-white mb-1"></div>
        <div className="w-5 h-0.5 bg-white mb-1"></div>
        <div className="w-5 h-0.5 bg-white"></div>
      </button>

      {open && (
        <div className="md:hidden absolute top-[72px] inset-x-0 glass border-b border-white/5 p-6 flex flex-col gap-4">
          {["Features","How it Works","Pricing","About"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`}
              className="text-[#8b8ba8] hover:text-white" onClick={() => setOpen(false)}>{l}</a>
          ))}
          <Link href="/call" className="btn-primary px-5 py-3 text-sm text-center mt-2">Get Started Free →</Link>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center dot-grid pt-[72px] overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-blob pointer-events-none" style={{animationDelay:"3s"}} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-emerald-500/20 text-sm font-medium text-emerald-400 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          AI-Powered · Real-time · Inclusive
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-up">
          Video Calls With<br />
          <span className="gradient-text">Sign Language AI</span><br />
          Built In
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#8b8ba8] leading-relaxed mb-10 animate-fade-up" style={{animationDelay:"0.1s"}}>
          SignSense detects hand signs in real time and displays live captions during your video calls — so everyone in the conversation is included.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{animationDelay:"0.2s"}}>
          <Link href="/call" className="btn-primary px-8 py-4 text-base rounded-2xl">
            Start a Free Call →
          </Link>
          <a href="#how-it-works" className="btn-ghost px-8 py-4 text-base rounded-2xl">
            See how it works ↓
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-3 text-sm text-[#8b8ba8] animate-fade-up" style={{animationDelay:"0.3s"}}>
          <div className="flex -space-x-2">
            {["#34d399","#8b5cf6","#3b82f6","#f59e0b","#ef4444"].map((c,i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050508]" style={{background:c}} />
            ))}
          </div>
          <span>Trusted by <strong className="text-white">2,400+</strong> users worldwide</span>
        </div>

        {/* Mock dashboard */}
        <div className="mt-16 relative animate-fade-up" style={{animationDelay:"0.4s"}}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="glass border border-white/10 rounded-3xl p-2 shadow-[0_40px_120px_rgba(0,0,0,0.6)] glow-emerald max-w-4xl mx-auto">
            <div className="bg-[#0d0d14] rounded-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="mx-auto text-xs text-[#4a4a68] font-mono">signsense.io/call/demo-room</span>
              </div>
              <MockCallUI />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Mini video call mockup in hero */
function MockCallUI() {
  return (
    <div className="grid grid-cols-2 gap-2 p-3 bg-[#080810]" style={{minHeight:320}}>
      {[
        { name:"You", label:"Hello", color:"#34d399", active: true },
        { name:"Alex Chen", label:"Nice to meet", color:"#8b5cf6", active: false },
      ].map((p) => (
        <div key={p.name} className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-[#141420] to-[#0d0d18] border ${p.active ? "border-emerald-500/40" : "border-white/5"}`} style={{minHeight:280}}>
          {/* Fake video gradient */}
          <div className="absolute inset-0" style={{background:`radial-gradient(ellipse at 50% 30%, ${p.color}18 0%, transparent 70%)`}} />
          {/* Avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black" style={{background:`${p.color}22`,color:p.color,border:`2px solid ${p.color}44`}}>
              {p.name[0]}
            </div>
          </div>
          {/* Hand landmarks overlay */}
          {p.active && (
            <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 300 280">
              {[[120,180],[130,150],[135,125],[138,105],[140,90],
                [150,185],[155,148],[158,120],[160,100],
                [165,188],[170,150],[172,122],[174,102],
                [180,185],[183,150],[185,124],[186,105],
                [193,180],[194,152],[195,128],[196,112]
              ].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill="#34d399" opacity="0.9"/>)}
              {[[120,180,130,150],[130,150,135,125],[135,125,138,105],[138,105,140,90],
                [120,180,150,185],[150,185,155,148],[155,148,158,120],[158,120,160,100],
                [150,185,165,188],[165,188,170,150],[170,150,172,122],[172,122,174,102],
                [165,188,180,185],[180,185,183,150],[183,150,185,124],[185,124,186,105],
                [180,185,193,180],[193,180,194,152],[194,152,195,128],[195,128,196,112],
                [120,180,193,180]
              ].map(([x1,y1,x2,y2],i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#34d399" strokeWidth="1.5" opacity="0.5"/>)}
            </svg>
          )}
          {/* Caption bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{p.name}</span>
              {p.active && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{background:"rgba(52,211,153,0.15)",color:"#34d399",border:"1px solid rgba(52,211,153,0.3)"}}>
                  ✋ {p.label}
                </div>
              )}
            </div>
          </div>
          {/* Active border glow */}
          {p.active && <div className="absolute inset-0 rounded-xl border-2 border-emerald-500/40 pointer-events-none" />}
        </div>
      ))}
    </div>
  );
}

/* ─── Logos ───────────────────────────────────────────────────── */
function LogoBar() {
  const logos = ["Google","Microsoft","Apple","Samsung","Amazon","Meta"];
  return (
    <section className="py-16 border-y border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-sm text-[#4a4a68] font-medium mb-10 uppercase tracking-widest">Trusted by teams at</p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
          {logos.map(l => (
            <span key={l} className="text-[#3a3a52] font-bold text-lg tracking-tight hover:text-[#6b6b88] transition-colors cursor-default">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────────── */
const FEATURES = [
  { icon:"🖐", title:"Real-Time Detection", desc:"MediaPipe AI tracks 21 hand landmarks at 60 FPS — no lag, no delay.", color:"#34d399" },
  { icon:"💬", title:"Live Captions", desc:"Detected signs are instantly translated to text and overlaid on the video stream.", color:"#8b5cf6" },
  { icon:"🌐", title:"Works Anywhere", desc:"Browser-based. No downloads. Works on Windows, Mac, Linux and mobile.", color:"#3b82f6" },
  { icon:"🔒", title:"End-to-End Encrypted", desc:"All video and data are fully encrypted. We never store your calls.", color:"#f59e0b" },
  { icon:"⚡","title":"Ultra Low Latency", desc:"Sub-100ms round-trip. Our edge infrastructure ensures crystal-clear calls.", color:"#ef4444" },
  { icon:"♿","title":"Accessibility First", desc:"Built from day one to break communication barriers for the deaf community.", color:"#34d399" },
];

function Features() {
  return (
    <section id="features" className="py-32 max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <p className="text-emerald-400 font-semibold text-sm uppercase tracking-widest mb-4">Features</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">
          Everything you need.<br /><span className="gradient-text">Nothing you don't.</span>
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(f => (
          <div key={f.title} className="glass glass-hover rounded-2xl p-7">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5" style={{background:`${f.color}18`,border:`1px solid ${f.color}30`}}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-[#8b8ba8] text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How it Works ────────────────────────────────────────────── */
const STEPS = [
  { n:"01", title:"Create a Room", desc:"Click 'Start a Call'. A unique link is generated instantly. No sign-up needed to try.", icon:"🚀" },
  { n:"02", title:"Invite Anyone", desc:"Share the link. Your guest opens it in any modern browser — no install required.", icon:"🔗" },
  { n:"03", title:"Sign Freely", desc:"The AI detects your hand signs and converts them to captions visible to everyone in the call.", icon:"🤝" },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-[#0a0a12]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-4">How it Works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Up and running in <span className="gradient-text">30 seconds.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(100%+12px)] w-[calc(100%-24px)] h-px bg-gradient-to-r from-emerald-500/40 to-purple-500/40 z-10" style={{width:"calc(100% - 2rem)"}} />
              )}
              <div className="glass rounded-2xl p-8 h-full text-center hover:border-emerald-500/20 transition-all duration-300">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="text-xs font-black text-emerald-500 tracking-widest mb-2">{s.n}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-[#8b8ba8] text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─────────────────────────────────────────────────── */
const PLANS = [
  {
    name:"Free", price:"$0", period:"/mo",
    desc:"Perfect for personal use and trying SignSense.",
    cta:"Get Started",
    features:["Up to 2 participants","40-min call limit","Basic sign detection","5 GB storage"],
    highlight: false,
  },
  {
    name:"Pro", price:"$19", period:"/mo",
    desc:"For power users and small teams who need more.",
    cta:"Start Free Trial",
    features:["Up to 10 participants","Unlimited call duration","Advanced AI detection","25 GB storage","Custom captions","Priority support"],
    highlight: true,
  },
  {
    name:"Enterprise", price:"Custom", period:"",
    desc:"Tailored for large organisations and accessibility programmes.",
    cta:"Contact Sales",
    features:["Unlimited participants","SSO & SAML","SLA guarantee","Custom AI training","Dedicated account manager","On-premise option"],
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-32 max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">
          Simple, <span className="gradient-text">transparent</span> pricing.
        </h2>
        <p className="mt-4 text-[#8b8ba8] max-w-xl mx-auto">No hidden fees. Cancel anytime. Start for free — no credit card required.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {PLANS.map(p => (
          <div key={p.name} className={`relative rounded-3xl p-8 ${p.highlight ? "glow-emerald border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-[#0d0d14]" : "glass"}`}>
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-emerald-500 text-black">Most Popular</div>
            )}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#8b8ba8] mb-1">{p.name}</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-white">{p.price}</span>
                <span className="text-[#8b8ba8] pb-2">{p.period}</span>
              </div>
              <p className="text-sm text-[#8b8ba8] mt-2 leading-relaxed">{p.desc}</p>
            </div>
            <Link href="/call" className={`block text-center py-3 rounded-xl font-bold text-sm mb-6 transition-all ${p.highlight ? "btn-primary" : "btn-ghost"}`}>
              {p.cta}
            </Link>
            <ul className="space-y-3">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#8b8ba8]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Testimonials ────────────────────────────────────────────── */
const TESTIMONIALS = [
  { q:"SignSense completely changed how I communicate in meetings. For the first time, I can participate without an interpreter.", name:"Priya K.", role:"Software Engineer", avatar:"P" },
  { q:"We integrated SignSense into our accessibility programme. The AI accuracy is genuinely impressive — our team is amazed.", name:"James T.", role:"Head of Inclusivity, Acme Corp", avatar:"J" },
  { q:"Finally, a video platform that actually thinks about deaf users. The captions appear almost instantly. Game changer.", name:"Maria L.", role:"Community Educator", avatar:"M" },
];

function Testimonials() {
  return (
    <section className="py-32 bg-[#0a0a12]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Loved by those who <span className="gradient-text">rely on it most.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="glass glass-hover rounded-2xl p-7">
              <div className="text-emerald-400 text-3xl mb-4">"</div>
              <p className="text-[#c0c0d8] text-sm leading-relaxed mb-6">{t.q}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-[#8b8ba8] text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="glass rounded-3xl p-12 relative overflow-hidden border border-emerald-500/15 glow-emerald">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-purple-950/20 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Ready to break the<br /><span className="gradient-text">silence barrier?</span>
            </h2>
            <p className="text-[#8b8ba8] text-lg mb-8 max-w-xl mx-auto">Join thousands of users who communicate more freely every day.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/call" className="btn-primary px-10 py-4 text-base rounded-2xl">
                Start for Free — No card needed
              </Link>
              <a href="#features" className="btn-ghost px-8 py-4 text-base rounded-2xl">
                Learn more ↓
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { title:"Product", links:["Features","Pricing","Changelog","Roadmap"] },
    { title:"Company", links:["About","Blog","Careers","Press"] },
    { title:"Legal",   links:["Privacy","Terms","Cookies","Security"] },
    { title:"Support", links:["Docs","Help Center","Status","Contact"] },
  ];
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-sm font-black">S</span>
              </div>
              <span className="font-bold text-white">SignSense</span>
            </Link>
            <p className="text-[#4a4a68] text-sm leading-relaxed">Sign language video calls powered by AI.</p>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map(l => (
                  <li key={l}><a href="#" className="text-[#4a4a68] text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#4a4a68] text-sm">© 2025 SignSense, Inc. All rights reserved.</p>
          <p className="text-[#4a4a68] text-sm">Made with ♥ for accessibility</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{background:"#050508"}}>
      <Navbar />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
