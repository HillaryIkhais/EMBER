# EMBER › REVERIE (V4 Masterpiece)

An immersive, cinematic mood tracker that fuses the boundlessness of digital environments with deep, AI-driven psychological reflection and generative audio synthesis.

## What is Ember?
EMBER is not just a journal—it is a living visual and spatial representation of your internal world. Every entry you log is analyzed by an AI engine to determine its emotional "zone" and "intensity," which is then rendered as a physical artifact within an infinite, parallax-driven 3D landscape.

## V4 Masterpiece Features

- **Generative Audio Engine:** A custom Web Audio API synthesizer is built into the environment. It dynamically generates a beautiful ambient drone that changes its frequencies (from major 432Hz to deep sub-bass) based on the current ratio of positive vs negative memories in your archive.
- **AI Memory Commune (Chat):** Your memories are alive. Clicking on any card in the Arc Slider opens a frosted-glass chat interface where the Gemini AI assumes the persona of your *past self* from that exact moment, allowing you to converse with your history.
- **Cinematic Parallax:** A 700vh scroll-linked animation system that pulls you through the cosmic portal, down into your Arc of memories, and finally plunges you into "The Deep Void" to view your most intense memory.
- **Priority Override:** A built-in AI safety classifier that detects acute stress in your entries and elegantly overrides the UI to offer immediate grounding.

## Tech Stack
- **Frontend:** React, Next.js (Webpack), TypeScript, Tailwind CSS v4, Web Audio API.
- **Backend:** Python, FastAPI, SQLite (`ember.db`), Uvicorn.
- **AI Engine:** Google GenAI SDK replaced with Qwen API (`qwen-plus`).

---

## Deployment (Web Hosting)
Ember is now fully containerized and ready for production deployment using Docker!

### Deploying to Render / Railway
1. Push this entire repository to GitHub.
2. Go to [Render](https://render.com/) or [Railway](https://railway.app/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. The platform will automatically detect the `Dockerfile` in the root folder and build the container.
5. **CRITICAL:** You must add the following Environment Variable in your Render/Railway dashboard:
   - `QWEN_API_KEY` = `your_qwen_api_key_here`
6. Once deployed, your frontend will be accessible via the provided URL!

## How to Run Locally

You will need two terminal windows to run both servers locally.

### 1. Start the AI Backend
```bash
cd backend
# Make sure your QWEN_API_KEY environment variable is set!
uvicorn main:app --reload
```
*The backend runs on `http://localhost:8000`.*

### 2. Start the Immersive Frontend
```bash
cd frontend
npm run dev
```
*The frontend runs on `http://localhost:3000`. Ensure you have cleared your `.next` cache if you encounter `ENOENT` errors.*
