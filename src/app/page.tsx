"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, useMotionValue } from "framer-motion";
import CmsText from "@/components/CmsText";

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


const CmsMedia = ({ media, fallback, alt, fill, className, priority, sizes, style, ...props }: any) => {
  const src = media?.src || fallback;
  const type = media?.mediaType || (src && src.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image');
  
  if (type === 'video') {
    const videoStyle = fill ? { objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, ...style } : style;
    return <video src={src} autoPlay muted loop playsInline className={className} style={videoStyle} {...props} />;
  }
  return <Image src={src} alt={alt || "Media"} fill={fill} sizes={sizes} priority={priority} className={className} style={style} {...props} />;
};

export default function Home() {
  const [cmsImages, setCmsImages] = useState<Record<string, any>>({});
  useEffect(() => { fetch('/api/studio/cms', { cache: 'no-store' }).then(r => r.json()).then(data => { const map = data.reduce((acc: any, img: any) => ({ ...acc, [img.id]: { src: img.src, mediaType: img.mediaType || 'image' } }), {}); setCmsImages(map); }).catch(() => {}); }, []);

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
    
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="relative bg-[#F9F8F6] overflow-x-hidden flex flex-col font-sans text-black selection:bg-black selection:text-white">

      {/* NAVIGATION */}
      <motion.header 
        className="fixed z-50 flex flex-row justify-between items-center transition-all"
        style={{
          top: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(1400px, calc(100% - 36px))",
          height: "64px",
          padding: "0 10px 0 22px",
          background: "rgba(248, 246, 241, 0.72)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          border: "1px solid rgba(255, 255, 255, 0.7)",
          borderRadius: "100px",
          boxShadow: "0 12px 35px rgba(0, 0, 0, 0.07), inset 0 1px rgba(255, 255, 255, 0.9)"
        }}
      >
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          <CmsText cmsId="global.nav.brand" fallback="GROTON AI STUDIO" />
        </Link>
        <div className="flex items-center gap-4 lg:gap-8 h-full">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
            <Link href="/services" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
            <Link href="/pricing" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
            <Link href="/tools" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.tools" fallback="Tools" /></Link>
            <Link href="/about" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.about" fallback="About" /></Link>
          </nav>
          <MagneticButton href="/contact" className="hidden lg:flex h-[44px] items-center justify-center rounded-full px-6 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            <CmsText cmsId="global.nav.contact" fallback="Contact" />
          </MagneticButton>
          
          <button 
            className="lg:hidden flex items-center justify-center w-[44px] h-[44px] rounded-full text-black hover:bg-black/5 focus:outline-none z-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 1. HERO SECTION - REDESIGNED */}
      <section className="relative min-h-[100svh] w-full flex items-center pt-[120px] pb-[80px] lg:pt-[150px] lg:pb-[100px] overflow-hidden bg-[#f3f0ea] z-20">
        
        {/* Grid Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(
                to right,
                rgba(0, 0, 0, 0.035) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.035) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "80px 80px",
            maskImage: "linear-gradient(to bottom, black, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 90%)",
          }}
        />

        <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center justify-between z-10">
          
          {/* Left Content */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center lg:items-start text-left relative z-30 pt-10 lg:pt-0">
             
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="flex items-center gap-2.5 mb-6 lg:mb-8 font-mono text-[11px] uppercase tracking-[0.08em] text-[#111]"
             >
               <style>{`
                 @keyframes live-pulse {
                   0%, 100% { box-shadow: 0 0 0 5px rgba(139, 124, 255, 0.12); }
                   50% { box-shadow: 0 0 0 8px rgba(139, 124, 255, 0.25), 0 0 12px rgba(139, 124, 255, 0.4); }
                 }
                 @media (prefers-reduced-motion: no-preference) {
                   .live-dot { animation: live-pulse 2s ease-in-out infinite; }
                 }
               `}</style>
               <div className="w-2 h-2 rounded-full bg-[#8B7CFF] shadow-[0_0_0_5px_rgba(139,124,255,0.12)] live-dot"></div>
               <CmsText cmsId="home.hero.kicker" fallback="AI CREATIVE STUDIO / GROTON AI" />
             </motion.div>

             <CmsText
               cmsId="home.hero.heading"
               as={motion.h1}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
               className="font-sans text-[50px] md:text-[65px] lg:text-[75px] xl:text-[85px] leading-[0.9] tracking-[-0.04em] font-bold text-[#111]"
               fallback={<>Product visuals<br/><span className="text-transparent" style={{ WebkitTextStroke: '1.4px #171714' }}>that make brands</span><br/>look better.</>}
             />

             <CmsText
               cmsId="home.hero.desc"
               as={motion.p}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
               className="mt-8 lg:mt-11 max-w-[450px] lg:ml-[8%] text-[15px] lg:text-[16px] leading-[1.7] text-[#66635d]"
               fallback="GROTON is an AI-powered creative studio building high-end visual systems, campaigns and digital experiences for modern brands."
             />

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
               className="flex flex-wrap items-center gap-3.5 mt-8 lg:mt-10 lg:ml-[8%]"
             >
                <MagneticButton href="/work" className="h-[54px] px-[25px] rounded-full flex items-center gap-3 text-[12px] font-bold bg-[#111] text-white shadow-[0_15px_35px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(0,0,0,0.23)] transition-all duration-[0.45s]">
                  <CmsText cmsId="home.hero.cta.primary" fallback="Explore work" />
                  <div className="w-[23px] h-[23px] rounded-full flex items-center justify-center bg-[#8B7CFF] text-[#111] text-[13px] leading-none">↗</div>
                </MagneticButton>
                
                <MagneticButton href="/contact" className="h-[54px] px-[25px] rounded-full flex items-center gap-3 text-[12px] font-bold border border-[rgba(17,17,15,0.13)] bg-[rgba(255,255,255,0.38)] text-[#111] hover:bg-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.07)] transition-all duration-[0.45s]">
                  <CmsText cmsId="home.hero.cta.secondary" fallback="Start a project" />
                </MagneticButton>
             </motion.div>
          </div>

          {/* Right Content - Image Composition */}
          <div className="w-full lg:w-[50%] relative mt-24 lg:mt-0 flex justify-center items-center h-[500px] sm:h-[600px] lg:h-[700px] xl:h-[800px] z-20 pointer-events-none">
            
            <div className="relative w-full h-full flex items-center justify-center pointer-events-auto max-w-[440px] xl:max-w-[560px]">
              
              {/* Primary - Activewear Model */}
              <motion.div 
                style={{ x: p1x, y: p1y }}
                className="relative z-10 w-[65%] sm:w-[60%] lg:w-[70%] xl:w-[75%] max-w-[380px] aspect-[735/1000] group"
              >
                <motion.div
                  style={{ y: useTransform(smoothScrollY, [0, 1000], [0, -60]) }}
                  className="w-full h-full shadow-[0_25px_55px_rgba(0,0,0,0.09)] rounded-[16px] lg:rounded-[20px] pointer-events-auto"
                >
                  <motion.div 
                    initial={{ opacity: 0, clipPath: "inset(5% 5% 5% 5%)" }} 
                    animate={{ opacity: 1, clipPath: "inset(0% 0 0% 0)" }} 
                    transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full relative overflow-hidden bg-white rounded-[16px] lg:rounded-[20px] p-[10px] lg:p-[12px]"
                    data-cursor="view"
                  >
                     <div className="relative w-full h-full flex items-center justify-center bg-[#f4f4f4] rounded-[6px] lg:rounded-[8px] overflow-hidden isolate">
                       <motion.div className="w-full h-full relative flex items-center justify-center" whileHover={{ scale: 1.03 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                         <CmsMedia media={cmsImages.hero_main} fallback="/campaign-worlds/groton-home-hero-primary-model-3x4.webp" alt="Activewear Model Campaign" fill className="object-cover object-center mix-blend-darken pointer-events-none" priority sizes="(max-width: 768px) 100vw, 50vw" />
                       </motion.div>
                     </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Secondary 1 - Top Left (Shoes) */}
              <FloatingHeroCard 
                media={cmsImages.hero_support_1} fallback="/campaign-worlds/groton-home-hero-floating-shoes-3x4.webp"
                alt="Floating Asset 1 - Shoes"
                className="-left-[5%] sm:-left-[10%] lg:-left-[14%] xl:-left-[18%] top-[8%] lg:top-[15%]"
                
                px={p2x} py={p2y}
                scrollYTransform={useTransform(smoothScrollY, [0, 1000], [0, -100])}
                initial={{ opacity: 0, x: -30, y: -20 }}
                delay={0.7}
              />

              {/* Secondary 2 - Bottom Left (T-shirt) */}
              <FloatingHeroCard 
                media={cmsImages.hero_support_2} fallback="/campaign-worlds/groton-home-hero-floating-tshirt-3x4.webp"
                alt="Floating Asset 2 - T-shirt"
                className="-left-[2%] sm:-left-[5%] lg:-left-[10%] xl:-left-[14%] bottom-[0%] lg:bottom-[6%]"
                
                px={p3x} py={p3y}
                scrollYTransform={useTransform(smoothScrollY, [0, 1000], [0, -60])}
                initial={{ opacity: 0, x: -30, y: 20 }}
                delay={0.9}
              />

              {/* Secondary 3 - Top Right (Sunglasses) */}
              <FloatingHeroCard 
                media={cmsImages.hero_support_3} fallback="/campaign-worlds/groton-home-hero-floating-sunglasses-3x4.webp"
                alt="Floating Asset 3 - Sunglasses"
                className="-right-[5%] sm:-right-[10%] lg:-right-[14%] xl:-right-[18%] top-[15%] lg:top-[22%]"
                
                px={p3x} py={p3y}
                scrollYTransform={useTransform(smoothScrollY, [0, 1000], [0, -120])}
                initial={{ opacity: 0, x: 30, y: -20 }}
                delay={0.8}
              />

              {/* Secondary 4 - Bottom Right (Jacket + Pants) */}
              <FloatingHeroCard 
                media={cmsImages.hero_support_4} fallback="/campaign-worlds/groton-home-hero-floating-jacket-3x4.webp"
                alt="Floating Asset 4 - Jacket"
                className="-right-[2%] sm:-right-[5%] lg:-right-[10%] xl:-right-[14%] bottom-[5%] lg:bottom-[10%]"
                
                px={p2x} py={p2y}
                scrollYTransform={useTransform(smoothScrollY, [0, 1000], [0, -80])}
                initial={{ opacity: 0, x: 30, y: 20 }}
                delay={1.0}
              />

            </div>
          </div>

        </div>
      </section>

      {/* 2. CAPABILITIES */}
      <section className="relative w-full z-10 bg-[#f3f0ea] pt-[150px] pb-[150px] px-6 lg:px-20 border-t border-[rgba(0,0,0,0.05)] overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-[100px]">
             <div className="max-w-[700px]">
                <CmsText cmsId="home.cap.label" as="span" className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6" fallback="Capabilities" />
                <CmsText cmsId="home.cap.heading" as="h2" brClassName="" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold" fallback={'E-commerce visuals,\nelevated.'} />
             </div>
             <CmsText cmsId="home.cap.desc" as="p" className="font-sans text-[15px] lg:text-[16px] leading-[1.7] text-zinc-500 max-w-[350px] mt-8 lg:mt-0" fallback="We specialize in creating premium product imagery for e-commerce brands. From clean catalog shots to highly art-directed campaign visuals, we ensure your products look their absolute best." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
             <div className="relative flex flex-col gap-6 lg:mt-0 group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#e8e5df] overflow-hidden rounded-[20px] shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)]">
                  <CmsMedia media={cmsImages.capability_product} fallback="/campaign-worlds/groton-home-capability-product-4x5.webp" alt="Premium e-commerce product imagery for campaigns" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img1.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="Product Imagery" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item1.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Product Photography" />
                   <CmsText cmsId="home.cap.item1.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Studio & Lifestyle" />
                </div>
             </div>
             <div className="relative flex flex-col gap-6 lg:mt-[60px] group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#dad7d0] overflow-hidden rounded-[20px] shadow-sm transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-lg">
                  <CmsMedia media={cmsImages.capability_model} fallback="/campaign-worlds/groton-home-capability-model-4x5.webp" alt="Product-on-Model" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img2.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="Product-on-Model" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item2.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Product-on-Model" />
                   <CmsText cmsId="home.cap.item2.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Fashion & Apparel" />
                </div>
             </div>
             <div className="relative flex flex-col gap-6 lg:mt-[120px] group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#d1cec7] overflow-hidden rounded-[20px] shadow-sm transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-lg">
                  <CmsMedia media={cmsImages.capability_apparel} fallback="/campaign-worlds/groton-1.jpg" alt="Fashion Apparel" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img3.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="Fashion Apparel" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item3.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Campaign Visuals" />
                   <CmsText cmsId="home.cap.item3.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Art Directed Compositions" />
                </div>
             </div>
             <div className="relative flex flex-col gap-6 lg:mt-[180px] group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#e8e5df] overflow-hidden rounded-[20px] shadow-sm transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-lg">
                  <CmsMedia media={cmsImages.capability_editorial} fallback="/campaign-worlds/groton-home-capability-editorial-4x5.webp" alt="Editorial" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img4.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="Editorial" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item4.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Catalog & Marketplace Imagery" />
                   <CmsText cmsId="home.cap.item4.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Collection Consistency" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT COLLECTION GALLERY */}
      <section className="relative w-full z-10 bg-[#f3f0ea] py-[150px] px-6 lg:px-20 overflow-hidden border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[80px]">
            <div>
               <CmsText cmsId="home.archive.label" as="span" className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6" fallback="Editorial Archive" />
               <CmsText cmsId="home.archive.heading" as="h2" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold" fallback="A visual collection." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
             <div className="md:col-span-7 flex flex-col gap-6 lg:gap-8">
                <div className="w-full aspect-[4/5] relative bg-[#dad7d0] rounded-[30px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] hover:-translate-y-1" data-cursor="view">
                  <CmsMedia media={cmsImages.gallery_1} fallback="/campaign-worlds/groton-home-gallery-sherpa-4x5.webp" alt="Fashion e-commerce apparel imagery of sherpa hoodie" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 60vw" />
                </div>
                <div className="grid grid-cols-2 gap-6 lg:gap-8">
                   <div className="w-full aspect-[3/4] relative bg-[#dad7d0] rounded-[30px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] hover:-translate-y-1" data-cursor="view">
                     <CmsMedia media={cmsImages.gallery_2} fallback="/campaign-worlds/groton-home-gallery-pink-jacket-3x4.webp" alt="Product-on-model fashion photography of pink jacket" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="30vw" />
                   </div>
                   <div className="w-full aspect-square relative bg-[#dad7d0] rounded-[30px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] hover:-translate-y-1 mt-6 lg:mt-12" data-cursor="view">
                     <CmsMedia media={cmsImages.gallery_3} fallback="/campaign-worlds/groton-home-gallery-pink-hoodie-1x1.webp" alt="Lifestyle product visuals of pink hoodie" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="30vw" />
                   </div>
                </div>
             </div>

             <div className="md:col-span-5 flex flex-col gap-6 lg:gap-8 md:mt-[150px]">
                <div className="w-full aspect-[3/4] relative bg-[#dad7d0] rounded-[30px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] hover:-translate-y-1" data-cursor="view">
                  <CmsMedia media={cmsImages.gallery_4} fallback="/campaign-worlds/groton-home-gallery-lighting-3x4.webp" alt="Lifestyle product imagery for interior lighting" fill className="object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 40vw" />
                </div>
                <div className="w-full aspect-[4/5] relative bg-[#dad7d0] rounded-[30px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] hover:-translate-y-1" data-cursor="view">
                  <CmsMedia media={cmsImages.gallery_5} fallback="/campaign-worlds/groton-home-gallery-footwear-4x5.webp" alt="E-commerce footwear product imagery for sandals" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 40vw" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT TRANSFORMATION */}
        <section className="relative w-full z-10 bg-[#111] text-white py-[100px] lg:py-[150px] px-6 lg:px-20 overflow-hidden border-t border-zinc-900">
          <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
            <CmsText cmsId="home.process.label" as="span" className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-400 uppercase mb-6" fallback="The Process" />
            <CmsText cmsId="home.process.heading" as="h2" brClassName="" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] font-bold mb-[80px] lg:mb-[120px]" fallback={"From Product\nto Campaign."} />

            <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12 lg:gap-4 relative">
              
              {/* STAGE 01 - PRODUCT */}
              <motion.div 
                initial={{ opacity: shouldReduceMotion ? 1 : 0.4 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-[22%] flex flex-col items-center text-center relative group"
              >
                <div className="flex flex-col items-center gap-4 mb-6">
                  <span className="font-mono text-[10px] text-zinc-500 group-hover:text-[#8B7CFF] transition-colors duration-500">01</span>
                  <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest group-hover:text-[#8B7CFF] transition-colors duration-500">Product</span>
                  <span className="font-sans text-[13px] text-zinc-400">Raw Product</span>
                </div>
                <div className="w-[80%] max-w-[200px] aspect-square relative overflow-hidden rounded-[16px] bg-zinc-900/50 border border-zinc-800/50">
                  <CmsMedia media={cmsImages.process_raw} fallback="/campaign-worlds/groton-home-process-raw-1x1.webp" alt="Raw Product Input" fill className="object-contain p-6 mix-blend-luminosity opacity-70 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700" />
                </div>
              </motion.div>

              {/* ARROW 1 -> 2 */}
              <motion.div 
                initial={{ opacity: shouldReduceMotion ? 1 : 0.2 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex flex-col lg:flex-row items-center justify-center text-zinc-700"
              >
                {/* Mobile Arrow */}
                <div className="lg:hidden h-8 w-[1px] bg-zinc-700 relative my-2">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b border-r border-zinc-700 rotate-45 translate-y-[2px]"></div>
                </div>
                {/* Desktop Arrow */}
                <div className="hidden lg:block w-8 lg:w-12 h-[1px] bg-zinc-700 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-zinc-700 rotate-45 translate-x-[2px]"></div>
                </div>
              </motion.div>

              {/* STAGE 02 - MODEL */}
              <motion.div 
                initial={{ opacity: shouldReduceMotion ? 1 : 0.4 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.2 }}
                className="w-full lg:w-[18%] flex flex-col items-center text-center relative group"
              >
                <div className="flex flex-col items-center gap-4 mb-6">
                  <span className="font-mono text-[10px] text-zinc-500 group-hover:text-[#8B7CFF] transition-colors duration-500">02</span>
                  <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest group-hover:text-[#8B7CFF] transition-colors duration-500">Model</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="font-sans text-[14px] text-zinc-300">Male</span>
                  <span className="font-sans text-[14px] text-zinc-300">Editorial Pose</span>
                  <span className="font-sans text-[14px] text-zinc-300">Casual Styling</span>
                </div>
              </motion.div>

              {/* ARROW 2 -> 3 */}
              <motion.div 
                initial={{ opacity: shouldReduceMotion ? 1 : 0.2 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col lg:flex-row items-center justify-center text-zinc-700"
              >
                <div className="lg:hidden h-8 w-[1px] bg-zinc-700 relative my-2">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b border-r border-zinc-700 rotate-45 translate-y-[2px]"></div>
                </div>
                <div className="hidden lg:block w-8 lg:w-12 h-[1px] bg-zinc-700 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-zinc-700 rotate-45 translate-x-[2px]"></div>
                </div>
              </motion.div>

              {/* STAGE 03 - ART DIRECTION */}
              <motion.div 
                initial={{ opacity: shouldReduceMotion ? 1 : 0.4 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.4 }}
                className="w-full lg:w-[18%] flex flex-col items-center text-center relative group"
              >
                <div className="flex flex-col items-center gap-4 mb-6">
                  <span className="font-mono text-[10px] text-zinc-500 group-hover:text-[#8B7CFF] transition-colors duration-500">03</span>
                  <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest group-hover:text-[#8B7CFF] transition-colors duration-500">Art Direction</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="font-sans text-[14px] text-zinc-300">Soft Lighting</span>
                  <span className="font-sans text-[14px] text-zinc-300">50mm Camera</span>
                  <span className="font-sans text-[14px] text-zinc-300">Clean Background</span>
                  <span className="font-sans text-[14px] text-zinc-300">Editorial Composition</span>
                </div>
              </motion.div>

              {/* ARROW 3 -> 4 */}
              <motion.div 
                initial={{ opacity: shouldReduceMotion ? 1 : 0.2 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col lg:flex-row items-center justify-center text-zinc-700"
              >
                <div className="lg:hidden h-8 w-[1px] bg-zinc-700 relative my-2">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b border-r border-zinc-700 rotate-45 translate-y-[2px]"></div>
                </div>
                <div className="hidden lg:block w-8 lg:w-12 h-[1px] bg-zinc-700 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-zinc-700 rotate-45 translate-x-[2px]"></div>
                </div>
              </motion.div>

              {/* STAGE 04 - CAMPAIGN */}
              <motion.div 
                initial={{ opacity: shouldReduceMotion ? 1 : 0.4 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.6 }}
                className="w-full lg:w-[28%] flex flex-col items-center text-center relative group"
              >
                <div className="flex flex-col items-center gap-4 mb-6">
                  <span className="font-mono text-[10px] text-[#8B7CFF]">04</span>
                  <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest text-[#8B7CFF]">Campaign</span>
                  <span className="font-sans text-[13px] text-zinc-400">Final Campaign Visual</span>
                </div>
                <div className="w-[90%] lg:w-full max-w-[280px] aspect-[4/5] relative overflow-hidden rounded-[20px] shadow-[0_18px_40px_rgba(0,0,0,0.30)]">
                  <CmsMedia media={cmsImages.process_final} fallback="/campaign-worlds/groton-home-process-final-4x5.webp" alt="Final Campaign Visual" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* 5. FASHION & APPAREL */}
      <section className="relative w-full z-10 bg-[#f3f0ea] py-[150px] px-6 lg:px-20 overflow-hidden border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[1440px] mx-auto mb-[100px]">
          <CmsText cmsId="home.focus.label" as="span" className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6" fallback="Focus" />
          <CmsText cmsId="home.focus.heading" as="h2" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold" fallback="Fashion & Apparel." />
        </div>
        
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
           <div className="w-full aspect-[3/4] relative bg-[#f3f0ea] rounded-[24px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)]" data-cursor="view">
             <CmsMedia media={cmsImages.fashion_1} fallback="/campaign-worlds/groton-home-fashion-black-hoodie-3x4.webp" alt="Black Hoodie Model" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
           </div>
           <div className="w-full aspect-[3/4] relative bg-[#e8e5df] rounded-[24px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] md:mt-[80px]" data-cursor="view">
             <CmsMedia media={cmsImages.fashion_2} fallback="/campaign-worlds/groton-home-fashion-striped-shirt-3x4.webp" alt="Striped Shirt" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
           </div>
           <div className="w-full aspect-[3/4] relative bg-[#dad7d0] rounded-[24px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] md:mt-[160px]" data-cursor="view">
             <CmsMedia media={cmsImages.fashion_3} fallback="/campaign-worlds/groton-home-fashion-blue-hoodie-3x4.webp" alt="Blue Hoodie Model" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
           </div>
        </div>
      </section>

      {/* 6. HOME & LIFESTYLE */}
      {false && (<section className="relative w-full z-10 bg-[#f3f0ea] py-[150px] px-6 lg:px-20 border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[1440px] mx-auto mb-16 text-right">
          <span className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6">Focus</span>
          <h2 className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold">Home & Lifestyle.</h2>
        </div>
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
           <div className="md:col-span-7 aspect-[16/9] relative bg-[#dad7d0] rounded-[30px] group overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)]" data-cursor="view">
             <Image src="/campaign-worlds/groton-16.jpg" alt="Lifestyle product imagery for interior lighting" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
           </div>
           <div className="md:col-span-5 flex flex-col gap-6 lg:gap-10">
             <div className="w-full aspect-square relative bg-[#dad7d0] rounded-[30px] group overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)]" data-cursor="view">
               <Image src="/campaign-worlds/groton-11.jpg" alt="Lifestyle e-commerce product visuals for home accessories" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
             </div>
             <div className="w-full aspect-[21/9] relative bg-[#dad7d0] rounded-[30px] group overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)]" data-cursor="view">
               <Image src="/campaign-worlds/groton-7.jpg" alt="Catalog product imagery for home decor" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
             </div>
           </div>
        </div>
      </section>)}

      {/* 7. HORIZONTAL GALLERY - PORTFOLIO / SELECTED WORK */}
      {false && (<section className="relative w-full z-10 bg-[#f3f0ea] py-[150px] overflow-hidden border-t border-[rgba(0,0,0,0.05)]">
        <div className="px-6 md:px-12 lg:px-24 mb-16 max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <span className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6">Selected Work</span>
            <h2 className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold">A visual archive.</h2>
          </div>
          <Link href="/work" className="text-[10px] uppercase tracking-widest font-bold text-black border-b border-black pb-1 hover:text-zinc-500 transition-colors">
            View Full Portfolio
          </Link>
        </div>

        <div className="w-full flex gap-6 px-6 md:px-12 lg:px-24 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {[
            { img: "/campaign-worlds/groton-3.jpg", label: "Fashion" },
            { img: "/campaign-worlds/groton-13.jpg", label: "Footwear" },
            { img: "/campaign-worlds/groton-6.jpg", label: "Home" },
            { img: "/campaign-worlds/groton-10.jpg", label: "Product" },
            { img: "/campaign-worlds/groton-5.jpg", label: "Lifestyle" }
          ].map((item, idx) => (
            <div key={idx} className="min-w-[85vw] md:min-w-[40vw] lg:min-w-[30vw] flex flex-col gap-4 snap-center group cursor-pointer" data-cursor="view">
              <div className="w-full aspect-[4/5] relative overflow-hidden rounded-[24px] bg-[#dad7d0] shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
                <Image src={item.img} alt={item.label} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="font-mono text-[10px] tracking-[0.08em] font-bold uppercase">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>)}

      {/* 8. PROCESS */}
      <section className="relative w-full z-10 bg-[#f3f0ea] py-[150px] px-6 lg:px-20 border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-[100px] text-left">
            <span className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6">Our Process</span>
            <h2 className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold">How we produce.</h2>
          </div>

          <div className="flex flex-col border-t border-[rgba(0,0,0,0.1)]">
            {[
              { id: "step1", step: "01", title: "Product", desc: "Provide your product or reference imagery." },
              { id: "step2", step: "02", title: "Direction", desc: "We establish the visual direction and lighting." },
              { id: "step3", step: "03", title: "Production", desc: "Products are developed into the required visual style." },
              { id: "step4", step: "04", title: "Refinement", desc: "Composition, styling, and details are meticulously polished." },
              { id: "step5", step: "05", title: "Delivery", desc: "Final commercial-ready visuals are delivered." }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.9, delay: shouldReduceMotion ? 0 : idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-16 py-10 lg:py-14 border-b border-[rgba(0,0,0,0.1)] group transition-colors duration-500 hover:bg-[rgba(0,0,0,0.02)] px-4 -mx-4 rounded-xl"
              >
                <div className="absolute left-0 bottom-[-1px] h-[1px] w-0 bg-black transition-all duration-[0.6s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full z-10" aria-hidden="true" />
                <span className="font-mono text-[24px] md:text-[32px] text-zinc-300 md:w-[100px] transition-colors duration-500 group-hover:text-black">{item.step}</span>
                <CmsText cmsId={`home.process.${item.id}.title`} as="h4" className="font-sans font-bold text-[24px] md:text-[32px] tracking-[-0.03em] text-black flex-1" fallback={item.title} />
                <CmsText cmsId={`home.process.${item.id}.desc`} as="p" className="font-sans text-[15px] lg:text-[16px] text-zinc-500 md:w-[350px] leading-[1.7]" fallback={item.desc} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. WHY GROTON */}
      <section className="relative w-full z-10 bg-[#f3f0ea] py-[150px] px-6 lg:px-20 border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-[150px]">
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-32">
               <CmsText cmsId="home.why.heading" as="h2" brClassName="" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold" fallback={"Built for\nE-commerce."} />
            </div>
          </div>
          <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-[80px]">
            {[
              { id: "item1", title: "Consistent Presentation", desc: "Maintain a unified visual language across your entire product catalog, ensuring brand consistency on every product page." },
              { id: "item2", title: "Premium Aesthetic", desc: "Elevate your brand perception with lighting, framing, and compositions that rival top-tier physical studio productions." },
              { id: "item3", title: "Scalable Production", desc: "Whether launching a single capsule collection or re-shooting a massive inventory, our process scales effortlessly." },
              { id: "item4", title: "Flexible Directions", desc: "Pivot from clean white-background catalog shots to moody, editorial campaign visuals using the same core product assets." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <CmsText cmsId={`home.why.${item.id}.title`} as="h4" className="font-sans font-bold text-[20px] tracking-[-0.02em] text-black" fallback={item.title} />
                <CmsText cmsId={`home.why.${item.id}.desc`} as="p" className="font-sans text-[15px] leading-[1.7] text-zinc-500" fallback={item.desc} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#f3f0ea] border-t border-[rgba(0,0,0,0.05)] mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <CmsText cmsId="global.footer.brand" as="h3" className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black" fallback="GROTON AI STUDIO" />
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 md:gap-x-8 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.about" fallback="About" /></Link>
              <Link href="/services" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
              <Link href="/work" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
              <Link href="/blog" className="hover:text-black transition-colors py-1 md:py-0">Blog</Link>

              <Link href="/pricing" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
              <Link href="/contact" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.contact" fallback="Contact" /></Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors py-1 md:py-0">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors py-1 md:py-0">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <CmsText cmsId="global.footer.copyright" as="p" className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold" fallback="© 2026 GROTON AI STUDIO" />
            <div className="flex items-center gap-6">
              <a href="https://www.instagram.com/d99p4k/" target="_blank" rel="noopener noreferrer" className="text-inherit opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://in.linkedin.com/in/deepak-kumawat-grafly" target="_blank" rel="noopener noreferrer" className="text-inherit opacity-60 hover:opacity-100 hover:text-[#0a66c2] transition-all duration-300 hover:-translate-y-1" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              <CmsText cmsId="global.footer.credit" fallback="A creative venture by" /> <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-black transition-colors"><CmsText cmsId="global.footer.creditLink" fallback="Grafly Studio" /></a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


interface FloatingCardProps {
  media: any;
  fallback: string;
  alt: string;
  className: string;
  px?: any;
  py?: any;
  scrollYTransform?: any;
  initial?: any;
  delay?: number;
  imageScale?: number;
}

function FloatingHeroCard({ media, fallback, alt, className, px, py, scrollYTransform, initial, delay, imageScale = 1 }: FloatingCardProps) {
  return (
    <motion.div 
      style={{ x: px, y: py }}
      className={`absolute z-20 w-[100px] sm:w-[110px] lg:w-[128px] xl:w-[140px] aspect-[4/5] ${className}`}
    >
       <motion.div
         style={{ y: scrollYTransform }}
         className="w-full h-full shadow-[0_14px_32px_rgba(0,0,0,0.09)] rounded-[16px] lg:rounded-[20px] group pointer-events-auto"
       >
         <motion.div 
           initial={initial} 
           animate={{ opacity: 1, x: 0, y: 0 }} 
           transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
           className="w-full h-full relative overflow-hidden bg-white rounded-[16px] lg:rounded-[20px] p-[10px] lg:p-[12px]"
           data-cursor="view"
         >
           <div className="relative w-full h-full flex items-center justify-center bg-[#f2f2f2] rounded-[6px] lg:rounded-[8px] overflow-hidden isolate">
             <div className="relative w-full h-full flex items-center justify-center">
               <CmsMedia media={media} fallback={fallback} alt={alt} fill className="object-cover mix-blend-darken pointer-events-none group-hover:scale-105 transition-transform duration-700" priority sizes="(max-width: 768px) 30vw, 20vw" />
             </div>
           </div>
         </motion.div>
       </motion.div>
    </motion.div>
  );
}
