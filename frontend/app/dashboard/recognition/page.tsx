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

import { useEffect, useRef, useState } from "react";
import { useNotificationStore } from "@/lib/store";
import { Hand, Camera, Database, Keyboard, Sparkles, Plus, Loader2 } from "lucide-react";

interface SavedSample {
  label: string;
  timestamp: string;
  size: number;
}

export default function SignRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentLabel = useRef("A");
  const latestData = useRef<number[]>([]);
  const lastPredictTime = useRef<number>(0);

  const [labelState, setLabelState] = useState("A");
  const [modelLoading, setModelLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [savedSamples, setSavedSamples] = useState<SavedSample[]>([]);
  const [savingSample, setSavingSample] = useState(false);
  
  const [livePrediction, setLivePrediction] = useState<{ label: string; confidence: number } | null>(null);

  const addNotification = useNotificationStore((s) => s.addNotification);

  // Quick select labels
  const alphabet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

  useEffect(() => {
    let active = true;
    let handLandmarker: any;
    let animationFrameId: number;
    let activeStream: MediaStream | null = null;

    // 🎯 KEYBOARD LISTENER
    const handleKey = async (e: KeyboardEvent) => {
      // Set label on pressing a-z / A-Z
      if (/^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        currentLabel.current = char;
        setLabelState(char);
        addNotification("Label Selected", `Dataset target label set to "${char}".`, "info");
      }

      // Save on SPACE
      if (e.code === "Space") {
        e.preventDefault();
        await triggerSave();
      }
    };

    window.addEventListener("keydown", handleKey);

    // CAMERA SETUP
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch((err) => {
            console.warn("Video play error:", err);
          });
        }
        setCameraActive(true);
      } catch (err) {
        if (active) {
          console.error("Camera access error:", err);
          addNotification("Camera Error", "Failed to access webcam. Check browser permissions.", "error");
        }
      }
    };

    // MODEL LOADING
    const loadModel = async () => {
      try {
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
            numHands: 2,
          }
        );
        if (!active) return;
        setModelLoading(false);
        addNotification("MediaPipe Loaded", "Hand landmark model loaded successfully.", "success");
      } catch (err) {
        if (active) {
          addNotification("Model Error", "Failed to load MediaPipe Hand Landmarker model.", "error");
        }
      }
    };

    // DETECTION LOOP
    const detectHands = () => {
      if (!active) return;

      if (!videoRef.current || !canvasRef.current || !handLandmarker) {
        animationFrameId = requestAnimationFrame(detectHands);
        return;
      }

      if (videoRef.current.readyState < 2) {
        animationFrameId = requestAnimationFrame(detectHands);
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
        console.error("MediaPipe detection error in SignRecognition:", err);
        animationFrameId = requestAnimationFrame(detectHands);
        return;
      }

      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const data = results.landmarks
          .flat()
          .map((p: any) => [p.x, p.y, p.z])
          .flat();

        latestData.current = data; // store latest data

        // 🧠 CALL BACKEND TENSORFLOW PREDICTOR (Throttled to 5 FPS / 200ms)
        const now = performance.now();
        if (now - lastPredictTime.current > 200) {
          lastPredictTime.current = now;
          fetch("/api/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ landmarks: data }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("HTTP error");
              return res.json();
            })
            .then((pred) => {
              if (pred && pred.label) {
                setLivePrediction({ label: pred.label, confidence: pred.confidence });
              }
            })
            .catch((err) => console.error("Predict endpoint error:", err));
        }

        // Draw connections and landmarks
        results.landmarks.forEach((landmarks: any) => {
          // Draw Landmark Dots
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
              ctx.fillStyle = "rgba(52, 211, 153, 0.9)"; // Emerald glow
              ctx.fill();
              ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });

          // Draw skeleton lines (MediaPipe hand landmarks standard connection indexes)
          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [5, 9], [9, 10], [10, 11], [11, 12], // Middle
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring
            [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [0, 17] // Palm
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
      } else {
        setLivePrediction(null);
      }

      animationFrameId = requestAnimationFrame(detectHands);
    };

    const init = async () => {
      setupCamera();
      await loadModel();
      if (!active) return;
      detectHands();
    };

    init();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKey);
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [addNotification]);

  // Save functionality
  const triggerSave = async () => {
    if (latestData.current.length === 0) {
      addNotification("Capture Error", "No hand landmarks detected. Hold your hand in front of the camera.", "warning");
      return;
    }

    setSavingSample(true);
    const sample = {
      label: currentLabel.current,
      data: latestData.current,
    };

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sample),
      });

      const result = await res.json();
      if (result.success) {
        addNotification("Sample Saved", `Captured landmark vector for label "${sample.label}".`, "success");
        setSavedSamples((prev) => [
          {
            label: sample.label,
            timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            size: sample.data.length,
          },
          ...prev,
        ]);
      } else {
        addNotification("Save Failed", "API returned failure during save.", "error");
      }
    } catch (err) {
      addNotification("Network Error", "Could not connect to the dataset saving endpoint.", "error");
    } finally {
      setSavingSample(false);
    }
  };

  const handleLabelSelect = (val: string) => {
    currentLabel.current = val;
    setLabelState(val);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
      {/* MediaPipe Camera and Canvas Feed */}
      <div className="xl:col-span-2 space-y-6">
        <div className="glass rounded-3xl p-5 border border-[var(--glass-border)] bg-[var(--surface)]/50 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Top Panel Bar */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[var(--emerald)]" />
              <span className="text-xs font-semibold text-[var(--text-1)]">
                MediaPipe Landmarks Vision Parser
              </span>
            </div>
            <div className="flex items-center gap-2">
              {modelLoading ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-bold">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading model
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-[var(--emerald)] font-bold">
                  <Sparkles className="w-3 h-3" /> Model Ready
                </span>
              )}
            </div>
          </div>

          {/* Camera Frame */}
          <div className="relative flex-1 flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden min-h-[300px]">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1] absolute inset-0 opacity-70"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />

            {livePrediction && livePrediction.confidence > 0.5 && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-emerald-500/30 text-[10px] text-white font-semibold backdrop-blur-md z-20 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
                Live Sign: {livePrediction.label} ({(livePrediction.confidence * 100).toFixed(0)}%)
              </div>
            )}

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#07070d] z-25">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)] mb-3" />
                <p className="text-sm font-semibold text-[var(--text-2)]">Initializing Camera Stream...</p>
              </div>
            )}
          </div>

          {/* Control Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-3 border-t border-[var(--border)] z-10 w-full">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--text-2)]">Target Label:</span>
                <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-2xl font-black text-[var(--emerald)] shadow-inner">
                  {labelState}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--text-2)]">AI Prediction:</span>
                <div className="w-24 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--emerald)]/20 flex flex-col items-center justify-center shadow-inner">
                  {livePrediction && livePrediction.confidence > 0.5 ? (
                    <>
                      <span className="text-sm font-black text-[var(--emerald)] leading-none">{livePrediction.label}</span>
                      <span className="text-[9px] text-[var(--text-3)] font-mono mt-1">{(livePrediction.confidence * 100).toFixed(0)}%</span>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--text-3)] italic">None</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={triggerSave}
              disabled={savingSample || modelLoading}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingSample ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Database className="w-4.5 h-4.5" /> Capture Dataset Sample
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick select selector bar */}
        <div className="glass rounded-3xl p-5 border border-[var(--glass-border)] space-y-3 bg-[var(--surface)]/20">
          <span className="text-xs font-bold text-[var(--text-2)] block mb-1">
            Quick Select Alphabet Label
          </span>
          <div className="flex flex-wrap gap-1.5">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLabelSelect(letter)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  labelState === letter
                    ? "bg-[var(--emerald)] border-[var(--emerald)] text-black"
                    : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)] hover:border-[var(--emerald)]/40 hover:text-[var(--text-1)]"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions & Session Stats Column */}
      <div className="space-y-6">
        {/* Short Key instructions */}
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/50 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Keyboard className="w-4.5 h-4.5 text-[var(--emerald)]" />
            <h3 className="text-sm font-bold text-[var(--text-1)]">Keyboard Shortcuts</h3>
          </div>
          <ul className="space-y-3 text-xs leading-relaxed text-[var(--text-2)]">
            <li className="flex items-start gap-2.5">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono font-bold text-[var(--text-1)]">
                A - Z
              </span>
              <span>Press any letter key to switch the target classification label instantly.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono font-bold text-[var(--text-1)]">
                Space
              </span>
              <span>Press spacebar to trigger a dataset capture. It parses the current 63-coordinate floating vector and posts it to the database.</span>
            </li>
          </ul>
        </div>

        {/* Current Capture Log */}
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-[var(--emerald)]" />
              <h3 className="text-sm font-bold text-[var(--text-1)]">Session Captures</h3>
            </div>
            <span className="text-[10px] bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 rounded-full text-[var(--text-3)] font-mono font-bold">
              {savedSamples.length} captured
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-3 max-h-72">
            {savedSamples.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-3)]">
                <Database className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-semibold">No samples captured</p>
                <p className="text-[10px] mt-1 leading-relaxed">
                  Hold hand in frame and press Space to record.
                </p>
              </div>
            ) : (
              savedSamples.map((sample, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--border)] animate-fade-in"
                >
                  <div>
                    <span className="text-xs font-bold text-[var(--text-1)]">
                      Label: {sample.label}
                    </span>
                    <span className="block text-[9px] text-[var(--text-3)] mt-0.5">
                      Coordinates: {sample.size} float values
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-3)]">
                    {sample.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
