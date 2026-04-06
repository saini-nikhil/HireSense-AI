"use client";

import { motion } from "framer-motion";
import { Mic, ArrowLeft, Bot, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function InterviewPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(true);
  const [transcript, setTranscript] = useState("Hello! Based on your resume, it looks like you have great experience with JavaScript and React. Could you describe a challenging project you've worked on recently?");
  
  const [userSpeech, setUserSpeech] = useState("");

  // Simulate AI speaking then stopping
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (aiSpeaking) {
      timer = setTimeout(() => {
        setAiSpeaking(false);
      }, 5000); // 5 sec of talking animation
    }
    return () => clearTimeout(timer);
  }, [aiSpeaking]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAiSpeaking(true);
      // Faking processing and a new question response
      setUserSpeech((prev) => prev + " [Response recorded]");
      setTimeout(() => {
        setTranscript("That sounds like a complex problem! How did you handle the state management in that application?");
      }, 1000);
    } else {
      setIsRecording(true);
      setAiSpeaking(false);
      setUserSpeech("I worked on a real-time dashboard where...");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden flex flex-col">
      {/* Background gradients aligned for Interview theme */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
      
      <header className="relative z-10 flex items-center justify-between mb-10 w-full max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Dashboard
        </button>
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Interview AI
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between relative z-10">
        
        {/* Top: AI visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative">
            {aiSpeaking && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-purple-500 rounded-full blur-2xl"
              />
            )}
            <div className="w-32 h-32 bg-zinc-900 border border-purple-500/30 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden">
               <Bot size={50} className={`\${aiSpeaking ? "text-purple-400" : "text-zinc-600"} transition-colors duration-500`} />
               {aiSpeaking && (
                 <div className="absolute bottom-4 flex gap-1 items-end h-4">
                   <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-purple-400 rounded-full"/>
                   <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-1 bg-purple-400 rounded-full"/>
                   <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-purple-400 rounded-full"/>
                 </div>
               )}
            </div>
          </div>
          
          <motion.div 
            key={transcript}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center max-w-2xl"
          >
            <p className="text-2xl leading-relaxed text-zinc-200 font-medium">"{transcript}"</p>
          </motion.div>
        </div>

        {/* Bottom: User interaction */}
        <div className="pb-10 pt-16 flex flex-col items-center">
          <div className="mb-8 min-h-[40px] text-center max-w-lg w-full">
            {isRecording ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-lg">
                <span className="animate-pulse mr-2">●</span> Recording your answer...
                <p className="text-zinc-400 text-sm mt-2">{userSpeech}</p>
              </motion.div>
            ) : (
              <div className="text-zinc-500">Tap microphone to answer</div>
            )}
          </div>

          <button 
            onClick={toggleRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border \${
              isRecording 
                ? 'bg-red-500/20 border-red-500 text-red-500 shadow-red-500/50 hover:bg-red-500/30' 
                : 'bg-white text-black border-white hover:bg-zinc-200'
            }`}
          >
            {isRecording ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
          </button>
        </div>
      </main>
    </div>
  );
}
