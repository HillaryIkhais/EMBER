"use client";
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "./hooks/useGameState";

export default function NewEntryView() {
  const [inputText, setInputText] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [released, setReleased] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { addSparks } = useGameState();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLogging) return;

    setIsLogging(true);
    setError("");

    try {
      const res = await fetch("/api/backend/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (res.ok) {
        // Only trigger animation AFTER successful save
        setReleased(true);
        addSparks(50);
        setTimeout(() => {
          router.push("/");
        }, 2500);
      } else {
        setError("Couldn't save your entry. Please try again.");
        setIsLogging(false);
      }
    } catch (err) {
      console.error(err);
      setError("Connection failed. Make sure the backend server is running.");
      setIsLogging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#020308]/60 backdrop-blur-sm">
      {!released ? (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl px-8 flex flex-col items-center"
        >
          <p className="text-[#a3a3b5] text-xl mb-12 font-body italic opacity-70">
            What's on your mind today?
          </p>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLogging}
            className="w-full bg-transparent text-[#e8e8ed] text-4xl md:text-5xl font-body text-center leading-relaxed outline-none resize-none min-h-[250px] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
            placeholder="..."
          />
          {error && (
            <p className="text-red-400 text-sm mt-4 font-body">{error}</p>
          )}
          <div className="mt-8 opacity-40">
            <span className="text-[#e8e8ed] text-xs tracking-[0.4em] uppercase font-title font-light">
              {isLogging ? "Saving..." : "Press Enter to Save"}
            </span>
          </div>
        </form>
      ) : (
        <div
          className="w-full max-w-4xl px-8"
          style={{ animation: "mistyDrift 3s ease-in forwards" }}
        >
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
