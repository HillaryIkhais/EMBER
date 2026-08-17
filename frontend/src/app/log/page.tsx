"use client";
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhisperView() {
  const [inputText, setInputText] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [released, setReleased] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLogging) return;
    
    setIsLogging(true);
    setReleased(true); // Triggers drift animation
    
    try {
      const res = await fetch(
        process.env.NODE_ENV === "production" ? "/api/backend/entry" : "http://localhost:8000/entry",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: inputText.trim() }) }
      );
      if (res.ok) {
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setIsLogging(false);
      setReleased(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#020308]/60 backdrop-blur-sm transition-all duration-1000">
      
      {!released ? (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl px-8 flex flex-col items-center">
          <p className="text-[#a3a3b5] text-xl mb-12 font-body italic opacity-70">What weighs on your spirit?</p>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLogging}
            className="w-full bg-transparent text-[#e8e8ed] text-4xl md:text-5xl font-body text-center leading-relaxed outline-none resize-none min-h-[250px] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            placeholder="..."
          />
          <div className="mt-8 opacity-40">
            <span className="text-[#e8e8ed] text-xs tracking-[0.4em] uppercase font-title font-light">Press Enter to Release</span>
          </div>
        </form>
      ) : (
        <div className="w-full max-w-4xl px-8" style={{ animation: 'mistyDrift 4s ease-in forwards' }}>
          <p className="text-[#e8e8ed] text-4xl md:text-5xl font-body text-center leading-relaxed drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            {inputText}
          </p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mistyDrift {
          0% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
          100% { transform: translateY(-100px) scale(1.1); opacity: 0; filter: blur(20px); }
        }
      `}} />
    </div>
  );
}
