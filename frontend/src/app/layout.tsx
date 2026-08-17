import type { Metadata } from "next";
import SceneWrapper from "./components/SceneWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ember Sanctuary",
  description: "An immersive spatial sanctuary for your thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-[#e8e8ed] overflow-hidden select-none bg-[#050714]">
        
        {/* 2.5D LAYERED ENVIRONMENT (Velaris Visual Identity) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          
          {/* Layer 1: The Twilight Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1128] via-[#1a103c] to-[#2b1b54] opacity-90" />
          
          {/* Layer 2: The WebGL Magic (Stars & Wisps) */}
          <div className="absolute inset-0 z-10">
            <SceneWrapper />
          </div>

          {/* Layer 3: The City Glow (Behind the mountains) */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#a388e8]/30 blur-[120px] mix-blend-screen z-10" style={{ animation: 'breatheGlow 10s ease-in-out infinite' }} />

          {/* Layer 4: The Mountain Silhouette Horizon */}
          <div className="absolute bottom-0 w-full h-[40vh] min-h-[300px] z-20">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
              {/* Midground Mountains */}
              <path fill="#120b29" d="M0,160L48,138.7C96,117,192,75,288,85.3C384,96,480,160,576,170.7C672,181,768,139,864,122.7C960,107,1056,117,1152,144C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              {/* Foreground Mountains */}
              <path fill="#050714" d="M0,224L60,197.3C120,171,240,117,360,128C480,139,600,213,720,229.3C840,245,960,203,1080,170.7C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
          </div>
        </div>

        {/* GLOBAL NAVIGATION (Diegetic UI) */}
        <nav className="fixed top-0 left-0 w-full p-8 z-50 flex justify-between items-start pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-1">
            <h1 className="font-title text-2xl tracking-[0.2em] text-[#e8e8ed]/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">EMBER</h1>
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#a3a3b5]/80">Sanctuary</p>
          </div>
          <div className="flex gap-8 pointer-events-auto">
            <a href="/" className="font-title text-xs tracking-[0.2em] uppercase text-[#a3a3b5] hover:text-[#e8e8ed] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500">
              Constellation
            </a>
            <a href="/log" className="font-title text-xs tracking-[0.2em] uppercase text-[#a3a3b5] hover:text-[#e8e8ed] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500">
              Whisper
            </a>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="relative z-30 w-full h-screen">
          {children}
        </main>

        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400&display=swap');
          
          .font-title { font-family: 'Cinzel', serif; }
          .font-body { font-family: 'Cormorant Garamond', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
          
          @keyframes breatheGlow {
            0%, 100% { opacity: 0.3; transform: scaleX(1); }
            50% { opacity: 0.6; transform: scaleX(1.1); }
          }
        `}} />
      </body>
    </html>
  );
}
