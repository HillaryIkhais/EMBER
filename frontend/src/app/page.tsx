"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const PORTAL_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779974947/portal_bg_mu60k9.png';
const CURTAIN_LEFT = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975070/curtain_left_cdht6q.png';
const CURTAIN_RIGHT = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975071/curtain_right_a9bn3i.png';
const WORLD_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975077/world_bg_jzzcn1.jpg';

interface WorldEntry {
  id: number;
  timestamp: number;
  raw_text: string;
  zone: "positive" | "negative";
  intensity: number;
  reflection_line: string;
  position_seed: number;
}

// Math Utilities
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const getZoneColor = (zone: string, intensity: number) => {
  if (zone === "positive") {
    if (intensity > 7) return '#f0e4c0';
    if (intensity > 4) return '#dcedc2';
    return '#c3e3f4';
  } else {
    if (intensity > 7) return '#3a2530';
    if (intensity > 4) return '#f3cdd6';
    return '#dcd2f2';
  }
};

const getZoneTextColor = (zone: string, intensity: number) => {
  if (zone === "negative" && intensity > 7) return '#ffffff';
  return '#3a2530';
};

const getZoneSubtextColor = (zone: string, intensity: number) => {
  if (zone === "negative" && intensity > 7) return 'rgba(255,255,255,0.65)';
  return 'rgba(58,37,48,0.65)';
};

export default function EmberReverie() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // App State
  const [entries, setEntries] = useState<WorldEntry[]>([]);

  // Computed data
  const mostIntenseEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return entries.reduce((prev, curr) => (curr.intensity > prev.intensity ? curr : prev));
  }, [entries]);

  // Parallax Refs
  const worldRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const curtainLeftRef = useRef<HTMLImageElement>(null);
  const curtainRightRef = useRef<HTMLImageElement>(null);
  
  const scene1Ref = useRef<HTMLDivElement>(null);
  const scene2Ref = useRef<HTMLDivElement>(null);
  const arcSliderRef = useRef<HTMLDivElement>(null);
  const scene3Ref = useRef<HTMLDivElement>(null);
  
  const stateRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    scrollProgress: 0,
    entranceDone: false,
    rotationOffset: 0,
  });

  // Fetch backend data
  useEffect(() => {
    fetch(process.env.NODE_ENV === "production" ? "/api/backend/world" : "http://localhost:8000/world")
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  }, []);

  const openMemoryChat = (entry: WorldEntry) => {
    router.push(`/commune/${entry.id}`);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    setTimeout(() => {
      setMounted(true);
    }, 100);

    setTimeout(() => {
      stateRef.current.entranceDone = true;
    }, 2200);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      stateRef.current.targetX = (e.clientX - cx) / cx;
      stateRef.current.targetY = (e.clientY - cy) / cy;
    };

    const handleScroll = () => {
      const scrollableHeight = document.body.scrollHeight - window.innerHeight;
      stateRef.current.scrollProgress = clamp(window.scrollY / scrollableHeight, 0, 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let reqId: number;
    const tick = () => {
      const st = stateRef.current;
      st.currentX = lerp(st.currentX, st.targetX, 0.07);
      st.currentY = lerp(st.currentY, st.targetY, 0.07);
      
      const rx = st.currentX;
      const ry = st.currentY;
      const sp = st.scrollProgress;
      const ep = easeInOut(clamp(sp / 0.5, 0, 1)); 

      const voidFade = clamp((sp - 0.7) / 0.2, 0, 1);
      
      if (worldRef.current) {
        const scale = lerp(1, 1.25, ep);
        worldRef.current.style.transform = `scale(${scale}) translate3d(${rx * -6}px, ${ry * -6}px, 0)`;
        worldRef.current.style.filter = `brightness(${1 - (voidFade * 0.9)}) blur(${voidFade * 10}px)`;
      }

      if (portalRef.current) {
        const scale = lerp(1, 12, ep);
        const opacity = clamp(1 - (sp - 0.3) / 0.15, 0, 1);
        portalRef.current.style.transform = `scale(${scale}) translate3d(${rx * -7}px, ${ry * -7}px, 0)`;
        portalRef.current.style.opacity = `${opacity}`;
      }

      if (curtainLeftRef.current && curtainRightRef.current) {
        const shiftScroll = lerp(0, 150, ep);
        const scale = lerp(1, 1.3, ep);
        
        curtainLeftRef.current.style.transform = `translateX(calc(-62% - ${shiftScroll}% + ${rx * -14}px)) translateY(${ry * -4.2}px) scale(${scale}) translateZ(0)`;
        curtainRightRef.current.style.transform = `translateX(calc(62% + ${shiftScroll}% + ${rx * -14}px)) translateY(${ry * -4.2}px) scale(${scale}) translateZ(0)`;
        
        const opacity = clamp(1 - (sp - 0.4) / 0.1, 0, 1);
        curtainLeftRef.current.style.opacity = `${opacity}`;
        curtainRightRef.current.style.opacity = `${opacity}`;

        if (!st.entranceDone) {
            curtainLeftRef.current.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
            curtainRightRef.current.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
            if (!mounted) {
              curtainLeftRef.current.style.transform = `translateX(0%)`;
              curtainRightRef.current.style.transform = `translateX(0%)`;
            }
        } else {
            curtainLeftRef.current.style.transition = 'none';
            curtainRightRef.current.style.transition = 'none';
        }
      }

      // Scene 1: Hero
      if (scene1Ref.current) {
        const opacity = clamp(1 - sp / 0.15, 0, 1);
        scene1Ref.current.style.opacity = `${opacity}`;
        scene1Ref.current.style.pointerEvents = opacity > 0 ? "auto" : "none";
      }

      // Scene 2: Arc Slider
      if (scene2Ref.current) {
        let opacity = 0;
        if (sp >= 0.25 && sp <= 0.75) {
          if (sp < 0.35) opacity = (sp - 0.25) / 0.1;
          else if (sp > 0.65) opacity = 1 - (sp - 0.65) / 0.1;
          else opacity = 1;
        }
        
        scene2Ref.current.style.opacity = `${opacity}`;
        scene2Ref.current.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
        
        const totalCards = entries.length;
        if (arcSliderRef.current) {
          arcSliderRef.current.style.opacity = `${opacity}`;
          arcSliderRef.current.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
        }
        
        if (totalCards > 0 && arcSliderRef.current) {
          const arcSweepDeg = (totalCards - 1) * 10;
          const sliderProgress = clamp((sp - 0.35) / 0.30, 0, 1);
          const targetRotation = lerp(0, arcSweepDeg, sliderProgress);
          st.rotationOffset = targetRotation;
          
          const cards = arcSliderRef.current.children;
          const cardSpacingDeg = isMobile ? 12 : 9;
          const centerIndex = Math.floor(totalCards / 2);
          const arcRadius = isMobile ? 700 : 1100;
          const halfW = isMobile ? 80 : 110;
          
          for (let i = 0; i < cards.length; i++) {
            const el = cards[i] as HTMLElement;
            const baseDeg = (i - centerIndex) * cardSpacingDeg;
            const deg = baseDeg - st.rotationOffset + (centerIndex * cardSpacingDeg);
            const rad = deg * Math.PI / 180;
            const x = Math.sin(rad) * arcRadius;
            const y = arcRadius - Math.cos(rad) * arcRadius;
            
            const plunge = voidFade * 300; 
            
            const bottomOffset = isMobile ? 140 : 200;
            el.style.transform = `rotate(${deg}deg)`;
            el.style.bottom = `${-y + bottomOffset - plunge}px`;
            el.style.left = `calc(50% + ${x - halfW}px)`;
          }
        }
      }

      // Scene 3: Deep Void
      if (scene3Ref.current) {
        scene3Ref.current.style.opacity = `${voidFade}`;
        scene3Ref.current.style.pointerEvents = voidFade > 0.8 ? "auto" : "none";
        
        const floatY = Math.sin(Date.now() / 1500) * 10;
        scene3Ref.current.style.transform = `translateY(${floatY}px) scale(${lerp(0.95, 1, voidFade)})`;
      }

      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(reqId);
    };
  }, [mounted, isMobile, entries.length]);

  const scrollToArc = () => {
    window.scrollTo({ top: (document.body.scrollHeight - window.innerHeight) * 0.5, behavior: 'smooth' });
  };

  const NavItem = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="group relative uppercase text-[12px] tracking-[0.15em] text-white/80 hover:text-white transition-colors py-2 cursor-pointer outline-none bg-transparent border-none"
    >
      {label}
      <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
    </button>
  );

  const StarLogo = () => (
    <svg viewBox="0 0 28 28" width="28" height="28" className="inline-block cursor-pointer hover:scale-110 transition-transform" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
      <path d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z" fill="white" opacity="0.9" />
      <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );

  return (
    <div style={{ height: "700vh", width: "100%", position: "relative" }} className="bg-[#0a0608]">
      
      {/* Sticky Container */}
      <div className="sticky top-0 left-0 w-full h-[100vh] overflow-hidden bg-[#0a0608] font-sans">
        
        <div ref={worldRef} className="absolute inset-0 w-full h-full bg-cover bg-center origin-center will-change-transform z-0" style={{ backgroundImage: `url(${WORLD_BG})` }} />
        <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[#0a0608] via-[rgba(10,6,8,0.7)] to-transparent z-[5]"></div>

        {/* Arc Card Slider */}
        <div ref={arcSliderRef} className="absolute left-0 right-0 z-[9] pointer-events-none" style={{ bottom: isMobile ? '60px' : '80px', opacity: 0 }}>
          {entries.map((entry, i) => {
            const cardW = isMobile ? 160 : 220;
            const cardH = isMobile ? 175 : 230;
            const arcRadius = isMobile ? 700 : 1100;
            const bgColor = getZoneColor(entry.zone, entry.intensity);
            const textColor = getZoneTextColor(entry.zone, entry.intensity);
            const subColor = getZoneSubtextColor(entry.zone, entry.intensity);
            
            return (
              <div 
                key={entry.id}
                onClick={() => openMemoryChat(entry)}
                className="absolute flex flex-col justify-between p-5 pointer-events-auto group cursor-pointer transition-all duration-500 hover:z-50 hover:scale-105"
                style={{
                  width: `${cardW}px`, height: `${cardH}px`,
                  borderRadius: isMobile ? '18px' : '26px',
                  backgroundColor: bgColor,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                  transformOrigin: `${cardW/2}px ${arcRadius}px`,
                  willChange: 'transform, left, bottom'
                }}
              >
                <div className="absolute inset-0 rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `0 0 30px ${bgColor}` }}></div>
                <div className="w-full flex justify-end relative z-10">
                  <div className="w-[24px] h-[24px] rounded-full flex items-center justify-center font-sans text-[10px]" style={{ border: `1.5px solid ${subColor}`, color: subColor }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="font-serif leading-tight mb-2 group-hover:-translate-y-1 transition-transform duration-500" style={{ fontSize: isMobile ? '22px' : '26px', color: textColor }}>
                    {entry.reflection_line}
                  </h3>
                  <p className="font-sans line-clamp-2 opacity-80" style={{ fontSize: isMobile ? '12px' : '14px', color: subColor }}>
                    {entry.raw_text}
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <div className="bg-black/10 backdrop-blur-md rounded-full px-3 py-1 text-[10px] uppercase tracking-widest text-black/70 font-bold border border-black/10">Commune</div>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={portalRef} className="absolute inset-0 w-full h-full bg-cover bg-center will-change-transform z-[15]" style={{ backgroundImage: `url(${PORTAL_BG})`, transformOrigin: "52% 38%" }} />
        <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent pointer-events-none z-[16]"></div>
        <img ref={curtainLeftRef} src={CURTAIN_LEFT} alt="Curtain Left" className="absolute inset-0 w-full h-full object-cover object-right origin-left will-change-transform z-[16]" />
        <img ref={curtainRightRef} src={CURTAIN_RIGHT} alt="Curtain Right" className="absolute inset-0 w-full h-full object-cover object-left origin-right will-change-transform z-[16]" />
        <div className="absolute top-0 w-full h-[42vh] bg-gradient-to-b from-[rgba(0,0,0,0.6)] to-transparent pointer-events-none z-[45]"></div>

        {/* NAVIGATION */}
        <nav className="absolute top-0 w-full z-[100] flex items-center justify-between transition-opacity duration-700" style={{ padding: isMobile ? "18px 20px" : "28px 60px", opacity: mounted ? 1 : 0 }}>
          {isMobile ? (
            <>
              <NavItem label="Memories" onClick={scrollToArc} />
              <div className="absolute left-1/2 -translate-x-1/2"><StarLogo /></div>
              <NavItem label="Insights" onClick={() => router.push('/insights')} />
            </>
          ) : (
            <>
              <div className="flex gap-[48px]">
                <NavItem label="Memories" onClick={scrollToArc} />
                <NavItem label="Insights" onClick={() => router.push('/insights')} />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2"><StarLogo /></div>
              <div className="flex gap-[48px]">
                <NavItem label="Sanctuary" onClick={() => {}} />
                <NavItem label="Log" onClick={() => router.push('/log')} />
              </div>
            </>
          )}
        </nav>

        {/* SCENE 1 UI */}
        <div ref={scene1Ref} className="absolute inset-0 z-[20] flex w-full h-full" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.9s ease 300ms, transform 0.9s ease 300ms" }}>
          <div className="w-full flex-col items-center justify-center text-center px-[24px] pt-[80px] pb-[100px] md:hidden flex">
            <h1 className="font-serif leading-none tracking-tight text-[#3b1a0a] flex flex-col items-center drop-shadow-sm mb-4">
              <span className="text-[clamp(26px,7vw,42px)] tracking-widest mb-1">FALL <span className="text-[#6b2e0e] text-[0.8em]">›</span> <span className="italic">INTO</span></span>
              <span className="text-[clamp(52px,16vw,80px)]">EMBER</span>
            </h1>
            <p className="font-sans text-[15px] leading-relaxed text-[#5c2d0e] max-w-[280px] mb-12">An immersive digital environment mapped entirely by your emotional state.</p>
          </div>
          <div className="hidden md:block w-full h-full">
            <div className="absolute top-[46%] left-[80px] xl:left-[120px] max-w-[480px] -translate-y-1/2 z-10 transition-all delay-300">
              <h1 className="font-serif text-white flex flex-col mb-6 drop-shadow-2xl" style={{ textShadow: "0 4px 32px rgba(0,0,0,0.8)" }}>
                <span className="text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[0.06em] mb-1">FALL <span className="text-[rgba(255,220,180,0.7)]">›</span> <span className="italic">INTO</span></span>
                <span className="text-[clamp(50px,8vw,110px)] leading-[0.9] tracking-[-0.02em]">EMBER</span>
              </h1>
              <p className="font-sans text-[18px] leading-[1.7] text-white/80 max-w-[340px]">A living emotional archive. Your mind mapped as boundless digital architecture.</p>
            </div>
            <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity delay-[900ms]">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
              <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center animate-bobUp"><div className="w-1 h-1 bg-white rounded-full"></div></div>
            </div>
          </div>
        </div>

        {/* SCENE 2 UI */}
        <div ref={scene2Ref} className="absolute inset-0 z-[46] flex flex-col items-center pointer-events-none" style={{ opacity: 0 }}>
          <div className="text-center px-6 max-w-4xl flex flex-col items-center" style={{ marginTop: isMobile ? '10vh' : '12vh' }}>
            <h2 className="font-serif text-white uppercase tracking-[0.06em] leading-[1.05] mb-4 drop-shadow-2xl" style={{ fontSize: isMobile ? "28px" : "64px" }}>YOUR LIVING ARCHIVE</h2>
            <p className="font-sans text-white/70 leading-[1.6]" style={{ fontSize: isMobile ? "14px" : "18px", maxWidth: isMobile ? "280px" : "480px" }}>These are the fragments of your journey. Hover and click to commune.</p>
          </div>
        </div>

        {/* SCENE 3 UI */}
        <div ref={scene3Ref} className="absolute inset-0 z-[40] flex flex-col items-center justify-center pointer-events-none" style={{ opacity: 0 }}>
          <div className="text-center px-6 max-w-4xl flex flex-col items-center">
            <span className="text-white/40 uppercase tracking-[0.4em] text-[10px] mb-8">The Deep Void</span>
            {mostIntenseEntry ? (
              <div className="relative group pointer-events-auto cursor-pointer" onClick={() => openMemoryChat(mostIntenseEntry)}>
                <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <h2 className="font-serif text-white leading-tight mb-8 relative z-10 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-transform duration-1000 group-hover:scale-105" style={{ fontSize: isMobile ? "32px" : "72px", color: getZoneColor(mostIntenseEntry.zone, mostIntenseEntry.intensity) }}>"{mostIntenseEntry.reflection_line}"</h2>
                <div className="inline-block border border-white/20 rounded-full px-6 py-2 text-white/60 text-xs uppercase tracking-widest relative z-10 group-hover:bg-white/10 transition-colors">Commune with this Memory</div>
              </div>
            ) : (
              <h2 className="font-serif text-white/30 text-4xl">No memories profound enough yet.</h2>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
