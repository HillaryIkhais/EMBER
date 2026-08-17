"use client";

import { useState, useEffect } from "react";

export interface GameState {
  sparks: number;
  unlockedItems: string[];
}

export function useGameState() {
  const [state, setState] = useState<GameState>({ sparks: 0, unlockedItems: [] });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ember_game_state");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Listen for custom events across components
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem("ember_game_state");
      if (saved) {
        setState(JSON.parse(saved));
      }
    };
    window.addEventListener("ember_state_update", handleUpdate);
    return () => window.removeEventListener("ember_state_update", handleUpdate);
  }, []);

  const addSparks = (amount: number) => {
    const saved = localStorage.getItem("ember_game_state");
    let current = { sparks: 0, unlockedItems: [] as string[] };
    if (saved) current = JSON.parse(saved);
    
    current.sparks += amount;
    localStorage.setItem("ember_game_state", JSON.stringify(current));
    window.dispatchEvent(new Event("ember_state_update"));
  };

  const unlockItem = (itemId: string, cost: number) => {
    const saved = localStorage.getItem("ember_game_state");
    let current = { sparks: 0, unlockedItems: [] as string[] };
    if (saved) current = JSON.parse(saved);

    if (current.sparks >= cost && !current.unlockedItems.includes(itemId)) {
      current.sparks -= cost;
      current.unlockedItems.push(itemId);
      localStorage.setItem("ember_game_state", JSON.stringify(current));
      window.dispatchEvent(new Event("ember_state_update"));
      return true;
    }
    return false;
  };

  return { ...state, addSparks, unlockItem };
}
