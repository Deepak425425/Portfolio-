"use client";

import { useState, useEffect, useRef } from "react";

const LAUNCH_DATE = new Date("2026-11-26T00:00:00").getTime();

function FlipDigit({ val }: { val: string }) {
  const [displayedValue, setDisplayedValue] = useState(val);
  const [nextValue, setNextValue] = useState(val);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (val !== displayedValue && !isFlipping) {
      setNextValue(val);
      setIsFlipping(true);
    }
  }, [val, displayedValue, isFlipping]);

  const handleAnimationEnd = () => {
    setDisplayedValue(nextValue);
    setIsFlipping(false);
  };

  return (
    <div className="relative w-8 h-12 sm:w-14 sm:h-20 md:w-20 md:h-28 lg:w-28 lg:h-40 bg-[#111] rounded-md sm:rounded-lg shadow-xl perspective-[1200px] text-white text-2xl sm:text-5xl md:text-6xl lg:text-8xl font-sans font-bold flex items-center justify-center select-none">
      
      {/* Top half static (Next value - hidden initially by flipper) */}
      <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden bg-[#181818] rounded-t-lg flex items-end justify-center">
        <span className="translate-y-[50%]">{isFlipping ? nextValue : displayedValue}</span>
      </div>
      
      {/* Bottom half static (Previous value - remains visible until covered) */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-b-lg flex items-start justify-center">
        <span className="-translate-y-[50%]">{displayedValue}</span>
      </div>

      {/* The 3D Flipper */}
      {isFlipping && (
        <div 
          className="absolute top-0 left-0 w-full h-1/2 origin-bottom animate-flip-card transform-style-3d z-10"
          onAnimationEnd={handleAnimationEnd}
        >
          {/* Front of flipper (Top half, old digit) */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-[#181818] rounded-t-lg flex items-end justify-center backface-hidden shadow-[inset_0_-1px_0_rgba(0,0,0,1)]">
            <span className="translate-y-[50%]">{displayedValue}</span>
            <div className="absolute inset-0 bg-black animate-flip-darken"></div>
          </div>
          
          {/* Back of flipper (Bottom half, new digit) */}
          <div 
            className="absolute top-0 left-0 w-full h-full overflow-hidden bg-[#111111] rounded-b-lg flex items-start justify-center backface-hidden shadow-[inset_0_1px_0_rgba(0,0,0,1)]"
            style={{ transform: 'rotateX(180deg)' }}
          >
            <span className="-translate-y-[50%]">{nextValue}</span>
            <div className="absolute inset-0 bg-black animate-flip-lighten"></div>
          </div>
        </div>
      )}

      {/* Center horizontal split line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#050505] z-20 -translate-y-1/2 shadow-sm"></div>
    </div>
  );
}

function FlipGroup({ value, label }: { value: string; label: string }) {
  const chars = value.split("");
  return (
    <div className="flex flex-col items-center gap-3 md:gap-5">
      <div className="flex gap-1 sm:gap-2">
        {chars.map((char, index) => (
          <FlipDigit key={index} val={char} />
        ))}
      </div>
      <span className="text-[9px] sm:text-[10px] md:text-xs text-zinc-500 tracking-[0.25em] uppercase font-medium">{label}</span>
    </div>
  );
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

  // Refs for parallax
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const bg1Ref = useRef<HTMLDivElement>(null);
  const bg2Ref = useRef<HTMLDivElement>(null);
  const bg3Ref = useRef<HTMLDivElement>(null);

  // Refs for custom cursor
  const cursorPos = useRef({ x: 0, y: 0 });
  const cursorLerpedPos = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);

  // Refs for scroll rotation
  const scrollTarget = useRef(0);
  const scrollCurrent = useRef(0);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Parallax Effect & Custom Cursor Hook
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    
    // Disable effect on touch devices or if reduced motion is preferred
    if (mediaQuery.matches || isTouch) return;

    if (cursorRef.current) {
      cursorRef.current.style.display = 'block';
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 for parallax
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mousePos.current = { x, y };

      // Exact pixel coordinates for cursor
      cursorPos.current.x = e.clientX;
      cursorPos.current.y = e.clientY;

      if (cursorRef.current && cursorRef.current.style.opacity === '0') {
        cursorRef.current.style.opacity = '1';
        // Instantly snap to cursor on first move to prevent flying in from 0,0
        cursorLerpedPos.current.x = e.clientX;
        cursorLerpedPos.current.y = e.clientY;
      }
    };

    const handleMouseLeave = () => {
      // Return to center when mouse leaves window
      mousePos.current = { x: 0, y: 0 };
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
    };

    const handleMouseOverInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button']")) {
        if (cursorRef.current) {
          cursorRef.current.style.width = '50px';
          cursorRef.current.style.height = '50px';
          cursorRef.current.style.borderWidth = '1.5px';
        }
      }
    };

    const handleMouseOutInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button']")) {
        if (cursorRef.current) {
          cursorRef.current.style.width = '30px';
          cursorRef.current.style.height = '30px';
          cursorRef.current.style.borderWidth = '1px';
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      scrollTarget.current += e.deltaY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOverInteractive);
    window.addEventListener("mouseout", handleMouseOutInteractive);
    window.addEventListener("wheel", handleWheel, { passive: true });

    let animationFrameId: number;

    const render = () => {
      // Smooth interpolation (lerp) for parallax
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.05;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.05;

      // Smooth interpolation (lerp) for cursor
      cursorLerpedPos.current.x += (cursorPos.current.x - cursorLerpedPos.current.x) * 0.2;
      cursorLerpedPos.current.y += (cursorPos.current.y - cursorLerpedPos.current.y) * 0.2;

      // Smooth interpolation for scroll rotation
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * 0.05;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorLerpedPos.current.x}px, ${cursorLerpedPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Extremely subtle panel movement (max ~4px)
      const moveX = currentPos.current.x * 4;
      const moveY = currentPos.current.y * 4;
      
      // Dynamic Shadow Depth
      // Calculate distance from center (approx 0 to 1) for dynamic blur and opacity
      const dist = Math.min(1, Math.sqrt(currentPos.current.x * currentPos.current.x + currentPos.current.y * currentPos.current.y));
      
      // Shadow moves opposite to create physical depth
      const shadowX = -currentPos.current.x * 18;
      const shadowY = -currentPos.current.y * 18;
      
      // Dynamic properties for realistic physical depth
      const shadowBlur = 50 + (dist * 20); // Blurs more as it 'stretches'
      const shadowSpread = -12 - (dist * 2); // Spreads slightly thinner
      const shadowOpacity = 0.25 - (dist * 0.08); // Becomes slightly more transparent

      if (panelRef.current) {
        panelRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
        panelRef.current.style.boxShadow = `${shadowX}px ${25 + shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,${shadowOpacity.toFixed(3)})`;
      }

      // Background shapes move slightly away from cursor for parallax
      const bgMoveX = -currentPos.current.x * 8;
      const bgMoveY = -currentPos.current.y * 8;
      
      // Calculate rotation from accumulated scroll
      const rot1 = scrollCurrent.current * 0.05;
      const rot2 = scrollCurrent.current * -0.03;
      const rot3 = scrollCurrent.current * 0.04;
      
      if (bg1Ref.current) bg1Ref.current.style.transform = `translate(${bgMoveX}px, ${bgMoveY}px) rotate(${rot1}deg)`;
      if (bg2Ref.current) bg2Ref.current.style.transform = `translate(${bgMoveX * 1.2}px, ${bgMoveY * 1.2}px) rotate(${rot2}deg)`;
      if (bg3Ref.current) bg3Ref.current.style.transform = `translate(${bgMoveX * 0.8}px, ${bgMoveY * 0.8}px) rotate(${rot3}deg)`;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOverInteractive);
      window.removeEventListener("mouseout", handleMouseOutInteractive);
      window.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="relative min-h-[100svh] bg-background overflow-hidden flex flex-col">
      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-[30px] h-[30px] rounded-full border border-[#1a1a1a] z-[100] pointer-events-none transition-[width,height,border-width,opacity] duration-300 ease-out opacity-0"
        style={{ display: 'none', borderWidth: '1px', transform: 'translate(-50%, -50%)' }}
      ></div>

      {/* Abstract Background Shapes */}
      <div ref={bg1Ref} className="absolute top-[-20%] left-[-10%] z-0 will-change-transform">
        <div className="w-[50vw] h-[50vw] min-w-[400px] min-h-[400px] bg-[#0a0a0a] rounded-full animate-float opacity-100"></div>
      </div>
      <div ref={bg2Ref} className="absolute top-[30%] right-[-15%] z-0 will-change-transform">
        <div className="w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] bg-[#0a0a0a] rounded-full animate-float-delayed opacity-100"></div>
      </div>
      <div ref={bg3Ref} className="absolute bottom-[-20%] left-[60%] z-0 will-change-transform">
        <div className="w-[35vw] h-[35vw] min-w-[250px] min-h-[250px] bg-[#0a0a0a] rounded-full animate-float opacity-100"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 relative z-10 w-full h-full">
        <div 
          ref={panelRef}
          className="w-full max-w-[1400px] bg-white shadow-2xl flex flex-col relative overflow-hidden min-h-[85svh] lg:min-h-0 lg:h-full will-change-transform transition-shadow rounded-sm"
        >
          {/* Header */}
          <header className="w-full p-5 sm:p-8 md:px-12 lg:px-16 lg:py-10 flex flex-row justify-between items-center z-20">
            <div className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
              PhotoLoom
            </div>
            <div className="flex items-center gap-8">
              <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="hidden md:block font-extrabold tracking-[0.3em] text-[15px] md:text-[17px] uppercase text-zinc-500 hover:text-black transition-colors font-sans">
                graflystudio.com
              </a>
              <button className="flex flex-col gap-[6px] p-2 hover:opacity-60 transition-opacity" aria-label="Menu">
                <span className="w-8 h-[2px] bg-black block"></span>
                <span className="w-8 h-[2px] bg-black block"></span>
              </button>
            </div>
          </header>

          {/* Central Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-16 text-center z-20 relative py-8">
            
            {/* Countdown */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-4 md:gap-6 lg:gap-8 z-30 transition-opacity duration-1000 w-full px-2" style={{ opacity: mounted ? 1 : 0 }}>
              <FlipGroup value={formatNumber(timeLeft.days)} label="Days" />
              <span className="text-lg sm:text-3xl md:text-5xl text-zinc-300 font-light pb-5 sm:pb-8 md:pb-10">:</span>
              <FlipGroup value={formatNumber(timeLeft.hours)} label="Hours" />
              <span className="text-lg sm:text-3xl md:text-5xl text-zinc-300 font-light pb-5 sm:pb-8 md:pb-10">:</span>
              <FlipGroup value={formatNumber(timeLeft.minutes)} label="Min" />
              <span className="text-lg sm:text-3xl md:text-5xl text-zinc-300 font-light pb-5 sm:pb-8 md:pb-10 hidden sm:block">:</span>
              <div className="hidden sm:block">
                <FlipGroup value={formatNumber(timeLeft.seconds)} label="Sec" />
              </div>
            </div>

            {/* Oversized Typography overlay effect */}
            <div className="w-full flex justify-center items-center my-6 md:my-8 lg:my-10 pointer-events-none z-10 relative overflow-hidden">
              <h1 className="font-sans text-[12vw] sm:text-[15vw] md:text-[140px] lg:text-[180px] leading-none text-[#f5f5f5] uppercase tracking-tighter select-none font-bold whitespace-nowrap">
                Coming Soon
              </h1>
            </div>

            {/* Subtext */}
            <div className="z-30 mt-[-1.0rem] sm:mt-[-1.5rem] md:mt-[-3rem] space-y-3 sm:space-y-4 md:space-y-6 max-w-2xl px-4 sm:px-6">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black font-medium leading-tight px-2">
                We&apos;re creating something new.
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-sans tracking-wide font-light max-w-md mx-auto px-4">
                AI-powered visual production for modern brands.
              </p>
            </div>
          </div>
          
          {/* Main Card Footer Attribution */}
          <div className="w-full p-5 sm:p-8 md:px-12 lg:px-16 flex flex-col sm:flex-row justify-between items-center text-center gap-3 sm:gap-4 z-20 mt-auto">
            <p className="text-[9px] sm:text-[10px] text-zinc-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-sans">
              &copy; 2026 PhotoLoom
            </p>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-sans">
              A creative venture by Grafly Studio
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
