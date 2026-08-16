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
    api_key=os.environ.get("QWEN_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
MODEL = "qwen-plus"

DB_FILE = "ember.db"

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
            position_seed REAL
        )
    ''')
    conn.commit()
    conn.close()

init_db()


class EntryRequest(BaseModel):
    text: str


class EntryResponse(BaseModel):
    mode: str
    text: Optional[str] = None
    zone: Optional[str] = None
    intensity: Optional[int] = None
    reflection_line: Optional[str] = None
    position_seed: Optional[float] = None


class WorldEntry(BaseModel):
    id: int
    timestamp: float
    raw_text: str
    zone: str
    intensity: int
    reflection_line: str
    position_seed: float


class ChatRequest(BaseModel):
    memory_text: str
    zone: str
    intensity: int
    user_message: str

class ChatResponse(BaseModel):
    reply: str


@app.post("/entry", response_model=EntryResponse)
def create_entry(req: EntryRequest):
    user_text = req.text.strip()
    if not user_text:
        return EntryResponse(mode="reflection")

    # 1. Guardrail check
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": GUARDRAIL_SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        temperature=0.0,
        max_tokens=100,
    )
    raw = response.choices[0].message.content.strip()
    
    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        risk_data = json.loads(cleaned)
        risk = risk_data.get("risk", "safe")
    except Exception:
        risk = "crisis"

    if risk == "crisis":
        return EntryResponse(mode="crisis", text=CRISIS_RESPONSE_TEXT)

    # 2. Reflector (Outputs ONLY the text)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": REFLECTOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        temperature=0.7,
        max_tokens=150,
    )
    reflection_line = response.choices[0].message.content.strip().replace('"', '')

    # 3. Analyzer (Outputs JSON with zone and intensity)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": ANALYZER_SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        temperature=0.0,
        max_tokens=100,
    )
    analyze_raw = response.choices[0].message.content.strip()
    
    try:
        cleaned_analyze = analyze_raw.replace("```json", "").replace("```", "").strip()
        analyze_data = json.loads(cleaned_analyze)
        zone = analyze_data.get("zone", "positive")
        intensity = analyze_data.get("intensity", 5)
    except Exception as e:
        zone = "positive"
        intensity = 5

    position_seed = random.random()
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        INSERT INTO entries (timestamp, raw_text, zone, intensity, reflection_line, position_seed)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (time.time(), user_text, zone, intensity, reflection_line, position_seed))
    conn.commit()
    conn.close()

    return EntryResponse(
        mode="reflection",
        zone=zone,
        intensity=intensity,
        reflection_line=reflection_line,
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
    system_instruction = f"You are the user's past self from a specific memory. In that moment, your raw thought was: '{req.memory_text}'. Your emotional state was classified as '{req.zone}' with an intensity of {req.intensity}/10. Speak directly to the user as that specific version of themselves. Keep your responses profound, poetic, short (1-2 sentences), and entirely rooted in the emotional context of that specific memory."
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": req.user_message}
            ],
            temperature=0.7,
            max_tokens=150,
        )
        return ChatResponse(reply=response.choices[0].message.content.strip())
    except Exception as e:
        return ChatResponse(reply="I am too far away to speak right now. The signal is lost.")

@app.get("/health")
def health():
    return {"status": "ok"}
