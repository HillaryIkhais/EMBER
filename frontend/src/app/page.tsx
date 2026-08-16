"use client";

import React, { useEffect, useState, FormEvent, useRef } from "react";

interface WorldEntry {
  id: number;
  timestamp: number;
  raw_text: string;
  zone: "positive" | "negative";
  intensity: number;
  reflection_line: string;
}

type SanctuaryTone = 'twilight' | 'midnight' | 'dawn';

// Pseudo-random generator for star positioning
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export default function VelarisSanctuary() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<WorldEntry[]>([]);
  
  // Sanctuary State
  const [tone, setTone] = useState<SanctuaryTone>('twilight');
  const [hudState, setHudState] = useState<'roam' | 'log' | 'commune'>('roam');
  const [activeEntry, setActiveEntry] = useState<WorldEntry | null>(null);
  
  // Input State
  const [inputText, setInputText] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const logInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Data
  const fetchWorld = () => {
    fetch(process.env.NODE_ENV === "production" ? "/api/backend/world" : "http://localhost:8000/world")
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  };

  useEffect(() => {
    setMounted(true);
    fetchWorld();
  }, []);

  useEffect(() => {
    if (hudState === 'log' && logInputRef.current) {
      setTimeout(() => logInputRef.current?.focus(), 100);
    }
  }, [hudState]);

  // Handlers
  const handleLogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLogging) return;
    setIsLogging(true);
    
    try {
      const res = await fetch(
        process.env.NODE_ENV === "production" ? "/api/backend/entry" : "http://localhost:8000/entry",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: inputText.trim() }) }
      );
      if (res.ok) {
        setInputText("");
        setHudState('roam');
        fetchWorld();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogging(false);
    }
  };

  // Tone Definitions
  const tones = {
    twilight: {
      sky: 'from-[#0b0a1a] via-[#1c1236] to-[#401f4a]',
      mountainBack: 'text-[#140b24]',
      mountainFront: 'text-[#0a0512]',
      river: 'from-[#1c1236] to-[#0a0512]',
    },
    midnight: {
      sky: 'from-[#020205] via-[#080812] to-[#121224]',
      mountainBack: 'text-[#0a0a14]',
      mountainFront: 'text-[#030308]',
      river: 'from-[#080812] to-[#030308]',
    },
    dawn: {
      sky: 'from-[#1a1b38] via-[#2f284f] to-[#7d4d5e]',
      mountainBack: 'text-[#241e3d]',
      mountainFront: 'text-[#120f1f]',
      river: 'from-[#2f284f] to-[#120f1f]',
    }
  };

  const currentTheme = tones[tone];

  if (!mounted) return <div className="bg-[#0b0a1a] min-h-screen" />;

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans select-none">
      
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes mistDrift {
          0% { transform: translateX(-5vw); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateX(5vw); opacity: 0; }
        }
        @keyframes ripple {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-twinkle { animation: twinkle 4s ease-in-out infinite; }
        .animate-mist { animation: mistDrift 40s linear infinite; }
        .animate-ripple { animation: ripple 15s linear infinite; }
      `}} />

      {/* --- LAYER 1: THE HEAVENS (Background) --- */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${currentTheme.sky} transition-colors duration-[2000ms] ease-in-out cursor-pointer z-0`}
        onClick={() => hudState === 'roam' && setHudState('log')}
      >
        {/* Ambient tiny stars */}
        {Array.from({ length: 150 }).map((_, i) => (
          <div 
            key={`ambient-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: \`\${pseudoRandom(i * 10) * 100}%\`,
              top: \`\${pseudoRandom(i * 20) * 70}%\`,
              width: \`\${pseudoRandom(i * 30) * 1.5 + 0.5}px\`,
              height: \`\${pseudoRandom(i * 30) * 1.5 + 0.5}px\`,
              animationDelay: \`\${pseudoRandom(i * 40) * 5}s\`,
              opacity: pseudoRandom(i * 50) * 0.5 + 0.1
            }}
          />
        ))}

        {/* Emotion-Driven World Building */}
        {entries.map((entry) => {
          const seedX = pseudoRandom(entry.id * 13);
          const seedY = pseudoRandom(entry.id * 17);
          const seedAnim = pseudoRandom(entry.id * 23);

          if (entry.zone === 'positive') {
            // Stars in the sky
            const left = `${5 + seedX * 90}%`;
            const top = `${5 + seedY * 60}%`;
            const size = entry.intensity > 7 ? 4 : 2;
            const glow = entry.intensity > 7 ? '0 0 12px 2px rgba(255,230,180,0.8)' : '0 0 6px 1px rgba(255,255,255,0.6)';

            return (
              <div 
                key={entry.id}
                onClick={(e) => { e.stopPropagation(); setActiveEntry(entry); setHudState('commune'); }}
                className="absolute rounded-full bg-[#fff5e6] cursor-pointer hover:scale-150 transition-transform duration-300 z-10"
                style={{
                  left, top,
                  width: `${size}px`, height: `${size}px`,
                  boxShadow: glow,
                  animation: `twinkle ${3 + seedAnim * 3}s ease-in-out infinite`,
                  animationDelay: `-${seedAnim * 5}s`
                }}
              >
                {/* Invisible larger hit area */}
                <div className="absolute inset-[-15px]" />
              </div>
            );
          } else {
            // Mist/Clouds over the mountains
            const left = `${seedX * 100}%`;
            const bottom = `${15 + seedY * 15}%`; // Hovering near the mountains
            const width = `${150 + entry.intensity * 20}px`;
            
            return (
              <div 
                key={entry.id}
                onClick={(e) => { e.stopPropagation(); setActiveEntry(entry); setHudState('commune'); }}
                className="absolute bg-white/10 blur-2xl rounded-full cursor-pointer hover:bg-white/20 transition-colors duration-500 z-20 animate-mist"
                style={{
                  left, bottom,
                  width, height: '40px',
                  animationDelay: `-${seedAnim * 40}s`
                }}
              />
            );
          }
        })}
      </div>

      {/* --- LAYER 2: THE RAMIEL MOUNTAINS (Midground) --- */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-end">
        {/* Back Mountains */}
        <svg viewBox="0 0 1440 320" className={`absolute bottom-[10%] w-[120%] -left-[10%] h-[40vh] ${currentTheme.mountainBack} transition-colors duration-[2000ms] ease-in-out`} preserveAspectRatio="none">
          <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        {/* Front Mountains */}
        <svg viewBox="0 0 1440 320" className={`absolute bottom-[10%] w-[110%] -left-[5%] h-[30vh] ${currentTheme.mountainFront} transition-colors duration-[2000ms] ease-in-out`} preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128L60,149.3C120,171,240,213,360,202.7C480,192,600,128,720,106.7C840,85,960,107,1080,133.3C1200,160,1320,192,1380,208L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>

      {/* --- LAYER 3: THE SIDRA RIVER (Foreground) --- */}
      <div className={`absolute bottom-0 w-full h-[15vh] bg-gradient-to-b ${currentTheme.river} opacity-95 transition-colors duration-[2000ms] z-20`}>
        {/* Subtle River Ripples */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] w-[200%] animate-ripple blur-[1px]"></div>
        <div className="absolute top-0 w-full h-[2px] bg-white/10 blur-[1px]"></div>
      </div>

      {/* --- LAYER 4: THE SANCTUARY (Diegetic UI) --- */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* Customization Toggle */}
        <div className="absolute top-6 right-6 pointer-events-auto flex gap-4">
          {(['twilight', 'midnight', 'dawn'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`text-[9px] uppercase tracking-[0.2em] font-serif transition-colors duration-500 focus:outline-none ${tone === t ? 'text-white/90' : 'text-white/30 hover:text-white/60'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Ambient Hint */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-[10px] uppercase tracking-[0.3em] font-serif transition-opacity duration-1000 ${hudState === 'roam' ? 'opacity-100' : 'opacity-0'}`}>
          Click the sky to release a thought
        </div>
      </div>

      {/* --- LOGGING STATE --- */}
      <div className={`absolute inset-0 z-40 flex items-center justify-center transition-all duration-[1500ms] ${hudState === 'log' ? 'opacity-100 pointer-events-auto bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0" onClick={() => setHudState('roam')}></div>
        <form onSubmit={handleLogSubmit} className="relative z-10 w-full max-w-3xl px-8 flex flex-col items-center">
          <textarea
            ref={logInputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLogging}
            placeholder="What is on your mind?"
            className="w-full bg-transparent text-white/90 text-2xl md:text-4xl text-center leading-[1.6] outline-none resize-none placeholder-white/20 min-h-[200px] font-serif"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isLogging}
            className={`mt-12 px-6 py-2 text-[10px] uppercase tracking-[0.4em] font-serif border-b border-transparent transition-all duration-700 focus:outline-none ${inputText.trim() && !isLogging ? 'text-white hover:border-white/50 cursor-pointer' : 'text-white/20 cursor-not-allowed'}`}
          >
            {isLogging ? 'Weaving...' : 'Release to the Sky'}
          </button>
        </form>
      </div>

      {/* --- COMMUNING STATE --- */}
      <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center transition-all duration-[1500ms] ${hudState === 'commune' ? 'opacity-100 pointer-events-auto bg-black/80 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0" onClick={() => { setHudState('roam'); setActiveEntry(null); }}></div>
        
        {activeEntry && (
          <div className="relative z-10 w-full max-w-4xl px-8 text-center flex flex-col items-center">
            {/* The Emotion Constellation / Indicator */}
            <div className="mb-12">
               <svg width="40" height="40" viewBox="0 0 40 40" className="animate-[spin_60s_linear_infinite]">
                 {activeEntry.zone === 'positive' 
                    ? <path d="M20 0 L22 18 L40 20 L22 22 L20 40 L18 22 L0 20 L18 18 Z" fill="rgba(255,240,200,0.8)" />
                    : <circle cx="20" cy="20" r="10" fill="rgba(255,255,255,0.2)" filter="blur(4px)" />
                 }
               </svg>
            </div>

            <h2 className="font-serif text-3xl md:text-5xl text-white/90 leading-tight mb-8">
              "{activeEntry.reflection_line}"
            </h2>
            
            <p className="font-serif text-white/50 text-sm md:text-lg leading-relaxed italic max-w-2xl mx-auto">
              "{activeEntry.raw_text}"
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
