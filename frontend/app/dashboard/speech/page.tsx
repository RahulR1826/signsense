"use client";

import { useState, useEffect, useRef } from "react";
import { useConversationStore, useNotificationStore } from "@/lib/store";
import { AudioRecorder } from "@/lib/audioRecorder";
import { Mic, MicOff, Play, RotateCcw, Copy, Loader2, Sparkles, Server, Laptop } from "lucide-react";

export default function SpeechRecognitionPage() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [engineMode, setEngineMode] = useState<"browser" | "backend">("backend");
  
  const recognitionRef = useRef<any>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  const addMessage = useConversationStore((s) => s.addMessage);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setSpeechSupported(false);
        setEngineMode("backend"); // force backend if browser doesn't support Web Speech API
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setRecognizing(true);
        addNotification("Voice Listening", "Speech recognition started.", "info");
      };

      rec.onresult = (event: any) => {
        let final = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript((prev) => (prev ? prev + " " + final : final));
          addMessage("Hearing User", final);
          
          // Sync with backend history as well
          fetch("/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ speaker: "Hearing User", text: final })
          }).catch(err => console.error(err));
        }
        setInterimTranscript(interim);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          addNotification("Microphone Blocked", "Please grant microphone permissions.", "error");
        }
      };

      rec.onend = () => {
        setRecognizing(false);
      };

      recognitionRef.current = rec;
    }
  }, [addMessage, addNotification]);

  const toggleSpeech = async () => {
    if (engineMode === "browser") {
      if (!speechSupported) {
        simulateSpeech();
        return;
      }
      if (recognizing) {
        recognitionRef.current?.stop();
      } else {
        setInterimTranscript("");
        try {
          recognitionRef.current?.start();
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      // Backend STT Mode
      if (recognizing) {
        // STOP recording and process
        setRecognizing(false);
        setTranscribing(true);
        if (audioRecorderRef.current) {
          try {
            const blob = await audioRecorderRef.current.stop();
            
            const formData = new FormData();
            formData.append("file", blob, "speech.wav");
            
            const res = await fetch("/api/speech-to-text", {
              method: "POST",
              body: formData
            });
            
            if (res.ok) {
              const data = await res.json();
              if (data.text) {
                setTranscript((prev) => (prev ? prev + " " + data.text : data.text));
                addMessage("Hearing User", data.text);
                addNotification("Speech Decoded", "Transcribed speech successfully.", "success");
                
                // Save to backend conversation history
                await fetch("/api/history", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ speaker: "Hearing User", text: data.text })
                });
              } else {
                addNotification("Capture Warning", "No clear speech detected. Speak louder.", "warning");
              }
            }
          } catch (e) {
            console.error("Backend STT error:", e);
            addNotification("Network Error", "Could not reach backend STT endpoint.", "error");
          } finally {
            setTranscribing(false);
          }
        }
      } else {
        // START recording
        try {
          setInterimTranscript("");
          setRecognizing(true);
          audioRecorderRef.current = new AudioRecorder();
          await audioRecorderRef.current.start();
          addNotification("Voice Recorder Active", "Recording speech for backend AI...", "info");
        } catch (e) {
          setRecognizing(false);
          console.error(e);
          addNotification("Mic Blocked", "Microphone access failed.", "error");
        }
      }
    }
  };

  const simulateSpeech = () => {
    setRecognizing(true);
    addNotification("Simulating Speech", "Adding mock transcriptions to timeline.", "info");
    setTimeout(() => {
      const phrases = [
        "Welcome to the accessibility center.",
        "SignSense automatically translates speech.",
        "Have you practiced your finger spelling today?",
      ];
      const selected = phrases[Math.floor(Math.random() * phrases.length)];
      setTranscript((prev) => (prev ? prev + " " + selected : selected));
      addMessage("Hearing User", selected);
      setRecognizing(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
      {/* Speech input interface */}
      <div className="xl:col-span-2 space-y-6">
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/50 min-h-[380px] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-[var(--emerald)]" />
              <span className="text-xs font-semibold text-[var(--text-1)]">
                Speech to Text Transcription
              </span>
            </div>

            {/* Mode selection HUD */}
            <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
              {speechSupported && (
                <button
                  onClick={() => setEngineMode("browser")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    engineMode === "browser"
                      ? "bg-[var(--emerald)]/10 text-[var(--emerald)] border border-[var(--emerald)]/20"
                      : "text-[var(--text-3)] hover:text-[var(--text-1)]"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" /> Browser API
                </button>
              )}
              <button
                onClick={() => setEngineMode("backend")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  engineMode === "backend"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/35"
                    : "text-[var(--text-3)] hover:text-[var(--text-1)]"
                }`}
              >
                <Server className="w-3.5 h-3.5" /> Backend AI
              </button>
            </div>
          </div>

          <div className="flex-1 my-6 flex flex-col justify-center items-center relative min-h-[160px]">
            {recognizing && (
              <div className="absolute flex items-center justify-center gap-1.5 mb-28">
                <div className={`w-1.5 h-6 rounded-full animate-bounce ${engineMode === "browser" ? "bg-[var(--emerald)]" : "bg-blue-400"}`} style={{ animationDelay: "0.1s" }} />
                <div className={`w-1.5 h-10 rounded-full animate-bounce ${engineMode === "browser" ? "bg-[var(--emerald)]" : "bg-blue-400"}`} style={{ animationDelay: "0.3s" }} />
                <div className={`w-1.5 h-8 rounded-full animate-bounce ${engineMode === "browser" ? "bg-[var(--emerald)]" : "bg-blue-400"}`} style={{ animationDelay: "0.2s" }} />
                <div className={`w-1.5 h-12 rounded-full animate-bounce ${engineMode === "browser" ? "bg-[var(--emerald)]" : "bg-blue-400"}`} style={{ animationDelay: "0.4s" }} />
                <div className={`w-1.5 h-7 rounded-full animate-bounce ${engineMode === "browser" ? "bg-[var(--emerald)]" : "bg-blue-400"}`} style={{ animationDelay: "0.5s" }} />
              </div>
            )}

            {transcribing && (
              <div className="absolute flex flex-col items-center justify-center gap-2 mb-20 text-blue-400">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-wider">FastAPI transcription...</span>
              </div>
            )}

            <div className="text-center max-w-md px-4 mt-6">
              {engineMode === "browser" && interimTranscript && (
                <p className="text-sm text-[var(--emerald)] font-medium italic animate-pulse mb-2">
                  "{interimTranscript}"
                </p>
              )}
              <p className="text-lg font-bold text-[var(--text-1)] leading-relaxed">
                {transcript || (
                  <span className="text-[var(--text-3)] font-normal italic">
                    Press "Listen" and begin speaking. Your voice will transcribe here in real time.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
            <button
              onClick={toggleSpeech}
              disabled={transcribing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                recognizing
                  ? "bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30"
                  : engineMode === "browser"
                  ? "btn-primary"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
              }`}
            >
              {recognizing ? (
                <>
                  <MicOff className="w-4.5 h-4.5" /> Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4.5 h-4.5" /> Start Listening
                </>
              )}
            </button>

            {transcript && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcript);
                    addNotification("Copied", "Transcription copied to clipboard.", "success");
                  }}
                  className="btn-ghost flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-4 h-4" /> Copy Text
                </button>
                <button
                  onClick={() => setTranscript("")}
                  className="btn-ghost flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-red-400 hover:bg-red-500/10"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="space-y-6">
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] bg-[var(--surface)]/50 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Sparkles className="w-4.5 h-4.5 text-[var(--emerald)]" />
            <h3 className="text-sm font-bold text-[var(--text-1)]">Transcription Modes</h3>
          </div>
          <div className="space-y-3.5 text-xs text-[var(--text-2)] leading-relaxed">
            <div>
              <span className="font-bold text-[var(--text-1)] block mb-0.5">Browser API Mode:</span>
              Uses local speech engine. Free and unlimited, but requires Chrome or webkit-compatible browsers.
            </div>
            <div>
              <span className="font-bold text-blue-400 block mb-0.5">Backend AI Mode:</span>
              Uses the FastAPI server's audio parser. Works on any browser (including Safari and Firefox) by capturing raw WAV microphone records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
