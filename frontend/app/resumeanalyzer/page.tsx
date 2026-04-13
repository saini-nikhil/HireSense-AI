"use client";

import { useState, useRef, useCallback } from "react";

// ── Animated score ring ──────────────────────────────────────────────
function ScoreRing({
  label,
  value,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  color: string;
  delay?: number;
}) {
  const CIRC = 163;
  const offset = CIRC - (value / 100) * CIRC;

  return (
    <div
      className="relative flex flex-col items-center p-3 rounded-2xl border border-white/[0.07] overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        animation: `slideUp 0.5s ease ${delay}s both`,
      }}
    >
      {/* subtle glow bg */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
      />

      <svg
        width="64"
        height="64"
        viewBox="0 0 58 58"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="29"
          cy="29"
          r="26"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="5"
        />
        <circle
          cx="29"
          cy="29"
          r="26"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{
            animation: `spinIn 1.2s ease ${delay}s both`,
          }}
        />
        {/* counter-rotate text */}
        <text
          x="29"
          y="34"
          textAnchor="middle"
          fontSize="11"
          fontWeight="500"
          fill="#e2e8f0"
          style={{ transform: "rotate(90deg)", transformOrigin: "29px 29px" }}
        >
          {value}%
        </text>
      </svg>
      <p className="text-[11px] text-slate-500 mt-1 relative">{label}</p>
    </div>
  );
}

// ── Pill tag ─────────────────────────────────────────────────────────
function Pill({
  text,
  variant,
}: {
  text: string;
  variant: "green" | "red" | "purple";
}) {
  const styles = {
    green:
      "bg-emerald-400/10 text-emerald-400 border border-emerald-400/25",
    red: "bg-red-400/10 text-red-400 border border-red-400/25",
    purple: "bg-violet-400/10 text-violet-400 border border-violet-400/25",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs m-1 ${styles[variant]}`}
    >
      {text}
    </span>
  );
}

// ── Glass section card ────────────────────────────────────────────────
function Section({
  title,
  titleColor,
  children,
  delay = 0,
}: {
  title: string;
  titleColor: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="rounded-2xl border border-white/[0.07] p-5"
      style={{
        background: "rgba(255,255,255,0.03)",
        animation: `slideUp 0.5s ease ${delay}s both`,
      }}
    >
      <h3 className="text-sm font-medium mb-3" style={{ color: titleColor }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Floating background orbs ──────────────────────────────────────────
function Orbs() {
  return (
    <>
      {[
        { c: "#6366f1", s: 280, t: -80, l: -60, d: 0 },
        { c: "#8b5cf6", s: 220, b: -60, r: -40, d: 2 },
        { c: "#3b82f6", s: 160, t: "40%", l: "30%", d: 1 },
      ].map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: o.s,
            height: o.s,
            background: o.c,
            filter: "blur(70px)",
            opacity: 0.18,
            top: (o as any).t,
            left: (o as any).l,
            bottom: (o as any).b,
            right: (o as any).r,
            animation: `float ${6 + i * 1.5}s ease-in-out infinite ${o.d}s`,
          }}
        />
      ))}
    </>
  );
}

// ── Loading dots ──────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-white rounded-full inline-block"
          style={{ animation: `bounceDot 1.4s ease-in-out infinite ${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function ResumeAnalyzerPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type === "application/pdf") setResume(file);
  }, []);

  const handleSubmit = async () => {
    if (!resume || !jobDesc.trim()) {
      alert("Upload a resume and enter a job description");
      return;
    }
    const formData = new FormData();
    formData.append("file", resume);
    formData.append("jobDescription", jobDesc);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/evaluate", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) { alert("API Error"); return; }
      setData(await res.json());
    } catch {
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const scores = data
    ? [
        { label: "ATS",        value: data.analysis.atsScore,            color: "#818cf8" },
        { label: "Match",      value: data.analysis.matchScore,          color: "#a78bfa" },
        { label: "Skills",     value: data.analysis.skillMatchScore,     color: "#60a5fa" },
        { label: "Experience", value: data.analysis.experienceMatchScore, color: "#34d399" },
        { label: "Education",  value: data.analysis.educationMatchScore, color: "#fbbf24" },
        { label: "Keywords",   value: data.analysis.keywordMatchScore,   color: "#f472b6" },
      ]
    : [];

  return (
    <>
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinIn {
          from { stroke-dashoffset: 220; }
        }
        @keyframes bounceDot {
          0%,80%,100% { transform: scale(0); }
          40%          { transform: scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>

      <div
        className="min-h-screen text-white px-4 py-10 relative overflow-hidden"
        style={{ background: "#0a0a12" }}
      >
        <Orbs />

        <div className="max-w-3xl mx-auto relative">

          {/* ── Header ── */}
          <div className="text-center mb-10" style={{ animation: "slideUp 0.5s ease both" }}>
            <h1
              className="text-4xl font-semibold mb-2"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Resume Analyzer
            </h1>
            <p className="text-sm text-slate-500">
              AI-powered match scoring, gap analysis & interview prep
            </p>
          </div>

          {/* ── Form card ── */}
          <div
            className="rounded-2xl border border-white/10 p-6 mb-8 space-y-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              animation: "slideUp 0.5s ease 0.1s both",
            }}
          >
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300"
              style={{
                borderColor: dragging
                  ? "#8b5cf6"
                  : resume
                  ? "#34d399"
                  : "rgba(139,92,246,0.35)",
                background: dragging
                  ? "rgba(139,92,246,0.1)"
                  : resume
                  ? "rgba(52,211,153,0.05)"
                  : "rgba(139,92,246,0.04)",
              }}
            >
              <div className="text-3xl mb-2">{resume ? "✅" : "📄"}</div>
              <p className="text-sm text-slate-400">
                {resume ? (
                  <span className="text-emerald-400 font-medium">{resume.name}</span>
                ) : (
                  <>
                    <span className="text-violet-400 font-medium">Click to upload</span>{" "}
                    or drag & drop your PDF
                  </>
                )}
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
            />

            {/* Job description */}
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                Job Description
              </label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the job description here…"
                rows={5}
                className="w-full rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none outline-none transition-colors"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#8b5cf6")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium text-white transition-all duration-300 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)",
              }}
            >
              <span
                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                }}
              />
              {loading ? <LoadingDots /> : "Analyze Resume"}
            </button>
          </div>

          {/* ── Results ── */}
          {data && (
            <div className="space-y-4">

              {/* Score rings */}
              <div className="grid grid-cols-3 gap-3">
                {scores.map((s, i) => (
                  <ScoreRing key={i} {...s} delay={i * 0.08} />
                ))}
              </div>

              {/* Summary */}
              <Section title="Summary" titleColor="#a78bfa" delay={0.2}>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {data.analysis.summary}
                </p>
              </Section>

              {/* Skills */}
              <div className="grid md:grid-cols-2 gap-4">
                <Section title="Matched skills" titleColor="#34d399" delay={0.3}>
                  {data.analysis.matchedSkills.map((s: string, i: number) => (
                    <Pill key={i} text={s} variant="green" />
                  ))}
                </Section>

                <Section title="Missing skills" titleColor="#f87171" delay={0.35}>
                  {data.analysis.missingSkills.length === 0 ? (
                    <p className="text-sm text-slate-500">No missing skills 🎉</p>
                  ) : (
                    data.analysis.missingSkills.map((s: string, i: number) => (
                      <Pill key={i} text={s} variant="red" />
                    ))
                  )}
                </Section>
              </div>

              {/* Suggestions */}
              <Section title="Suggestions" titleColor="#fbbf24" delay={0.4}>
                <ul className="space-y-3">
                  {data.analysis.suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-slate-400">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0"
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Interview questions */}
              <Section title="Interview questions" titleColor="#818cf8" delay={0.45}>
                <div className="space-y-3">
                  {data.interview.questions.map((q: string, i: number) => (
                    <div
                      key={i}
                      className="rounded-xl p-3.5 text-sm text-slate-300"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        borderLeft: "2px solid #8b5cf6",
                        border: "0.5px solid rgba(255,255,255,0.07)",
                        borderLeftWidth: 2,
                        borderLeftColor: "#8b5cf6",
                      }}
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </Section>

            </div>
          )}
        </div>
      </div>
    </>
  );
}