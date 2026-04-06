"use client";

import { motion } from "framer-motion";
import { UploadCloud, Bot, Search, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const nestUrl = process.env.NEXT_PUBLIC_NEST_URL;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsUploading(true);
      
      // Simulate backend delay then show score
      setTimeout(() => {
        setIsUploading(false);
        setScore(85); // Simulated score
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none" />

      <main className="max-w-6xl mx-auto relative z-10 pt-6">
        <header className="mb-16 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-2">
              Welcome back, Candidate
            </h1>
            <p className="text-zinc-400 text-lg">Your intelligent career assistant is ready.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/login')} className="text-sm text-zinc-400 hover:text-white transition-colors">Logout</button>
            <div className="h-12 w-12 rounded-full border border-white/10 overflow-hidden bg-zinc-800 flex items-center justify-center shadow-lg">
              <span className="font-bold text-zinc-300">C</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Upload Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[450px] shadow-2xl relative overflow-hidden"
          >
            {score === null ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-inner">
                  <UploadCloud size={40} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Upload your Resume</h2>
                <p className="text-zinc-400 mb-8 max-w-md text-center">
                  Drag and drop your PDF resume here, or click to browse. We'll analyze it using our AI engine. {nestUrl && <span className="opacity-50 text-xs block mt-2">(Connected: {nestUrl})</span>}
                </p>
                <label className="relative cursor-pointer group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-zinc-950 px-8 py-4 rounded-xl font-medium flex items-center gap-2 border border-white/10 group-hover:border-white/20 transition-all shadow-xl">
                    <FileText size={20} className="text-blue-400" />
                    Browse Files
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleUpload} />
                </label>
                {isUploading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-blue-400 flex items-center gap-3 font-medium">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Analyzing resume formatting & syntax...
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <div className="w-40 h-40 relative mb-8">
                  {/* Circular progress */}
                  <svg className="w-full h-full transform -rotate-90 filter drop-shadow-2xl">
                    <circle cx="80" cy="80" r="70" className="stroke-zinc-800" strokeWidth="8" fill="none" />
                    <motion.circle 
                      initial={{ strokeDasharray: "0 440" }}
                      animate={{ strokeDasharray: `${(score / 100) * 440} 440` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      cx="80" cy="80" r="70" 
                      className="stroke-green-400" strokeWidth="10" fill="none" strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col shadow-inner rounded-full">
                    <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-green-200">{score}</span>
                    <span className="text-sm text-green-400/80 font-medium tracking-wide">SCORE</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white">
                  <CheckCircle2 className="text-green-500" size={28} /> Analysis Complete
                </h2>
                <p className="text-zinc-400 mb-10 text-center max-w-sm"><span className="text-zinc-200 font-medium">{file?.name}</span> has been deeply analyzed against industry benchmarks.</p>
                <button 
                  onClick={() => { setScore(null); setFile(null); }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 font-medium hover:border-white/20 active:scale-95"
                >
                  Analyze New Resume
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Side Panel: Actions */}
          <div className="flex flex-col gap-6">
            <motion.button 
              onClick={() => router.push('/interview')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-start gap-6 h-full shadow-xl hover:shadow-purple-900/20 group relative overflow-hidden text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
                <Bot size={28} className="text-purple-400" />
              </div>
              <div className="text-left w-full relative z-10">
                <h3 className="text-2xl font-bold mb-3 flex items-center justify-between text-purple-50">
                  Interview AI
                  <ArrowRight size={22} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-purple-400"/>
                </h3>
                <p className="text-purple-200/60 text-sm leading-relaxed">
                  Practice your answers with our voice-enabled AI recruiter tailored specifically to your uploaded resume profile.
                </p>
              </div>
            </motion.button>

            <motion.button 
              onClick={() => router.push('/jobs')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/20 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-start gap-6 h-full shadow-xl hover:shadow-blue-900/20 group relative overflow-hidden text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-500/30">
                <Search size={28} className="text-blue-400" />
              </div>
              <div className="text-left w-full relative z-10">
                <h3 className="text-2xl font-bold mb-3 flex items-center justify-between text-blue-50">
                  Job Search
                  <ArrowRight size={22} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-400"/>
                </h3>
                <p className="text-blue-200/60 text-sm leading-relaxed">
                  Discover curated job opportunities that perfectly align with your newly benchmarked skills and market value.
                </p>
              </div>
            </motion.button>
          </div>

        </div>
      </main>
    </div>
  );
}
