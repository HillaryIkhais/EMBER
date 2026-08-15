import json
import os
import sqlite3
import random
import time
from typing import List, Optional

from google import genai
from google.genai import types

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

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"

DB_FILE = "ember.db"

def init_db():
    # We will recreate the DB to match the new schema for V2
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


@app.post("/entry", response_model=EntryResponse)
def create_entry(req: EntryRequest):
    user_text = req.text.strip()
    if not user_text:
        return EntryResponse(mode="reflection")

    # 1. Guardrail check
    guardrail_msg = client.models.generate_content(
        model=MODEL,
        contents=user_text,
        config=types.GenerateContentConfig(
            system_instruction=GUARDRAIL_SYSTEM_PROMPT,
            temperature=0.0,
            max_output_tokens=100,
        )
    )
    raw = guardrail_msg.text.strip()
    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        risk_data = json.loads(cleaned)
        risk = risk_data.get("risk", "safe")
    except Exception:
        risk = "crisis"

    if risk == "crisis":
        return EntryResponse(mode="crisis", text=CRISIS_RESPONSE_TEXT)

    # 2. Reflector (Outputs ONLY the text)
    reflect_msg = client.models.generate_content(
        model=MODEL,
        contents=user_text,
        config=types.GenerateContentConfig(
            system_instruction=REFLECTOR_SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=150,
        )
    )
    reflection_line = reflect_msg.text.strip().replace('"', '')

    # 3. Analyzer (Outputs JSON with zone and intensity)
    analyze_msg = client.models.generate_content(
        model=MODEL,
        contents=user_text,
        config=types.GenerateContentConfig(
            system_instruction=ANALYZER_SYSTEM_PROMPT,
            temperature=0.0,
            max_output_tokens=100,
        )
    )
    analyze_raw = analyze_msg.text.strip()
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


@app.get("/world", response_model=List[WorldEntry])
def get_world():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM entries ORDER BY timestamp ASC")
    rows = c.fetchall()
    conn.close()
    
    return [WorldEntry(**dict(row)) for row in rows]


@app.get("/health")
def health():
    return {"status": "ok"}
