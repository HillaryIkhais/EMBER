"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface WorldEntry {
  id: number;
  timestamp: number;
  raw_text: string;
  zone: "positive" | "negative";
  intensity: number;
  reflection_line: string;
  micro_action?: string;
}

export default function CommuneView() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<WorldEntry | null>(null);

  useEffect(() => {
    fetch(process.env.NODE_ENV === "production" ? "/api/backend/world" : "http://localhost:8000/world")
      .then(res => res.json())
      .then((data: WorldEntry[]) => {
        const found = data.find(e => e.id.toString() === id);
        if (found) setEntry(found);
      })
      .catch(console.error);
  }, [id]);

  if (!entry) return <div className="w-full h-full flex items-center justify-center text-[#a3a3b5] font-title tracking-[0.3em] text-xs uppercase">Seeking archive...</div>;

  const color = entry.zone === 'positive' ? '#e8b923' : '#a388e8';

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020308]/80 backdrop-blur-xl transition-all duration-1000 p-8">
      <button onClick={() => router.push('/')} className="absolute top-32 left-12 text-[#a3a3b5] hover:text-white font-title text-xs tracking-[0.3em] uppercase">
        ← Return
      </button>

      <div className="w-full max-w-3xl flex flex-col items-center animate-fade-in">
        <div className="text-[#a3a3b5] text-xs tracking-[0.5em] uppercase font-title font-light mb-16 opacity-60">
          From the Archives • {new Date(entry.timestamp * 1000).toLocaleDateString()}
        </div>
        
        <p className="text-[#e8e8ed] text-3xl md:text-4xl font-body italic text-center leading-loose mb-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          "You whispered that {entry.raw_text.toLowerCase()}. In response, {entry.zone === 'positive' ? 'a star was born to guide you' : 'an aurora was painted to hold your burden'}."
        </p>

        <div className="w-full pt-16 flex flex-col items-center relative">
          <div className="absolute top-0 w-64 h-[1px] bg-gradient-to-r from-transparent via-[#a3a3b5]/30 to-transparent" />
          
          <span className="text-[#a3a3b5] text-xs tracking-[0.4em] uppercase font-title font-light mb-16 opacity-50">
            Commune with this memory
          </span>
          
          <div className="relative w-64 h-64 flex items-center justify-center mb-16">
            <div className="absolute w-full h-full rounded-full border-[0.5px] border-white/20 pointer-events-none" style={{ animation: 'breatheGlow 8s ease-in-out infinite' }} />
            <div className="absolute w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: color, opacity: 0.1, animation: 'breatheGlow 8s ease-in-out infinite' }} />
            <p className="text-[#e8e8ed] font-body text-2xl text-center px-8 leading-relaxed opacity-90">
              {entry.micro_action || "Rest. Breathe."}
            </p>
          </div>

          <p className="text-[#a3a3b5] text-[10px] tracking-[0.3em] uppercase font-title font-light text-center mt-4 opacity-40">
            Follow the light. Inhale as it expands, exhale as it returns.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes breatheGlow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; }
      `}} />
    </div>
  );
}
