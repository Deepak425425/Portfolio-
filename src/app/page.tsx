"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useReducedMotion, useMotionValue } from "framer-motion";

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
  
  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax Transforms
  const p1x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [-15, 15]);
  const p1y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [-15, 15]);
  
  const p2x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [25, -25]);
  const p2y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [25, -25]);
  
  const p3x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [-35, 35]);
  const p3y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [-35, 35]);

  const p4x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [20, -20]);
  const p4y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [20, -20]);

  const p5x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);
  const p5y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);

  const pPanelX = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? ["-50%", "-50%"] : ["-48%", "-52%"]);
  const pPanelY = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);
  
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

      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);

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

      {/* 1. HERO SECTION - EDITORIAL COMPOSITION */}
      <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#F9F8F6] pt-32 pb-24 z-10">
        
        <div className="relative w-full max-w-[1600px] h-full flex flex-col items-center justify-center px-6 z-10">
          
          {/* Main Content (Centered) */}
          <div className="relative z-20 flex flex-col items-center text-center mt-12 md:mt-24 w-full">
             {/* Headline */}
             <motion.h1 
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
               className="font-serif text-5xl md:text-7xl lg:text-[6.5rem] leading-[1.05] text-black tracking-tight max-w-5xl mx-auto"
             >
                Premium AI Visuals <br className="hidden md:block"/> for Modern Brands.
             </motion.h1>

             {/* Supporting Text */}
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
               className="font-sans text-sm md:text-base text-zinc-600 mt-8 max-w-lg mx-auto font-light leading-relaxed"
             >
                Product imagery, cinematic campaigns and motion content — directed for brands that care how they look.
             </motion.p>

             {/* CTAs */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 w-full"
             >
                <MagneticButton href="/contact" className="inline-flex px-10 py-5 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors shadow-2xl w-full sm:w-auto justify-center text-center">
                  Start A Project
                </MagneticButton>
                <Link href="/work" className="text-[10px] uppercase tracking-widest font-bold text-black border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors w-full sm:w-auto text-center">
                  View Selected Work
                </Link>
             </motion.div>
          </div>

          {/* FLOATING VISUAL SYSTEM (Desktop/Tablet) */}
          <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
            
            {/* 1. Top Left: Medium Jewellery */}
            <motion.div style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -90]) }} className="absolute top-[8%] left-[5%] lg:left-[10%] w-[18vw] max-w-[240px] z-10 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ x: p1x, y: p1y }}
                className="w-full aspect-[4/5] overflow-hidden shadow-2xl group pointer-events-auto bg-zinc-200" data-cursor="view"
              >
                 <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                   <Image src="/work/jewellery.jpg" alt="Jewellery Campaign" fill className="object-cover" priority sizes="(max-width: 768px) 0vw, 25vw" />
                 </motion.div>
              </motion.div>
            </motion.div>

            {/* 2. Top Right: Large Fashion */}
            <motion.div style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -140]) }} className="absolute top-[3%] right-[2%] lg:right-[6%] w-[22vw] max-w-[300px] z-20 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ x: p2x, y: p2y }}
                className="w-full aspect-[3/4] overflow-hidden shadow-2xl group pointer-events-auto bg-zinc-200" data-cursor="view"
              >
                 <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                   <Image src="/work/fashion.jpg" alt="Fashion Campaign" fill className="object-cover" priority sizes="(max-width: 768px) 0vw, 30vw" />
                 </motion.div>
              </motion.div>
            </motion.div>

            {/* 3. Middle Left: Cropped Beauty/Product */}
            <motion.div style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -50]) }} className="absolute top-[45%] left-[1%] lg:left-[4%] w-[12vw] max-w-[160px] z-30 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ x: p3x, y: p3y }}
                className="w-full aspect-square overflow-hidden shadow-xl group pointer-events-auto bg-zinc-200" data-cursor="view"
              >
                 <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                   <Image src="/images/luxury.jpg" alt="Beauty Campaign" fill className="object-cover object-[center_30%]" priority sizes="(max-width: 768px) 0vw, 15vw" />
                 </motion.div>
              </motion.div>
            </motion.div>

            {/* 4. Bottom Right: Medium Product */}
            <motion.div style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -110]) }} className="absolute bottom-[-2%] right-[10%] lg:right-[15%] w-[16vw] max-w-[220px] z-20 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.5, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ x: p4x, y: p4y }}
                className="w-full aspect-[4/5] overflow-hidden shadow-2xl group pointer-events-auto bg-zinc-200" data-cursor="view"
              >
                 <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                   <Image src="/work/product.jpg" alt="Product Campaign" fill className="object-cover" priority sizes="(max-width: 768px) 0vw, 20vw" />
                 </motion.div>
              </motion.div>
            </motion.div>
            
            {/* 5. Lower Left Background overlapping */}
            <motion.div style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -70]) }} className="absolute bottom-[5%] left-[18%] w-[14vw] max-w-[180px] z-0 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 2, delay: 1.3 }}
                style={{ x: p5x, y: p5y }}
                className="w-full aspect-[4/5] overflow-hidden shadow-md opacity-70 mix-blend-multiply pointer-events-none bg-zinc-200"
              >
                 <Image src="/work/campaign.jpg" alt="Atmospheric visual" fill className="object-cover filter grayscale opacity-60" sizes="(max-width: 768px) 0vw, 20vw" />
              </motion.div>
            </motion.div>

          </div>

          {/* CENTRAL CREATIVE PANEL */}
          <motion.div style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -40]) }} className="absolute bottom-[8%] md:bottom-[12%] left-1/2 z-30 pointer-events-none hidden sm:block">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ x: pPanelX, y: pPanelY }}
              className="flex flex-col gap-3 bg-white/90 backdrop-blur-xl p-5 pr-14 shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-purple-500/10 rounded-sm pointer-events-auto"
            >
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></div>
                 <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-800">Generating campaign visual...</span>
               </div>
               <div className="flex gap-5 mt-2 border-t border-zinc-100 pt-3">
                 <div className="flex flex-col gap-1">
                   <span className="text-[7px] uppercase tracking-[0.2em] text-zinc-400">Direction</span>
                   <span className="text-[9px] uppercase tracking-[0.1em] text-black font-semibold">Editorial</span>
                 </div>
                 <div className="flex flex-col gap-1 border-l border-zinc-100 pl-4">
                   <span className="text-[7px] uppercase tracking-[0.2em] text-zinc-400">Subject</span>
                   <span className="text-[9px] uppercase tracking-[0.1em] text-black font-semibold">Luxury Product</span>
                 </div>
                 <div className="flex flex-col gap-1 border-l border-zinc-100 pl-4">
                   <span className="text-[7px] uppercase tracking-[0.2em] text-zinc-400">Status</span>
                   <span className="text-[9px] uppercase tracking-[0.1em] text-purple-600 font-semibold">Rendering</span>
                 </div>
               </div>
            </motion.div>
          </motion.div>
          
          {/* Mobile Specific Floating Images */}
          <div className="absolute inset-0 z-0 pointer-events-none md:hidden overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 0.25, y: 0 }} transition={{ duration: 2, delay: 0.5 }}
              style={{ y: useTransform(smoothScrollY, [0, 800], [0, -40]) }}
              className="absolute top-[10%] right-[-15%] w-[50vw] aspect-[3/4] overflow-hidden mix-blend-multiply filter grayscale"
            >
               <Image src="/work/fashion.jpg" alt="Fashion" fill className="object-cover" sizes="50vw" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.4, y: 0 }} transition={{ duration: 2, delay: 0.8 }}
              style={{ y: useTransform(smoothScrollY, [0, 800], [0, -60]) }}
              className="absolute bottom-[15%] left-[-10%] w-[40vw] aspect-[4/5] overflow-hidden mix-blend-multiply"
            >
               <Image src="/work/jewellery.jpg" alt="Jewellery" fill className="object-cover" sizes="40vw" />
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
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden w-full">
          <div className="px-12 lg:px-24 mb-16">
             <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl">Campaign Worlds.</h2>
          </div>
          <motion.div ref={trackRef} style={{ x: horizontalX }} className="flex gap-8 lg:gap-16 pl-12 lg:pl-24 w-max">
            {horizontalItems.map((item, i) => (
              <div key={i} data-cursor="view" className="relative w-[80vw] lg:w-[60vw] h-[60vh] flex-shrink-0 group overflow-hidden">
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
      <section className="py-24 px-6 bg-zinc-50 md:hidden border-y border-zinc-200">
         <h2 className="font-serif text-4xl mb-12">Campaign Worlds.</h2>
         <div className="flex flex-col gap-8">
           {horizontalItems.map((item, i) => (
              <div key={i} className="relative w-full h-[60vh] overflow-hidden">
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
