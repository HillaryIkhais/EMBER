# EMBER › REVERIE

> *"Tending a world of your own making, one honest feeling at a time."*

---

## ✦ The Story Behind Ember

Most mood trackers fail for a very human reason: **blank-page paralysis and streak guilt**. 

When you're overwhelmed, opening a journal app and seeing a empty text box or a broken "7-day streak" counter feels like homework you forgot to turn in. So, people quit. 

**Ember flips the script.** 

Instead of asking you to log data for an algorithm, Ember gives your inner world a home. Every time you write what’s actually going on—whether it’s quiet joy or heavy grief—Ember doesn't just log text. It **plants a living artifact in a visual, spatial universe that is uniquely yours**.

- Hard, heavy thoughts sink gently into **The Void**, taking root in cool, deep tones.
- Bright, grounding thoughts blossom in **The Light**, glowing with warmth.

Over time, you aren't staring at old logs or streak numbers. You’re looking at a living landscape built out of your own honesty—a place that visibly holds both the weight and the light of everything you've lived through.

---

## The Ember Experience

### 1. The Living Canvas & Parallax Arc
Your memories aren't buried in rows of text. They exist as illuminated embers within an interactive, parallax-driven 3D sky. As you scroll down the page, you travel through your personal memory continuum—from the vibrant constellation of your brightest moments down to the quiet depths of **The Void**.

### 2. Generative Ambient Audio
Ember listens to the emotional balance of your world. Built with the Web Audio API, an integrated generative synthesizer creates a soft, dynamic ambient drone:
- When your world leans toward light, harmonic 432Hz major tones drift through the air.
- When heavy memories accumulate, deep sub-bass frequencies anchor the soundscape.

### 3. The Memory Commune (Dialogue with Your Past Self)
What if you could speak directly to the person you were three weeks ago? 
Clicking any ember in your landscape opens the **Commune**—a frosted-glass dialogue interface where AI assumes the exact emotional persona of your past self from that moment, letting you offer comfort, seek perspective, or simply listen.

### 4. Uncompromising AI Safety (Guardrail First)
Wellness technology must be responsible. Before any reflection runs, every entry passes through an isolated **Guardrail Classifier**:
- If acute stress or crisis is detected, all visual planting and AI generation stop immediately.
- The UI gracefully shifts to plain, compassionate, real-world crisis support resources (988 Helpline, Crisis Text Line) without judgment or delay.

---

## Technology & Craft

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS, Web Audio API, Framer Motion |
| **Backend** | Python, FastAPI, SQLite (`ember.db`), Uvicorn |
| **AI Engine** | Qwen AI (`qwen-plus`) for Guardrail, Reflection & Memory Persona synthesis |
| **Deployment** | Vercel (Frontend & Serverless Backend) / Docker |

---

## Running Ember Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- A `QWEN_API_KEY` (or compatible DashScope API key)

### 1. Launch the Backend
```bash
# Navigate to the backend directory
cd backend

# Set your API key
export QWEN_API_KEY="your_api_key_here"

# Install dependencies (if needed)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```
*The backend API will run on `http://localhost:8000`.*

### 2. Launch the Frontend
In a separate terminal window:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```
*Open `http://localhost:3000` in your browser to experience Ember.*


---

## A Note on Wellness

Ember is designed as a daily practice of naming what is true—a peaceful harbor for self-expression and reflection. **It is not therapy, diagnosis, or clinical treatment.** Ember honors the space between keeping things inside and seeking professional support, giving you a quiet place to tend to yourself.
