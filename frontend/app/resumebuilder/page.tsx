'use client';

import { useState } from 'react';

const STEPS = ['Personal', 'Summary & Skills', 'Experience', 'Projects', 'Education'];

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-gray-400';
const labelClass = 'block text-xs font-medium text-gray-500 mb-1';
const sectionCardClass = 'border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative';

export default function AtsResumeBuilder() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    name: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    location: '',
    summary: '',
    skills: '',
    experience: [{ role: '', company: '', location: '', duration: '', points: '' }],
    projects: [{ name: '', url: '', points: '' }],
    education: [{ degree: '', institution: '', duration: '', location: '' }],
  });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNestedChange = (index: number, field: string, value: string, section: string) => {
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
      skills: form.skills.split(',').map((s: string) => s.trim()),
      experience: form.experience.map((exp: any) => ({ ...exp, points: exp.points.split('\n') })),
      projects: form.projects.map((proj: any) => ({ ...proj, points: proj.points.split('\n') })),
    };
    try {
      const res = await fetch('/resumebuilder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await res.json();
      alert('Resume generated successfully!');
    } catch {
      alert('Error generating resume');
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-medium mb-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            ATS Optimized
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Resume Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Build a professional, ATS-friendly resume in minutes</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 px-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                  ${i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-white text-gray-400 border border-gray-200'}`}
              >
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${i === step ? 'text-indigo-600' : 'text-gray-400'}`}>{s}</span>
            </button>
          ))}
          {/* Connector lines */}
          <style>{`
            .step-connector { position: absolute; top: 16px; left: 0; right: 0; height: 1px; background: #e5e7eb; z-index: 0; }
          `}</style>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">{STEPS[step]}</h2>

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input className={inputClass} name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
                </div>
                <div>
                  <label className={labelClass}>Job Title *</label>
                  <input className={inputClass} name="title" placeholder="Software Engineer" value={form.title} onChange={handleChange} />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input className={inputClass} name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} name="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn URL</label>
                  <input className={inputClass} name="linkedin" placeholder="linkedin.com/in/johndoe" value={form.linkedin} onChange={handleChange} />
                </div>
                <div>
                  <label className={labelClass}>GitHub URL</label>
                  <input className={inputClass} name="github" placeholder="github.com/johndoe" value={form.github} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} name="location" placeholder="City, State, Country" value={form.location} onChange={handleChange} />
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
                  placeholder="Results-driven software engineer with 5+ years of experience building scalable web applications..."
                  value={form.summary}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-400 mt-1">Tip: Keep it 3–5 sentences and keyword-rich for ATS.</p>
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
                <p className="text-xs text-gray-400 mt-1">Separate each skill with a comma.</p>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-4">
              {form.experience.map((exp: any, i: number) => (
                <div key={i} className={sectionCardClass}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Position {i + 1}</span>
                    {form.experience.length > 1 && (
                      <button onClick={() => removeItem('experience', i)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Role</label>
                      <input className={inputClass} placeholder="Senior Engineer" value={exp.role} onChange={e => handleNestedChange(i, 'role', e.target.value, 'experience')} />
                    </div>
                    <div>
                      <label className={labelClass}>Company</label>
                      <input className={inputClass} placeholder="Acme Corp" value={exp.company} onChange={e => handleNestedChange(i, 'company', e.target.value, 'experience')} />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input className={inputClass} placeholder="San Francisco, CA" value={exp.location} onChange={e => handleNestedChange(i, 'location', e.target.value, 'experience')} />
                    </div>
                    <div>
                      <label className={labelClass}>Duration</label>
                      <input className={inputClass} placeholder="Jan 2021 – Present" value={exp.duration} onChange={e => handleNestedChange(i, 'duration', e.target.value, 'experience')} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Key Achievements / Bullet Points</label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={4}
                      placeholder={"Built REST APIs used by 100k+ users\nReduced page load time by 40%\nLed team of 5 engineers"}
                      value={exp.points}
                      onChange={e => handleNestedChange(i, 'points', e.target.value, 'experience')}
                    />
                    <p className="text-xs text-gray-400 mt-1">One bullet point per line. Start with action verbs.</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem('experience', { role: '', company: '', location: '', duration: '', points: '' })}
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
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Project {i + 1}</span>
                    {form.projects.length > 1 && (
                      <button onClick={() => removeItem('projects', i)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Project Name</label>
                      <input className={inputClass} placeholder="My Awesome App" value={proj.name} onChange={e => handleNestedChange(i, 'name', e.target.value, 'projects')} />
                    </div>
                    <div>
                      <label className={labelClass}>URL / GitHub Link</label>
                      <input className={inputClass} placeholder="github.com/user/project" value={proj.url} onChange={e => handleNestedChange(i, 'url', e.target.value, 'projects')} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description / Highlights</label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={4}
                      placeholder={"Built with React and Node.js\nProcesses 10k daily active users\nDeployed on AWS with CI/CD pipeline"}
                      value={proj.points}
                      onChange={e => handleNestedChange(i, 'points', e.target.value, 'projects')}
                    />
                    <p className="text-xs text-gray-400 mt-1">One bullet per line. Mention tech stack and impact.</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem('projects', { name: '', url: '', points: '' })}
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
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Degree {i + 1}</span>
                    {form.education.length > 1 && (
                      <button onClick={() => removeItem('education', i)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Degree / Certification</label>
                      <input className={inputClass} placeholder="B.S. Computer Science" value={edu.degree} onChange={e => handleNestedChange(i, 'degree', e.target.value, 'education')} />
                    </div>
                    <div>
                      <label className={labelClass}>Institution</label>
                      <input className={inputClass} placeholder="MIT" value={edu.institution} onChange={e => handleNestedChange(i, 'institution', e.target.value, 'education')} />
                    </div>
                    <div>
                      <label className={labelClass}>Duration</label>
                      <input className={inputClass} placeholder="2016 – 2020" value={edu.duration} onChange={e => handleNestedChange(i, 'duration', e.target.value, 'education')} />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input className={inputClass} placeholder="Cambridge, MA" value={edu.location} onChange={e => handleNestedChange(i, 'location', e.target.value, 'education')} />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem('education', { degree: '', institution: '', duration: '', location: '' })}
                className="w-full py-2.5 border border-dashed border-indigo-300 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 transition font-medium"
              >
                + Add Another Degree
              </button>

              {/* Summary preview before submitting */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Ready to generate</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-indigo-900">
                  <span>✓ {form.name || 'Name not filled'}</span>
                  <span>✓ {form.experience.length} experience{form.experience.length > 1 ? 's' : ''}</span>
                  <span>✓ {form.projects.length} project{form.projects.length > 1 ? 's' : ''}</span>
                  <span>✓ {form.education.length} education entr{form.education.length > 1 ? 'ies' : 'y'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm transition"
            >
              ← Back
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={() => setStep(s => s + 1)}
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
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Resume'
              )}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Your data is never stored. Resume is generated on demand.
        </p>
      </div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';

// const STEPS = ['Personal', 'Summary & Skills', 'Experience', 'Projects', 'Education'];

// const inputClass =
//   'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-gray-400';
// const labelClass = 'block text-xs font-medium text-gray-500 mb-1';
// const sectionCardClass = 'border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative';

// export default function AtsResumeBuilder() {
//   const [step, setStep] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState<any>({
//     name: '',
//     title: '',
//     email: '',
//     phone: '',
//     linkedin: '',
//     github: '',
//     location: '',
//     summary: '',
//     skills: '',
//     experience: [{ role: '', company: '', location: '', duration: '', points: '' }],
//     projects: [{ name: '', url: '', points: '' }],
//     education: [{ degree: '', institution: '', duration: '', location: '' }],
//   });

//   const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleNestedChange = (index: number, field: string, value: string, section: string) => {
//     const updated = [...form[section]];
//     updated[index][field] = value;
//     setForm({ ...form, [section]: updated });
//   };

//   const addItem = (section: string, template: any) =>
//     setForm({ ...form, [section]: [...form[section], template] });

//   const removeItem = (section: string, index: number) => {
//     if (form[section].length === 1) return;
//     const updated = form[section].filter((_: any, i: number) => i !== index);
//     setForm({ ...form, [section]: updated });
//   };

//   const handleSubmit = async () => {
//     setLoading(true);

//     const payload = {
//       ...form,
//       skills: form.skills.split(',').map((s: string) => s.trim()),
//       experience: form.experience.map((exp: any) => ({
//         ...exp,
//         points: exp.points.split('\n'),
//       })),
//       projects: form.projects.map((proj: any) => ({
//         ...proj,
//         points: proj.points.split('\n'),
//       })),
//     };

//     try {
//       const res = await fetch('/resumebuilder', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       await res.json();
//       alert('Resume generated successfully!');
//     } catch {
//       alert('Error generating resume');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isLastStep = step === STEPS.length - 1;

//   return (
//     <div className="min-h-screen bg-gray-100 flex">

//       {/* LEFT SIDE FORM */}
//       <div className="w-full lg:w-1/2 overflow-y-auto p-6">
//         <div className="max-w-2xl mx-auto">

//           {/* HEADER */}
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">ATS Resume Builder</h1>
//             <p className="text-sm text-gray-500">Build a clean, recruiter-friendly resume</p>
//           </div>

//           {/* STEP INDICATOR */}
//           <div className="flex justify-between mb-6">
//             {STEPS.map((s, i) => (
//               <button key={i} onClick={() => setStep(i)} className="flex flex-col items-center text-xs">
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
//                   ${i <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}
//                 >
//                   {i + 1}
//                 </div>
//                 <span className={i === step ? 'text-indigo-600' : 'text-gray-400'}>{s}</span>
//               </button>
//             ))}
//           </div>

//           {/* FORM CARD */}
//           <div className="bg-white p-6 rounded-xl shadow-sm border">

//             {/* STEP 0 */}
//             {step === 0 && (
//               <div className="grid gap-4">
//                 <input className={inputClass} name="name" placeholder="Full Name" onChange={handleChange} />
//                 <input className={inputClass} name="title" placeholder="Job Title" onChange={handleChange} />
//                 <input className={inputClass} name="email" placeholder="Email" onChange={handleChange} />
//                 <input className={inputClass} name="phone" placeholder="Phone" onChange={handleChange} />
//                 <input className={inputClass} name="linkedin" placeholder="LinkedIn" onChange={handleChange} />
//                 <input className={inputClass} name="github" placeholder="GitHub" onChange={handleChange} />
//                 <input className={inputClass} name="location" placeholder="Location" onChange={handleChange} />
//               </div>
//             )}

//             {/* STEP 1 */}
//             {step === 1 && (
//               <div className="space-y-4">
//                 <textarea className={inputClass} name="summary" placeholder="Summary" onChange={handleChange} />
//                 <textarea className={inputClass} name="skills" placeholder="Skills (comma separated)" onChange={handleChange} />
//               </div>
//             )}

//             {/* EXPERIENCE */}
//             {step === 2 && (
//               <div className="space-y-4">
//                 {form.experience.map((exp: any, i: number) => (
//                   <div key={i} className={sectionCardClass}>
//                     <input className={inputClass} placeholder="Role" onChange={(e) => handleNestedChange(i, 'role', e.target.value, 'experience')} />
//                     <input className={inputClass} placeholder="Company" onChange={(e) => handleNestedChange(i, 'company', e.target.value, 'experience')} />
//                     <input className={inputClass} placeholder="Duration" onChange={(e) => handleNestedChange(i, 'duration', e.target.value, 'experience')} />
//                     <textarea className={inputClass} placeholder="Points (one per line)" onChange={(e) => handleNestedChange(i, 'points', e.target.value, 'experience')} />
//                   </div>
//                 ))}
//                 <button onClick={() => addItem('experience', { role: '', company: '', duration: '', points: '' })}>
//                   + Add Experience
//                 </button>
//               </div>
//             )}

//             {/* PROJECTS */}
//             {step === 3 && (
//               <div className="space-y-4">
//                 {form.projects.map((proj: any, i: number) => (
//                   <div key={i} className={sectionCardClass}>
//                     <input className={inputClass} placeholder="Project Name" onChange={(e) => handleNestedChange(i, 'name', e.target.value, 'projects')} />
//                     <input className={inputClass} placeholder="URL" onChange={(e) => handleNestedChange(i, 'url', e.target.value, 'projects')} />
//                     <textarea className={inputClass} placeholder="Points" onChange={(e) => handleNestedChange(i, 'points', e.target.value, 'projects')} />
//                   </div>
//                 ))}
//                 <button onClick={() => addItem('projects', { name: '', url: '', points: '' })}>
//                   + Add Project
//                 </button>
//               </div>
//             )}

//             {/* EDUCATION */}
//             {step === 4 && (
//               <div className="space-y-4">
//                 {form.education.map((edu: any, i: number) => (
//                   <div key={i} className={sectionCardClass}>
//                     <input className={inputClass} placeholder="Degree" onChange={(e) => handleNestedChange(i, 'degree', e.target.value, 'education')} />
//                     <input className={inputClass} placeholder="Institution" onChange={(e) => handleNestedChange(i, 'institution', e.target.value, 'education')} />
//                     <input className={inputClass} placeholder="Duration" onChange={(e) => handleNestedChange(i, 'duration', e.target.value, 'education')} />
//                   </div>
//                 ))}
//                 <button onClick={() => addItem('education', { degree: '', institution: '', duration: '' })}>
//                   + Add Education
//                 </button>
//               </div>
//             )}

//           </div>

//           {/* NAVIGATION */}
//           <div className="flex gap-3 mt-4">
//             {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
//             {!isLastStep ? (
//               <button onClick={() => setStep(step + 1)}>Next</button>
//             ) : (
//               <button onClick={handleSubmit}>{loading ? 'Generating...' : 'Generate Resume'}</button>
//             )}
//           </div>

//         </div>
//       </div>

//       {/* RIGHT SIDE LIVE PREVIEW */}
//       <div className="hidden lg:block w-1/2 bg-gray-200 p-6 overflow-y-auto">
//         <div className="bg-white shadow-lg mx-auto p-8 max-w-[700px] text-sm">

//           <h1 className="text-xl font-bold">{form.name || 'Your Name'}</h1>
//           <p className="text-gray-600">{form.title}</p>

//           <p className="text-xs text-gray-500 mt-1">
//             {[form.email, form.phone, form.linkedin, form.github, form.location]
//               .filter(Boolean)
//               .join(' | ')}
//           </p>

//           {form.summary && (
//             <div className="mt-4">
//               <h2 className="text-xs font-bold border-b">SUMMARY</h2>
//               <p>{form.summary}</p>
//             </div>
//           )}

//           {form.skills && (
//             <div className="mt-4">
//               <h2 className="text-xs font-bold border-b">SKILLS</h2>
//               <p>{form.skills}</p>
//             </div>
//           )}

//           {form.experience.map((exp: any, i: number) => (
//             <div key={i} className="mt-4">
//               <h2 className="text-xs font-bold border-b">EXPERIENCE</h2>
//               <p className="font-semibold">{exp.role}</p>
//               <p className="text-xs">{exp.company}</p>
//               <ul className="list-disc ml-4 text-xs">
//                 {exp.points?.split('\n').map((p: string, idx: number) => (
//                   <li key={idx}>{p}</li>
//                 ))}
//               </ul>
//             </div>
//           ))}

//         </div>
//       </div>
//     </div>
//   );
// }