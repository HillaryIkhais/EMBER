"use client";

import React, { useEffect, useState, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

interface WorldEntry {
  id: number;
  timestamp: number;
  raw_text: string;
  zone: "positive" | "negative";
  intensity: number;
  reflection_line: string;
}

const getZoneColor = (zone: string, intensity: number) => {
  if (zone === "positive") {
    if (intensity > 7) return '#f0e4c0';
    if (intensity > 4) return '#dcedc2';
    return '#c3e3f4';
  } else {
    if (intensity > 7) return '#6b2e3e';
    if (intensity > 4) return '#f3cdd6';
    return '#dcd2f2';
  }
};

export default function CommunePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [memory, setMemory] = useState<WorldEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'memory', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
    fetch(process.env.NODE_ENV === "production" ? `/api/backend/entry/${id}` : `http://localhost:8000/entry/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Memory not found");
        return res.json();
      })
      .then(data => {
        setMemory(data);
        setChatMessages([{
          role: 'memory', 
          text: `I am you from the moment you felt this: "${data.reflection_line}". Why have you returned here?`
        }]);
      })
      .catch(err => {
        console.error(err);
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !memory) return;
    
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(process.env.NODE_ENV === "production" ? "/api/backend/chat" : "http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memory_text: memory.raw_text,
          zone: memory.zone,
          intensity: memory.intensity,
          user_message: userMsg
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, {role: 'memory', text: data.reply}]);
    } catch (e) {
      console.error(e);
      setChatMessages(prev => [...prev, {role: 'memory', text: "The connection to this memory has been lost."}]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050204] flex items-center justify-center text-white/50 uppercase tracking-[0.3em] text-xs">
        Connecting to the past...
      </div>
    );
  }

  if (!memory) return null;

  const accentColor = getZoneColor(memory.zone, memory.intensity);

  return (
    <div className="min-h-screen bg-[#050204] flex flex-col font-sans relative overflow-hidden">
      {/* Cinematic Lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] opacity-20 pointer-events-none rounded-full"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      ></div>

      {/* Navigation */}
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => router.push('/')}
          className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to World
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 z-10 w-full max-w-4xl mx-auto mt-20 lg:mt-0 gap-12">
        
        {/* Monolith Memory Display */}
        <div className="text-center w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: accentColor }}>
            Memory {String(memory.id).padStart(3, '0')} • Intensity {memory.intensity}/10
          </div>
          <h1 
            className="font-serif text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-8 drop-shadow-2xl"
            style={{ textShadow: `0 4px 40px ${accentColor}40` }}
          >
            "{memory.reflection_line}"
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            {memory.raw_text}
          </p>
        </div>

        {/* Chat Interface */}
        <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl backdrop-blur-3xl p-6 md:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          
          <div ref={chatScrollRef} className="h-[40vh] min-h-[300px] overflow-y-auto flex flex-col gap-6 pr-4 mb-6 scrollbar-thin scrollbar-thumb-white/10">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-5 text-sm md:text-base font-sans leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white/10 text-white border border-white/20 rounded-tr-sm' 
                    : 'bg-black/50 text-white/90 border border-white/5 rounded-tl-sm shadow-inner'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-black/50 text-white/40 border border-white/5 rounded-2xl rounded-tl-sm p-5 text-xs tracking-[0.2em] uppercase animate-pulse">
                  Sensing...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="relative">
            <div className="absolute inset-0 bg-black/40 rounded-2xl pointer-events-none"></div>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Speak to your past self..."
              className="w-full bg-transparent border border-white/10 text-white px-6 py-5 rounded-2xl outline-none placeholder-white/30 text-sm focus:border-white/40 transition-colors relative z-10"
            />
            <button 
              type="submit" 
              disabled={chatLoading || !chatInput.trim()} 
              className="absolute right-3 top-3 bottom-3 bg-white text-black px-6 rounded-xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-colors disabled:opacity-50 z-20"
            >
              Send
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
