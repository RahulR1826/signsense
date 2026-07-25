"use client";

// Silence harmless MediaPipe/TFLite WASM initialization info logs that get routed to console.error
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      args.some(
        (arg) =>
          typeof arg === "string" &&
          arg.includes("Created TensorFlow Lite XNNPACK delegate for CPU")
      )
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}

import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/lib/store";
import { AudioRecorder } from "@/lib/audioRecorder";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  CheckCircle,
  Copy,
  ChevronRight,
  Loader2,
  Sparkles,
  AlertTriangle,
  Heart,
  HelpCircle,
  MessageSquare,
  Globe,
} from "lucide-react";

interface MessageItem {
  id?: number;
  speaker: "Deaf User" | "Hearing User";
  text: string;
  confidence?: number;
  created_at?: string;
}

interface AIAgentAnalysis {
  corrected_text: string;
  analysis: {
    emergency_detected: boolean;
    translation: string;
    accessibility_guidance: string;
    context_understanding: string;
  };
}

export default function LiveCommunication() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handLandmarkerRef = useRef<any>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [transcribing, setTranscribing] = useState(false);

  const [latestSign, setLatestSign] = useState("");
  const [latestSignConfidence, setLatestSignConfidence] = useState(0.0);
  const [translatedText, setTranslatedText] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [hearingInput, setHearingInput] = useState("");
  
  // Database state
  const [conversations, setConversations] = useState<MessageItem[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAgentAnalysis | null>(null);

  const addNotification = useNotificationStore((s) => s.addNotification);

  // Throttling and Debouncing refs
  const lastPredictTime = useRef<number>(0);
  const lastDetectedSign = useRef<string>("");
  const detectionStreak = useRef<number>(0);

  // 1. Fetch Timeline History on Mount
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. Play TTS via Backend Streaming Response
  const playTTS = async (text: string) => {
    if (!ttsEnabled) return;
    try {
      const res = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (e) {
      console.error("Failed to play TTS audio stream:", e);
    }
  };

  // 3. Trigger Agent Analysis on Conversation Updates
  const triggerAgent = async (currentHistory: MessageItem[]) => {
    try {
      const res = await fetch("/api/chat-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: currentHistory }),
      });
      if (res.ok) {
        const data: AIAgentAnalysis = await res.json();
        setAiAnalysis(data);
        
        // Dispatch warning if emergency detected
        if (data.analysis.emergency_detected) {
          addNotification(
            "CRITICAL ALERT",
            "Emergency signals detected! Medical guidance flagged.",
            "error"
          );
        }
        
        // Speak out the corrected text
        if (data.corrected_text) {
          await playTTS(data.corrected_text);
        }
      }
    } catch (err) {
      console.error("AI Orchestrator failed:", err);
    }
  };

  // 4. Toggle Webcam
  const toggleCamera = async () => {
    if (streamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setStreamActive(false);
    } else {
      setStreamActive(true);
    }
  };

  // Clean up HandLandmarker on component unmount
  useEffect(() => {
    return () => {
      if (handLandmarkerRef.current) {
        try {
          handLandmarkerRef.current.close();
        } catch (e) {
          console.error("Failed to close handLandmarker:", e);
        }
        handLandmarkerRef.current = null;
      }
    };
  }, []);

  // Camera & Tracking Loop Effect
  useEffect(() => {
    let active = true;
    let handLandmarker: any = null;
    let animationFrameId: number;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch((err) => {
            console.warn("Video play error:", err);
          });
        }
        addNotification("Camera Started", "Webcam stream loaded successfully.", "success");
      } catch (err) {
        if (active) {
          console.error("Camera access error:", err);
          addNotification("Camera Error", "Failed to access webcam. Check permissions.", "error");
        }
      }
    };

    const loadModels = async () => {
      try {
        if (handLandmarkerRef.current) {
          handLandmarker = handLandmarkerRef.current;
          return;
        }
        // Load MediaPipe Hands
        const vision = await import("@mediapipe/tasks-vision");
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        if (!active) return;
        handLandmarker = await vision.HandLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            },
            runningMode: "VIDEO",
            numHands: 1,
          }
        );

        if (!active) {
          handLandmarker.close();
          return;
        }
        handLandmarkerRef.current = handLandmarker;
        setModelLoading(false);
        addNotification("AI Model Ready", "Sign Language AI engine initialized.", "success");
      } catch (err) {
        if (active) {
          addNotification("AI Load Error", "Failed to initialize classification model.", "error");
        }
      }
    };

    const detectLoop = () => {
      if (!active || !streamActive) return;

      if (!videoRef.current || !canvasRef.current || !handLandmarker) {
        animationFrameId = requestAnimationFrame(detectLoop);
        return;
      }

      if (videoRef.current.readyState < 2) {
        animationFrameId = requestAnimationFrame(detectLoop);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      let results;
      try {
        results = handLandmarker.detectForVideo(
          videoRef.current,
          performance.now()
        );
      } catch (err) {
        console.error("MediaPipe detection error in LiveCommunication:", err);
        animationFrameId = requestAnimationFrame(detectLoop);
        return;
      }

      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const data = results.landmarks
          .flat()
          .map((p: any) => [p.x, p.y, p.z])
          .flat();

        // 🧠 CALL BACKEND TENSORFLOW INFERENCE (Throttled to 5 FPS / 200ms)
        const now = performance.now();
        if (now - lastPredictTime.current > 200) {
          lastPredictTime.current = now;
          
          fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ landmarks: data }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("HTTP prediction failed");
              return res.json();
            })
            .then((pred) => {
              if (pred && pred.confidence > 0.8) {
                // Debounce to check if user holds a sign consistently
                if (pred.label === lastDetectedSign.current) {
                  detectionStreak.current++;
                  
                  if (detectionStreak.current === 3) { // held for ~600ms (3 predictions)
                    setLatestSign(pred.label);
                    setLatestSignConfidence(pred.confidence);
                    setTranslatedText((prev) => (prev ? prev + " " + pred.label : pred.label));
                    
                    // Add message to backend DB history
                    fetch("/api/history", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        speaker: "Deaf User",
                        text: pred.label,
                        confidence: pred.confidence
                      })
                    })
                      .then(hRes => hRes.json())
                      .then(newMsg => {
                        // Refresh state history
                        setConversations(prev => {
                          const updated = [...prev, newMsg];
                          // Run AI Agent Orchestrator
                          triggerAgent(updated);
                          return updated;
                        });
                      });
                  }
                } else {
                  lastDetectedSign.current = pred.label;
                  detectionStreak.current = 0;
                }
              }
            })
            .catch((err) => console.error("Predict endpoint error:", err));
        }

        // Draw connections
        results.landmarks.forEach((landmarks: any) => {
          landmarks.forEach((point: any) => {
            ctx?.beginPath();
            ctx?.arc(
              point.x * canvas.width,
              point.y * canvas.height,
              4,
              0,
              2 * Math.PI
            );
            if (ctx) {
              ctx.fillStyle = "rgba(52, 211, 153, 0.9)";
              ctx.fill();
            }
          });

          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [17, 18], [18, 19], [19, 20],
            [0, 17]
          ];

          ctx?.beginPath();
          connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            if (p1 && p2) {
              ctx?.moveTo(p1.x * canvas.width, p1.y * canvas.height);
              ctx?.lineTo(p2.x * canvas.width, p2.y * canvas.height);
            }
          });
          if (ctx) {
            ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(detectLoop);
    };

    const init = async () => {
      if (streamActive) {
        setupCamera();
        await loadModels();
        if (!active) return;
        detectLoop();
      }
    };

    init();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [streamActive]);

  // 5. Submit keyboard responses for Hearing User
  const handleHearingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingInput.trim()) return;

    const text = hearingInput.trim();
    setHearingInput("");

    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speaker: "Hearing User", text }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setConversations(prev => {
          const updated = [...prev, newMsg];
          triggerAgent(updated);
          return updated;
        });
        addNotification("Message Sent", "Text added to communication timeline.", "success");
      }
    } catch (err) {
      console.error("Failed to add message:", err);
    }
  };

  // 6. Microphoned Speech Input (STT API Connection)
  const toggleSpeechRecording = async () => {
    if (micActive) {
      // STOP recording
      setMicActive(false);
      setTranscribing(true);
      if (audioRecorderRef.current) {
        try {
          const audioBlob = await audioRecorderRef.current.stop();
          
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.wav");
          
          const res = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              // Submit transcribed speech
              const hRes = await fetch("/api/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ speaker: "Hearing User", text: data.text })
              });
              if (hRes.ok) {
                const newMsg = await hRes.json();
                setConversations(prev => {
                  const updated = [...prev, newMsg];
                  triggerAgent(updated);
                  return updated;
                });
                addNotification("Speech Decoded", `Hearing speech parsed: "${data.text}"`, "success");
              }
            } else {
              addNotification("Transcription Empty", "Could not transcribe words. Speak clearly.", "warning");
            }
          }
        } catch (e) {
          console.error("Mic record stop error:", e);
          addNotification("Mic Error", "Failed to upload audio to STT service.", "error");
        } finally {
          setTranscribing(false);
        }
      }
    } else {
      // START recording
      try {
        setMicActive(true);
        audioRecorderRef.current = new AudioRecorder();
        await audioRecorderRef.current.start();
        addNotification("Microphone Active", "Speech recognition listening...", "info");
      } catch (err) {
        setMicActive(false);
        console.error(err);
        addNotification("Mic Blocked", "Microphone access failed. Check permissions.", "error");
      }
    }
  };

  // 7. Reset timeline logs
  const handleClearHistory = async () => {
    if (confirm("Clear timeline history?")) {
      try {
        const res = await fetch("/api/history", { method: "DELETE" });
        if (res.ok) {
          setConversations([]);
          setAiAnalysis(null);
          addNotification("Timeline Reset", "Timeline history cleared.", "info");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full min-h-[calc(100vh-180px)] animate-fade-in">
      {/* Left Column: Camera and Translations */}
      <div className="xl:col-span-2 space-y-6 flex flex-col justify-between">
        
        {/* Webcam glass interface */}
        <div className="glass rounded-3xl p-4 border border-[var(--glass-border)] bg-[var(--surface)]/50 flex-1 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
          {/* Top Info HUD */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 border border-white/5 text-xs text-slate-300">
              <div className={`w-2 h-2 rounded-full ${streamActive ? "bg-[var(--emerald)] animate-pulse" : "bg-red-400"}`} />
              <span>{streamActive ? "Camera Live (ASL Mode)" : "Camera Offline"}</span>
            </div>
            {streamActive && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-[var(--emerald)] font-bold">
                <Sparkles className="w-3 h-3" /> AI Active
              </div>
            )}
          </div>

          {/* Video Stream Container */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#07070d]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] absolute inset-0 opacity-70 ${
                streamActive ? "block" : "hidden"
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] z-10 ${
                streamActive ? "block" : "hidden"
              }`}
            />
            {!streamActive && (
              <div className="flex flex-col items-center text-center p-6 space-y-3 z-20">
                <VideoOff className="w-10 h-10 text-[var(--text-3)]" />
                <p className="text-sm font-semibold text-[var(--text-2)]">Webcam is inactive</p>
                <p className="text-xs text-[var(--text-3)] max-w-xs leading-relaxed">
                  Start the camera to begin real-time American Sign Language translation.
                </p>
              </div>
            )}

            {streamActive && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center z-20 px-4">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md w-full text-center">
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                    Detected ASL (Real-time Model)
                  </span>
                  <span className="text-xl font-bold text-white mt-1 block">
                    {latestSign || "Waiting for signs..."}
                  </span>
                  {latestSignConfidence > 0 && (
                    <span className="text-[9px] text-[var(--emerald)] mt-0.5 block font-mono">
                      Confidence: {Math.round(latestSignConfidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div />

          {/* Controls Footer */}
          <div className="flex items-center justify-between mt-4 z-10 pt-2 border-t border-[var(--border)]">
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                streamActive
                  ? "bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30"
                  : "btn-primary"
              }`}
            >
              {streamActive ? (
                <>
                  <VideoOff className="w-4 h-4" /> Stop Camera
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" /> Start Camera
                </>
              )}
            </button>

            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                ttsEnabled
                  ? "bg-[var(--emerald)]/10 border-[var(--emerald)]/30 text-[var(--emerald)] hover:bg-[var(--emerald)]/20"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-3)]"
              }`}
              title="Text to Speech Audio Sync"
            >
              <Volume2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Translation Output Buffer */}
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/30 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--text-1)]">Sign Language Words Buffer</h3>
            {translatedText && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(translatedText);
                  addNotification("Copied", "Translated text copied.", "success");
                }}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="min-h-16 p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[var(--border)] text-sm text-[var(--text-1)] leading-relaxed">
            {translatedText || (
              <span className="text-[var(--text-3)] italic">
                Start camera and run hand signs. Letters/words will buffer here.
              </span>
            )}
          </div>
          {translatedText && (
            <button
              onClick={() => setTranslatedText("")}
              className="text-xs text-[var(--text-3)] hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear buffer
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Two-way Timeline & Agent HUD */}
      <div className="space-y-6 flex flex-col justify-between h-full">
        
        {/* Agentic AI Assistant HUD (Glow card) */}
        <div className={`glass rounded-3xl p-5 border transition-all duration-500 bg-[var(--surface)]/35 ${
          aiAnalysis?.analysis.emergency_detected 
            ? "border-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.2)] animate-pulse" 
            : "border-[var(--glass-border)]"
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--emerald)]" />
              <h3 className="text-xs font-bold text-[var(--text-1)] uppercase tracking-wider">Agentic AI HUD</h3>
            </div>
            {aiAnalysis?.analysis.emergency_detected && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-[9px] text-red-400 font-extrabold uppercase animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Emergency
              </span>
            )}
          </div>

          <div className="mt-3.5 space-y-3.5 text-xs">
            {/* Grammar corrected text */}
            <div>
              <span className="text-[10px] text-[var(--text-3)] font-semibold flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--emerald)]" /> Corrected Grammar
              </span>
              <p className="text-sm font-bold text-[var(--text-1)] mt-1 pl-4.5">
                {aiAnalysis ? aiAnalysis.corrected_text : "Waiting for conversation updates..."}
              </p>
            </div>

            {/* Translation */}
            <div>
              <span className="text-[10px] text-[var(--text-3)] font-semibold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Spanish Translation
              </span>
              <p className="italic text-[var(--text-2)] mt-1 pl-4.5">
                {aiAnalysis ? aiAnalysis.analysis.translation : "Esperando..."}
              </p>
            </div>

            {/* Accessibility and context logs */}
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[var(--border)]">
              <div>
                <span className="text-[9px] text-[var(--text-3)] uppercase font-semibold flex items-center gap-0.5">
                  <HelpCircle className="w-3 h-3 text-purple-400" /> Assistance Guidance
                </span>
                <span className="block text-[10px] text-[var(--text-2)] mt-1 font-medium leading-relaxed">
                  {aiAnalysis ? aiAnalysis.analysis.accessibility_guidance : "System idle"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--text-3)] uppercase font-semibold flex items-center gap-0.5">
                  <Heart className="w-3 h-3 text-red-400" /> Context Analysis
                </span>
                <span className="block text-[10px] text-[var(--text-2)] mt-1 font-medium leading-relaxed">
                  {aiAnalysis ? aiAnalysis.analysis.context_understanding : "Waiting for chat"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Frame */}
        <div className="glass rounded-3xl p-5 border border-[var(--glass-border)] bg-[var(--surface)]/30 flex-1 flex flex-col justify-between min-h-[280px]">
          <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-1)] uppercase">Timeline Feed</h3>
              <p className="text-[9px] text-[var(--text-3)] mt-0.5">Real-time caption sequence</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-[10px] text-[var(--text-3)] hover:text-red-400 cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 my-3 overflow-y-auto space-y-3.5 pr-1 max-h-[190px]">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-3)]">
                <Loader2 className="w-5 h-5 animate-spin mb-1 text-[var(--emerald)]" />
                <p className="text-[10px] font-semibold">Feed Empty</p>
              </div>
            ) : (
              conversations.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className={`flex flex-col ${c.speaker === "Hearing User" ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-center gap-1.5 text-[8px] text-[var(--text-3)] mb-0.5">
                    <span
                      className={`font-semibold ${
                        c.speaker === "Deaf User" ? "text-[var(--emerald)]" : "text-blue-400"
                      }`}
                    >
                      {c.speaker}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      c.speaker === "Hearing User"
                        ? "bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border)]"
                        : "bg-[var(--emerald)]/10 text-white border border-[var(--emerald)]/20"
                    }`}
                  >
                    {c.text}
                  </div>
                  {c.confidence !== undefined && (
                    <span className="text-[7px] text-[var(--text-3)] mt-0.5 flex items-center gap-0.5">
                      <CheckCircle className="w-2 h-2 text-[var(--emerald)]" />
                      Acc {Math.round(c.confidence * 100)}%
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-2)]">Hearing Mic</span>
              <button
                onClick={toggleSpeechRecording}
                disabled={transcribing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-colors ${
                  micActive
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : transcribing
                    ? "bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-3)] opacity-70"
                    : "bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-3)] hover:border-blue-400/30 hover:text-blue-400"
                }`}
              >
                {transcribing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> Parsing...
                  </>
                ) : micActive ? (
                  <>
                    <Mic className="w-3.5 h-3.5 animate-pulse text-blue-400" /> Record Stop
                  </>
                ) : (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Record Speech
                  </>
                )}
              </button>
            </div>

            {micActive && (
              <div className="flex items-center gap-1 h-6 px-1 justify-center bg-[var(--surface-2)] rounded-lg border border-[var(--border)] animate-fade-in">
                <div className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                <div className="w-1 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-1 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }} />
                <div className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            )}

            <form onSubmit={handleHearingSubmit} className="flex gap-2">
              <input
                type="text"
                value={hearingInput}
                onChange={(e) => setHearingInput(e.target.value)}
                placeholder="Type reply and press Enter..."
                className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors"
              />
              <button
                type="submit"
                className="btn-primary px-3 py-2 rounded-xl text-xs flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
