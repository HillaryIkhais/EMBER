"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

const WORLD_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975077/world_bg_jzzcn1.jpg';

export default function LogPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [crisisText, setCrisisText] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    setCrisisText(null);
    
    try {
      const res = await fetch(process.env.NODE_ENV === "production" ? "/api/backend/entry" : "http://localhost:8000/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      const data = await res.json();
      
      if (data.mode === "crisis") {
        setCrisisText(data.text);
      } else {
        // Success: Wait a moment for visual feedback, then route to home
        setTimeout(() => {
          router.push('/');
        }, 800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0608] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center origin-center opacity-40 blur-xl scale-110" 
        style={{ backgroundImage: `url(${WORLD_BG})` }} 
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] blur-[200px] opacity-30 pointer-events-none rounded-full" style={{ background: `radial-gradient(circle, #f3cdd6 0%, transparent 70%)` }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0608] via-transparent to-[#0a0608]/50 z-[5]"></div>

      {/* Navigation */}
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => router.push('/')}
          className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to World
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-3xl mx-auto">
        <div className={`text-center w-full transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight mb-4 drop-shadow-2xl">
            Log a Memory
          </h1>
          <p className="text-white/50 max-w-md mx-auto leading-relaxed text-sm uppercase tracking-[0.1em] mb-16">
            Speak into the void. It will anchor you.
          </p>

          {crisisText ? (
            <div className="w-full bg-[#2a0810]/95 border border-red-500/30 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <div className="text-red-300 text-[10px] tracking-[0.25em] uppercase font-sans">Priority Override Active</div>
              </div>
              <p className="text-white/90 text-[15px] font-sans mb-8 whitespace-pre-line leading-[1.8]">{crisisText}</p>
              <button onClick={() => setCrisisText(null)} className="w-full text-xs uppercase tracking-[0.2em] bg-red-500/10 border border-red-500/30 py-4 hover:bg-red-500/20 text-white transition-colors rounded-xl font-sans">I understand. Return.</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full relative group">
              <div className={`absolute inset-0 rounded-[32px] border transition-colors duration-500 shadow-2xl pointer-events-none ${inputFocused ? 'bg-white/10 border-white/30 backdrop-blur-2xl' : 'bg-[#1a0f16]/60 border-white/10 backdrop-blur-xl group-hover:bg-[#1a0f16]/80'}`}></div>
              <textarea 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onFocus={() => setInputFocused(true)} 
                onBlur={() => setInputFocused(false)} 
                disabled={loading} 
                placeholder="What's going on right now?" 
                className="w-full h-[200px] bg-transparent text-white px-8 py-8 text-[16px] outline-none transition-colors placeholder-white/30 rounded-[32px] font-sans relative z-10 resize-none" 
              />
              <button 
                type="submit" 
                disabled={loading || !inputText.trim()} 
                className={`absolute right-4 bottom-4 px-8 py-3 text-[11px] tracking-[0.15em] uppercase transition-all duration-300 rounded-[20px] font-sans z-10 flex items-center justify-center ${inputFocused && inputText.trim() ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
              >
                {loading ? "Transmitting..." : "Log"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
