"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="relative w-6 h-10 sm:w-10 sm:h-16 md:w-16 md:h-24 lg:w-20 lg:h-28 bg-[#111] rounded-md shadow-xl perspective-[1200px] text-white text-lg sm:text-3xl md:text-5xl lg:text-6xl font-sans font-bold flex items-center justify-center select-none">
      <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden bg-[#181818] rounded-t-md flex items-end justify-center">
        <span className="translate-y-[50%]">{isFlipping ? nextValue : displayedValue}</span>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-b-md flex items-start justify-center">
        <span className="-translate-y-[50%]">{displayedValue}</span>
      </div>
      {isFlipping && (
        <div className="absolute top-0 left-0 w-full h-1/2 origin-bottom animate-flip-card transform-style-3d z-10" onAnimationEnd={handleAnimationEnd}>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-[#181818] rounded-t-md flex items-end justify-center backface-hidden shadow-[inset_0_-1px_0_rgba(0,0,0,1)]">
            <span className="translate-y-[50%]">{displayedValue}</span>
            <div className="absolute inset-0 bg-black animate-flip-darken"></div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-[#111111] rounded-b-md flex items-start justify-center backface-hidden shadow-[inset_0_1px_0_rgba(0,0,0,1)]" style={{ transform: 'rotateX(180deg)' }}>
            <span className="-translate-y-[50%]">{nextValue}</span>
            <div className="absolute inset-0 bg-black animate-flip-lighten"></div>
          </div>
        </div>
      )}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#050505] z-20 -translate-y-1/2 shadow-sm"></div>
    </div>
  );
}

function FlipGroup({ value, label }: { value: string; label: string }) {
  const chars = value.split("");
  return (
    <div className="flex flex-col items-center gap-2 md:gap-4">
      <div className="flex gap-1 sm:gap-2">
        {chars.map((char, index) => (
          <FlipDigit key={index} val={char} />
        ))}
      </div>
      <span className="text-[8px] sm:text-[10px] md:text-xs text-zinc-500 tracking-[0.1em] sm:tracking-[0.2em] uppercase font-medium">{label}</span>
    </div>
  );
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const bg1Ref = useRef<HTMLDivElement>(null);
  const bg2Ref = useRef<HTMLDivElement>(null);
  const bg3Ref = useRef<HTMLDivElement>(null);

  const cursorPos = useRef({ x: 0, y: 0 });
  const cursorLerpedPos = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);

  const scrollTarget = useRef(0);
  const scrollCurrent = useRef(0);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (mediaQuery.matches || isTouch) return;
    if (cursorRef.current) cursorRef.current.style.display = 'block';

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
          cursorRef.current.style.width = '60px';
          cursorRef.current.style.height = '60px';
          cursorRef.current.style.backgroundColor = 'rgba(0,0,0,0.05)';
        }
      }
    };
    const handleMouseOutInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button']")) {
        if (cursorRef.current) {
          cursorRef.current.style.width = '30px';
          cursorRef.current.style.height = '30px';
          cursorRef.current.style.backgroundColor = 'transparent';
        }
      }
    };
    const handleScroll = () => {
      scrollTarget.current = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOverInteractive);
    window.addEventListener("mouseout", handleMouseOutInteractive);
    window.addEventListener("scroll", handleScroll, { passive: true });

    let animationFrameId: number;
    const render = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.05;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.05;
      cursorLerpedPos.current.x += (cursorPos.current.x - cursorLerpedPos.current.x) * 0.2;
      cursorLerpedPos.current.y += (cursorPos.current.y - cursorLerpedPos.current.y) * 0.2;
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * 0.08;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorLerpedPos.current.x}px, ${cursorLerpedPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      const moveX = currentPos.current.x * 6;
      const moveY = currentPos.current.y * 6;
      const dist = Math.min(1, Math.sqrt(currentPos.current.x * currentPos.current.x + currentPos.current.y * currentPos.current.y));
      const shadowX = -currentPos.current.x * 20;
      const shadowY = -currentPos.current.y * 20;
      const shadowBlur = 40 + (dist * 30);
      const shadowSpread = -10 - (dist * 5);
      const shadowOpacity = 0.3 - (dist * 0.1);

      if (panelRef.current) {
        panelRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        panelRef.current.style.boxShadow = `${shadowX}px ${30 + shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,${shadowOpacity.toFixed(3)})`;
      }

      const bgMoveX = -currentPos.current.x * 12;
      const bgMoveY = -currentPos.current.y * 12;
      const rot1 = scrollCurrent.current * 0.02;
      const rot2 = scrollCurrent.current * -0.015;
      const rot3 = scrollCurrent.current * 0.01;
      
      if (bg1Ref.current) bg1Ref.current.style.transform = `translate3d(${bgMoveX}px, ${bgMoveY - scrollCurrent.current * 0.1}px, 0) rotate(${rot1}deg)`;
      if (bg2Ref.current) bg2Ref.current.style.transform = `translate3d(${bgMoveX * 1.2}px, ${bgMoveY * 1.2 - scrollCurrent.current * 0.2}px, 0) rotate(${rot2}deg)`;
      if (bg3Ref.current) bg3Ref.current.style.transform = `translate3d(${bgMoveX * 0.8}px, ${bgMoveY * 0.8 - scrollCurrent.current * 0.15}px, 0) rotate(${rot3}deg)`;

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOverInteractive);
      window.removeEventListener("mouseout", handleMouseOutInteractive);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const faqs = [
    { q: "What kind of brands does PhotoLoom work with?", a: "We partner with modern D2C, fashion, jewellery, beauty, and lifestyle brands looking to elevate their visual communication beyond standard templates." },
    { q: "What can PhotoLoom create?", a: "From hyper-realistic product imagery and cinematic commercials to complete campaign-ready visual systems across digital and social channels." },
    { q: "Can you work from existing product images?", a: "Yes. Our AI production pipeline can ingest existing product photography or flat-lays and synthesize them into completely new, high-end environments and campaigns." },
    { q: "Do you provide campaign direction?", a: "Absolutely. We are a creative studio first. We provide full visual direction, art direction, and conceptual thinking before any production begins." },
    { q: "How does the production process work?", a: "It starts with a brief and concept phase, followed by AI-driven asset generation, meticulous human refinement, and final delivery of production-ready assets." },
    { q: "Can PhotoLoom create both stills and motion?", a: "Yes, we produce both high-fidelity still imagery and cinematic motion pieces optimized for various digital formats." },
    { q: "How do we start a project?", a: "Simply reach out via our Contact page with your project details and budget range, and our creative team will be in touch to discuss the creative direction." }
  ];

  return (
    <div className="relative bg-background overflow-x-hidden flex flex-col font-sans text-black selection:bg-black selection:text-white">
      
      {/* Custom Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-[30px] h-[30px] rounded-full border border-black z-[100] pointer-events-none transition-all duration-300 ease-out opacity-0 backdrop-invert mix-blend-difference" style={{ display: 'none', transform: 'translate(-50%, -50%)' }}></div>

      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div ref={bg1Ref} className="absolute top-[-10%] left-[-5%] will-change-transform">
          <div className="w-[50vw] h-[50vw] min-w-[400px] min-h-[400px] bg-[#d9d9d9]/30 blur-3xl rounded-full animate-float"></div>
        </div>
        <div ref={bg2Ref} className="absolute top-[40%] right-[-10%] will-change-transform">
          <div className="w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] bg-[#d9d9d9]/30 blur-3xl rounded-full animate-float-delayed"></div>
        </div>
        <div ref={bg3Ref} className="absolute bottom-[-10%] left-[20%] will-change-transform">
          <div className="w-[45vw] h-[45vw] min-w-[350px] min-h-[350px] bg-[#d9d9d9]/30 blur-3xl rounded-full animate-float"></div>
        </div>
      </div>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 w-full z-10 pt-20">
        <div ref={panelRef} className="w-full max-w-[1400px] bg-white shadow-2xl flex flex-col relative overflow-hidden min-h-[85svh] will-change-transform rounded-sm border border-zinc-100">
          
          <header className="absolute top-0 left-0 w-full p-5 sm:p-8 md:px-12 lg:px-16 flex flex-row justify-between items-center z-30">
            <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
              PhotoLoom
            </Link>
            <div className="flex items-center gap-8">
              <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
                <Link href="/work" className="hover:text-black transition-colors">Work</Link>
                <Link href="/services" className="hover:text-black transition-colors">Services</Link>
                <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
                <Link href="/about" className="hover:text-black transition-colors">About</Link>
              </nav>
              <button className="flex flex-col gap-[6px] p-2 group" aria-label="Menu">
                <span className="w-8 h-[2px] bg-black block group-hover:w-6 transition-all"></span>
                <span className="w-8 h-[2px] bg-black block group-hover:w-4 transition-all"></span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-between pt-24 lg:pt-0 z-20 h-full w-full">
            <div className="w-full lg:w-1/2 flex flex-col justify-center h-full gap-8 md:gap-10 px-6 md:px-12 lg:pl-16 lg:pr-12 py-8 lg:py-24 text-left">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.05] text-black tracking-tight mt-4 lg:mt-0">
                Premium AI Visuals <br/> <span className="italic text-zinc-400 font-light">for Modern D2C Brands.</span>
              </h1>
              
              <div className="space-y-4 max-w-lg">
                <h3 className="font-serif text-xl md:text-2xl text-black">High-end product imagery, cinematic commercials, and campaign-ready content — created with AI and guided by real creative direction.</h3>
                <p className="font-sans text-sm md:text-base text-zinc-500 leading-relaxed font-light">
                  PhotoLoom helps modern brands turn products into premium visual campaigns without traditional production limitations.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-2">
                <Link href="/contact" className="px-8 py-4 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors text-center w-full sm:w-auto">
                  Start A Project
                </Link>
                <Link href="/work" className="text-xs uppercase tracking-widest font-bold text-black border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors text-center w-full sm:w-auto">
                  View Selected Work
                </Link>
              </div>

              {/* Waitlist Countdown */}
              <div className="mt-8 pt-8 border-t border-zinc-100 flex flex-wrap items-center justify-start gap-2 sm:gap-4 w-full" style={{ opacity: mounted ? 1 : 0 }}>
                <div className="flex flex-col gap-1 mr-2 sm:mr-4 mb-2 sm:mb-0 w-full sm:w-auto">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-black">V.1 Launching</span>
                  <span className="text-xs font-serif italic text-zinc-400">Join the waitlist</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <FlipGroup value={formatNumber(timeLeft.days)} label="Days" />
                  <span className="text-lg text-zinc-300 font-light pb-4">:</span>
                  <FlipGroup value={formatNumber(timeLeft.hours)} label="Hrs" />
                  <span className="text-lg text-zinc-300 font-light pb-4">:</span>
                  <FlipGroup value={formatNumber(timeLeft.minutes)} label="Min" />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 h-[50vh] sm:h-[60vh] lg:h-auto min-h-[400px] relative overflow-hidden bg-zinc-50">
              <Image src="/images/luxury.jpg" alt="Luxury visual" fill className="object-cover object-center filter grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST / POSITIONING */}
      <section className="relative w-full z-10 py-32 md:py-48 px-6 md:px-12 lg:px-24 flex items-center justify-center text-center">
        <div className="max-w-4xl flex flex-col items-center gap-8">
          <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase">The Studio</span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight text-black">
            Visual production, <br/><span className="italic text-zinc-500 font-light">reimagined for modern brands.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-zinc-500 max-w-2xl leading-relaxed font-light mt-4">
            We merge high-end art direction with bleeding-edge AI generation, replacing traditional physical shoot limitations with infinite, scalable creative capabilities. Every campaign is meticulously directed, generated, and polished to production-grade standards.
          </p>
        </div>
      </section>

      {/* SECTION 3: WHAT WE CREATE */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white border-y border-zinc-100">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl max-w-2xl leading-tight">What We Create.</h2>
            <Link href="/services" className="text-xs uppercase tracking-widest font-bold border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors">View All Services</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 lg:gap-x-12">
            {[
              { t: 'AI Product Images', d: 'Premium product visuals designed for eCommerce, campaigns and brand communication.' },
              { t: 'AI Commercial Reels', d: 'Cinematic short-form product films and advertising visuals.' },
              { t: 'Ad Creatives', d: 'Performance-focused visual concepts for paid social and digital campaigns.' },
              { t: 'Social Media Content', d: 'High-quality visual systems for consistent brand communication.' },
              { t: 'Creative Direction', d: 'Concept development, visual direction, art direction and campaign thinking.' }
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-6 group cursor-pointer border-t border-black pt-6">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] tracking-[0.2em] font-bold">0{i+1}</span>
                  <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <span className="text-xs">+</span>
                  </div>
                </div>
                <h3 className="font-serif text-2xl lg:text-3xl">{s.t}</h3>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="w-full lg:w-1/3">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">How It Works.</h2>
            <p className="text-sm text-zinc-500 font-light max-w-sm leading-relaxed">A seamless, bespoke production pipeline integrating creative strategy with precise algorithmic execution.</p>
          </div>
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
            {[
              { t: 'Brief', d: 'Understand the product, brand and objective.' },
              { t: 'Concept', d: 'Develop the visual direction and creative treatment.' },
              { t: 'Production', d: 'Create the imagery, motion and campaign assets.' },
              { t: 'Refinement', d: 'Art-direct, composite, retouch and polish every output.' },
              { t: 'Delivery', d: 'Deliver production-ready assets for campaigns, eCommerce and social.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start border-b border-zinc-200 pb-8 hover:border-black transition-colors">
                <span className="text-[10px] tracking-[0.2em] font-bold text-zinc-300 mt-1">0{i+1}</span>
                <div>
                  <h4 className="font-serif text-xl md:text-2xl mb-3">{step.t}</h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: SELECTED WORK */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-50">
        <div className="max-w-[1400px] mx-auto">
           <div className="flex justify-between items-end mb-16 md:mb-24">
             <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl">Selected Work.</h2>
             <Link href="/work" className="hidden md:block text-xs uppercase tracking-widest font-bold border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors">View Portfolio</Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
             {[
               { src: '/work/fashion.jpg', label: 'Fashion Editorial', aspect: 'aspect-[3/4]', offset: false },
               { src: '/work/jewellery.jpg', label: 'Jewellery Campaign', aspect: 'aspect-[4/5]', offset: true },
               { src: '/work/campaign.jpg', label: 'Concept Project: Automotive', aspect: 'aspect-[4/3]', offset: false },
               { src: '/work/product.jpg', label: 'Beauty Campaign', aspect: 'aspect-square', offset: true }
             ].map((work, i) => (
               <div key={i} className={`flex flex-col gap-5 ${work.offset ? 'md:mt-32' : ''}`}>
                 <div className={`w-full ${work.aspect} bg-zinc-200 flex items-center justify-center relative overflow-hidden group shadow-sm`}>
                   <Image src={work.src} alt={work.label} fill className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10"></div>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-black">{work.label}</span>
                    <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">View Project</span>
                 </div>
               </div>
             ))}
           </div>
           <div className="mt-16 md:hidden flex justify-center">
             <Link href="/work" className="text-xs uppercase tracking-widest font-bold border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors">View Portfolio</Link>
           </div>
        </div>
      </section>

      {/* SECTION 6: WHY PHOTOLOOM */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-black text-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl max-w-3xl mb-24 leading-tight">Beyond traditional production limits.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {[
              { t: 'Bespoke Creative Direction', d: 'Every visual is developed around the brand rather than a fixed template.' },
              { t: 'Production-Grade Quality', d: 'Focus on composition, lighting, materials, realism, retouching and final polish.' },
              { t: 'Fast Turnaround', d: 'Designed for modern campaign timelines, eliminating logistical delays.' },
              { t: 'Flexible & Scalable', d: 'From individual product visuals to complete global campaign systems.' }
            ].map((w, i) => (
              <div key={i} className="flex flex-col gap-5 border-t border-zinc-800 pt-8 group">
                 <span className="text-[9px] text-zinc-600 tracking-[0.2em] font-bold group-hover:text-white transition-colors">0{i+1}</span>
                 <h4 className="text-lg md:text-xl font-medium font-serif">{w.t}</h4>
                 <p className="text-sm text-zinc-400 font-light leading-relaxed">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CAPABILITIES / VISUAL SYSTEM */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
          <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase mb-8">Capabilities</span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight mb-16">
            A complete visual system.
          </h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-4xl">
            {['Product Photography', 'Campaign Imagery', 'Fashion Editorials', 'Commercial Films', 'Social Content', 'Digital Advertising', 'Creative Direction'].map((cap, i) => (
               <div key={i} className="text-xl md:text-3xl lg:text-4xl font-sans font-bold text-zinc-300 hover:text-black transition-colors cursor-pointer tracking-tight">
                 {cap}
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CASE STUDIES */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-16">
             <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl">Case Studies.</h2>
          </div>
          <div className="w-full bg-white shadow-xl rounded-sm overflow-hidden flex flex-col lg:flex-row border border-zinc-100">
            <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
               <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 mb-6">Concept Project</span>
               <h3 className="font-serif text-3xl md:text-4xl mb-8 leading-tight">Automotive visual syntax in barren environments.</h3>
               
               <div className="space-y-6">
                 <div className="border-t border-zinc-100 pt-4">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Objective</h4>
                   <p className="text-sm text-zinc-500 font-light">Establish a commanding visual presence for luxury vehicles outside traditional studio setups.</p>
                 </div>
                 <div className="border-t border-zinc-100 pt-4">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Creative Direction</h4>
                   <p className="text-sm text-zinc-500 font-light">Minimalist surrealism, golden-hour contrast, architectural lines.</p>
                 </div>
                 <div className="border-t border-zinc-100 pt-4">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Deliverables</h4>
                   <p className="text-sm text-zinc-500 font-light">8 High-resolution hero campaign images, 1 cinematic motion reel.</p>
                 </div>
               </div>
            </div>
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto min-h-[400px] relative">
              <Image src="/work/campaign.jpg" alt="Automotive concept" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: PRICING */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">Transparent Engagement.</h2>
            <p className="text-sm text-zinc-500 font-light max-w-xl mx-auto">We operate on clear, project-based tiers depending on the complexity of creative direction and volume of visual deliverables.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             <div className="border border-zinc-200 p-8 md:p-10 flex flex-col gap-6 hover:shadow-2xl transition-shadow bg-white">
               <h3 className="font-sans font-bold tracking-tight text-xl uppercase">Product Collection</h3>
               <div className="text-2xl font-serif text-zinc-400">₹2.5L – ₹5L</div>
               <p className="text-sm text-zinc-500 font-light flex-1">Ideal for foundational e-commerce imagery, social content batches, and lookbooks requiring strong art direction.</p>
             </div>
             
             <div className="border border-black p-8 md:p-10 flex flex-col gap-6 shadow-xl bg-black text-white transform md:-translate-y-4">
               <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Recommended</span>
               <h3 className="font-sans font-bold tracking-tight text-xl uppercase">Premium Campaign</h3>
               <div className="text-2xl font-serif text-zinc-300">₹5L – ₹12L</div>
               <p className="text-sm text-zinc-400 font-light flex-1">Comprehensive campaign production including hero visuals, commercial reels, and extensive ad creatives.</p>
             </div>

             <div className="border border-zinc-200 p-8 md:p-10 flex flex-col gap-6 hover:shadow-2xl transition-shadow bg-white">
               <h3 className="font-sans font-bold tracking-tight text-xl uppercase">Enterprise</h3>
               <div className="text-2xl font-serif text-zinc-400">Custom</div>
               <p className="text-sm text-zinc-500 font-light flex-1">Bespoke visual pipelines, ongoing retainer production, and highly complex commercial film projects.</p>
             </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/contact" className="inline-block px-10 py-5 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
              Tell us about your project
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl mb-16 text-center">Frequently Asked Questions.</h2>
          <div className="flex flex-col border-t border-zinc-200">
             {faqs.map((faq, i) => (
               <div key={i} className="border-b border-zinc-200">
                 <button 
                   onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                   className="w-full text-left py-8 flex justify-between items-center focus:outline-none group"
                 >
                   <span className="font-serif text-lg md:text-xl group-hover:text-zinc-600 transition-colors pr-8">{faq.q}</span>
                   <span className="text-2xl font-light text-zinc-400 transform transition-transform duration-300" style={{ transform: activeFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                 </button>
                 <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === i ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                   <p className="text-sm text-zinc-500 font-light leading-relaxed">{faq.a}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: FINAL CTA */}
      <section className="relative w-full z-10 py-32 md:py-48 px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl flex flex-col items-center gap-10">
          <p className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight text-black italic">
            Have a product worth <br/>seeing differently?
          </p>
          <p className="font-sans text-sm md:text-base text-zinc-500 font-light uppercase tracking-widest">
            Tell us what you&apos;re building. We&apos;ll shape the visual direction.
          </p>
          <div className="mt-8">
            <Link href="/contact" className="px-10 py-5 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors shadow-xl">
              Start A Project
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 12: FOOTER */}
      <footer className="w-full z-20 bg-white border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">PhotoLoom</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors">About</Link>
              <Link href="/services" className="hover:text-black transition-colors">Services</Link>
              <Link href="/work" className="hover:text-black transition-colors">Work</Link>
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              &copy; 2026 PhotoLoom
            </p>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              A creative venture by <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-black transition-colors">Grafly Studio</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
