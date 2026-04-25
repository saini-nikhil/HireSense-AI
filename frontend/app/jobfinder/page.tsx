"use client";

import { useState, useRef, useCallback } from "react";
import { backendUrl } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────
interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_publisher: string;
  job_employment_type: string;
  job_apply_link: string;
  job_description: string;
  job_is_remote: boolean;
  job_posted_at: string | null;
  job_location: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_period: string | null;
  matchScore: number;
  matchReason: string;
}

// ── Floating grid bg ──────────────────────────────────────────────────
function GridBg() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />
  );
}

// ── Orbs ──────────────────────────────────────────────────────────────
function Orbs() {
  return (
    <>
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: 500, height: 500,
          top: -200, left: -150,
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: 400, height: 400,
          bottom: -100, right: -100,
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
    </>
  );
}

// ── Match score arc ───────────────────────────────────────────────────
function MatchArc({ score }: { score: number }) {
  const color =
    score >= 80 ? "#22d3ee" : score >= 60 ? "#a78bfa" : "#f472b6";
  const CIRC = 163;
  const offset = CIRC - (score / 100) * CIRC;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="52" height="52" viewBox="0 0 58 58" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="29" cy="29" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <circle
          cx="29" cy="29" r="26" fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={offset}
        />
        <text
          x="29" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}
          style={{ transform: "rotate(90deg)", transformOrigin: "29px 29px" }}
        >
          {score}
        </text>
      </svg>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.6)" }}>
        match
      </span>
    </div>
  );
}

// ── Job card ──────────────────────────────────────────────────────────
function JobCard({ job, index }: { job: Job; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    job.matchScore >= 80
      ? { bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)", text: "#22d3ee" }
      : job.matchScore >= 60
      ? { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", text: "#a78bfa" }
      : { bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)", text: "#f472b6" };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 group"
      style={{
        background: "rgba(15,23,42,0.7)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
        animation: `slideUp 0.4s ease ${index * 0.07}s both`,
      }}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${scoreColor.text}55, transparent)`,
        }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex gap-4 items-start">
          {/* Logo */}
          <div
            className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {job.employer_logo ? (
              <img
                src={job.employer_logo}
                alt={job.employer_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    `<span style="font-size:20px">${job.employer_name[0]}</span>`;
                }}
              />
            ) : (
              <span className="text-xl text-slate-400">{job.employer_name[0]}</span>
            )}
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base leading-tight mb-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#e2e8f0",
              }}
            >
              {job.job_title}
            </h3>
            <p className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
              {job.employer_name}
            </p>
          </div>

          {/* Match arc */}
          <MatchArc score={job.matchScore} />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Location */}
          <span
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {job.job_location}
          </span>

          {/* Type */}
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {job.job_employment_type}
          </span>

          {/* Remote */}
          {job.job_is_remote && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              Remote
            </span>
          )}

          {/* Posted */}
          {job.job_posted_at && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {job.job_posted_at}
            </span>
          )}

          {/* Publisher */}
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: scoreColor.bg, color: scoreColor.text, border: `1px solid ${scoreColor.border}` }}
          >
            via {job.job_publisher}
          </span>
        </div>

        {/* Match reason */}
        <div
          className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
          style={{ background: scoreColor.bg, border: `1px solid ${scoreColor.border}` }}
        >
          <span style={{ color: scoreColor.text }}>✦</span>
          <span style={{ color: scoreColor.text }}>{job.matchReason}</span>
        </div>

        {/* Salary */}
        {(job.job_min_salary || job.job_max_salary) && (
          <div className="mt-3 text-sm" style={{ color: "#34d399" }}>
            {job.job_min_salary && job.job_max_salary
              ? `₹${job.job_min_salary.toLocaleString()} – ₹${job.job_max_salary.toLocaleString()}`
              : job.job_min_salary
              ? `From ₹${job.job_min_salary.toLocaleString()}`
              : `Up to ₹${job.job_max_salary?.toLocaleString()}`}
            {job.job_salary_period && (
              <span className="text-xs text-slate-500 ml-1">/ {job.job_salary_period}</span>
            )}
          </div>
        )}

        {/* Description toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-4 text-xs flex items-center gap-1 transition-colors duration-200"
          style={{ color: "rgba(148,163,184,0.5)" }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#94a3b8")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(148,163,184,0.5)")}
        >
          <span>{expanded ? "Hide description" : "View description"}</span>
          <span
            style={{
              display: "inline-block",
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          >
            ▾
          </span>
        </button>

        {expanded && (
          <div
            className="mt-3 text-xs leading-relaxed rounded-xl p-3 whitespace-pre-line"
            style={{
              background: "rgba(0,0,0,0.3)",
              color: "rgba(148,163,184,0.7)",
              border: "1px solid rgba(255,255,255,0.05)",
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {job.job_description}
          </div>
        )}

        {/* Apply button */}
        <a
          href={job.job_apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group/btn"
          style={{
            background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15))",
            border: "1px solid rgba(14,165,233,0.25)",
            color: "#7dd3fc",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "linear-gradient(135deg, rgba(14,165,233,0.25), rgba(99,102,241,0.25))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15))";
          }}
        >
          Apply Now
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-5 h-44"
          style={{
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(255,255,255,0.06)",
            animation: `pulse 1.8s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────
function FilterBar({
  filter,
  setFilter,
  total,
}: {
  filter: string;
  setFilter: (v: string) => void;
  total: number;
}) {
  const options = ["All", "Full-time", "Remote", "High Match"];
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-xs mr-1" style={{ color: "rgba(148,163,184,0.5)" }}>
        {total} jobs found
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setFilter(opt)}
          className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
          style={{
            background: filter === opt ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)",
            border: filter === opt ? "1px solid rgba(14,165,233,0.35)" : "1px solid rgba(255,255,255,0.07)",
            color: filter === opt ? "#7dd3fc" : "rgba(148,163,184,0.6)",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function JobFinderPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type === "application/pdf") setResume(file);
  }, []);

  const handleSubmit = async () => {
    if (!resume || !jobDesc.trim() || !location.trim()) {
      setError("Please fill in all fields and upload your resume.");
      return;
    }
    setError("");
    const formData = new FormData();
    formData.append("file", resume);
    formData.append("jobDescription", jobDesc);
    formData.append("location", location);

    try {
      setLoading(true);
      setJobs(null);
      const res = await fetch(backendUrl("/webscraper/jobs"), {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setError("API returned an error. Please try again.");
        return;
      }
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs ?? []);
    } catch {
      setError("Could not connect to the server. Make sure it's running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = (jobs ?? []).filter((j) => {
    if (filter === "Full-time") return j.job_employment_type === "Full-time";
    if (filter === "Remote") return j.job_is_remote;
    if (filter === "High Match") return j.matchScore >= 80;
    return true;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        * { box-sizing: border-box; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div
        className="min-h-screen text-white relative"
        style={{
          background: "#060b14",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <GridBg />
        <Orbs />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">

          {/* ── Header ── */}
          <div className="mb-12 text-center" style={{ animation: "slideUp 0.5s ease both" }}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6"
              style={{
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.2)",
                color: "#38bdf8",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }}
              />
              AI-Powered Job Matching
            </div>

            <h1
              className="text-5xl font-bold mb-3 leading-tight"
              style={{
                fontFamily: "'Syne', sans-serif",
                background: "linear-gradient(135deg, #e2e8f0 0%, #7dd3fc 50%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Find Your Next Role
            </h1>
            <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
              Upload your resume, describe what you&apos;re looking for, and let AI find the best matches.
            </p>
          </div>

          {/* ── Form ── */}
          <div
            className="rounded-3xl p-6 mb-8 space-y-5"
            style={{
              background: "rgba(15,23,42,0.6)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              animation: "slideUp 0.5s ease 0.1s both",
            }}
          >
            {/* Section label */}
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.4)" }}>
              Search Parameters
            </p>

            {/* Resume drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className="rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all duration-300"
              style={{
                borderColor: dragging
                  ? "#38bdf8"
                  : resume
                  ? "#34d399"
                  : "rgba(14,165,233,0.2)",
                background: dragging
                  ? "rgba(14,165,233,0.06)"
                  : resume
                  ? "rgba(52,211,153,0.04)"
                  : "rgba(14,165,233,0.02)",
              }}
            >
              <div className="text-3xl mb-2">{resume ? "✅" : "📄"}</div>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
                {resume ? (
                  <span style={{ color: "#4ade80", fontWeight: 500 }}>{resume.name}</span>
                ) : (
                  <>
                    <span style={{ color: "#38bdf8", fontWeight: 500 }}>Click to upload</span>{" "}
                    or drag & drop — PDF only
                  </>
                )}
              </p>
              {resume && (
                <button
                  onClick={(e) => { e.stopPropagation(); setResume(null); }}
                  className="mt-2 text-xs"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  Remove ✕
                </button>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
            />

            {/* Location + Job Desc in a two-column layout */}
            <div className="grid md:grid-cols-5 gap-4">
              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-xs mb-1.5 uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.4)" }}>
                  Location
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(148,163,184,0.4)" strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. New Delhi, India"
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#e2e8f0",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
              </div>

              {/* Job description */}
              <div className="md:col-span-3">
                <label className="block text-xs mb-1.5 uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.4)" }}>
                  Job Description / Role
                </label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the job description or describe the role you're targeting…"
                  rows={4}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-colors"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e2e8f0",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-300 relative overflow-hidden group flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? "rgba(14,165,233,0.1)"
                  : "linear-gradient(135deg, #0ea5e9, #6366f1)",
                border: "1px solid rgba(14,165,233,0.3)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Searching jobs…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Find Matching Jobs
                </>
              )}
            </button>
          </div>

          {/* ── Loading ── */}
          {loading && <Skeleton />}

          {/* ── Results ── */}
          {jobs && !loading && (
            <div style={{ animation: "fadeIn 0.4s ease both" }}>
              <FilterBar filter={filter} setFilter={setFilter} total={jobs.length} />

              {filteredJobs.length === 0 ? (
                <div
                  className="text-center py-20 rounded-2xl"
                  style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
                >
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>
                    No jobs match the selected filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job, i) => (
                    <JobCard key={job.job_id} job={job} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Empty state (before first search) ── */}
          {!jobs && !loading && (
            <div
              className="text-center py-20 rounded-3xl"
              style={{
                border: "1px dashed rgba(255,255,255,0.05)",
                background: "rgba(15,23,42,0.3)",
              }}
            >
              <div className="text-5xl mb-4">🚀</div>
              <p className="font-medium mb-1" style={{ color: "rgba(148,163,184,0.5)", fontFamily: "'Syne', sans-serif" }}>
                Ready to launch your job search
              </p>
              <p className="text-xs" style={{ color: "rgba(148,163,184,0.3)" }}>
                Fill in the form above and hit Find Matching Jobs
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}