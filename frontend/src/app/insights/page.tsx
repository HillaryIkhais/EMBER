"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface WorldEntry {
  id: number;
  timestamp: number;
  raw_text: string;
  zone: "positive" | "negative";
  intensity: number;
  reflection_line: string;
}

export default function InsightsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WorldEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetch(process.env.NODE_ENV === "production" ? "/api/backend/world" : "http://localhost:8000/world")
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    const pos = entries.filter(e => e.zone === 'positive').length;
    const neg = entries.filter(e => e.zone === 'negative').length;
    const total = entries.length;
    const latest = entries[entries.length - 1];
    
    const shareText = `My Ember Emotional State\n━━━━━━━━━━━━━━━━━━━━━━\n${pos} Ascendent · ${neg} Abyssal · ${total} Total Entries\nLatest: "${latest?.reflection_line || 'No entries yet'}"\n\nThis is my emotional landscape right now. No words needed.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Ember State', text: shareText });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0608] flex items-center justify-center text-white/50 uppercase tracking-[0.3em] text-xs">
        Compiling insights...
      </div>
    );
  }

  const positive = entries.filter(e => e.zone === 'positive').length;
  const negative = entries.filter(e => e.zone === 'negative').length;

  return (
    <div className="min-h-screen bg-[#0a0608] flex flex-col font-sans relative overflow-hidden">
      
      {/* Immersive Lighting */}
      <div className="absolute top-0 left-0 w-1/2 h-[600px] blur-[150px] opacity-20 pointer-events-none rounded-full" style={{ background: `radial-gradient(circle, #c3e3f4 0%, transparent 70%)` }}></div>
      <div className="absolute top-0 right-0 w-1/2 h-[600px] blur-[150px] opacity-20 pointer-events-none rounded-full" style={{ background: `radial-gradient(circle, #f3cdd6 0%, transparent 70%)` }}></div>
      
      {/* Navigation */}
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => router.push('/')}
          className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to World
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-5xl mx-auto animate-in fade-in duration-1000">
        
        <div className="text-center mb-24">
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight mb-4 drop-shadow-2xl tracking-[0.05em]">
            Emotional Topography
          </h1>
          <p className="text-white/50 max-w-lg mx-auto leading-relaxed text-sm">
            Your emotional state, mapped and ready to share. No words needed.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-32 w-full mb-20">
          
          {/* Ascendent */}
          <div className="flex flex-col items-center group">
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 border border-[#dcedc2]/30 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute inset-4 border border-[#dcedc2]/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
              <div className="text-7xl font-serif text-[#dcedc2] drop-shadow-[0_0_30px_rgba(220,237,194,0.3)]">{positive}</div>
            </div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-white/80 mb-2">Ascendent</h2>
            <p className="text-white/40 text-xs uppercase tracking-[0.1em]">Positive Anchors</p>
          </div>

          {/* Abyssal */}
          <div className="flex flex-col items-center group">
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 border border-[#f3cdd6]/30 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute inset-4 border border-[#f3cdd6]/10 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
              <div className="text-7xl font-serif text-[#f3cdd6] drop-shadow-[0_0_30px_rgba(243,205,214,0.3)]">{negative}</div>
            </div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-white/80 mb-2">Abyssal</h2>
            <p className="text-white/40 text-xs uppercase tracking-[0.1em]">Negative Anchors</p>
          </div>

        </div>

        {/* Share Button — The Communication Bridge */}
        <button
          onClick={handleShare}
          className="group relative px-10 py-4 border border-white/20 rounded-full text-white/70 hover:text-white hover:border-white/40 transition-all duration-500 hover:scale-105 active:scale-95"
        >
          <span className="text-xs uppercase tracking-[0.25em]">
            {shared ? '✓ Copied to clipboard' : 'Share with Therapist / Friend'}
          </span>
          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
        <p className="text-white/30 text-xs mt-4 max-w-sm text-center">
          Send your emotional state to someone in your support system. No explanation needed.
        </p>

      </div>
    </div>
  );
}
