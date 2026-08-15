"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";

const PORTAL_BG = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779707217/image_1_vdzwae.png';
const CURTAIN_LEFT = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706559/curtain_left_znkmva.png';
const CURTAIN_RIGHT = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706564/curtain_right_paeyym.png';
const WORLD_BG = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706392/image_2_gkcdlx.png';
const BOTTOM_CLOUDS = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706555/bottom_clouds_xskut6.png';

const CARD_IMAGES = [
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85',
];

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

// Zone Color Mapper for Cards
const getZoneColor = (zone: string, intensity: number) => {
  if (zone === "positive") {
    if (intensity > 7) return '#f0e4c0'; // Gilded Dusk
    if (intensity > 4) return '#dcedc2'; // Wild Solitudes
    return '#c3e3f4'; // Silent Havens
  } else {
    if (intensity > 7) return '#3a2530'; // Dark/Heavy (custom)
    if (intensity > 4) return '#f3cdd6'; // Hidden Realms
    return '#dcd2f2'; // Vivid Drifts
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
  
  // Backend State
  const [entries, setEntries] = useState<WorldEntry[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [crisisText, setCrisisText] = useState<string | null>(null);

  // Parallax Refs
  const worldRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLImageElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const curtainLeftRef = useRef<HTMLImageElement>(null);
  const curtainRightRef = useRef<HTMLImageElement>(null);
  
  const scene1Ref = useRef<HTMLDivElement>(null);
  const scene2Ref = useRef<HTMLDivElement>(null);
  const arcSliderRef = useRef<HTMLDivElement>(null);
  
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
    fetch("http://localhost:8000/world")
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    setCrisisText(null);
    
    try {
      const res = await fetch("http://localhost:8000/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      const data = await res.json();
      
      if (data.mode === "crisis") {
        setCrisisText(data.text);
      } else {
        const newEntry = {
          id: Date.now(),
          timestamp: Date.now(),
          raw_text: inputText,
          zone: data.zone,
          intensity: data.intensity,
          reflection_line: data.reflection_line,
          position_seed: data.position_seed
        };
        setEntries(prev => [...prev, newEntry]);
      }
      setInputText("");
      
      // Auto-scroll to the Arc Slider to show the new entry if we have some
      if (entries.length > 0) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    handleScroll(); // init

    let reqId: number;
    const tick = () => {
      const st = stateRef.current;
      st.currentX = lerp(st.currentX, st.targetX, 0.07);
      st.currentY = lerp(st.currentY, st.targetY, 0.07);
      
      const rx = st.currentX;
      const ry = st.currentY;
      const sp = st.scrollProgress;
      const ep = easeInOut(sp);

      // World Layer (MAG=6)
      if (worldRef.current) {
        const scale = lerp(1, 1.18, ep);
        worldRef.current.style.transform = `scale(${scale}) translate3d(${rx * -6}px, ${ry * -6}px, 0)`;
      }
      
      // Bottom Clouds (MAG=9, Y=0.4x)
      if (cloudsRef.current) {
        const scale = lerp(1, 1.4, ep);
        cloudsRef.current.style.transform = `scale(${scale}) translate3d(${rx * -9}px, ${ry * -3.6}px, 0)`;
        const opacity = clamp(sp / 0.05, 0.7, 1);
        cloudsRef.current.style.opacity = `${opacity}`;
      }

      // Portal Frame (MAG=7)
      if (portalRef.current) {
        const scale = lerp(1, 7.5, ep);
        const opacity = clamp(1 - (sp - 0.65) / 0.2, 0, 1);
        portalRef.current.style.transform = `scale(${scale}) translate3d(${rx * -7}px, ${ry * -7}px, 0)`;
        portalRef.current.style.opacity = `${opacity}`;
      }

      // Curtains (MAG=14, Y=0.3x)
      if (curtainLeftRef.current && curtainRightRef.current) {
        const shiftScroll = lerp(0, 150, ep);
        const scale = lerp(1, 1.3, ep);
        
        curtainLeftRef.current.style.transform = `translateX(calc(-62% - ${shiftScroll}% + ${rx * -14}px)) translateY(${ry * -4.2}px) scale(${scale}) translateZ(0)`;
        curtainRightRef.current.style.transform = `translateX(calc(62% + ${shiftScroll}% + ${rx * -14}px)) translateY(${ry * -4.2}px) scale(${scale}) translateZ(0)`;
        
        if (!st.entranceDone) {
            curtainLeftRef.current.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
            curtainRightRef.current.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
            // If we are before mount animation trigger
            if (!mounted) {
              curtainLeftRef.current.style.transform = `translateX(0%)`;
              curtainRightRef.current.style.transform = `translateX(0%)`;
            }
        } else {
            curtainLeftRef.current.style.transition = 'none';
            curtainRightRef.current.style.transition = 'none';
        }
      }

      // Scene 1 Opacity
      if (scene1Ref.current) {
        const opacity = clamp(1 - sp / 0.22, 0, 1);
        scene1Ref.current.style.opacity = `${opacity}`;
        scene1Ref.current.style.pointerEvents = opacity > 0 ? "auto" : "none";
      }

      // Scene 2 Opacity (and Arc Slider Rotation)
      if (scene2Ref.current) {
        const opacity = clamp((sp - 0.68) / 0.16, 0, 1);
        scene2Ref.current.style.opacity = `${opacity}`;
        scene2Ref.current.style.pointerEvents = opacity > 0 ? "auto" : "none";
        
        // Arc Slider calculations
        const totalCards = entries.length;
        if (totalCards > 0 && arcSliderRef.current) {
          arcSliderRef.current.style.opacity = `${opacity}`;
          const arcSweepDeg = (totalCards - 1) * 10;
          const targetRotation = lerp(0, arcSweepDeg, clamp((sp - 0.70) / 0.30, 0, 1));
          st.rotationOffset = targetRotation;
          
          // Apply rotation directly to children cards to avoid React renders
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
            
            const bottomOffset = isMobile ? 140 : 200;
            el.style.transform = `rotate(${deg}deg)`;
            el.style.bottom = `${-y + bottomOffset}px`;
            el.style.left = `calc(50% + ${x - halfW}px)`;
          }
        }
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

  const StarLogo = () => (
    <svg viewBox="0 0 28 28" width="28" height="28" className="inline-block">
      <path d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z" fill="white" opacity="0.9" />
      <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.6" />
      <circle cx="6" cy="6" r="1" fill="white" opacity="0.4" />
      <circle cx="22" cy="6" r="1" fill="white" opacity="0.4" />
    </svg>
  );

  const PlayIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  return (
    <div style={{ height: "480vh", width: "100%", position: "relative" }} className="bg-[#0a0608]">
      {/* Sticky Container */}
      <div className="sticky top-0 left-0 w-full h-[100vh] overflow-hidden bg-[#0a0608] font-sans">
        
        {/* Layer 1: World Background */}
        <div 
          ref={worldRef} 
          className="absolute inset-0 w-full h-full bg-cover bg-center origin-center will-change-transform z-0"
          style={{ backgroundImage: `url(${WORLD_BG})` }}
        />

        {/* Layer 2: Bottom Clouds */}
        <img 
          ref={cloudsRef}
          src={BOTTOM_CLOUDS}
          alt="Clouds"
          className="absolute bottom-0 left-0 right-0 w-full h-auto origin-bottom will-change-transform z-10"
        />

        {/* Layer 2.5: Arc Card Slider */}
        <div 
          ref={arcSliderRef}
          className="absolute left-0 right-0 z-[9] pointer-events-none"
          style={{ bottom: isMobile ? '60px' : '80px', opacity: 0 }}
        >
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
                className="absolute flex flex-col justify-between p-4 pointer-events-auto"
                style={{
                  width: `${cardW}px`,
                  height: `${cardH}px`,
                  borderRadius: isMobile ? '18px' : '26px',
                  backgroundColor: bgColor,
                  boxShadow: '0 8px 40px rgba(80,40,60,0.18)',
                  transformOrigin: `${cardW/2}px ${arcRadius}px`,
                  willChange: 'transform, left, bottom'
                }}
              >
                <div className="w-full flex justify-end">
                  <div className="w-[24px] h-[24px] rounded-full flex items-center justify-center font-sans text-[10px]"
                       style={{ border: `1.5px solid ${subColor}`, color: subColor }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
                <div>
                  <h3 className="font-serif leading-tight mb-2" 
                      style={{ fontSize: isMobile ? '22px' : '30px', color: textColor }}>
                    {entry.reflection_line}
                  </h3>
                  <p className="font-sans line-clamp-3" 
                     style={{ fontSize: isMobile ? '12px' : '15px', color: subColor }}>
                    {entry.raw_text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Layer 3: Portal Frame */}
        <div 
          ref={portalRef}
          className="absolute inset-0 w-full h-full bg-cover bg-center will-change-transform z-[15]"
          style={{ 
            backgroundImage: `url(${PORTAL_BG})`,
            transformOrigin: "52% 38%"
          }}
        />

        {/* Layer 3.5: Bottom Fade */}
        <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-[rgba(0,0,0,0.45)] to-transparent pointer-events-none z-[16]"></div>

        {/* Layer 4L & 4R: Curtains */}
        <img 
          ref={curtainLeftRef}
          src={CURTAIN_LEFT}
          alt="Curtain Left"
          className="absolute inset-0 w-full h-full object-cover object-right origin-left will-change-transform z-[16]"
        />
        <img 
          ref={curtainRightRef}
          src={CURTAIN_RIGHT}
          alt="Curtain Right"
          className="absolute inset-0 w-full h-full object-cover object-left origin-right will-change-transform z-[16]"
        />

        {/* Top Fade Gradient */}
        <div className="absolute top-0 w-full h-[42vh] bg-gradient-to-b from-[rgba(0,0,0,0.45)] to-transparent pointer-events-none z-[45]"></div>

        {/* NAVIGATION */}
        <nav className="absolute top-0 w-full z-[50] flex items-center justify-between"
             style={{ padding: isMobile ? "18px 20px" : "22px 48px" }}>
          {isMobile ? (
            <>
              <span className="uppercase text-[11px] tracking-[0.12em] text-white/90">Explore</span>
              <div className="absolute left-1/2 -translate-x-1/2"><StarLogo /></div>
              <span className="uppercase text-[11px] tracking-[0.12em] text-white/90">Connect</span>
            </>
          ) : (
            <>
              <div className="flex gap-[36px]">
                <a href="#" className="uppercase text-[12px] tracking-[0.12em] text-white/90 no-underline hover:text-white transition-colors">Worlds</a>
                <a href="#" className="uppercase text-[12px] tracking-[0.12em] text-white/90 no-underline hover:text-white transition-colors">Atelier</a>
                <a href="#" className="uppercase text-[12px] tracking-[0.12em] text-white/90 no-underline hover:text-white transition-colors">Immersions</a>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2"><StarLogo /></div>
              <div className="flex gap-[36px]">
                <a href="#" className="uppercase text-[12px] tracking-[0.12em] text-white/90 no-underline hover:text-white transition-colors">Craft</a>
                <a href="#" className="uppercase text-[12px] tracking-[0.12em] text-white/90 no-underline hover:text-white transition-colors">Codex</a>
                <a href="#" className="uppercase text-[12px] tracking-[0.12em] text-white/90 no-underline hover:text-white transition-colors">Connect</a>
              </div>
            </>
          )}
        </nav>

        {/* SCENE 1 UI */}
        <div 
          ref={scene1Ref} 
          className="absolute inset-0 z-[20] flex w-full h-full"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s ease 300ms, transform 0.9s ease 300ms"
          }}
        >
          {/* MOBILE LAYOUT */}
          <div className="w-full flex-col items-center justify-center text-center px-[24px] pt-[80px] pb-[100px] md:hidden flex">
            <h1 className="font-serif leading-none tracking-tight text-[#3b1a0a] flex flex-col items-center drop-shadow-sm mb-4">
              <span className="text-[clamp(26px,7vw,42px)] tracking-widest mb-1">
                FALL <span className="text-[#6b2e0e] text-[0.8em]">›</span> <span className="italic">INTO</span>
              </span>
              <span className="text-[clamp(52px,16vw,80px)]">EMBER</span>
            </h1>
            <p className="font-sans text-[15px] leading-relaxed text-[#5c2d0e] max-w-[280px] mb-12">
              Crafting boundless digital worlds where the edge between AI, vision, and living myth dissolves.
            </p>
            
            <div className="relative w-[140px] h-[140px] rounded-[22px] overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <img src={CARD_IMAGES[0]} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="w-[26px] h-[26px] rounded-full border border-white flex items-center justify-center"><PlayIcon /></div>
                <span className="text-white text-[13px]">View Reel</span>
              </div>
            </div>
          </div>

          {/* TABLET LAYOUT */}
          <div className="w-full flex-col items-center justify-center text-center gap-[28px] px-[32px] pt-[80px] pb-[96px] hidden md:flex xl:hidden">
            <h1 className="font-serif leading-none tracking-tight text-[#3b1a0a] flex flex-col items-center drop-shadow-sm">
              <span className="text-[clamp(28px,5vw,44px)] tracking-widest mb-2">
                FALL <span className="text-[#6b2e0e] text-[0.8em]">›</span> <span className="italic">INTO</span>
              </span>
              <span className="text-[clamp(60px,12vw,86px)]">EMBER</span>
            </h1>
            <p className="font-sans text-[16px] leading-relaxed text-[#5c2d0e] max-w-[400px]">
              Crafting boundless digital worlds where the edge between AI, vision, and living myth dissolves.
            </p>
            <div className="flex gap-[14px]">
              {/* Card 1 */}
              <div className="relative w-[140px] h-[140px] rounded-[22px] overflow-hidden group shadow-lg">
                <img src={CARD_IMAGES[0]} alt="C1" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
                <div className="absolute bottom-0 w-full h-[44%] backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black,transparent)]"></div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center scale-75"><PlayIcon /></div>
                  <span className="text-white text-[12px]">View Reel</span>
                </div>
              </div>
              {/* Card 2 */}
              <div className="relative w-[140px] h-[140px] rounded-[22px] overflow-hidden group shadow-lg">
                <img src={CARD_IMAGES[1]} alt="C2" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
                <div className="absolute bottom-0 w-full h-[44%] backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black,transparent)]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center mt-6">
                  <span className="font-serif text-[28px] text-white leading-none mb-1">{entries.length}</span>
                  <span className="text-white text-[12px] leading-tight">World<br/>Entries</span>
                </div>
              </div>
              {/* Card 3 */}
              <div className="relative w-[140px] h-[140px] rounded-[22px] overflow-hidden group shadow-lg">
                <img src={CARD_IMAGES[2]} alt="C3" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
                <div className="absolute bottom-0 w-full h-[44%] backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black,transparent)]"></div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center scale-75"><PlayIcon /></div>
                  <span className="text-white text-[12px]">View Reel</span>
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden xl:block w-full h-full">
            <div className="absolute top-[46%] left-[60px] max-w-[440px] -translate-y-1/2 z-10 transition-all delay-300"
                 style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(-50%)" : "translateY(-40%)" }}>
              <h1 className="font-serif text-white flex flex-col mb-4 drop-shadow-xl"
                  style={{ textShadow: "0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)" }}>
                <span className="text-[clamp(32px,4.5vw,54px)] leading-[1.1] tracking-[0.04em] mb-1">
                  FALL <span className="text-[rgba(255,220,180,0.7)]">›</span> <span className="italic">INTO</span>
                </span>
                <span className="text-[clamp(50px,7.5vw,88px)] leading-[0.9] tracking-[-0.02em]">EMBER</span>
              </h1>
              <p className="font-sans text-[18px] leading-[1.7] text-[rgba(255,245,235,0.88)] max-w-[300px]"
                 style={{ textShadow: "0 1px 12px rgba(0,0,0,0.8)" }}>
                Crafting boundless digital worlds where the edge between AI, vision, and living myth dissolves.
              </p>
            </div>

            <div className="absolute top-[50%] right-[40px] -translate-y-1/2 flex gap-[12px] z-10 transition-all delay-[550ms]"
                 style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(-50%)" : "translateY(-40%)" }}>
              <div className="relative w-[158px] h-[158px] rounded-[28px] overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
                <img src={CARD_IMAGES[0]} alt="D1" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
                <div className="absolute bottom-0 w-full h-[44%] backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black,transparent)]"></div>
                <div className="absolute bottom-[12px] left-[12px] right-[12px] flex items-center gap-2">
                  <div className="w-[30px] h-[30px] rounded-full border border-white flex items-center justify-center shrink-0"><PlayIcon /></div>
                  <span className="text-white text-[18px]">View Reel</span>
                </div>
              </div>
              <div className="relative w-[158px] h-[158px] rounded-[28px] overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
                <img src={CARD_IMAGES[1]} alt="D2" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
                <div className="absolute bottom-0 w-full h-[44%] backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black,transparent)]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-8">
                  <span className="font-serif text-[36px] text-white leading-none">{entries.length}</span>
                  <span className="text-white text-[18px] leading-tight">World<br/>Entries</span>
                </div>
              </div>
              <div className="relative w-[158px] h-[158px] rounded-[28px] overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
                <img src={CARD_IMAGES[2]} alt="D3" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
                <div className="absolute bottom-0 w-full h-[44%] backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black,transparent)]"></div>
                <div className="absolute bottom-[12px] left-[12px] right-[12px] flex items-center gap-2">
                  <div className="w-[30px] h-[30px] rounded-full border border-white flex items-center justify-center shrink-0"><PlayIcon /></div>
                  <span className="text-white text-[18px]">View Reel</span>
                </div>
              </div>
            </div>

            {/* Scroll Cue (Desktop only) */}
            <div className="absolute bottom-[36px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity delay-[900ms]"
                 style={{ opacity: mounted ? 1 : 0 }}>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.6)]">Descend</span>
              <div className="w-[34px] h-[34px] border-[1.5px] border-[rgba(255,255,255,0.5)] rounded-full flex items-center justify-center animate-bobUp">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,0.6)">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Slider Dots (Scene 1) */}
          <div className={`absolute bottom-[28px] md:bottom-[40px] flex gap-2 items-center transition-opacity delay-[800ms] ${isMobile ? 'left-1/2 -translate-x-1/2' : 'left-[60px]'}`}
               style={{ opacity: mounted ? 1 : 0 }}>
            <div className="h-[4px] w-[28px] bg-[rgba(255,255,255,0.9)] rounded-[2px]"></div>
            <div className="h-[4px] w-[14px] bg-[rgba(255,255,255,0.35)] rounded-[2px]"></div>
            <div className="h-[4px] w-[14px] bg-[rgba(255,255,255,0.35)] rounded-[2px]"></div>
            <div className="h-[4px] w-[14px] bg-[rgba(255,255,255,0.35)] rounded-[2px]"></div>
          </div>
        </div>

        {/* SCENE 2 UI (Call to Action / Arc Slider Context) */}
        <div 
          ref={scene2Ref}
          className="absolute inset-0 z-[46] flex flex-col items-center pointer-events-none"
          style={{ opacity: 0 }}
        >
          <div className="text-center px-6 max-w-4xl flex flex-col items-center"
               style={{ marginTop: isMobile ? '8vh' : '12vh' }}>
            <h2 
              className="font-serif text-white uppercase tracking-[0.03em] leading-[1.05] mb-6"
              style={{
                fontSize: isMobile ? "clamp(28px, 8vw, 44px)" : "clamp(38px, 6.5vw, 78px)",
                textShadow: "0 2px 20px rgba(0,0,0,0.4)"
              }}
            >
              FORGE BEYOND THE REAL
            </h2>
            <p className="font-sans text-[rgba(255,255,255,0.82)] leading-[1.6] tracking-[-0.01em]"
               style={{
                 fontSize: isMobile ? "14px" : "20px",
                 maxWidth: isMobile ? "260px" : "480px"
               }}
            >
              Singular voyages to astonishing destinations, shaped for those who seek beauty beyond the ordinary and the known.
            </p>
          </div>
        </div>

        {/* INPUT FORM (Fixed at bottom over everything) */}
        <div className="absolute bottom-6 w-full flex justify-center z-[100] px-6">
           {crisisText ? (
             <div className="w-full max-w-2xl bg-red-950/90 border border-red-500/30 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
               <div className="text-red-200 text-xs tracking-[0.2em] uppercase mb-4 font-sans">Priority Override</div>
               <p className="text-white text-sm font-sans mb-6 whitespace-pre-line leading-relaxed">{crisisText}</p>
               <button onClick={() => setCrisisText(null)} className="text-xs uppercase tracking-widest border border-red-500/50 px-4 py-2 hover:bg-red-500/20 text-white transition-colors rounded-lg font-sans">
                 Acknowledge
               </button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-2xl relative">
              <div className="absolute inset-0 bg-[#1a0f16]/60 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-none"></div>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                placeholder="What's going on right now?"
                className="w-full bg-transparent text-white px-8 py-5 text-[15px] outline-none transition-colors placeholder-white/40 rounded-[24px] font-sans relative z-10"
              />
              <button 
                type="submit" 
                disabled={loading || !inputText.trim()}
                className="absolute right-3 top-3 bottom-3 px-6 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs tracking-widest uppercase transition-colors rounded-[16px] font-sans z-10"
              >
                {loading ? "..." : "LOG"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
