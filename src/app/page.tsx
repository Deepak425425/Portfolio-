"use client";

import { useState, useEffect } from "react";

const LAUNCH_DATE = new Date("2026-11-26T00:00:00").getTime();

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

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

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] min-w-[400px] min-h-[400px] bg-[#0a0a0a] rounded-full animate-float opacity-100 z-0"></div>
      <div className="absolute top-[30%] right-[-15%] w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] bg-[#0a0a0a] rounded-full animate-float-delayed opacity-100 z-0"></div>
      <div className="absolute bottom-[-20%] left-[60%] w-[35vw] h-[35vw] min-w-[250px] min-h-[250px] bg-[#0a0a0a] rounded-full animate-float opacity-100 z-0"></div>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 relative z-10 w-full h-full">
        <div className="w-full max-w-[1400px] bg-white shadow-2xl flex flex-col relative overflow-hidden min-h-[85vh]">
          
          {/* Header */}
          <header className="w-full p-8 md:px-16 md:py-12 flex flex-col sm:flex-row justify-between items-center z-20 gap-6">
            <div className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
              PhotoLoom
            </div>
            <div className="flex items-center gap-8">
              <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="hidden md:block text-[10px] tracking-widest uppercase text-zinc-500 hover:text-black transition-colors font-sans">
                graflystudio.com
              </a>
              <button className="flex flex-col gap-[6px] p-2 hover:opacity-60 transition-opacity" aria-label="Menu">
                <span className="w-8 h-[2px] bg-black block"></span>
                <span className="w-8 h-[2px] bg-black block"></span>
              </button>
            </div>
          </header>

          {/* Central Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-16 text-center z-20 relative pt-12 pb-24">
            
            {/* Countdown */}
            <div className="flex items-start justify-center gap-4 md:gap-8 lg:gap-12 z-30 transition-opacity duration-1000" style={{ opacity: mounted ? 1 : 0 }}>
              <div className="flex flex-col items-center">
                <span className="font-sans text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-black">{formatNumber(timeLeft.days)}</span>
                <span className="text-[10px] md:text-xs text-zinc-400 tracking-[0.2em] uppercase mt-4">Days</span>
              </div>
              <span className="text-3xl md:text-5xl lg:text-6xl pt-2 text-zinc-300 font-light">:</span>
              <div className="flex flex-col items-center">
                <span className="font-sans text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-black">{formatNumber(timeLeft.hours)}</span>
                <span className="text-[10px] md:text-xs text-zinc-400 tracking-[0.2em] uppercase mt-4">Hours</span>
              </div>
              <span className="text-3xl md:text-5xl lg:text-6xl pt-2 text-zinc-300 font-light">:</span>
              <div className="flex flex-col items-center">
                <span className="font-sans text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-black">{formatNumber(timeLeft.minutes)}</span>
                <span className="text-[10px] md:text-xs text-zinc-400 tracking-[0.2em] uppercase mt-4">Min</span>
              </div>
              <span className="text-3xl md:text-5xl lg:text-6xl pt-2 text-zinc-300 font-light hidden sm:block">:</span>
              <div className="flex-col items-center hidden sm:flex">
                <span className="font-sans text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-black">{formatNumber(timeLeft.seconds)}</span>
                <span className="text-[10px] md:text-xs text-zinc-400 tracking-[0.2em] uppercase mt-4">Sec</span>
              </div>
            </div>

            {/* Oversized Typography overlay effect */}
            <div className="w-full flex justify-center items-center my-12 pointer-events-none z-10 relative">
              <h1 className="font-sans text-[15vw] md:text-[140px] lg:text-[180px] leading-none text-[#f5f5f5] uppercase tracking-tighter select-none font-bold whitespace-nowrap">
                Coming Soon
              </h1>
            </div>

            {/* Subtext */}
            <div className="z-30 mt-[-2rem] md:mt-[-4rem] space-y-6 max-w-2xl px-6">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-black font-medium leading-tight">
                We&apos;re creating something new.
              </h2>
              <p className="text-sm md:text-base text-zinc-500 font-sans tracking-wide font-light max-w-md mx-auto">
                AI-powered visual production for modern brands.
              </p>
            </div>
          </div>
          
          {/* Main Card Footer Attribution */}
          <div className="w-full p-8 md:px-16 text-center md:text-left z-20 mt-auto">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-sans">
              A creative venture by Grafly Studio
            </p>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full p-6 md:px-12 relative z-10 flex flex-col sm:flex-row justify-between items-center text-center gap-4 text-zinc-500">
        <p className="text-[10px] tracking-widest uppercase font-sans">
          &copy; 2026 PhotoLoom
        </p>
        <p className="text-[10px] tracking-widest uppercase font-sans">
          A creative venture by Grafly Studio
        </p>
      </footer>
    </div>
  );
}
