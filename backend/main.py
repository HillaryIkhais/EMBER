import json
import os
import sqlite3
import random
import time
from typing import List, Optional

from openai import OpenAI

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from prompts import (
    CRISIS_RESPONSE_TEXT,
    GUARDRAIL_SYSTEM_PROMPT,
    REFLECTOR_SYSTEM_PROMPT,
    ANALYZER_SYSTEM_PROMPT
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.environ.get("QWEN_API_KEY", "dummy-key"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
MODEL = "qwen-plus"

DB_FILE = "/tmp/ember.db" if os.environ.get("VERCEL") else "ember.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL,
            raw_text TEXT,
            zone TEXT,
            intensity INTEGER,
            reflection_line TEXT,
            micro_action TEXT,
            position_seed REAL
        )
    ''')
    try:
        c.execute("ALTER TABLE entries ADD COLUMN micro_action TEXT")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

init_db()


class EntryRequest(BaseModel):
    text: str


class EntryResponse(BaseModel):
    mode: str
    id: Optional[int] = None
    text: Optional[str] = None
    zone: Optional[str] = None
    intensity: Optional[int] = None
    reflection_line: Optional[str] = None
    micro_action: Optional[str] = None
    position_seed: Optional[float] = None


class WorldEntry(BaseModel):
    id: int
    timestamp: float
    raw_text: str
    zone: str
    intensity: int
    reflection_line: str
    micro_action: Optional[str] = None
    position_seed: float


class ChatRequest(BaseModel):
    memory_text: str
    zone: str
    intensity: int
    user_message: str

class ChatResponse(BaseModel):
    reply: str


# Helper fallbacks for bulletproof reliability
def fallback_guardrail(text: str) -> str:
    lower = text.lower()
    crisis_keywords = [
        "suicide", "kill myself", "end my life", "want to die",
        "harm myself", "cant go on", "can't go on", "ending it all",
        "don't want to live", "dont want to live"
    ]
    for kw in crisis_keywords:
        if kw in lower:
            return "crisis"
    return "safe"


def fallback_analyze(text: str) -> tuple:
    lower = text.lower()
    neg_words = [
        "tired", "sad", "exhausted", "angry", "overwhelmed", "scared", "lonely",
        "anxious", "stress", "hard", "bad", "pain", "hate", "cry", "lost", "fail",
        "heavy", "grief", "stuck", "alone", "hurt"
    ]
    pos_words = [
        "happy", "good", "great", "peace", "joy", "calm", "love", "light", "hope",
        "grateful", "smile", "laugh", "win", "excited", "relieved", "proud", "warm"
    ]
    
    neg_score = sum(1 for w in neg_words if w in lower)
    pos_score = sum(1 for w in pos_words if w in lower)
    length_factor = min(4, max(1, len(text) // 25))
    
    if pos_score > neg_score:
        zone = "positive"
        intensity = min(10, max(2, 4 + pos_score + length_factor))
    elif neg_score > pos_score:
        zone = "negative"
        intensity = min(10, max(2, 4 + neg_score + length_factor))
    else:
        zone = "positive" if ("not bad" in lower or "okay" in lower or "fine" in lower) else "negative"
        intensity = min(10, max(3, 4 + length_factor))
        
    return zone, intensity


def fallback_reflect(text: str) -> tuple:
    cleaned = text.strip()
    if len(cleaned) > 100:
        snippet = cleaned[:97] + "..."
    else:
        snippet = cleaned
    if not snippet.endswith((".", "!", "?")):
        snippet += "."
    return f"A moment captured: {snippet}", "Take a slow, deep breath."


def fallback_chat(memory_text: str, user_msg: str) -> str:
    return f"Looking back at when we felt '{memory_text[:45]}...', I hear you. We carried that feeling then, and it lives in who we are now."


@app.post("/entry", response_model=EntryResponse)
def create_entry(req: EntryRequest):
    user_text = req.text.strip()
    if not user_text:
        return EntryResponse(
            mode="reflection",
            text="",
            zone="positive",
            intensity=1,
            reflection_line="A quiet moment of stillness.",
            micro_action="Sit quietly for 60 seconds.",
            position_seed=0.5
        )

    api_key = os.environ.get("QWEN_API_KEY")
    risk = "safe"
    reflection_line = None
    micro_action = None
    zone = "positive"
    intensity = 5

    if api_key and api_key != "dummy-key":
        try:
            # 1. Guardrail check
            resp_g = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": GUARDRAIL_SYSTEM_PROMPT},
                    {"role": "user", "content": user_text}
                ],
                temperature=0.0,
                max_tokens=100,
                timeout=6.0
            )
            raw_g = resp_g.choices[0].message.content.strip()
            cleaned_g = raw_g.replace("```json", "").replace("```", "").strip()
            risk_data = json.loads(cleaned_g)
            risk = risk_data.get("risk", "safe")
        except Exception:
            risk = fallback_guardrail(user_text)

        if risk == "crisis":
            return EntryResponse(mode="crisis", text=CRISIS_RESPONSE_TEXT)

        # 2. Reflector
        try:
            resp_r = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": REFLECTOR_SYSTEM_PROMPT},
                    {"role": "user", "content": user_text}
                ],
                temperature=0.7,
                max_tokens=150,
                timeout=6.0
            )
            raw_r = resp_r.choices[0].message.content.strip()
            cleaned_r = raw_r.replace("```json", "").replace("```", "").strip()
            reflector_data = json.loads(cleaned_r)
            reflection_line = reflector_data.get("reflection_line", "A moment captured.")
            micro_action = reflector_data.get("micro_action", "Take a deep breath.")
        except Exception:
            reflection_line, micro_action = fallback_reflect(user_text)

        # 3. Analyzer
        try:
            resp_a = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": ANALYZER_SYSTEM_PROMPT},
                    {"role": "user", "content": user_text}
                ],
                temperature=0.0,
                max_tokens=100,
                timeout=6.0
            )
            raw_a = resp_a.choices[0].message.content.strip()
            cleaned_a = raw_a.replace("```json", "").replace("```", "").strip()
            analyze_data = json.loads(cleaned_a)
            zone = analyze_data.get("zone", "positive")
            intensity = int(analyze_data.get("intensity", 5))
        except Exception:
            zone, intensity = fallback_analyze(user_text)
    else:
        # Fallback when QWEN_API_KEY is not provided
        risk = fallback_guardrail(user_text)
        if risk == "crisis":
            return EntryResponse(mode="crisis", text=CRISIS_RESPONSE_TEXT)
        reflection_line, micro_action = fallback_reflect(user_text)
        zone, intensity = fallback_analyze(user_text)

    position_seed = random.random()
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        INSERT INTO entries (timestamp, raw_text, zone, intensity, reflection_line, micro_action, position_seed)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (time.time(), user_text, zone, intensity, reflection_line, micro_action, position_seed))
    entry_id = c.lastrowid
    conn.commit()
    conn.close()

    return EntryResponse(
        mode="reflection",
        id=entry_id,
        text=user_text,
        zone=zone,
        intensity=intensity,
        reflection_line=reflection_line,
        micro_action=micro_action,
        position_seed=position_seed
    )


@app.get("/entry/{entry_id}", response_model=WorldEntry)
def get_entry(entry_id: int):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM entries WHERE id = ?", (entry_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return WorldEntry(**dict(row))
    raise HTTPException(status_code=404, detail="Entry not found")


@app.get("/world", response_model=List[WorldEntry])
def get_world():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM entries ORDER BY timestamp ASC")
    rows = c.fetchall()
    conn.close()
    
    return [WorldEntry(**dict(row)) for row in rows]


@app.post("/chat", response_model=ChatResponse)
def memory_chat(req: ChatRequest):
    api_key = os.environ.get("QWEN_API_KEY")
    if api_key and api_key != "dummy-key":
        system_instruction = (
            f"You are the user's past self from a specific memory. "
            f"In that moment, your raw thought was: '{req.memory_text}'. "
            f"Your emotional state was classified as '{req.zone}' with an intensity of {req.intensity}/10. "
            f"Speak directly to the user as that specific version of themselves. "
            f"Keep your responses profound, poetic, short (1-2 sentences), and entirely rooted in the emotional context of that specific memory."
        )
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": req.user_message}
                ],
                temperature=0.7,
                max_tokens=150,
                timeout=6.0
            )
            return ChatResponse(reply=response.choices[0].message.content.strip())
        except Exception:
            return ChatResponse(reply=fallback_chat(req.memory_text, req.user_message))
    else:
        return ChatResponse(reply=fallback_chat(req.memory_text, req.user_message))

@app.get("/health")
def health():
    return {"status": "ok"}
