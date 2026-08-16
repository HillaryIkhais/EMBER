"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

const WORLD_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975077/world_bg_jzzcn1.jpg';

interface EntryResult {
  mode: "reflection" | "crisis";
  text?: string;
  zone?: "positive" | "negative";
  intensity?: number;
  reflection_line?: string;
  id?: number;
}

export default function LogPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EntryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setErrorMessage(null);
    
    try {
      const res = await fetch(
        process.env.NODE_ENV === "production" ? "/api/backend/entry" : "http://localhost:8000/entry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText.trim() })
        }
      );
      
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: EntryResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Entry logging failed:", err);
      setErrorMessage("Could not connect to the server. Please ensure the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInputText("");
    setErrorMessage(null);
  };

  const getZoneColor = (zone?: string, intensity: number = 5) => {
    if (zone === "positive") {
      if (intensity > 7) return '#f0e4c0';
      if (intensity > 4) return '#dcedc2';
      return '#c3e3f4';
    } else {
      if (intensity > 7) return '#f3cdd6';
      if (intensity > 4) return '#dcd2f2';
      return '#c3e3f4';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0608] flex flex-col font-sans relative overflow-hidden text-white">
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center origin-center opacity-40 blur-xl scale-110" 
        style={{ backgroundImage: `url(${WORLD_BG})` }} 
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] blur-[200px] opacity-30 pointer-events-none rounded-full" style={{ background: `radial-gradient(circle, #f3cdd6 0%, transparent 70%)` }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0608] via-transparent to-[#0a0608]/60 z-[5]"></div>

      {/* Navigation Header */}
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => router.push('/')}
          className="text-white/50 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] flex items-center gap-2 group cursor-pointer"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to World
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-3xl mx-auto my-12">
        <div className={`text-center w-full transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight mb-3 drop-shadow-2xl">
            Log a Memory
          </h1>
          <p className="text-white/50 max-w-md mx-auto leading-relaxed text-xs md:text-sm uppercase tracking-[0.15em] mb-12">
            Write what is true. Your world will take root.
          </p>

          {/* ERROR STATE */}
          {errorMessage && (
            <div className="w-full bg-red-950/80 border border-red-500/40 p-6 rounded-3xl backdrop-blur-xl mb-8 text-left animate-in fade-in">
              <div className="text-red-400 text-xs uppercase tracking-widest font-bold mb-2">Connection Error</div>
              <p className="text-white/80 text-sm mb-4">{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* CRISIS MODE OVERRIDE */}
          {result?.mode === "crisis" && (
            <div className="w-full bg-[#2a0810]/95 border border-red-500/40 p-8 md:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
                <div className="text-red-300 text-xs tracking-[0.25em] uppercase font-sans font-bold">Priority Safety Override</div>
              </div>
              <p className="text-white/95 text-base md:text-lg font-sans mb-8 whitespace-pre-line leading-relaxed">{result.text}</p>
              <button 
                onClick={handleReset} 
                className="w-full text-xs uppercase tracking-[0.2em] bg-red-500/20 border border-red-500/40 py-4 hover:bg-red-500/30 text-white transition-colors rounded-2xl font-bold font-sans cursor-pointer"
              >
                I understand. Return to writing.
              </button>
            </div>
          )}

          {/* SUCCESSFUL REFLECTION CARD */}
          {result?.mode === "reflection" && (
            <div className="w-full bg-white/10 border border-white/20 p-8 md:p-12 rounded-3xl backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500 text-center relative overflow-hidden">
              <div 
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 blur-3xl opacity-30 rounded-full pointer-events-none"
                style={{ backgroundColor: getZoneColor(result.zone, result.intensity || 5) }}
              />

              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-[10px] uppercase tracking-[0.25em] mb-8" style={{ color: getZoneColor(result.zone, result.intensity || 5) }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getZoneColor(result.zone, result.intensity || 5) }}></span>
                {result.zone === 'positive' ? 'Light Zone' : 'Void Zone'} • Intensity {result.intensity}/10
              </div>

              <h2 className="font-serif text-2xl md:text-4xl text-white leading-tight mb-6 drop-shadow-xl">
                "{result.reflection_line}"
              </h2>

              <p className="text-white/60 text-xs md:text-sm max-w-lg mx-auto mb-10 italic line-clamp-3">
                "{inputText}"
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/90 transition-all duration-300 shadow-lg cursor-pointer"
                >
                  Enter the World
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl border border-white/20 transition-all duration-300 cursor-pointer"
                >
                  Log Another Memory
                </button>
              </div>
            </div>
          )}

          {/* FORM INPUT STATE */}
          {!result && (
            <form onSubmit={handleSubmit} className="w-full relative group">
              <div 
                className={`absolute inset-0 rounded-[32px] border transition-all duration-500 shadow-2xl pointer-events-none ${
                  inputFocused 
                    ? 'bg-white/10 border-white/40 backdrop-blur-2xl shadow-white/5' 
                    : 'bg-[#1a0f16]/70 border-white/10 backdrop-blur-xl group-hover:bg-[#1a0f16]/90'
                }`}
              />

              <textarea 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onFocus={() => setInputFocused(true)} 
                onBlur={() => setInputFocused(false)} 
                disabled={loading} 
                placeholder="What's on your mind right now? Speak freely..." 
                className="w-full h-[220px] bg-transparent text-white px-8 py-8 text-base md:text-lg outline-none transition-colors placeholder-white/30 rounded-[32px] font-sans relative z-10 resize-none leading-relaxed" 
              />

              <div className="absolute right-6 bottom-6 z-20 flex items-center gap-4">
                {loading && (
                  <span className="text-xs uppercase tracking-[0.2em] text-white/60 animate-pulse font-sans">
                    Analyzing emotional resonance...
                  </span>
                )}
                <button 
                  type="submit" 
                  disabled={loading || !inputText.trim()} 
                  className={`px-8 py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-2xl font-sans flex items-center justify-center cursor-pointer ${
                    inputText.trim() && !loading
                      ? 'bg-white text-black hover:scale-105 shadow-xl' 
                      : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {loading ? "Processing..." : "Plant Entry"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
