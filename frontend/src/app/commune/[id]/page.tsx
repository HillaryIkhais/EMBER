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
    if (intensity > 7) return '#f3cdd6';
    if (intensity > 4) return '#dcd2f2';
    return '#c3e3f4';
  }
};

export default function CommunePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [memory, setMemory] = useState<WorldEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'memory', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    
    fetch(process.env.NODE_ENV === "production" ? `/api/backend/entry/${id}` : `http://localhost:8000/entry/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Memory not found");
        return res.json();
      })
      .then((data: WorldEntry) => {
        setMemory(data);
        setChatMessages([{
          role: 'memory', 
          text: `I am your past self from the moment you felt this: "${data.reflection_line}". What would you like to say to me?`
        }]);
      })
      .catch(err => {
        console.error("Commune error:", err);
        setFetchError("Could not retrieve this memory from your archive.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, chatLoading]);

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !memory || chatLoading) return;
    
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

      if (!res.ok) {
        throw new Error("Chat response failed");
      }

      const data = await res.json();
      setChatMessages(prev => [...prev, {role: 'memory', text: data.reply}]);
    } catch (e) {
      console.error("Chat transmission error:", e);
      setChatMessages(prev => [...prev, {
        role: 'memory', 
        text: `Looking back at when we wrote "${memory.raw_text.slice(0, 40)}...", I hear you. We carried that feeling then, and it shaped who we are today.`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050204] flex flex-col items-center justify-center text-white/60 font-sans gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        <div className="uppercase tracking-[0.3em] text-xs font-bold">Connecting to your past self...</div>
      </div>
    );
  }

  if (fetchError || !memory) {
    return (
      <div className="min-h-screen bg-[#050204] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl max-w-md">
          <div className="text-white/40 uppercase tracking-[0.2em] text-xs font-bold mb-4">Memory Unavailable</div>
          <p className="text-white/80 text-sm mb-6">{fetchError || "Memory could not be found."}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white/90 transition-colors"
          >
            Return to World
          </button>
        </div>
      </div>
    );
  }

  const accentColor = getZoneColor(memory.zone, memory.intensity);

  return (
    <div className="min-h-screen bg-[#050204] flex flex-col font-sans relative overflow-hidden text-white">
      
      {/* Cinematic Ambient Lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] opacity-25 pointer-events-none rounded-full"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />

      {/* Navigation */}
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => router.push('/')}
          className="text-white/50 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] flex items-center gap-2 group cursor-pointer"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to World
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 z-10 w-full max-w-4xl mx-auto mt-16 lg:mt-0 gap-10">
        
        {/* Memory Display Card */}
        <div className="text-center w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: accentColor }}>
            Memory #{String(memory.id).padStart(3, '0')} • {memory.zone.toUpperCase()} ZONE ({memory.intensity}/10)
          </div>
          <h1 
            className="font-serif text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-4 drop-shadow-2xl max-w-3xl mx-auto"
            style={{ textShadow: `0 4px 40px ${accentColor}40` }}
          >
            "{memory.reflection_line}"
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-xs md:text-sm italic leading-relaxed">
            "{memory.raw_text}"
          </p>
        </div>

        {/* Chat Interface */}
        <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl backdrop-blur-3xl p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-700">
          
          <div ref={chatScrollRef} className="h-[38vh] min-h-[280px] overflow-y-auto flex flex-col gap-4 pr-2 mb-6 scrollbar-thin scrollbar-thumb-white/20">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm md:text-base font-sans leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white/15 text-white border border-white/20 rounded-tr-sm' 
                    : 'bg-black/60 text-white/95 border border-white/10 rounded-tl-sm shadow-lg'
                }`}>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
                    {msg.role === 'user' ? 'You' : 'Past Self'}
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-black/60 text-white/60 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 text-xs tracking-[0.15em] uppercase flex items-center gap-3">
                  <div className="w-2 h-2 bg-white/70 rounded-full animate-ping"></div>
                  Past self is reflecting...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="relative flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Speak to your past self..."
              className="w-full bg-black/40 border border-white/15 text-white px-6 py-4 rounded-2xl outline-none placeholder-white/30 text-sm focus:border-white/40 transition-colors pr-28 font-sans"
            />
            <button 
              type="submit" 
              disabled={chatLoading || !chatInput.trim()} 
              className="absolute right-2 bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-all disabled:opacity-30 cursor-pointer"
            >
              {chatLoading ? "..." : "Send"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
