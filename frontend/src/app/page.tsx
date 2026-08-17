"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface WorldEntry {
  id: number;
  timestamp: number;
  raw_text: string;
  zone: "positive" | "negative";
  intensity: number;
}

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export default function ConstellationView() {
  const [entries, setEntries] = useState<WorldEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetch(process.env.NODE_ENV === "production" ? "/api/backend/world" : "http://localhost:8000/world")
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
      
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      containerRef.current.style.transform = `translate(${-x}px, ${-y}px)`;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div ref={containerRef} className="absolute inset-0 transition-transform duration-[2000ms] ease-out">
        
        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen">
          {entries.map((entry, idx, arr) => {
            if (idx === 0) return null;
            const prev = arr[idx - 1];
            const x1 = `${10 + pseudoRandom(prev.id * 13) * 80}%`;
            const y1 = `${20 + pseudoRandom(prev.id * 17) * 60}%`; 
            const x2 = `${10 + pseudoRandom(entry.id * 13) * 80}%`;
            const y2 = `${20 + pseudoRandom(entry.id * 17) * 60}%`;
            return <line key={entry.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(200,200,255,0.15)" strokeWidth="1" />;
          })}
        </svg>

        {/* Nodes */}
        {entries.map((entry) => {
          const isPos = entry.zone === 'positive';
          const x = `${10 + pseudoRandom(entry.id * 13) * 80}%`;
          const y = `${20 + pseudoRandom(entry.id * 17) * 60}%`;
          
          return (
            <div 
              key={entry.id}
              onClick={() => router.push(`/commune/${entry.id}`)}
              className="absolute cursor-pointer hover:scale-150 transition-transform duration-500 group"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative flex items-center justify-center mix-blend-screen">
                <div className={`absolute w-24 h-24 rounded-full blur-2xl opacity-50 ${isPos ? 'bg-[#ffcc00]' : 'bg-[#6a4cff]'}`} />
                <div className={`absolute w-8 h-8 rounded-full blur-md ${isPos ? 'bg-[#ffeebb]' : 'bg-[#a99eff]'}`} />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
              </div>
            </div>
          );
        })}
      </div>
      
      {entries.length === 0 && (
        <div className="text-center opacity-50 font-title tracking-[0.3em] text-sm uppercase">
          The sky is empty. <br/><br/> <a href="/log" className="hover:text-white transition-colors border-b border-white/20 pb-1">Whisper to begin</a>
        </div>
      )}
    </div>
  );
}
