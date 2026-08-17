"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "./hooks/useGameState";

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
  const [storeOpen, setStoreOpen] = useState(false);
  const { sparks, unlockItem, unlockedItems } = useGameState();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetch("/api/backend/world")
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  }, []);

  if (!mounted) return null;

  const handleBuy = (id: string, cost: number) => {
    const success = unlockItem(id, cost);
    if (!success) {
      alert("Not enough sparks! Write a new entry to earn 50 sparks.");
    }
  };

  return (
    <div className="w-full h-full relative">
      
      {/* SPARKS HUD */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#1a1423]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_0_15px_rgba(163,136,232,0.2)]">
          <div className="w-2 h-2 rounded-full bg-[#ffd27a] animate-pulse shadow-[0_0_8px_#ffd27a]" />
          <span className="font-title text-sm tracking-[0.1em] text-[#e8e8ed]">{sparks}</span>
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#a3a3b5]">Sparks</span>
        </div>
        <button 
          onClick={() => setStoreOpen(true)}
          className="bg-[#6a4cff]/20 hover:bg-[#6a4cff]/40 text-[#e8e8ed] font-title text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-[#6a4cff]/50 transition-all duration-300 shadow-[0_0_10px_rgba(106,76,255,0.3)]"
        >
          Store
        </button>
      </div>

      {/* STORE DRAWER */}
      <div className={`absolute top-0 right-0 w-full md:w-96 h-full bg-[#05060f]/95 backdrop-blur-xl border-l border-white/10 z-50 p-8 transform transition-transform duration-500 ease-in-out pointer-events-auto ${storeOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="font-title text-xl tracking-[0.2em] text-white">Sanctuary Store</h2>
            <p className="font-sans text-[10px] tracking-[0.2em] text-[#a3a3b5] uppercase mt-2">Spend sparks to upgrade your world</p>
          </div>
          <button onClick={() => setStoreOpen(false)} className="text-[#a3a3b5] hover:text-white text-2xl font-light">×</button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="font-title tracking-[0.1em] text-[#e8e8ed] mb-2">Aurora Sky</h3>
            <p className="text-[#a3a3b5] text-xs font-body mb-4">Bathe your sanctuary in a breathtaking violet aurora.</p>
            {unlockedItems.includes("aurora") ? (
              <span className="text-[#a388e8] font-title text-xs tracking-[0.2em] uppercase">Unlocked</span>
            ) : (
              <button onClick={() => handleBuy("aurora", 100)} className="w-full bg-[#6a4cff]/30 hover:bg-[#6a4cff]/50 text-white font-title text-xs tracking-[0.2em] uppercase py-3 rounded-lg border border-[#6a4cff]/50 transition-colors">
                Buy for 100 Sparks
              </button>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="font-title tracking-[0.1em] text-[#e8e8ed] mb-2">Ancient Willow</h3>
            <p className="text-[#a3a3b5] text-xs font-body mb-4">Plant a massive, weeping spirit tree on your island.</p>
            {unlockedItems.includes("willow") ? (
              <span className="text-[#ffd27a] font-title text-xs tracking-[0.2em] uppercase">Unlocked</span>
            ) : (
              <button onClick={() => handleBuy("willow", 200)} className="w-full bg-[#e8b923]/20 hover:bg-[#e8b923]/40 text-white font-title text-xs tracking-[0.2em] uppercase py-3 rounded-lg border border-[#e8b923]/50 transition-colors">
                Buy for 200 Sparks
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Container for nodes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-50">
          {entries.map((entry, idx, arr) => {
            if (idx === 0) return null;
            const prev = arr[idx - 1];
            const x1 = `${10 + pseudoRandom(prev.id * 13) * 80}%`;
            const y1 = `${10 + pseudoRandom(prev.id * 17) * 80}%`; 
            const x2 = `${10 + pseudoRandom(entry.id * 13) * 80}%`;
            const y2 = `${10 + pseudoRandom(entry.id * 17) * 80}%`;
            return <line key={entry.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(200,200,255,0.15)" strokeWidth="1" />;
          })}
        </svg>

        {/* Nodes */}
        {entries.map((entry) => {
          const isPos = entry.zone === 'positive';
          const x = `${10 + pseudoRandom(entry.id * 13) * 80}%`;
          const y = `${10 + pseudoRandom(entry.id * 17) * 80}%`;
          
          return (
            <div 
              key={entry.id}
              onClick={() => router.push(`/commune/${entry.id}`)}
              className="absolute cursor-pointer hover:scale-150 transition-transform duration-500 group pointer-events-auto"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative flex items-center justify-center mix-blend-screen">
                <div className={`absolute w-24 h-24 rounded-full blur-2xl opacity-50 ${isPos ? 'bg-[#ffcc00]' : 'bg-[#6a4cff]'}`} />
                <div className={`absolute w-8 h-8 rounded-full blur-md ${isPos ? 'bg-[#ffeebb]' : 'bg-[#a99eff]'}`} />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[150px] text-center pointer-events-none">
                  <span className="font-title text-[10px] tracking-[0.2em] uppercase text-white/80 drop-shadow-md">
                    Reflect
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {entries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center opacity-50 font-title tracking-[0.3em] text-sm uppercase pointer-events-none">
            Your journal is empty. <br/><br/> <a href="/log" className="hover:text-white transition-colors border-b border-white/20 pb-1 pointer-events-auto">Write a new entry to begin</a>
          </div>
        </div>
      )}
    </div>
  );
}
