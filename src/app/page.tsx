"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, useMotionValue } from "framer-motion";

const revealVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const MotionLink = motion.create(Link);

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
    <MotionLink 
      href={href}
      ref={ref} 
      onMouseMove={handleMouse} 
      onMouseLeave={reset} 
      animate={{ x: position.x, y: position.y }} 
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </MotionLink>
  );
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Scroll Tracking
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { damping: 20, stiffness: 100, mass: 0.5 });
  
  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax Transforms
  const p1x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);
  const p1y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);
  
  const p2x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [20, -20]);
  const p2y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [20, -20]);
  
  const p3x = useTransform(smoothMouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [-25, 25]);
  const p3y = useTransform(smoothMouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [-25, 25]);
  
  // Navigation styling
  const navBg = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.95)"]);
  const navBorder = useTransform(scrollY, [0, 100], ["rgba(228,228,231,0)", "rgba(228,228,231,1)"]);
  const navPadding = useTransform(scrollY, [0, 100], ["2rem", "1.25rem"]);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (mediaQuery.matches || isTouch) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="relative bg-[#F9F8F6] overflow-x-hidden flex flex-col font-sans text-black selection:bg-black selection:text-white">

      {/* NAVIGATION */}
      <motion.header 
        style={{ backgroundColor: navBg, borderBottomColor: navBorder, paddingTop: navPadding, paddingBottom: navPadding }}
        className="fixed top-0 left-0 w-full px-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-50 transition-all backdrop-blur-md"
      >
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          GROTON AI STUDIO
        </Link>
        <div className="flex items-center gap-4 lg:gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/services" className="hover:text-black transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <MagneticButton href="/contact" className="hidden lg:inline-flex px-6 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </MagneticButton>
          
          <button 
            className="lg:hidden p-2 text-black focus:outline-none z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               {mobileMenuOpen ? (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
               )}
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-24 px-6 pb-6 lg:hidden overflow-y-auto">
           <nav className="flex flex-col gap-6 text-lg font-bold tracking-[0.2em] uppercase text-zinc-500 mt-8">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors text-black">Home</Link>
              <Link href="/work" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Work</Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Services</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/tools" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Tools</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">About</Link>
           </nav>
           <div className="mt-auto pt-12">
             <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-5 py-4 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
               Contact Us
             </Link>
           </div>
        </div>
      )}

      {/* 1. HERO SECTION - E-COMMERCE VISUAL PRODUCTION */}
      <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-start bg-[#F9F8F6] pt-40 pb-24 z-20">
        
        <div className="relative w-full max-w-[1400px] flex flex-col items-center justify-start px-6 z-10">
          
          {/* Main Content */}
          <div className="relative z-30 flex flex-col items-center text-center w-full">
             <motion.h1 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
               className="font-serif text-[2.5rem] leading-[1.1] sm:text-5xl md:text-7xl lg:text-[7.5rem] md:leading-[1.05] text-black tracking-tight max-w-5xl mx-auto"
             >
                Product visuals that <br className="hidden md:block"/> make brands look better.
             </motion.h1>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
               className="font-sans text-sm md:text-base text-zinc-600 mt-8 max-w-lg mx-auto font-light leading-relaxed"
             >
                Premium e-commerce imagery created for modern brands. We transform ordinary products into high-end commercial campaigns.
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 w-full"
             >
                <MagneticButton href="/contact" className="inline-flex px-10 py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors shadow-xl w-full sm:w-auto justify-center text-center">
                  Start A Project
                </MagneticButton>
                <Link href="/work" className="text-[10px] uppercase tracking-widest font-bold text-black border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors w-full sm:w-auto text-center">
                  View Our Work
                </Link>
             </motion.div>
          </div>

          {/* Hero Visual Layout - Using Actual Assets */}
          <div className="relative mt-20 w-full flex justify-center items-end pb-32 lg:pb-48">
            
            {/* Primary - Activewear Model */}
            <motion.div 
              style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -60]) }}
              className="relative z-10 w-[90%] md:w-full max-w-[500px] xl:max-w-[640px] aspect-[4/5] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.1)] group pointer-events-auto mt-8"
            >
              <motion.div 
                initial={{ opacity: 0, clipPath: "inset(5% 5% 5% 5%)" }} 
                animate={{ opacity: 1, clipPath: "inset(0% 0 0% 0)" }} 
                transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full relative overflow-hidden bg-zinc-200"
                data-cursor="view"
              >
                 <motion.div className="w-full h-full relative" whileHover={{ scale: 1.03 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ x: p1x, y: p1y }}>
                   <Image src="/campaign-worlds/24f5f63a08c1fa2434bdb5edfe06e4bb.jpg" alt="Activewear Model Campaign" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
                 </motion.div>
              </motion.div>
            </motion.div>

            {/* Secondary 1 - Sneakers */}
            <motion.div 
              style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -90]) }}
              className="absolute left-[2%] md:left-[5%] lg:left-[10%] bottom-16 lg:bottom-24 z-20 w-[35vw] md:w-[25vw] max-w-[300px] aspect-square shadow-[-20px_40px_80px_-20px_rgba(0,0,0,0.25)] group pointer-events-auto hidden sm:block"
            >
               <motion.div 
                 initial={{ opacity: 0, x: -30 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ duration: 1.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
                 className="w-full h-full relative overflow-hidden bg-zinc-200"
                 data-cursor="view"
               >
                 <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ x: p2x, y: p2y }}>
                   <Image src="/campaign-worlds/990d5aeb63b8b4ecc01f0e17d877fc6c.jpg" alt="Yellow Sneakers E-commerce" fill className="object-cover" priority sizes="(max-width: 768px) 0vw, 25vw" />
                 </motion.div>
               </motion.div>
            </motion.div>

            {/* Secondary 2 - Purifiers/Product */}
            <motion.div 
              style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -120]) }}
              className="absolute right-[5%] md:right-[12%] lg:right-[16%] top-12 md:top-20 lg:top-32 z-30 w-[30vw] md:w-[18vw] max-w-[220px] aspect-[3/4] shadow-[20px_40px_80px_-20px_rgba(0,0,0,0.25)] group pointer-events-auto hidden sm:block"
            >
               <motion.div 
                 initial={{ opacity: 0, x: 30 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ duration: 1.2, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                 className="w-full h-full relative overflow-hidden bg-zinc-200"
                 data-cursor="view"
               >
                 <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ x: p3x, y: p3y }}>
                   <Image src="/campaign-worlds/8ba03716f09635d4a54c4dfbd7ca2687.jpg" alt="Colorful Product Campaign" fill className="object-cover object-center" priority sizes="(max-width: 768px) 0vw, 20vw" />
                 </motion.div>
               </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.8 }}
              className="absolute bottom-0 right-[5%] lg:right-[10%] z-10 hidden md:flex flex-col text-right gap-1"
            >
               <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-400">GROTON</span>
               <span className="text-[9px] uppercase tracking-[0.1em] text-black font-semibold">Art Direction &<br/>E-Commerce Visuals</span>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* 2. WHAT GROTON CREATES */}
      <section className="relative w-full z-10 bg-white py-32 px-6 border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase mb-4">Capabilities</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-black mb-8">
              E-commerce visuals, <br/>elevated.
            </h2>
            <p className="font-sans text-zinc-500 font-light max-w-md leading-relaxed mb-12">
              We specialize in creating premium product imagery for e-commerce brands. From clean catalog shots to highly art-directed campaign visuals, we ensure your products look their absolute best.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="w-full aspect-square relative bg-zinc-100 group overflow-hidden" data-cursor="view">
                 <Image src="/campaign-worlds/8ba03716f09635d4a54c4dfbd7ca2687.jpg" alt="Product Imagery" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/10 flex items-end p-4"><span className="text-[10px] font-bold text-white uppercase tracking-widest">Product Imagery</span></div>
               </div>
               <div className="w-full aspect-square relative bg-zinc-100 group overflow-hidden" data-cursor="view">
                 <Image src="/campaign-worlds/88ed8c348d74c49b9c906f032986a937.jpg" alt="Product-on-Model" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/10 flex items-end p-4"><span className="text-[10px] font-bold text-white uppercase tracking-widest">Product-on-Model</span></div>
               </div>
               <div className="w-full aspect-square relative bg-zinc-100 group overflow-hidden" data-cursor="view">
                 <Image src="/campaign-worlds/04b99ee05dbfbbb23eab1576a0fcf6f4.jpg" alt="Fashion E-commerce" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/10 flex items-end p-4"><span className="text-[10px] font-bold text-white uppercase tracking-widest">Fashion Apparel</span></div>
               </div>
               <div className="w-full aspect-square relative bg-zinc-100 group overflow-hidden" data-cursor="view">
                 <Image src="/campaign-worlds/96162aabb92e6fedb4c4918e9b746219.jpg" alt="Lifestyle Products" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/10 flex items-end p-4"><span className="text-[10px] font-bold text-white uppercase tracking-widest">Lifestyle</span></div>
               </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 justify-center text-sm md:text-base font-medium tracking-wide">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <span>Product Photography</span>
              <span className="text-zinc-400 text-xs">— Studio & Lifestyle</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <span>Product-on-Model</span>
              <span className="text-zinc-400 text-xs">— Fashion & Apparel</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <span>Campaign Visuals</span>
              <span className="text-zinc-400 text-xs">— Art Directed Compositions</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <span>Catalog & Marketplace Imagery</span>
              <span className="text-zinc-400 text-xs">— Collection Consistency</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT COLLECTION GALLERY */}
      <section className="relative w-full z-10 bg-[#F9F8F6] py-32 overflow-hidden border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 mb-16 text-center">
          <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase block mb-4">Editorial Archive</span>
          <h2 className="font-serif text-4xl md:text-5xl text-black">A visual collection.</h2>
        </div>

        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="col-span-2 md:col-span-2 row-span-2 aspect-[4/5] relative bg-zinc-200 group overflow-hidden" data-cursor="view">
              <Image src="/campaign-worlds/41bffbbcab612a0661fbefdfaf50e872.jpg" alt="Sherpa Hoodie" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
            </div>
            <div className="col-span-1 aspect-square relative bg-zinc-200 group overflow-hidden" data-cursor="view">
              <Image src="/campaign-worlds/0a1b3678298467ff8b2caf425bbd7853.jpg" alt="Pink Jacket" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />
            </div>
            <div className="col-span-1 aspect-[3/4] relative bg-zinc-200 group overflow-hidden" data-cursor="view">
              <Image src="/campaign-worlds/9658700553cbc9f4432fc4c327023f8f.jpg" alt="Pink Hoodie Model" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />
            </div>
            <div className="col-span-1 aspect-[4/5] relative bg-zinc-200 group overflow-hidden" data-cursor="view">
              <Image src="/campaign-worlds/51c544e78767b419a857af993f1814ab.jpg" alt="Pendant Lights" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />
            </div>
            <div className="col-span-1 aspect-square relative bg-zinc-200 group overflow-hidden" data-cursor="view">
              <Image src="/campaign-worlds/45258c05db236072e9efbed40ba5e79e.jpg" alt="Sandals" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT TRANSFORMATION */}
      <section className="relative w-full z-10 bg-zinc-950 text-white py-32 px-6 overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-500 uppercase mb-4">The Process</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-16">
            From Product <br/> to Campaign.
          </h2>

          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-6 w-full md:w-1/3">
              <div className="w-full aspect-square relative overflow-hidden bg-zinc-900 border border-zinc-800">
                <Image src="/campaign-worlds/f8bc3ba5d07efbee4c99ce1f6c028602.jpg" alt="Raw Product Input" fill className="object-cover filter grayscale opacity-80 mix-blend-luminosity" />
              </div>
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-zinc-500">Raw Product Asset</span>
            </div>

            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
              <span className="text-[8px] tracking-[0.2em] uppercase font-bold text-zinc-400 mt-2">Art Direction</span>
            </div>

            <div className="flex flex-col items-center gap-6 w-full md:w-1/2">
              <div className="w-full aspect-[4/5] relative overflow-hidden bg-zinc-900 shadow-2xl">
                <Image src="/campaign-worlds/c85eebec43abf0ea972f6a8fcd15371d.jpg" alt="Final Campaign Visual" fill className="object-cover" />
              </div>
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-white">Final Campaign Visual</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FASHION & APPAREL */}
      <section className="relative w-full z-10 bg-white py-32 border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 mb-16">
          <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase block mb-4">Focus</span>
          <h2 className="font-serif text-4xl md:text-5xl text-black">Fashion & Apparel.</h2>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="w-full aspect-[3/4] relative bg-zinc-100 group overflow-hidden" data-cursor="view">
             <Image src="/campaign-worlds/cef7134dfb9512f9d8034ce9d8626853.jpg" alt="Black Hoodie Model" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
           </div>
           <div className="w-full aspect-[3/4] relative bg-zinc-100 group overflow-hidden md:mt-12" data-cursor="view">
             <Image src="/campaign-worlds/04b99ee05dbfbbb23eab1576a0fcf6f4.jpg" alt="Striped Shirt" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
           </div>
           <div className="w-full aspect-[3/4] relative bg-zinc-100 group overflow-hidden" data-cursor="view">
             <Image src="/campaign-worlds/88ed8c348d74c49b9c906f032986a937.jpg" alt="Blue Hoodie Model" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
           </div>
        </div>
      </section>

      {/* 6. HOME & LIFESTYLE */}
      <section className="relative w-full z-10 bg-[#F9F8F6] py-32 border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 mb-16 text-right">
          <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase block mb-4">Focus</span>
          <h2 className="font-serif text-4xl md:text-5xl text-black">Home & Lifestyle.</h2>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-7 aspect-[16/9] relative bg-zinc-100 group overflow-hidden" data-cursor="view">
             <Image src="/campaign-worlds/d9e1c8fd5191c143b2ad5e29c1a15f37.jpg" alt="Pendant Lights" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
           </div>
           <div className="md:col-span-5 flex flex-col gap-6">
             <div className="w-full aspect-square relative bg-zinc-100 group overflow-hidden" data-cursor="view">
               <Image src="/campaign-worlds/96162aabb92e6fedb4c4918e9b746219.jpg" alt="Orange Cushions" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="w-full aspect-[21/9] relative bg-zinc-100 group overflow-hidden" data-cursor="view">
               <Image src="/campaign-worlds/5548c29a92a965abad9325b905a07cdd.jpg" alt="Translucent Lamp" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
             </div>
           </div>
        </div>
      </section>

      {/* 7. HORIZONTAL GALLERY - PORTFOLIO / SELECTED WORK */}
      <section className="relative w-full z-10 bg-white py-32 overflow-hidden border-t border-zinc-200">
        <div className="px-6 md:px-12 lg:px-24 mb-16 max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase block mb-4">Selected Work</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-black">A visual archive.</h2>
          </div>
          <Link href="/work" className="text-[10px] uppercase tracking-widest font-bold text-black border-b border-black pb-1 hover:text-zinc-500 transition-colors">
            View Full Portfolio
          </Link>
        </div>

        {/* Gallery Track */}
        <div className="w-full flex gap-6 px-6 md:px-12 lg:px-24 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          
          <div className="min-w-[85vw] md:min-w-[40vw] lg:min-w-[30vw] flex flex-col gap-4 snap-center group cursor-pointer" data-cursor="view">
            <div className="w-full aspect-[4/5] relative overflow-hidden bg-zinc-200">
              <Image src="/campaign-worlds/24f5f63a08c1fa2434bdb5edfe06e4bb.jpg" alt="Fashion Apparel" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold tracking-widest uppercase">Fashion</span>
            </div>
          </div>

          <div className="min-w-[85vw] md:min-w-[40vw] lg:min-w-[30vw] flex flex-col gap-4 snap-center group cursor-pointer" data-cursor="view">
            <div className="w-full aspect-[4/5] relative overflow-hidden bg-zinc-200">
              <Image src="/campaign-worlds/990d5aeb63b8b4ecc01f0e17d877fc6c.jpg" alt="Footwear" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold tracking-widest uppercase">Footwear</span>
            </div>
          </div>

          <div className="min-w-[85vw] md:min-w-[40vw] lg:min-w-[30vw] flex flex-col gap-4 snap-center group cursor-pointer" data-cursor="view">
            <div className="w-full aspect-[4/5] relative overflow-hidden bg-zinc-200">
              <Image src="/campaign-worlds/51c544e78767b419a857af993f1814ab.jpg" alt="Home" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold tracking-widest uppercase">Home</span>
            </div>
          </div>

          <div className="min-w-[85vw] md:min-w-[40vw] lg:min-w-[30vw] flex flex-col gap-4 snap-center group cursor-pointer" data-cursor="view">
            <div className="w-full aspect-[4/5] relative overflow-hidden bg-zinc-200">
              <Image src="/campaign-worlds/8ba03716f09635d4a54c4dfbd7ca2687.jpg" alt="Product" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold tracking-widest uppercase">Product</span>
            </div>
          </div>
          
          <div className="min-w-[85vw] md:min-w-[40vw] lg:min-w-[30vw] flex flex-col gap-4 snap-center group cursor-pointer" data-cursor="view">
            <div className="w-full aspect-[4/5] relative overflow-hidden bg-zinc-200">
              <Image src="/campaign-worlds/45258c05db236072e9efbed40ba5e79e.jpg" alt="Lifestyle" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold tracking-widest uppercase">Lifestyle</span>
            </div>
          </div>

        </div>
      </section>

      {/* 8. PROCESS */}
      <section className="relative w-full z-10 bg-zinc-50 py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-20 text-center">
            <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase block mb-4">Our Process</span>
            <h2 className="font-serif text-3xl md:text-5xl text-black">How we produce.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 border-t border-zinc-200 pt-12">
            
            <div className="flex flex-col gap-4">
              <span className="text-zinc-300 font-serif text-3xl italic">01</span>
              <h4 className="font-bold text-sm uppercase tracking-widest">Product</h4>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">Provide your product or reference imagery.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-zinc-300 font-serif text-3xl italic">02</span>
              <h4 className="font-bold text-sm uppercase tracking-widest">Direction</h4>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">We establish the visual direction and lighting.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-zinc-300 font-serif text-3xl italic">03</span>
              <h4 className="font-bold text-sm uppercase tracking-widest">Production</h4>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">Products are developed into the required visual style.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-zinc-300 font-serif text-3xl italic">04</span>
              <h4 className="font-bold text-sm uppercase tracking-widest">Refinement</h4>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">Composition, styling, and details are meticulously polished.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-zinc-300 font-serif text-3xl italic">05</span>
              <h4 className="font-bold text-sm uppercase tracking-widest">Delivery</h4>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">Final commercial-ready visuals are delivered.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. WHY GROTON */}
      <section className="relative w-full z-10 bg-white py-32 px-6 border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="w-full lg:w-1/3">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-black sticky top-32">
              Built for <br/>E-commerce.
            </h2>
          </div>
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Consistent Presentation</h4>
              <p className="text-zinc-500 text-sm md:text-base font-light leading-relaxed">Maintain a unified visual language across your entire product catalog, ensuring brand consistency on every product page.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Premium Aesthetic</h4>
              <p className="text-zinc-500 text-sm md:text-base font-light leading-relaxed">Elevate your brand perception with lighting, framing, and compositions that rival top-tier physical studio productions.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Scalable Production</h4>
              <p className="text-zinc-500 text-sm md:text-base font-light leading-relaxed">Whether launching a single capsule collection or re-shooting a massive inventory, our process scales effortlessly.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Flexible Directions</h4>
              <p className="text-zinc-500 text-sm md:text-base font-light leading-relaxed">Pivot from clean white-background catalog shots to moody, editorial campaign visuals using the same core product assets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">GROTON AI STUDIO</h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 md:gap-x-8 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors py-1 md:py-0">About</Link>
              <Link href="/services" className="hover:text-black transition-colors py-1 md:py-0">Services</Link>
              <Link href="/work" className="hover:text-black transition-colors py-1 md:py-0">Work</Link>
              <Link href="/pricing" className="hover:text-black transition-colors py-1 md:py-0">Pricing</Link>
              <Link href="/contact" className="hover:text-black transition-colors py-1 md:py-0">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors py-1 md:py-0">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors py-1 md:py-0">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              &copy; 2026 GROTON AI STUDIO
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
