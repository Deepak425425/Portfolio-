"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useReducedMotion } from "framer-motion";

const LAUNCH_DATE = new Date("2026-11-26T00:00:00").getTime();

// Animation Utilities
const revealVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const lineRevealVariants: any = {
  hidden: { y: "100%" },
  visible: (custom: number) => ({
    y: 0,
    transition: { delay: custom * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }
  })
};

const imageRevealVariants: any = {
  hidden: { clipPath: "inset(0 0 100% 0)", scale: 1.05 },
  visible: { 
    clipPath: "inset(0 0 0% 0)", 
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  }
};

const MagneticButton = ({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <Link href={href} passHref legacyBehavior>
      <motion.a 
        ref={ref} 
        onMouseMove={handleMouse} 
        onMouseLeave={reset} 
        animate={{ x: position.x, y: position.y }} 
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        className={className}
      >
        {children}
      </motion.a>
    </Link>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeService, setActiveService] = useState(0);

  // Custom Cursor state
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLSpanElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });
  const cursorLerpedPos = useRef({ x: 0, y: 0 });

  // Scroll Tracking
  const { scrollY, scrollYProgress } = useScroll();
  const smoothScrollY = useSpring(scrollY, { damping: 20, stiffness: 100, mass: 0.5 });
  
  // Navigation styling
  const navBg = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.95)"]);
  const navBorder = useTransform(scrollY, [0, 100], ["rgba(228,228,231,0)", "rgba(228,228,231,1)"]);
  const navPadding = useTransform(scrollY, [0, 100], ["2rem", "1.25rem"]);

  // Horizontal Scroll refs and state
  const horizontalRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const updateScrollRange = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.getBoundingClientRect().width;
        const maxScroll = trackWidth - window.innerWidth;
        setScrollRange(Math.max(0, maxScroll));
      }
    };
    updateScrollRange();
    // setTimeout to ensure images/fonts are loaded and measured correctly
    const timeoutId = setTimeout(updateScrollRange, 100);
    window.addEventListener("resize", updateScrollRange);
    return () => {
      window.removeEventListener("resize", updateScrollRange);
      clearTimeout(timeoutId);
    };
  }, []);

  const { scrollYProgress: horizontalProgress } = useScroll({ 
    target: horizontalRef,
    offset: ["start start", "end end"]
  });
  
  const horizontalX = useTransform(horizontalProgress, [0, 1], [0, -scrollRange]);

  const shouldReduceMotion = useReducedMotion();

  // Decorative Graphic Transforms (Desktop)
  const graphic1X = useTransform(horizontalProgress, [0, 0.6], shouldReduceMotion ? ["5vw", "5vw"] : ["-100vw", "100vw"]);
  const graphic1Rotate = useTransform(horizontalProgress, [0, 0.6], shouldReduceMotion ? [-5, -5] : [-12, 12]);
  const graphic1Scale = useTransform(horizontalProgress, [0, 0.3, 0.6], shouldReduceMotion ? [0.9, 0.9, 0.9] : [0.85, 1, 1.15]);
  const graphic1Opacity = useTransform(horizontalProgress, [0, 0.3, 0.6], shouldReduceMotion ? [0, 0.4, 0] : [0.4, 0.4, 0.4]);
  
  const graphic2X = useTransform(horizontalProgress, [0.4, 1], shouldReduceMotion ? ["60vw", "60vw"] : ["100vw", "-100vw"]);
  const graphic2Rotate = useTransform(horizontalProgress, [0.4, 1], shouldReduceMotion ? [5, 5] : [12, -12]);
  const graphic2Scale = useTransform(horizontalProgress, [0.4, 0.7, 1], shouldReduceMotion ? [0.9, 0.9, 0.9] : [0.85, 1, 1.15]);
  const graphic2Opacity = useTransform(horizontalProgress, [0.4, 0.7, 1], shouldReduceMotion ? [0, 0.4, 0] : [0.4, 0.4, 0.4]);

  // Mobile Campaign Worlds Ref and Transforms
  const mobileCampaignRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: mobileCampaignProgress } = useScroll({
    target: mobileCampaignRef,
    offset: ["start center", "end center"]
  });
  
  const mobileGraphic1X = useTransform(mobileCampaignProgress, [0, 0.6], shouldReduceMotion ? ["10vw", "10vw"] : ["-100vw", "100vw"]);
  const mobileGraphic1Rotate = useTransform(mobileCampaignProgress, [0, 0.6], shouldReduceMotion ? [-5, -5] : [-8, 8]);
  const mobileGraphic1Opacity = useTransform(mobileCampaignProgress, [0, 0.3, 0.6], shouldReduceMotion ? [0, 0.2, 0] : [0.2, 0.2, 0.2]);

  const mobileGraphic2X = useTransform(mobileCampaignProgress, [0.4, 1], shouldReduceMotion ? ["50vw", "50vw"] : ["100vw", "-100vw"]);
  const mobileGraphic2Rotate = useTransform(mobileCampaignProgress, [0.4, 1], shouldReduceMotion ? [5, 5] : [8, -8]);
  const mobileGraphic2Opacity = useTransform(mobileCampaignProgress, [0.4, 0.7, 1], shouldReduceMotion ? [0, 0.2, 0] : [0.2, 0.2, 0.2]);

  // How It Works Sticky scroll ref
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: howItWorksProgress } = useScroll({ target: howItWorksRef, offset: ["start center", "end center"] });

  useEffect(() => {
    setMounted(true);
    
    // Custom cursor logic
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (mediaQuery.matches || isTouch) return;
    
    if (cursorRef.current) cursorRef.current.style.display = 'flex';

    const handleMouseMove = (e: MouseEvent) => {
      cursorPos.current.x = e.clientX;
      cursorPos.current.y = e.clientY;
      if (cursorRef.current && cursorRef.current.style.opacity === '0') {
        cursorRef.current.style.opacity = '1';
        cursorLerpedPos.current.x = e.clientX;
        cursorLerpedPos.current.y = e.clientY;
      }
    };
    
    const handleMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!cursorRef.current || !cursorTextRef.current) return;

      if (target.closest("[data-cursor='view']")) {
        cursorRef.current.style.width = '80px';
        cursorRef.current.style.height = '80px';
        cursorRef.current.style.backgroundColor = 'white';
        cursorRef.current.style.mixBlendMode = 'normal';
        cursorRef.current.style.border = 'none';
        cursorTextRef.current.innerText = 'VIEW';
        cursorTextRef.current.style.color = 'black';
        cursorTextRef.current.style.opacity = '1';
      } else if (target.closest("a, button, [role='button']")) {
        cursorRef.current.style.width = '60px';
        cursorRef.current.style.height = '60px';
        cursorRef.current.style.backgroundColor = 'rgba(0,0,0,0.05)';
        cursorRef.current.style.mixBlendMode = 'difference';
        cursorRef.current.style.border = '1px solid black';
        cursorTextRef.current.style.opacity = '0';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!cursorRef.current || !cursorTextRef.current) return;
      if (target.closest("a, button, [role='button'], [data-cursor='view']")) {
        cursorRef.current.style.width = '30px';
        cursorRef.current.style.height = '30px';
        cursorRef.current.style.backgroundColor = 'transparent';
        cursorRef.current.style.mixBlendMode = 'difference';
        cursorRef.current.style.border = '1px solid black';
        cursorTextRef.current.style.opacity = '0';
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    let animationFrameId: number;
    const render = () => {
      cursorLerpedPos.current.x += (cursorPos.current.x - cursorLerpedPos.current.x) * 0.2;
      cursorLerpedPos.current.y += (cursorPos.current.y - cursorLerpedPos.current.y) * 0.2;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorLerpedPos.current.x}px, ${cursorLerpedPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const servicesList = [
    { t: 'AI Product Images', img: '/work/jewellery.jpg' },
    { t: 'AI Commercial Reels', img: '/work/campaign.jpg' },
    { t: 'Ad Creatives', img: '/work/product.jpg' },
    { t: 'Social Media Content', img: '/work/fashion.jpg' },
    { t: 'Creative Direction', img: '/images/luxury.jpg' }
  ];

  const horizontalItems = [
    { cat: "Jewellery", img: "/work/jewellery.jpg" },
    { cat: "Fashion", img: "/work/fashion.jpg" }
  ];

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
    <div className="relative bg-zinc-50 overflow-x-hidden flex flex-col font-sans text-black selection:bg-black selection:text-white">
      
      {/* Custom Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-[30px] h-[30px] rounded-full border border-black z-[100] pointer-events-none transition-all duration-300 ease-out opacity-0 mix-blend-difference flex items-center justify-center" style={{ display: 'none', transform: 'translate(-50%, -50%)' }}>
        <span ref={cursorTextRef} className="text-[8px] font-bold tracking-[0.2em] opacity-0 transition-opacity"></span>
      </div>

      {/* NAVIGATION */}
      <motion.header 
        style={{ backgroundColor: navBg, borderBottomColor: navBorder, paddingTop: navPadding, paddingBottom: navPadding }}
        className="fixed top-0 left-0 w-full px-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-50 transition-all backdrop-blur-md"
      >
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
          <MagneticButton href="/contact" className="hidden md:inline-flex px-6 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </MagneticButton>
        </div>
      </motion.header>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 w-full z-10 pt-32 pb-16">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center justify-between gap-16 h-full">
          
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-10">
            <motion.h1 
              initial="hidden" animate="visible" 
              className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.05] text-black tracking-tight"
            >
              {["Premium AI", "Visuals for", "Modern Brands."].map((line, i) => (
                <span key={i} className="block overflow-hidden pb-2">
                  <motion.span custom={i} variants={lineRevealVariants} className={`block ${i === 2 ? 'italic text-zinc-400 font-light' : ''}`}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}
              className="space-y-4 max-w-lg"
            >
              <h3 className="font-serif text-xl md:text-2xl text-black leading-tight">High-end product imagery, cinematic commercials, and campaign-ready content.</h3>
              <p className="font-sans text-sm md:text-base text-zinc-500 leading-relaxed font-light">
                PhotoLoom helps modern brands turn products into premium visual campaigns without traditional production limitations.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <MagneticButton href="/contact" className="inline-flex px-10 py-5 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center justify-center">
                Start A Project
              </MagneticButton>
              <Link href="/work" className="text-xs uppercase tracking-widest font-bold text-black border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors w-full sm:w-auto text-center">
                View Selected Work
              </Link>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 h-[50vh] sm:h-[60vh] lg:h-[80vh] relative overflow-hidden bg-zinc-200">
            <motion.div
              initial="hidden" animate="visible" variants={imageRevealVariants}
              className="w-full h-full relative"
            >
              <Image priority src="/images/luxury.jpg" alt="Luxury visual" fill className="object-cover object-center" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / POSITIONING */}
      <section className="relative w-full z-10 py-32 md:py-48 px-6 flex items-center justify-center text-center bg-white border-t border-zinc-100">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}
          className="max-w-4xl flex flex-col items-center gap-8"
        >
          <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase">The Studio</span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight text-black">
            Visual production, <br/><span className="italic text-zinc-500 font-light">reimagined for modern brands.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-zinc-500 max-w-2xl leading-relaxed font-light mt-4">
            We merge high-end art direction with bleeding-edge AI generation, replacing traditional physical shoot limitations with infinite, scalable creative capabilities. Every campaign is meticulously directed, generated, and polished to production-grade standards.
          </p>
        </motion.div>
      </section>

      {/* 3. WHAT WE CREATE (Interactive Sticky Section) */}
      <section className="relative w-full z-10 bg-zinc-950 text-white min-h-[100vh] py-24 md:py-32 px-6 md:px-12 lg:px-24 border-t border-zinc-900">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 relative">
          
          <div className="w-full lg:w-1/2 flex flex-col gap-12 lg:sticky lg:top-32 h-fit">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants}>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl leading-tight">What We <br/>Create.</h2>
              <p className="font-sans text-sm md:text-base text-zinc-400 max-w-sm font-light mt-6 mb-12">
                A seamless pipeline integrating creative strategy with precise algorithmic execution.
              </p>
              <Link href="/services" className="text-xs uppercase tracking-widest font-bold border-b border-zinc-700 pb-1 hover:text-white hover:border-white transition-colors">
                View All Services
              </Link>
            </motion.div>

            <div className="flex flex-col gap-4 mt-8 hidden lg:flex">
              {servicesList.map((s, i) => (
                <button 
                  key={i} 
                  onMouseEnter={() => setActiveService(i)}
                  className={`text-left font-serif text-2xl lg:text-4xl transition-all duration-300 ${activeService === i ? 'text-white pl-4 border-l-2 border-white' : 'text-zinc-700 border-l-2 border-transparent'}`}
                >
                  {s.t}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative h-[50vh] sm:h-[60vh] lg:h-[75vh] overflow-hidden bg-zinc-900">
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeService}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image src={servicesList[activeService].img} alt="Service Visual" fill className="object-cover" />
                </motion.div>
             </AnimatePresence>
             {/* Mobile list overlay */}
             <div className="absolute inset-0 bg-black/60 lg:hidden p-8 flex flex-col justify-center gap-6">
               {servicesList.map((s, i) => (
                 <h3 key={i} className="font-serif text-2xl text-white">{s.t}</h3>
               ))}
             </div>
          </div>
          
        </div>
      </section>

      {/* 4. HOW IT WORKS (Sticky Storytelling) */}
      <section ref={howItWorksRef} className="relative w-full z-10 bg-white">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row relative">
          
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-[100vh] sticky top-0 overflow-hidden bg-zinc-200">
             <motion.div
               style={{ 
                 scale: useTransform(howItWorksProgress, [0, 1], [1.1, 1]), 
                 opacity: useTransform(howItWorksProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
               }}
               className="w-full h-full relative"
             >
               <Image src="/images/luxury.jpg" alt="Production Process" fill className="object-cover" />
             </motion.div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col py-24 md:py-48 px-6 md:px-12 lg:px-24">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-24 sticky top-32 bg-white/90 backdrop-blur-sm py-4 z-10">How It Works.</h2>
            
            <div className="flex flex-col gap-32 pb-48">
              {[
                { t: 'Brief', d: 'Understand the product, brand and objective. We define the constraints and explore visual territories.' },
                { t: 'Direction', d: 'Develop the visual direction and creative treatment. Lighting logic, color theory, and mood are established.' },
                { t: 'Production', d: 'Create the imagery, motion and campaign assets utilizing AI generation guided by human art direction.' },
                { t: 'Refinement', d: 'Meticulously composite, retouch and polish every output to ensure production-grade realism.' },
                { t: 'Delivery', d: 'Deliver final assets perfectly optimized for campaigns, eCommerce grids, and social channels.' }
              ].map((step, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0.2 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ margin: "-40% 0px -40% 0px" }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  <span className="text-[10px] tracking-[0.2em] font-bold text-zinc-400">0{i+1}</span>
                  <h4 className="font-serif text-3xl md:text-4xl">{step.t}</h4>
                  <p className="text-sm text-zinc-500 font-light leading-relaxed max-w-sm">{step.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HORIZONTAL SCROLL CAMPAIGN WORLDS */}
      <section 
        ref={horizontalRef} 
        style={{ height: scrollRange > 0 ? `calc(100vh + ${scrollRange}px)` : '300vh' }}
        className="relative bg-zinc-50 hidden md:block border-y border-zinc-200"
      >
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden w-full relative z-0">
          
          {/* DECORATIVE HALFTONE GRAPHICS */}
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 left-0 w-[50vw] xl:w-[40vw] z-[-1] pointer-events-none mix-blend-multiply will-change-transform"
            style={{ x: graphic1X, rotate: graphic1Rotate, scale: graphic1Scale, opacity: graphic1Opacity }}
          >
            <Image src="/campaign-worlds/Asset 6.png" alt="" width={1200} height={1200} className="w-full h-auto object-contain" />
          </motion.div>
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 left-0 w-[50vw] xl:w-[40vw] z-[-1] pointer-events-none mix-blend-multiply will-change-transform"
            style={{ x: graphic2X, rotate: graphic2Rotate, scale: graphic2Scale, opacity: graphic2Opacity }}
          >
            <Image src="/campaign-worlds/Asset 6.png" alt="" width={1200} height={1200} className="w-full h-auto object-contain" />
          </motion.div>

          <div className="px-12 lg:px-24 mb-16 z-10 relative pointer-events-none">
             <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl pointer-events-auto w-fit">Campaign Worlds.</h2>
          </div>
          <motion.div ref={trackRef} style={{ x: horizontalX }} className="flex gap-8 lg:gap-16 pl-12 lg:pl-24 w-max z-10 relative">
            {horizontalItems.map((item, i) => (
              <div key={i} data-cursor="view" className="relative w-[80vw] lg:w-[60vw] h-[60vh] flex-shrink-0 group overflow-hidden bg-zinc-200">
                <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 1, ease: "easeOut" }}>
                  <Image src={item.img} alt={item.cat} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                </motion.div>
                <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
                  <span className="text-[10px] text-white tracking-widest uppercase font-bold bg-black/40 px-4 py-2 backdrop-blur-sm mix-blend-normal">
                    {item.cat}
                  </span>
                </div>
              </div>
            ))}
            {/* Right padding spacer to ensure scrollWidth includes final visual padding */}
            <div className="w-12 lg:w-24 flex-shrink-0" />
          </motion.div>
        </div>
      </section>

      {/* Mobile alternative for Campaign Worlds */}
      <section ref={mobileCampaignRef} className="py-24 px-6 bg-zinc-50 md:hidden border-y border-zinc-200 relative overflow-hidden z-0">
         
         {/* MOBILE DECORATIVE HALFTONE GRAPHICS */}
         <motion.div 
           className="absolute top-1/4 left-0 w-[80vw] z-[-1] pointer-events-none mix-blend-multiply will-change-transform"
           style={{ x: mobileGraphic1X, rotate: mobileGraphic1Rotate, opacity: mobileGraphic1Opacity }}
         >
           <Image src="/campaign-worlds/Asset 6.png" alt="" width={600} height={600} className="w-full h-auto object-contain" />
         </motion.div>
         <motion.div 
           className="absolute top-3/4 left-0 w-[80vw] z-[-1] pointer-events-none mix-blend-multiply will-change-transform"
           style={{ x: mobileGraphic2X, rotate: mobileGraphic2Rotate, opacity: mobileGraphic2Opacity }}
         >
           <Image src="/campaign-worlds/Asset 6.png" alt="" width={600} height={600} className="w-full h-auto object-contain" />
         </motion.div>

         <h2 className="font-serif text-4xl mb-12 relative z-10">Campaign Worlds.</h2>
         <div className="flex flex-col gap-8 relative z-10">
           {horizontalItems.map((item, i) => (
              <div key={i} className="relative w-full h-[60vh] overflow-hidden bg-zinc-200">
                <Image src={item.img} alt={item.cat} fill className="object-cover" />
                <div className="absolute bottom-6 left-6 z-20">
                  <span className="text-[10px] text-white tracking-widest uppercase font-bold bg-black/40 px-4 py-2 backdrop-blur-sm">
                    {item.cat}
                  </span>
                </div>
              </div>
            ))}
         </div>
      </section>

      {/* 6. WHY PHOTOLOOM */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-black text-white">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}
          className="max-w-[1400px] mx-auto"
        >
          <div className="overflow-hidden mb-24 max-w-4xl">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl leading-tight uppercase">
              {["AI is the tool.", "Direction is the", "difference."].map((line, i) => (
                <span key={i} className="block overflow-hidden pb-2">
                  <motion.span custom={i} variants={lineRevealVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="block">
                    {line}
                  </motion.span>
                </span>
              ))}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {[
              { t: 'Bespoke Direction', d: 'Every visual is developed around the brand rather than a fixed template.' },
              { t: 'Production-Grade', d: 'Focus on composition, lighting, materials, realism, retouching and final polish.' },
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
        </motion.div>
      </section>

      {/* 7. CASE STUDIES */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants} className="flex justify-between items-end mb-16">
             <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl">Case Studies.</h2>
          </motion.div>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants}
            className="w-full bg-zinc-50 shadow-xl rounded-sm overflow-hidden flex flex-col lg:flex-row border border-zinc-100"
          >
            <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
               <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 mb-6">Concept Project</span>
               <h3 className="font-serif text-3xl md:text-4xl mb-8 leading-tight">Automotive visual syntax in barren environments.</h3>
               
               <div className="space-y-6">
                 <div className="border-t border-zinc-200 pt-4">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Objective</h4>
                   <p className="text-sm text-zinc-500 font-light">Establish a commanding visual presence for luxury vehicles outside traditional studio setups.</p>
                 </div>
                 <div className="border-t border-zinc-200 pt-4">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Creative Direction</h4>
                   <p className="text-sm text-zinc-500 font-light">Minimalist surrealism, golden-hour contrast, architectural lines.</p>
                 </div>
                 <div className="border-t border-zinc-200 pt-4">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Deliverables</h4>
                   <p className="text-sm text-zinc-500 font-light">8 High-resolution hero campaign images, 1 cinematic motion reel.</p>
                 </div>
               </div>
            </div>
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto min-h-[400px] relative overflow-hidden group" data-cursor="view">
              <motion.img 
                src="/work/campaign.jpg" 
                alt="Automotive concept" 
                style={{ scale: useTransform(smoothScrollY, [0, 4000], [1.15, 1]) }}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. PRICING */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-50 border-t border-zinc-200">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">Transparent Engagement.</h2>
            <p className="text-sm text-zinc-500 font-light max-w-xl mx-auto">We operate on clear, project-based tiers depending on the complexity of creative direction and volume.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             <div className="border border-zinc-200 p-8 md:p-10 flex flex-col gap-6 hover:shadow-2xl transition-shadow bg-white">
               <h3 className="font-sans font-bold tracking-tight text-xl uppercase">Product Collection</h3>
               <div className="text-2xl font-serif text-zinc-400">₹2.5L – ₹5L</div>
               <p className="text-sm text-zinc-500 font-light flex-1">Ideal for foundational e-commerce imagery, social content batches, and lookbooks requiring strong art direction.</p>
             </div>
             
             <div className="border border-black p-8 md:p-10 flex flex-col gap-6 shadow-xl bg-black text-white transform md:-translate-y-4 relative">
               <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[9px] uppercase tracking-widest font-bold px-4 py-1">Recommended</span>
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
        </motion.div>
      </section>

      {/* 9. FAQ */}
      <section className="relative w-full z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants} className="max-w-3xl mx-auto">
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
        </motion.div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="relative w-full z-10 py-32 md:py-48 px-6 flex flex-col items-center justify-center text-center overflow-hidden bg-black text-white">
        {/* Subtle parallax background for final CTA */}
        <motion.div 
          style={{ y: useTransform(smoothScrollY, [0, 5000], [0, 200]) }}
          className="absolute inset-0 opacity-20"
        >
           <Image src="/images/luxury.jpg" alt="Background" fill className="object-cover filter grayscale" />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants} className="max-w-3xl flex flex-col items-center gap-10 relative z-10">
          <p className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight italic">
            Have a product worth <br/>seeing differently?
          </p>
          <p className="font-sans text-sm md:text-base text-zinc-400 font-light uppercase tracking-widest">
            Tell us what you&apos;re building. We&apos;ll shape the visual direction.
          </p>
          <div className="mt-8">
            <MagneticButton href="/contact" className="inline-block px-12 py-6 bg-white text-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-200 transition-colors shadow-2xl">
              Start A Project
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
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
