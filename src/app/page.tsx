"use client";

import { useState, useEffect, useRef } from "react";

const LAUNCH_DATE = new Date("2026-11-26T00:00:00").getTime();

function FlipDigit({ val }: { val: string }) {
  const [displayedValue, setDisplayedValue] = useState(val);
  const [nextValue, setNextValue] = useState(val);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (val !== displayedValue) {
      setNextValue(val);
      setIsFlipping(true);
      
      const timeout = setTimeout(() => {
        setDisplayedValue(val);
        setIsFlipping(false);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [val, displayedValue]);

  return (
    <div className="relative w-5 h-8 sm:w-10 sm:h-14 md:w-12 md:h-16 lg:w-16 lg:h-24 bg-[#f9f9f9] border border-[#e0e0e0] rounded-sm shadow-sm perspective-[1200px] text-[#1a1a1a] text-lg sm:text-3xl md:text-4xl lg:text-5xl font-sans font-light flex items-center justify-center select-none">
      
      <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden bg-[#fafafa] rounded-t-sm flex items-end justify-center">
        <span className="translate-y-[50%]">{isFlipping ? nextValue : displayedValue}</span>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden bg-[#f4f4f4] rounded-b-sm flex items-start justify-center">
        <span className="-translate-y-[50%]">{displayedValue}</span>
      </div>

      {isFlipping && (
        <div className="absolute top-0 left-0 w-full h-1/2 origin-bottom animate-flip-card transform-style-3d z-10">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-[#fafafa] rounded-t-sm flex items-end justify-center backface-hidden shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
            <span className="translate-y-[50%]">{displayedValue}</span>
            <div className="absolute inset-0 bg-black/5 animate-flip-darken"></div>
          </div>
          
          <div 
            className="absolute top-0 left-0 w-full h-full overflow-hidden bg-[#f4f4f4] rounded-b-sm flex items-start justify-center backface-hidden shadow-[inset_0_1px_0_rgba(0,0,0,0.05)]"
            style={{ transform: 'rotateX(180deg)' }}
          >
            <span className="-translate-y-[50%]">{nextValue}</span>
            <div className="absolute inset-0 bg-black/5 animate-flip-lighten"></div>
          </div>
        </div>
      )}

      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#d4d4d4] z-20 -translate-y-1/2 shadow-sm"></div>
    </div>
  );
}

function FlipGroup({ value, label }: { value: string; label: string }) {
  const chars = value.split("");
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      <div className="flex gap-1">
        {chars.map((char, index) => (
          <FlipDigit key={index} val={char} />
        ))}
      </div>
      <span className="text-[7px] sm:text-[9px] md:text-[10px] text-zinc-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-sans">{label}</span>
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

  // Parallax refs
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  // Cursor refs
  const cursorPos = useRef({ x: 0, y: 0 });
  const cursorLerpedPos = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = Date.now();
      const distance = LAUNCH_DATE - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
      return false;
    };

    const isFinished = calculateTimeLeft();
    if (isFinished) return;

    const timer = setInterval(() => {
      const finished = calculateTimeLeft();
      if (finished) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Parallax Effect & Custom Cursor Hook
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    
    if (mediaQuery.matches || isTouch) return;

    if (cursorRef.current) {
      cursorRef.current.style.display = 'block';
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mousePos.current = { x, y };

      cursorPos.current.x = e.clientX;
      cursorPos.current.y = e.clientY;

      if (cursorRef.current && cursorRef.current.style.opacity === '0') {
        cursorRef.current.style.opacity = '1';
        cursorLerpedPos.current.x = e.clientX;
        cursorLerpedPos.current.y = e.clientY;
      }
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: 0, y: 0 };
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '1';
    };

    const handleMouseOverInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button']")) {
        if (cursorRef.current) {
          cursorRef.current.style.width = '40px';
          cursorRef.current.style.height = '40px';
          cursorRef.current.style.borderWidth = '1px';
          cursorRef.current.style.background = 'rgba(0,0,0,0.03)';
        }
      }
    };

    const handleMouseOutInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button']")) {
        if (cursorRef.current) {
          cursorRef.current.style.width = '12px';
          cursorRef.current.style.height = '12px';
          cursorRef.current.style.borderWidth = '1px';
          cursorRef.current.style.background = 'black';
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOverInteractive);
    window.addEventListener("mouseout", handleMouseOutInteractive);

    let animationFrameId: number;

    const render = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.05;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.05;

      cursorLerpedPos.current.x += (cursorPos.current.x - cursorLerpedPos.current.x) * 0.2;
      cursorLerpedPos.current.y += (cursorPos.current.y - cursorLerpedPos.current.y) * 0.2;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorLerpedPos.current.x}px, ${cursorLerpedPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      const imgMoveX = currentPos.current.x * -25;
      const imgMoveY = currentPos.current.y * -25;

      const txtMoveX = currentPos.current.x * 15;
      const txtMoveY = currentPos.current.y * 15;

      if (heroImageRef.current) {
        heroImageRef.current.style.transform = `translate3d(${imgMoveX}px, ${imgMoveY}px, 0) scale(1.05)`;
      }
      
      if (heroTextRef.current) {
        heroTextRef.current.style.transform = `translate3d(${txtMoveX}px, ${txtMoveY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOverInteractive);
      window.removeEventListener("mouseout", handleMouseOutInteractive);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="relative bg-background text-foreground overflow-hidden selection:bg-zinc-200 selection:text-black">
      
      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-[12px] h-[12px] rounded-full border border-black bg-black z-[100] pointer-events-none transition-[width,height,border-width,opacity,background] duration-300 ease-out opacity-0 mix-blend-difference"
        style={{ display: 'none', transform: 'translate(-50%, -50%)' }}
      ></div>

      {/* Header */}
      <header className="fixed top-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-50 mix-blend-difference text-[#e0e0e0]">
        <div className="font-sans text-xs tracking-[0.2em] uppercase font-semibold">
          PhotoLoom
        </div>
        
        <nav className="hidden md:flex gap-12 font-sans text-[10px] tracking-[0.25em] uppercase">
          <a href="#work" className="hover:opacity-50 transition-opacity">Work</a>
          <a href="#services" className="hover:opacity-50 transition-opacity">Services</a>
          <a href="#about" className="hover:opacity-50 transition-opacity">About</a>
          <a href="#contact" className="hover:opacity-50 transition-opacity">Contact</a>
        </nav>

        <button className="flex flex-col gap-[5px] p-2 hover:opacity-60 transition-opacity group" aria-label="Menu">
          <span className="w-6 h-[1px] bg-current block origin-right transition-transform group-hover:scale-x-75"></span>
          <span className="w-6 h-[1px] bg-current block"></span>
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full h-[100svh] flex flex-col md:flex-row pt-24 md:pt-0">
        
        {/* Left Text Area */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-6 md:px-16 lg:px-24 z-20" ref={heroTextRef}>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[110px] leading-[0.9] font-normal tracking-tight text-[#111]">
            Visual<br />
            Production<br />
            <span className="italic text-zinc-500">Studio</span>
          </h1>
          <p className="mt-8 md:mt-12 font-sans text-xs md:text-sm tracking-wide text-zinc-500 max-w-xs leading-relaxed uppercase">
            Cinematic imagery, campaigns and visual systems for modern brands.
          </p>
          
          {/* Countdown embedded in hero */}
          <div className="mt-12 md:mt-24" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s ease' }}>
            <div className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 mb-4">Site Launching In</div>
            <div className="flex items-center gap-2 sm:gap-4">
              <FlipGroup value={formatNumber(timeLeft.days)} label="Days" />
              <span className="text-xl text-zinc-300 font-light pb-4">:</span>
              <FlipGroup value={formatNumber(timeLeft.hours)} label="Hours" />
              <span className="text-xl text-zinc-300 font-light pb-4">:</span>
              <FlipGroup value={formatNumber(timeLeft.minutes)} label="Min" />
              <span className="text-xl text-zinc-300 font-light pb-4">:</span>
              <FlipGroup value={formatNumber(timeLeft.seconds)} label="Sec" />
            </div>
          </div>
        </div>

        {/* Right Image Area */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden flex items-center justify-center p-4 md:p-12 lg:py-24 lg:pr-24 z-10">
          <div className="relative w-full h-full md:w-[110%] md:h-[110%] overflow-hidden bg-zinc-200">
            <div 
              ref={heroImageRef}
              className="absolute inset-[-10%] bg-cover bg-center bg-no-repeat will-change-transform grayscale-[20%]"
              style={{ backgroundImage: "url('/hero-image.jpg')" }}
            ></div>
          </div>
        </div>
      </section>

      {/* 01 SELECTED WORK */}
      <section id="work" className="py-24 md:py-40 px-6 md:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          <div className="w-full md:w-1/3 flex flex-col gap-6 md:sticky top-32">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400">01 — Selected Work</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#111]">Art<br/>Direction</h2>
            <p className="font-sans text-xs leading-relaxed text-zinc-500 max-w-sm mt-4">
              We specialize in creating premium, minimal, and highly art-directed visual compositions that elevate brand perception.
            </p>
          </div>
          <div className="w-full md:w-2/3">
            <div className="relative w-full aspect-[4/5] md:aspect-auto md:h-[80vh] overflow-hidden bg-zinc-100 group">
              <img 
                src="/art-image.jpg" 
                alt="Selected Work" 
                className="w-full h-full object-cover grayscale-[30%] transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:grayscale-0"
              />
            </div>
            <div className="flex justify-between mt-6 border-t border-zinc-200 pt-4">
              <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-500">Editorial Campaign</span>
              <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-500">2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* 02 WHAT WE CREATE */}
      <section id="services" className="py-24 md:py-40 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 block mb-16 text-center">02 — Capabilities</span>
          
          <ul className="flex flex-col w-full border-t border-zinc-200">
            {['AI Product Images', 'Cinematic Films', 'Campaign Visuals', 'Social Content', 'Creative Direction'].map((item, i) => (
              <li key={i} className="flex justify-between items-center py-8 md:py-12 border-b border-zinc-200 group cursor-pointer hover:px-4 transition-all duration-500">
                <span className="font-sans text-[10px] tracking-[0.2em] text-zinc-400 w-12">0{i+1}</span>
                <h3 className="font-serif text-2xl md:text-5xl text-zinc-300 group-hover:text-[#111] transition-colors duration-500 flex-1 text-center md:text-left">{item}</h3>
                <span className="hidden md:block font-sans text-[10px] tracking-[0.2em] uppercase text-[#111] opacity-0 group-hover:opacity-100 transition-opacity duration-500">Explore</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 03 PROCESS */}
      <section className="py-24 md:py-40 px-6 md:px-12 lg:px-24">
        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 block mb-16 md:mb-24">03 — Process</span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {[
            { num: "01", title: "Discovery", desc: "Understanding the brand essence and formulating the aesthetic direction." },
            { num: "02", title: "Production", desc: "Executing high-fidelity visual generation and meticulous post-production." },
            { num: "03", title: "Delivery", desc: "Finalizing assets tailored for varied luxury touchpoints and campaigns." }
          ].map((step, i) => (
            <div key={i} className="flex flex-col gap-6 group">
              <span className="font-serif text-5xl md:text-6xl text-zinc-300 group-hover:text-black transition-colors duration-500">{step.num}</span>
              <div className="h-[1px] w-full bg-zinc-200 group-hover:bg-black transition-colors duration-500"></div>
              <h4 className="font-sans text-xs tracking-[0.1em] uppercase font-semibold">{step.title}</h4>
              <p className="font-sans text-xs text-zinc-500 leading-relaxed max-w-[80%]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 04 ABOUT & 05 CONTACT */}
      <section id="about" className="pt-24 pb-12 md:pt-40 md:pb-24 px-6 md:px-12 lg:px-24 bg-[#111] text-white">
        <div className="flex flex-col md:flex-row justify-between items-end gap-16 md:gap-0">
          <div className="w-full md:w-1/2">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-500 block mb-12">04 — About</span>
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight font-normal text-zinc-100 max-w-lg">
              We shape the visual future of luxury brands through AI, preserving the soul of traditional art direction.
            </h2>
          </div>
          
          <div id="contact" className="w-full md:w-auto flex flex-col gap-8 items-start md:items-end text-left md:text-right">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-500">05 — Connect</span>
            <a href="mailto:hello@graflystudio.com" className="font-serif text-2xl md:text-4xl text-white hover:italic transition-all duration-300">
              hello@photoloom.com
            </a>
            <div className="flex gap-6 mt-4">
              <a href="#" className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[1px] bg-zinc-800 mt-24 mb-8"></div>
        
        <div className="flex justify-between items-center">
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-600">© 2026 PhotoLoom</span>
          <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-600 hover:text-white transition-colors">
            By Grafly Studio
          </a>
        </div>
      </section>

    </div>
  );
}
