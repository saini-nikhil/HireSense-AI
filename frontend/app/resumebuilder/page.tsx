"use client";

import { useState, useEffect, useRef } from "react";

const STEPS = [
  "Personal",
  "Summary & Skills",
  "Experience",
  "Projects",
  "Education",
];

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-gray-400";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const sectionCardClass =
  "border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative";

// ─── Resume HTML Template ───────────────────────────────────────────────────

function resumeTemplate(data: any): string {
  const skills: string[] = Array.isArray(data.skills)
    ? data.skills
    : (data.skills || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

  const experience = (data.experience || []).map((exp: any) => ({
    ...exp,
    points: Array.isArray(exp.points)
      ? exp.points
      : (exp.points || "").split("\n").filter(Boolean),
  }));

  const projects = (data.projects || []).map((proj: any) => ({
    ...proj,
    points: Array.isArray(proj.points)
      ? proj.points
      : (proj.points || "").split("\n").filter(Boolean),
  }));

  const education = data.education || [];

  const contactLine = [
    data.email,
    data.phone,
    data.linkedin,
    data.github,
    data.location,
  ]
    .filter(Boolean)
    .join(" &nbsp;|&nbsp; ");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.name} – Resume</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #000;
      margin: 0;
      padding: 32px 40px;
      line-height: 1.5;
    }
    h1 { font-size: 20px; font-weight: bold; margin: 0 0 2px; }
    h2 {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid #ccc;
      padding-bottom: 3px;
      margin: 20px 0 8px;
    }
    p { margin: 0 0 4px; }
    ul { margin: 4px 0 10px; padding-left: 18px; }
    li { margin-bottom: 3px; }
    .subtitle { font-size: 13px; color: #444; margin: 0 0 3px; }
    .contact { font-size: 12px; color: #555; margin: 0 0 20px; }
    .job-header { display: flex; justify-content: space-between; }
    .job-title { font-weight: bold; }
    .company { font-size: 12px; color: #555; margin-bottom: 4px; }
    .dates { font-size: 12px; color: #555; }
  </style>
</head>
<body itemscope itemtype="https://schema.org/Person">

  <h1 itemprop="name">${data.name}</h1>
  <p class="subtitle" itemprop="jobTitle">${data.title}</p>
  <p class="contact">${contactLine}</p>

  <section>
    <h2>Summary</h2>
    <p>${data.summary}</p>
  </section>

  <section>
    <h2>Skills</h2>
    <p>${skills.join(", ")}</p>
  </section>

  <section>
    <h2>Work Experience</h2>
    ${experience
      .map(
        (exp: any) => `
      <article>
        <div class="job-header">
          <span class="job-title">${exp.role}</span>
          <span class="dates">${exp.duration ?? ""}</span>
        </div>
        <p class="company">${exp.company}${exp.location ? ` &nbsp;·&nbsp; ${exp.location}` : ""}</p>
        <ul>
          ${exp.points.map((p: string) => `<li>${p}</li>`).join("")}
        </ul>
      </article>
    `,
      )
      .join("")}
  </section>

  <section>
    <h2>Projects</h2>
    ${projects
      .map(
        (proj: any) => `
      <article>
        <p class="job-title">${proj.name}${proj.url ? ` &nbsp;–&nbsp; <span style="font-weight:normal">${proj.url}</span>` : ""}</p>
        <ul>
          ${proj.points.map((p: string) => `<li>${p}</li>`).join("")}
        </ul>
      </article>
    `,
      )
      .join("")}
  </section>

  <section>
    <h2>Education</h2>
    ${education
      .map(
        (edu: any) => `
      <article>
        <div class="job-header">
          <span class="job-title">${edu.degree} &nbsp;–&nbsp; ${edu.institution}</span>
          <span class="dates">${edu.duration}</span>
        </div>
        ${edu.location ? `<p class="company">${edu.location}</p>` : ""}
      </article>
    `,
      )
      .join("")}
  </section>

</body>
</html>
  `;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AtsResumeBuilder() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [form, setForm] = useState<any>({
    name: "",
    title: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    location: "",
    summary: "",
    skills: "",
    experience: [
      { role: "", company: "", location: "", duration: "", points: "" },
    ],
    projects: [{ name: "", url: "", points: "" }],
    education: [{ degree: "", institution: "", duration: "", location: "" }],
  });

  // Update live preview whenever form changes
  useEffect(() => {
    if (iframeRef.current) {
      const html = resumeTemplate(form);
      iframeRef.current.srcdoc = html;
    }
  }, [form]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNestedChange = (
    index: number,
    field: string,
    value: string,
    section: string,
  ) => {
    const updated = [...form[section]];
    updated[index][field] = value;
    setForm({ ...form, [section]: updated });
  };

  const addItem = (section: string, template: any) =>
    setForm({ ...form, [section]: [...form[section], template] });

  const removeItem = (section: string, index: number) => {
    if (form[section].length === 1) return;
    const updated = form[section].filter((_: any, i: number) => i !== index);
    setForm({ ...form, [section]: updated });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      ...form,
      skills: form.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      experience: form.experience.map((exp: any) => ({
        ...exp,
        points: exp.points.split("\n").filter(Boolean),
      })),
      projects: form.projects.map((proj: any) => ({
        ...proj,
        points: proj.points.split("\n").filter(Boolean),
      })),
    };

    try {
      const res = await fetch("http://localhost:3001/users/resumebuilder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const blob = await res.blob(); // ✅ IMPORTANT

      const url = window.URL.createObjectURL(blob);

      // ✅ Open in new tab
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Error generating resume");
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ── LEFT: FORM ── */}
      <div className="w-full lg:w-1/2 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              ATS Optimized
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Resume Builder
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Build a professional, ATS-friendly resume in minutes
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-4 px-1">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                    ${
                      i < step
                        ? "bg-indigo-600 text-white"
                        : i === step
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                          : "bg-white text-gray-400 border border-gray-200"
                    }`}
                >
                  {i < step ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium hidden sm:block ${i === step ? "text-indigo-600" : "text-gray-400"}`}
                >
                  {s}
                </span>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {STEPS[step]}
            </h2>

            {/* Step 0: Personal Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      className={inputClass}
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Job Title *</label>
                    <input
                      className={inputClass}
                      name="title"
                      placeholder="Software Engineer"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      className={inputClass}
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      className={inputClass}
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>LinkedIn URL</label>
                    <input
                      className={inputClass}
                      name="linkedin"
                      placeholder="https://www.linkedin.com/in/johndoe"
                      value={form.linkedin}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>GitHub URL</label>
                    <input
                      className={inputClass}
                      name="github"
                      placeholder="https://github.com/johndoe"
                      value={form.github}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Location</label>
                    <input
                      className={inputClass}
                      name="location"
                      placeholder="City, State, Country"
                      value={form.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Summary & Skills */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Professional Summary</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    name="summary"
                    rows={5}
                    placeholder="Results-driven software engineer with 5+ years of experience..."
                    value={form.summary}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Tip: Keep it 3–5 sentences and keyword-rich for ATS.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Skills</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    name="skills"
                    rows={3}
                    placeholder="React, TypeScript, Node.js, PostgreSQL, Docker, AWS..."
                    value={form.skills}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate each skill with a comma.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="space-y-4">
                {form.experience.map((exp: any, i: number) => (
                  <div key={i} className={sectionCardClass}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Position {i + 1}
                      </span>
                      {form.experience.length > 1 && (
                        <button
                          onClick={() => removeItem("experience", i)}
                          className="text-xs text-red-400 hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Role</label>
                        <input
                          className={inputClass}
                          placeholder="Senior Engineer"
                          value={exp.role}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "role",
                              e.target.value,
                              "experience",
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Company</label>
                        <input
                          className={inputClass}
                          placeholder="Acme Corp"
                          value={exp.company}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "company",
                              e.target.value,
                              "experience",
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Location</label>
                        <input
                          className={inputClass}
                          placeholder="San Francisco, CA"
                          value={exp.location}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "location",
                              e.target.value,
                              "experience",
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Duration</label>
                        <input
                          className={inputClass}
                          placeholder="Jan 2021 – Present"
                          value={exp.duration}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "duration",
                              e.target.value,
                              "experience",
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Key Achievements / Bullet Points
                      </label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        rows={4}
                        placeholder={
                          "Built REST APIs used by 100k+ users\nReduced page load time by 40%\nLed team of 5 engineers"
                        }
                        value={exp.points}
                        onChange={(e) =>
                          handleNestedChange(
                            i,
                            "points",
                            e.target.value,
                            "experience",
                          )
                        }
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        One bullet point per line. Start with action verbs.
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    addItem("experience", {
                      role: "",
                      company: "",
                      location: "",
                      duration: "",
                      points: "",
                    })
                  }
                  className="w-full py-2.5 border border-dashed border-indigo-300 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 transition font-medium"
                >
                  + Add Another Position
                </button>
              </div>
            )}

            {/* Step 3: Projects */}
            {step === 3 && (
              <div className="space-y-4">
                {form.projects.map((proj: any, i: number) => (
                  <div key={i} className={sectionCardClass}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Project {i + 1}
                      </span>
                      {form.projects.length > 1 && (
                        <button
                          onClick={() => removeItem("projects", i)}
                          className="text-xs text-red-400 hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Project Name</label>
                        <input
                          className={inputClass}
                          placeholder="My Awesome App"
                          value={proj.name}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "name",
                              e.target.value,
                              "projects",
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>URL / GitHub Link</label>
                        <input
                          className={inputClass}
                          placeholder="github.com/user/project"
                          value={proj.url}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "url",
                              e.target.value,
                              "projects",
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Description / Highlights
                      </label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        rows={4}
                        placeholder={
                          "Built with React and Node.js\nProcesses 10k daily active users\nDeployed on AWS with CI/CD pipeline"
                        }
                        value={proj.points}
                        onChange={(e) =>
                          handleNestedChange(
                            i,
                            "points",
                            e.target.value,
                            "projects",
                          )
                        }
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        One bullet per line. Mention tech stack and impact.
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    addItem("projects", { name: "", url: "", points: "" })
                  }
                  className="w-full py-2.5 border border-dashed border-indigo-300 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 transition font-medium"
                >
                  + Add Another Project
                </button>
              </div>
            )}

            {/* Step 4: Education */}
            {step === 4 && (
              <div className="space-y-4">
                {form.education.map((edu: any, i: number) => (
                  <div key={i} className={sectionCardClass}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Degree {i + 1}
                      </span>
                      {form.education.length > 1 && (
                        <button
                          onClick={() => removeItem("education", i)}
                          className="text-xs text-red-400 hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Degree / Certification
                        </label>
                        <input
                          className={inputClass}
                          placeholder="B.S. Computer Science"
                          value={edu.degree}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "degree",
                              e.target.value,
                              "education",
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Institution</label>
                        <input
                          className={inputClass}
                          placeholder="MIT"
                          value={edu.institution}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "institution",
                              e.target.value,
                              "education",
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Duration</label>
                        <input
                          className={inputClass}
                          placeholder="2016 – 2020"
                          value={edu.duration}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "duration",
                              e.target.value,
                              "education",
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Location</label>
                        <input
                          className={inputClass}
                          placeholder="Cambridge, MA"
                          value={edu.location}
                          onChange={(e) =>
                            handleNestedChange(
                              i,
                              "location",
                              e.target.value,
                              "education",
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    addItem("education", {
                      degree: "",
                      institution: "",
                      duration: "",
                      location: "",
                    })
                  }
                  className="w-full py-2.5 border border-dashed border-indigo-300 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 transition font-medium"
                >
                  + Add Another Degree
                </button>

                {/* Summary preview before submitting */}
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
                    Ready to generate
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-indigo-900">
                    <span>✓ {form.name || "Name not filled"}</span>
                    <span>
                      ✓ {form.experience.length} experience
                      {form.experience.length > 1 ? "s" : ""}
                    </span>
                    <span>
                      ✓ {form.projects.length} project
                      {form.projects.length > 1 ? "s" : ""}
                    </span>
                    <span>
                      ✓ {form.education.length} education entr
                      {form.education.length > 1 ? "ies" : "y"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-5">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm transition"
              >
                ← Back
              </button>
            )}

            {!isLastStep ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.99] transition shadow-sm"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.99] transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Resume"
                )}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your data is never stored. Resume is generated on demand.
          </p>
        </div>
      </div>

      {/* ── RIGHT: LIVE PREVIEW ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col bg-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-xs font-medium text-gray-500">
            Live Preview
          </span>
        </div>
        <iframe
          ref={iframeRef}
          className="flex-1 w-full bg-white shadow-lg rounded-xl"
          title="Resume Preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
