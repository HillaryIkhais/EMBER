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
      <body className="antialiased text-[#e8e8ed] bg-[#05060f] overflow-hidden">
        
        {/* TRUE 3D INTERACTIVE DIORAMA */}
        <div className="fixed inset-0 z-0 pointer-events-auto">
          <SceneWrapper />
        </div>

        {/* GLOBAL NAVIGATION (Diegetic UI) */}
        <nav className="fixed top-0 left-0 w-full p-8 z-50 flex justify-between items-start pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-1">
            <h1 className="font-title text-2xl tracking-[0.2em] text-[#e8e8ed]/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">EMBER</h1>
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#a3a3b5]/80">Sanctuary</p>
          </div>
          <div className="flex gap-8 pointer-events-auto">
            <a href="/" className="font-title text-xs tracking-[0.2em] uppercase text-[#a3a3b5] hover:text-[#e8e8ed] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500">
              Journal
            </a>
            <a href="/log" className="font-title text-xs tracking-[0.2em] uppercase text-[#a3a3b5] hover:text-[#e8e8ed] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500">
              New Entry
            </a>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="relative z-30 w-full h-screen pointer-events-none">
          {/* We set pointer-events-none on main so the user can click through the UI to drag the 3D island, but re-enable it on specific interactive elements inside page.tsx */}
          {children}
        </main>

        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400&display=swap');
          
          .font-title { font-family: 'Cinzel', serif; }
          .font-body { font-family: 'Cormorant Garamond', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
        `}} />
      </body>
    </html>
  );
}
