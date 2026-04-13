"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, PhoneOff, Bot, User, Clock,
  Volume2, VolumeX, Activity, CheckCircle, XCircle,
  BarChart2, ChevronRight, Sparkles
} from "lucide-react";

// ─── SSR-safe globals ──────────────────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// ─── Utility: format seconds as MM:SS ─────────────────────────────────────
const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const AUTH_COOKIE_NAME = "hiresense_token";

type TranscriptMessage = {
  role: "ai" | "user";
  text: string;
};

type InterviewReport = {
  technicalScore: number;
  communicationScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

const getCookieValue = (name: string): string => {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

// ─── Waveform bars ─────────────────────────────────────────────────────────
function Waveform({ active, color = "#6366f1" }: { active: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          animate={active ? { scaleY: [0.3, 1.4, 0.3] } : { scaleY: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.07, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 3, height: 20, borderRadius: 99,
            background: color, transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

// ─── Orbiting glow ring around AI avatar ──────────────────────────────────
function AiRing({ speaking }: { speaking: boolean }) {
  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      {speaking && (
        <>
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: "absolute", inset: -20, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", inset: -6, borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "#6366f1",
              borderRightColor: "rgba(99,102,241,0.3)",
            }}
          />
        </>
      )}
      <div style={{
        width: 180, height: 180, borderRadius: "50%",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        border: "2px solid rgba(99,102,241,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
      }}>
        <Bot size={72} color="#818cf8" />
        {speaking && (
          <motion.div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)" }}>
            <Waveform active={speaking} color="#818cf8" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── User tile ─────────────────────────────────────────────────────────────
function UserTile({ recording, muted }: { recording: boolean; muted: boolean }) {
  return (
    <div style={{
      position: "absolute", bottom: 20, right: 20,
      width: 160, height: 110, borderRadius: 14,
      background: "linear-gradient(135deg, #111827, #1f2937)",
      border: "1.5px solid rgba(255,255,255,0.1)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 8,
      overflow: "hidden", zIndex: 10,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg, #374151, #4b5563)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <User size={22} color="#9ca3af" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {recording && !muted
          ? <Waveform active color="#34d399" />
          : <span style={{ fontSize: 11, color: "#6b7280" }}>You</span>
        }
      </div>
      {muted && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(239,68,68,0.9)", borderRadius: "50%",
          width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <MicOff size={10} color="white" />
        </div>
      )}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "3px 8px", background: "rgba(0,0,0,0.5)",
        fontSize: 10, color: "#d1d5db", textAlign: "center",
      }}>
        Candidate
      </div>
    </div>
  );
}

// ─── Transcript bubble ─────────────────────────────────────────────────────
function Bubble({ role, text }: { role: "ai" | "user"; text: string }) {
  const isAi = role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", justifyContent: isAi ? "flex-start" : "flex-end", marginBottom: 10 }}
    >
      <div style={{
        maxWidth: "78%", padding: "10px 14px",
        borderRadius: isAi ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        background: isAi ? "rgba(99,102,241,0.12)" : "rgba(55,65,81,0.7)",
        border: `1px solid ${isAi ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)"}`,
        fontSize: 13, color: "#e5e7eb", lineHeight: 1.5,
      }}>
        <span style={{ fontSize: 10, color: isAi ? "#818cf8" : "#6b7280", display: "block", marginBottom: 4 }}>
          {isAi ? "AI Interviewer" : "You"}
        </span>
        {text}
      </div>
    </motion.div>
  );
}

// ─── Score ring ────────────────────────────────────────────────────────────
function ScoreRing({ value, max = 5, label, color }: { value: number; max?: number; label: string; color: string }) {
  const pct = (value / max) * 100;
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <motion.circle
          cx={44} cy={44} r={r} fill="none"
          stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "44px 44px", transform: "rotate(-90deg)" }}
        />
        <text x={44} y={44} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize={16} fontWeight={600}>{value}/{max}</text>
      </svg>
      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{label}</p>
    </div>
  );
}

// ─── Report screen ─────────────────────────────────────────────────────────
function ReportScreen({ report, onRestart }: { report: InterviewReport; onRestart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ minHeight: "100vh", background: "#030712", padding: "40px 24px", color: "white", fontFamily: "'DM Sans', sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BarChart2 size={22} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif" }}>Interview Report</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>AI-generated performance analysis</p>
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "28px 24px", marginBottom: 20,
          display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16,
        }}>
          <ScoreRing value={report.technicalScore} label="Technical" color="#6366f1" />
          <ScoreRing value={report.communicationScore} label="Communication" color="#10b981" />
          <ScoreRing value={report.overallScore} label="Overall" color="#f59e0b" />
        </div>
        <Section title="Strengths" icon={<CheckCircle size={16} color="#10b981" />} items={report.strengths} color="#10b981" />
        <Section title="Areas to improve" icon={<XCircle size={16} color="#ef4444" />} items={report.weaknesses} color="#ef4444" />
        <Section title="Suggestions" icon={<Sparkles size={16} color="#f59e0b" />} items={report.suggestions} color="#f59e0b" />
        <button
          onClick={onRestart}
          style={{
            marginTop: 24, width: "100%", padding: "14px", borderRadius: 12,
            border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.15)",
            color: "#818cf8", fontSize: 14, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Start New Interview <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function Section({ title, icon, items, color }: { title: string; icon: React.ReactNode; items: string[]; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "20px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{title}</span>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, marginTop: 6, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: "#d1d5db", lineHeight: 1.6 }}>{item}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Interview Page ───────────────────────────────────────────────────
export default function InterviewPage() {
  const [phase, setPhase] = useState<"idle" | "interview" | "report">("idle");
  const [muted, setMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("Press Start Interview to begin");
  const [userSpeech, setUserSpeech] = useState("");
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [pageError, setPageError] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // FIX: initialize synthRef lazily to avoid SSR crash
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const sessionId = useRef("");
  // FIX: track muted in a ref so callbacks always see the latest value
  const mutedRef = useRef(false);

  // Keep mutedRef in sync with muted state
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // ── SSR-safe synth init ──
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  // ── Timer ──
  useEffect(() => {
    if (phase === "interview") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (phase === "idle") setElapsed(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  // ── Auto-scroll transcript ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // ── TTS ──
  const speak = useCallback((text: string) => {
    if (!volume || !synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const preferred = voices.find((v) =>
      v.name.includes("Google UK English Female") ||
      v.name.includes("Samantha") ||
      v.name.includes("Karen") ||
      v.name.includes("Moira")
    ) || voices[0];
    if (preferred) u.voice = preferred;
    u.rate = 0.92;
    u.pitch = 1.0;
    u.onstart = () => setAiSpeaking(true);
    u.onend = () => setAiSpeaking(false);
    synthRef.current.speak(u);
  }, [volume]);

  // ── Speech recognition setup ──
  useEffect(() => {
    // FIX: guard against SSR and unsupported browsers
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (e: SpeechRecognitionEvent) => {
      const interim = Array.from(e.results).map((res) => res[0].transcript).join(" ");
      setUserSpeech(interim);
      if (e.results[e.results.length - 1].isFinal) {
        const final = e.results[e.results.length - 1][0].transcript;
        setUserSpeech("");
        // FIX: honour muted via ref — don't submit if user is muted
        if (!mutedRef.current) {
          submitAnswerRef.current(final);
        }
      }
    };

    r.onend = () => setRecording(false);
    r.onerror = () => setRecording(false);
    recognitionRef.current = r;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── authenticatedFetch ──
  const authenticatedFetch = useCallback(async (url: string, init?: RequestInit) => {
    const token = getCookieValue(AUTH_COOKIE_NAME);
    if (!token) throw new Error("AUTH_REQUIRED");

    const headers = new Headers(init?.headers || undefined);
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(url, { ...init, headers, credentials: "include" });
    if (response.status === 401) throw new Error("AUTH_REQUIRED");
    return response;
  }, []);

  // ── submitAnswer ──
  const submitAnswer = useCallback(async (answer: string) => {
    if (!answer.trim()) return;
    if (!sessionId.current) {
      setPageError("Interview session not found. Please start a new interview.");
      setPhase("idle");
      return;
    }

    setLoading(true);
    setPageError("");
    setTranscript((t) => [...t, { role: "user", text: answer }]);

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, answer }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      if (data.completed || data.report) {
        setReport(data.report);
        speak("Interview completed. Here is your detailed report.");
        setPhase("report");
        setLoading(false);
        return;
      }

      const next: string = data.nextQuestion || data.question || "";
      const aiText = data.explanation ? `${data.explanation}. ${next}` : next;
      setCurrentQuestion(next);
      setTranscript((t) => [...t, { role: "ai", text: aiText }]);
      speak(aiText);
    } catch (error) {
      
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        window.location.href = "/auth/login?redirect=/interviewcoach";
        return;
      }
      setPageError("We couldn't submit your answer. Please try again.");
    }

    setLoading(false);
  // FIX: speak is now correctly listed as a dependency
  }, [authenticatedFetch, speak]);

  // FIX: keep a stable ref to submitAnswer so the speech recognition handler
  // (set up once in useEffect) always calls the latest version
  const submitAnswerRef = useRef(submitAnswer);
  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  }, [submitAnswer]);

  // ── Start interview ──
  const startInterview = useCallback(async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setPageError("Upload your resume and add a job description before starting.");
      return;
    }

    setPhase("interview");
    setLoading(true);
    setTranscript([]);
    setPageError("");
    setReport(null);
    sessionId.current = "";

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("jobDescription", jobDescription.trim());

      const res = await authenticatedFetch(`${API_BASE_URL}/interview/start-interview`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("START_FAILED");

      const data = await res.json();
      const nextSessionId: string = data.sessionId || data.id || data.session?.id || "";
      const q: string = data.firstQuestion || data.question || data.nextQuestion || "Tell me about yourself.";

      if (!nextSessionId) throw new Error("MISSING_SESSION");

      sessionId.current = nextSessionId;
      setCurrentQuestion(q);
      setTranscript([{ role: "ai", text: q }]);
      speak(q);
    } catch (error) {
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        window.location.href = "/auth/login?redirect=/interviewcoach";
        return;
      }
      setPhase("idle");
      setPageError("We couldn't start the interview. Please check your resume, job description, and login session.");
    }

    setLoading(false);
  }, [authenticatedFetch, jobDescription, resumeFile, speak]);

  // ── Toggle mic ──
  const toggleMic = useCallback(() => {
    if (!recognitionRef.current) return;
    // FIX: also guard against muted state
    if (recording) {
      recognitionRef.current.stop();
    } else if (!loading && !aiSpeaking && !muted) {
      setUserSpeech("");
      recognitionRef.current.start();
      setRecording(true);
    }
  }, [recording, loading, aiSpeaking, muted]);

  // ── End interview ──
  const endInterview = useCallback(() => {
    recognitionRef.current?.stop();
    synthRef.current?.cancel();
    sessionId.current = "";
    setPhase("idle");
    setTranscript([]);
    setCurrentQuestion("Press Start Interview to begin");
    setReport(null);
    setPageError("");
    setRecording(false);
    setAiSpeaking(false);
  }, []);

  // ── Report screen ──
  if (phase === "report" && report) {
    return (
      <ReportScreen
        report={report}
        onRestart={() => {
          sessionId.current = "";
          setReport(null);
          setPhase("idle");
          setTranscript([]);
          setCurrentQuestion("Press Start Interview to begin");
        }}
      />
    );
  }

  const idle = phase === "idle";

  return (
    <div style={{
      minHeight: "100vh", background: "#030712",
      fontFamily: "'DM Sans', sans-serif", color: "white",
      display: "flex", flexDirection: "column",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />

      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(3,7,18,0.9)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>
            AI Interviewer
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {phase === "interview" && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 99, padding: "4px 12px",
            }}>
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }}
              />
              <span style={{ fontSize: 12, color: "#fca5a5" }}>{fmt(elapsed)}</span>
            </div>
          )}
          {phase === "interview" && (
            <button
              onClick={() => setVolume((v) => !v)}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "6px 10px", color: "#9ca3af", cursor: "pointer",
                display: "flex", alignItems: "center",
              }}
            >
              {volume ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden" }}>

        {/* ── Left: AI video tile ── */}
        <div style={{
          flex: idle ? "1 1 100%" : "1 1 55%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          position: "relative",
          background: "linear-gradient(160deg, #0a0e1a 0%, #0f0d1f 100%)",
          transition: "flex 0.4s ease",
          minHeight: "calc(100vh - 60px)",
          padding: 24,
        }}>
          {/* Background grid */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {idle && (
            <div style={{
              width: "100%", maxWidth: 520, marginBottom: 28, padding: 20,
              borderRadius: 18, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", zIndex: 1,
            }}>
              <p style={{ margin: "0 0 14px", fontSize: 14, color: "#cbd5e1" }}>
                Upload your resume and paste the job description to start an authenticated interview session.
              </p>
              <label style={{ display: "block", marginBottom: 10, fontSize: 12, color: "#94a3b8" }}>
                Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                style={{ width: "100%", marginBottom: 14, color: "#e2e8f0" }}
              />
              {resumeFile && (
                <p style={{ margin: "0 0 14px", fontSize: 12, color: "#818cf8" }}>
                  Selected: {resumeFile.name}
                </p>
              )}
              <label style={{ display: "block", marginBottom: 10, fontSize: 12, color: "#94a3b8" }}>
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here"
                rows={5}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  background: "rgba(2,6,23,0.65)", border: "1px solid rgba(148,163,184,0.2)",
                  color: "#e2e8f0", resize: "vertical", outline: "none",
                }}
              />
              {pageError && (
                <p style={{ margin: "12px 0 0", fontSize: 12, color: "#fda4af" }}>{pageError}</p>
              )}
            </div>
          )}

          <AiRing speaking={aiSpeaking || loading} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                marginTop: 28, textAlign: "center", maxWidth: 460,
                padding: "16px 20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 14,
              }}
            >
              {loading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                  <Activity size={13} color="#818cf8" />
                  <span style={{ fontSize: 11, color: "#818cf8" }}>thinking...</span>
                </div>
              )}
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: loading ? "#6b7280" : "#e5e7eb" }}>
                {loading ? "Processing your answer..." : currentQuestion}
              </p>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {aiSpeaking && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 99, padding: "5px 12px",
              }}>
                <Waveform active color="#818cf8" />
                <span style={{ fontSize: 11, color: "#818cf8" }}>AI speaking</span>
              </div>
            )}
            {recording && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 99, padding: "5px 12px",
              }}>
                <Waveform active color="#34d399" />
                <span style={{ fontSize: 11, color: "#34d399" }}>Listening</span>
              </div>
            )}
          </div>

          {userSpeech && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 14, maxWidth: 400, padding: "10px 16px",
                background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)",
                borderRadius: 10, fontSize: 13, color: "#6ee7b7", fontStyle: "italic",
              }}
            >
              "{userSpeech}"
            </motion.div>
          )}

          {phase === "interview" && <UserTile recording={recording} muted={muted} />}

          {phase === "interview" && (
            <div style={{
              position: "absolute", top: 16, left: 16,
              background: "rgba(0,0,0,0.5)", borderRadius: 8,
              padding: "4px 10px", fontSize: 11, color: "#6b7280",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span>🇺🇸</span> English (US)
            </div>
          )}

          {!idle && pageError && (
            <div style={{
              position: "absolute", top: 70, right: 24, maxWidth: 320,
              padding: "10px 12px", borderRadius: 12,
              background: "rgba(127,29,29,0.5)", border: "1px solid rgba(248,113,113,0.3)",
              color: "#fecaca", fontSize: 12,
            }}>
              {pageError}
            </div>
          )}
        </div>

        {/* ── Right panel: transcript ── */}
        {phase === "interview" && (
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
              flex: "0 0 340px", background: "#06090f",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Live Transcript
              </span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
              {transcript.map((m, i) => <Bubble key={i} role={m.role} text={m.text} />)}
              {userSpeech && (
                <div style={{ textAlign: "right", marginBottom: 10 }}>
                  <span style={{
                    display: "inline-block", padding: "8px 12px",
                    borderRadius: "14px 4px 14px 14px",
                    background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)",
                    fontSize: 12, color: "#6ee7b7", fontStyle: "italic",
                  }}>
                    {userSpeech}…
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Bottom control bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        padding: "16px 24px", background: "#030712",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        {phase === "idle" && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={startInterview}
            disabled={loading}
            style={{
              padding: "13px 36px", borderRadius: 12,
              background: loading ? "rgba(107,114,128,0.35)" : "linear-gradient(135deg, #4f46e5, #6366f1)",
              border: "none", color: "white", fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <Mic size={18} /> {loading ? "Starting..." : "Start Interview"}
          </motion.button>
        )}

        {phase === "interview" && (
          <>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setMuted((m) => !m)}
              title={muted ? "Unmute" : "Mute"}
              style={{
                width: 48, height: 48, borderRadius: "50%",
                background: muted ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${muted ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.12)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: muted ? "#fca5a5" : "#9ca3af",
              }}
            >
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={toggleMic}
              disabled={loading || aiSpeaking || muted}
              style={{
                width: 64, height: 64, borderRadius: "50%",
                background: recording
                  ? "rgba(239,68,68,0.9)"
                  : loading || aiSpeaking
                    ? "rgba(107,114,128,0.3)"
                    : "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: loading || aiSpeaking || muted ? "not-allowed" : "pointer",
                position: "relative",
              }}
            >
              {recording && (
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(239,68,68,0.5)" }}
                />
              )}
              {recording
                ? <div style={{ width: 18, height: 18, borderRadius: 3, background: "white" }} />
                : <Mic size={24} color="white" />
              }
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={endInterview}
              style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fca5a5",
              }}
            >
              <PhoneOff size={18} />
            </motion.button>
          </>
        )}
      </div>

      {phase === "interview" && !recording && !aiSpeaking && !loading && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          fontSize: 11, color: "#374151",
        }}>
          Click the microphone to answer
        </div>
      )}
    </div>
  );
}