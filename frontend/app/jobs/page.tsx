"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Search, MapPin, Briefcase, DollarSign, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Dummy Data
const dummyJobs = [
  {
    id: 1,
    title: "Senior React Engineer",
    company: "TechNova Inc.",
    location: "Remote",
    salary: "$130k - $160k",
    probability: 92,
    tags: ["React", "TypeScript", "Next.js"],
    description: "Looking for an experienced engineer to lead our frontend product."
  },
  {
    id: 2,
    title: "Fullstack JavaScript Developer",
    company: "FinStream",
    location: "New York, NY",
    salary: "$110k - $140k",
    probability: 85,
    tags: ["Node.js", "React", "PostgreSQL"],
    description: "Build robust fintech applications handling millions of transactions."
  },
  {
    id: 3,
    title: "Frontend UI/UX Developer",
    company: "Creative Blocks",
    location: "San Francisco, CA",
    salary: "$100k - $130k",
    probability: 78,
    tags: ["CSS", "Framer Motion", "React"],
    description: "Design and implement beautiful pixel-perfect user interfaces."
  },
  {
    id: 4,
    title: "Junior Web Developer",
    company: "Startup Co.",
    location: "Austin, TX (Hybrid)",
    salary: "$70k - $90k",
    probability: 99,
    tags: ["HTML", "JavaScript", "React"],
    description: "Great entry level position to learn and grow your skills rapidly."
  }
];

export default function JobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredJobs = dummyJobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden flex flex-col">
      {/* Background gradients */}
      <div className="absolute top-[0%] right-[0%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      
      <header className="relative z-10 flex items-center justify-between mb-12 w-full max-w-6xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Dashboard
        </button>
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Job Search
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto relative z-10">
        
        {/* Search Bar */}
        <div className="relative mb-12 max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by role, skills, or job description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-zinc-600 backdrop-blur-xl"
          />
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <span className="text-sm text-zinc-400">Based on your Resume Score (85/100)</span>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job, idx) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-zinc-800/40 transition-colors group cursor-pointer relative overflow-hidden"
            >
              {/* Match Probability Badge */}
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-white/5">
                <Target size={16} className={job.probability >= 90 ? "text-green-400" : job.probability >= 80 ? "text-blue-400" : "text-yellow-400"} />
                <span className="text-sm font-semibold">{job.probability}% Match</span>
              </div>

              <h3 className="text-2xl font-bold mb-1 pr-32">{job.title}</h3>
              <p className="text-zinc-400 mb-6">{job.company}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
                  <MapPin size={16} className="text-zinc-500" /> {job.location}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
                  <DollarSign size={16} className="text-zinc-500" /> {job.salary}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
                  <Briefcase size={16} className="text-zinc-500" /> Full-time
                </div>
              </div>

              <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{job.description}</p>

              <div className="flex items-center gap-2">
                {job.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300">
                    {tag}
                  </span>
                ))}
              </div>

            </motion.div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-20 text-zinc-500 border border-dashed border-white/10 rounded-3xl">
              <Search size={40} className="mx-auto mb-4 opacity-50" />
              <p>No jobs found matching your description.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
