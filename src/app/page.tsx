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
  return <Image src={src} alt={alt || "Media"} fill={fill} sizes={sizes} priority={priority} fetchPriority={priority ? "high" : "auto"} className={className} style={style} {...props} />;
};

const HeroReference = ({ cmsImages }: { cmsImages: any }) => {
  useEffect(() => {
    const pinContainer = document.getElementById('hero-pin-container');
    const orbitRing = document.getElementById('scroll-orbit-ring');
    const baseTiltX = -9;

    const updateOrbit = (rotateY: number) => {
        if (!orbitRing) return;
        orbitRing.style.transform = `rotateX(${baseTiltX}deg) rotateY(${rotateY}deg)`;
        orbitRing.style.setProperty('--ring-rotate-y', `${rotateY}deg`);

        const baseAngles = [0, 72, 144, 216, 288];
        for (let i = 0; i < 5; i++) {
            const rad = ((baseAngles[i] + rotateY) * Math.PI) / 180;
            const cosVal = Math.cos(rad);
            const t = (cosVal + 1) / 2; // 0 (back) to 1 (front)
            const scale = (0.78 + 0.24 * t).toFixed(3);
            const opacity = (0.40 + 0.60 * t).toFixed(3);
            orbitRing.style.setProperty(`--card-scale-${i}`, scale);
            orbitRing.style.setProperty(`--card-op-${i}`, opacity);
        }
    };

    if (orbitRing) {
        updateOrbit(0);
    }

    let rafId: number | null = null;
    const handleScroll = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(() => {
            if (!pinContainer || !orbitRing) return;
            const stickyEl = pinContainer.firstElementChild as HTMLElement;
            if (!stickyEl) return;
            
            const rect = pinContainer.getBoundingClientRect();
            // Calculate exactly how far the container can scroll before the sticky element hits the bottom
            const scrollableDistance = pinContainer.offsetHeight - stickyEl.offsetHeight;
            
            let progress = 0;
            if (rect.top <= 0 && scrollableDistance > 0) {
                progress = Math.abs(rect.top) / scrollableDistance;
            }
            
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;
            
            const rotateY = progress * 360;
            updateOrbit(rotateY);
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Dynamic flexible connector wires tracking
    const stickyStage = document.getElementById('hero-sticky-stage');
    const leftWirePath = document.getElementById('hero-left-wire-path');
    const rightWirePath = document.getElementById('hero-right-wire-path');
    const leftCard = document.querySelector('.animate-float-1') as HTMLElement | null;
    const rightCard = document.querySelector('.animate-float-2') as HTMLElement | null;
    const modelImg = document.querySelector('img[alt="Center Model"]') as HTMLElement | null;

    let wireRafId: number | null = null;
    const updateWires = () => {
        if (stickyStage && leftWirePath && rightWirePath && leftCard && rightCard && modelImg) {
            if (leftCard.offsetParent !== null) {
                const sRect = stickyStage.getBoundingClientRect();
                const mRect = modelImg.getBoundingClientRect();
                const lRect = leftCard.getBoundingClientRect();
                const rRect = rightCard.getBoundingClientRect();

                // Left wire: card inner-right edge -> person's left edge
                const x0L = lRect.right - 1 - sRect.left;
                const y0L = lRect.top + lRect.height * 0.42 - sRect.top;
                const x3L = mRect.left + mRect.width * 0.22 - sRect.left;
                const y3L = mRect.top + mRect.height * 0.32 - sRect.top;

                const dxL = x3L - x0L;
                const dyL = y3L - y0L;
                const c1xL = x0L + dxL * 0.40;
                const c1yL = y0L + dyL * 0.25;
                const c2xL = x0L + dxL * 0.60;
                const c2yL = y0L + dyL * 0.85;

                leftWirePath.setAttribute('d', `M ${x0L.toFixed(1)},${y0L.toFixed(1)} C ${c1xL.toFixed(1)},${c1yL.toFixed(1)} ${c2xL.toFixed(1)},${c2yL.toFixed(1)} ${x3L.toFixed(1)},${y3L.toFixed(1)}`);

                // Right wire: card inner-left edge -> person's right edge
                const x0R = rRect.left + 1 - sRect.left;
                const y0R = rRect.top + rRect.height * 0.42 - sRect.top;
                const x3R = mRect.left + mRect.width * 0.78 - sRect.left;
                const y3R = mRect.top + mRect.height * 0.32 - sRect.top;

                const dxR = x3R - x0R;
                const dyR = y3R - y0R;
                const c1xR = x0R + dxR * 0.40;
                const c1yR = y0R + dyR * 0.25;
                const c2xR = x0R + dxR * 0.60;
                const c2yR = y0R + dyR * 0.85;

                rightWirePath.setAttribute('d', `M ${x0R.toFixed(1)},${y0R.toFixed(1)} C ${c1xR.toFixed(1)},${c1yR.toFixed(1)} ${c2xR.toFixed(1)},${c2yR.toFixed(1)} ${x3R.toFixed(1)},${y3R.toFixed(1)}`);
            }
        }
    };

    const runWireLoop = () => {
        updateWires();
        wireRafId = window.requestAnimationFrame(runWireLoop);
    };

    updateWires();
    wireRafId = window.requestAnimationFrame(runWireLoop);

    return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (wireRafId) cancelAnimationFrame(wireRafId);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
            --orbit-radius: clamp(230px, min(22vw, 32vh), 320px);
            --orbit-card-w: clamp(170px, 14vw, 210px);
            --card-scale-0: 1.02;
            --card-scale-1: 0.93;
            --card-scale-2: 0.81;
            --card-scale-3: 0.81;
            --card-scale-4: 0.93;
            --card-op-0: 1;
            --card-op-1: 0.79;
            --card-op-2: 0.49;
            --card-op-3: 0.49;
            --card-op-4: 0.79;
        }
        @media (max-width: 1024px) {
            :root {
                --orbit-radius: clamp(190px, min(26vw, 28vh), 260px);
                --orbit-card-w: clamp(160px, 16vw, 190px);
            }
        }
        @media (max-width: 768px) {
            :root {
                --orbit-radius: clamp(140px, min(34vw, 24vh), 190px);
                --orbit-card-w: 160px;
            }
        }
        .hero-bg {
            background-image:
                linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
            background-size: 60px 60px;
            -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }
        .perspective-container {
            perspective: 2000px;
            perspective-origin: 50% 50%;
        }
        .transform-style-3d {
            transform-style: preserve-3d;
            will-change: transform;
        }
        .orbit-glass-card {
            background: rgba(255, 255, 255, 0.78);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.9);
            transition: box-shadow 0.3s ease;
        }
        .orbit-glass-card:hover {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 1);
        }
        .side-glass-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 20px 45px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,1);
            border-radius: 22px;
        }
        .svg-connector {
            position: absolute;
            pointer-events: none;
        }
        @keyframes hero-float-1 {
            0%, 100% {
                transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            33% {
                transform: translateY(-5px) translateX(1.5px) rotate(0.6deg);
            }
            66% {
                transform: translateY(-8px) translateX(-1px) rotate(-0.5deg);
            }
        }
        @keyframes hero-float-2 {
            0%, 100% {
                transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            35% {
                transform: translateY(-4px) translateX(-1.5px) rotate(-0.5deg);
            }
            70% {
                transform: translateY(-7.5px) translateX(1px) rotate(0.6deg);
            }
        }
        .animate-float-1 {
            animation: hero-float-1 4.6s ease-in-out infinite;
            will-change: transform;
        }
        .animate-float-2 {
            animation: hero-float-2 5.4s ease-in-out -1.8s infinite;
            will-change: transform;
        }
        @keyframes live-pulse {
            0%, 100% {
                box-shadow: 0 0 0 5px rgba(139, 124, 255, 0.12);
                opacity: 0.8;
            }
            50% {
                box-shadow: 0 0 0 8px rgba(139, 124, 255, 0.25), 0 0 12px rgba(139, 124, 255, 0.4);
                opacity: 1;
            }
        }
        .live-dot {
            animation: live-pulse 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            .animate-float-1,
            .animate-float-2,
            .live-dot {
                animation: none !important;
                transform: none !important;
            }
        }
      `}</style>
      <section id="hero-pin-container" className="relative w-full h-[300vh] bg-[#F9F8F6] z-20">
        <div id="hero-sticky-stage" className="sticky top-0 w-full h-[100vh] h-[100dvh] flex flex-col items-center pt-[88px] lg:pt-[92px] pb-3 overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hero-bg"></div>

            {/* DYNAMIC CONNECTOR WIRES SVG OVERLAY */}
            <svg id="hero-connectors-svg" className="hidden md:block pointer-events-none absolute inset-0 w-full h-full z-[1] overflow-visible" aria-hidden="true">
                <path id="hero-left-wire-path" fill="none" stroke="#dedcd5" strokeWidth="1.2" strokeLinecap="round" />
                <path id="hero-right-wire-path" fill="none" stroke="#dedcd5" strokeWidth="1.2" strokeLinecap="round" />
            </svg>

            {/* LEFT STATIC DETAIL (BOTTOM CORNER) */}
            <div className="hidden lg:flex absolute left-[3%] xl:left-[4%] bottom-[4%] flex-col gap-2 reveal delay-100 z-30 pointer-events-none">
                <div className="w-8 h-[1px] bg-zinc-300"></div>
                <p className="text-[12px] text-zinc-500 font-medium max-w-[150px] leading-tight">
                    Trusted by top-tier modern brands.
                </p>
                <div className="flex items-center -space-x-2 mt-0.5">
                    <img src="https://i.pravatar.cc/100?img=11" className="w-7 h-7 rounded-full border-2 border-[#F9F8F6]" alt="Client 1" />
                    <img src="https://i.pravatar.cc/100?img=32" className="w-7 h-7 rounded-full border-2 border-[#F9F8F6]" alt="Client 2" />
                    <img src="https://i.pravatar.cc/100?img=12" className="w-7 h-7 rounded-full border-2 border-[#F9F8F6]" alt="Client 3" />
                    <div className="w-7 h-7 rounded-full border-2 border-[#F9F8F6] bg-white flex items-center justify-center text-[10px] font-bold text-zinc-500">
                        +
                    </div>
                </div>
            </div>

            {/* RIGHT STATIC DETAIL (BOTTOM CORNER) */}
            <div className="hidden lg:flex absolute right-[3%] xl:right-[4%] bottom-[4%] text-right reveal delay-100 z-30 pointer-events-none">
                <p className="text-[12px] text-zinc-500 font-medium leading-tight">
                    Creative partner with<br/>
                    <a
                        href="https://graflystudio.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto text-[#8B7CFF] hover:text-black hover:underline underline-offset-2 transition-colors"
                    >
                        Grafly Studio.
                    </a>
                </p>
            </div>

            {/* LEFT OUTER FRAMING CARD (HIGH POSITION FLANKING HEADLINE) */}
            <div className="absolute left-[2%] xl:left-[4%] top-[18%] lg:top-[20%] w-[190px] lg:w-[210px] xl:w-[230px] side-glass-card p-4 lg:p-5 text-left hidden md:block animate-float-1 z-30 pointer-events-auto">
                <div className="w-9 h-9 bg-zinc-100 rounded-[10px] flex items-center justify-center mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                        <path d="M12 4v16m-4-12v8m8-10v12"/>
                    </svg>
                </div>
                <h3 className="font-bold text-[14px] lg:text-[15px] leading-[1.2] mb-1.5 text-[#111]">
                    Generate ideas<br/>
                    into reality.
                </h3>
                <p className="text-[11px] lg:text-[12px] text-zinc-500 font-medium leading-[1.4]">
                    Rapid prototyping and final commercial renders.
                </p>
            </div>

            {/* RIGHT OUTER FRAMING CARD (HIGH POSITION FLANKING CTA) */}
            <div className="absolute right-[2%] xl:right-[4%] top-[24%] lg:top-[26%] w-[180px] lg:w-[200px] xl:w-[220px] side-glass-card p-4 lg:p-5 text-left hidden md:block animate-float-2 z-30 pointer-events-auto">
                <div className="flex items-center -space-x-2 mb-3">
                    <img src="https://i.pravatar.cc/100?img=4" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" alt="User 1" />
                    <img src="https://i.pravatar.cc/100?img=5" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" alt="User 2" />
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold">
                        +
                    </div>
                </div>
                <h3 className="font-bold text-[14px] lg:text-[15px] leading-[1.2] mb-1.5 text-[#111]">
                    Global creative<br/>
                    collaboration.
                </h3>
                <p className="text-[11px] lg:text-[12px] text-zinc-500 font-medium leading-[1.4]">
                    Scale your brand's visual identity easily.
                </p>
            </div>

            {/* CENTER HERO CONTENT (TEXT + CTA) */}
            <div className="relative w-full max-w-[1000px] mx-auto px-6 flex flex-col items-center text-center z-40 reveal active shrink-0">
                <div className="flex items-center gap-2.5 mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#111] font-bold">
                    <div className="w-2 h-2 rounded-full bg-[#8B7CFF] shadow-[0_0_0_5px_rgba(139,124,255,0.12)] live-dot"></div>
                    AI CREATIVE STUDIO / GROTON AI
                </div>
                <h1 className="font-sans text-[38px] md:text-[50px] lg:text-[62px] xl:text-[72px] leading-[0.96] tracking-[-0.04em] font-bold text-[#111] max-w-[850px] relative">
                    A clearer vision<br/>
                    <span className="font-light italic text-zinc-500" style={{ letterSpacing: "-0.02em" }}>
                        for a brighter
                    </span> brand.
                </h1>
                <p className="mt-2 max-w-[480px] text-[13px] lg:text-[14.5px] leading-[1.5] text-zinc-500 font-medium">
                    GROTON is an AI-powered creative studio building high-end visual systems,
                    campaigns, and commercial imagery.
                </p>
                <div className="flex items-center justify-center gap-4 mt-2.5">
                    <a href="https://www.groton.in/work" className="h-[42px] px-[22px] rounded-full flex items-center gap-2.5 text-[12px] font-bold bg-[#111] text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 transition-all duration-300 pointer-events-auto">
                        Explore work
                        <div className="w-[19px] h-[19px] rounded-full flex items-center justify-center bg-[#8B7CFF] text-[#111] text-[10.5px] leading-none">
                            ↗
                        </div>
                    </a>
                </div>
            </div>

            {/* DEDICATED VISUAL STAGE (MODEL + 3D HALO) */}
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center perspective-container pointer-events-none mt-1 z-20">
                
                {/* BOUNDED CENTRAL SYSTEM */}
                <div className="relative w-full max-w-[850px] h-full flex items-center justify-center transform-style-3d">

                    {/* CENTRAL MODEL — Scaled to prominent bust/portrait presence */}
                    <div className="relative h-[112%] max-h-[530px] w-auto flex items-center justify-center transform-style-3d pointer-events-none" style={{ transform: "translateZ(0px)" }}>
                        {/* NATURAL GROUNDED CONTACT SHADOW BENEATH FEET */}
                        <div
                            aria-hidden="true"
                            className="absolute pointer-events-none select-none flex items-center justify-center"
                            style={{
                                bottom: '2.0%',
                                left: '49%',
                                transform: 'translateX(-50%)',
                                width: '54%',
                                height: '28px',
                                zIndex: 0,
                            }}
                        >
                            {/* Wide, very soft ambient floor diffusion */}
                            <div
                                className="absolute w-full h-full rounded-[100%] opacity-20 mix-blend-multiply blur-[16px]"
                                style={{
                                    background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.10) 45%, transparent 75%)',
                                }}
                            />
                            {/* Smooth transitional floor occlusion */}
                            <div
                                className="absolute w-[72%] h-[18px] rounded-[100%] opacity-25 mix-blend-multiply blur-[9px]"
                                style={{
                                    bottom: '3px',
                                    background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.12) 50%, transparent 80%)',
                                }}
                            />
                            {/* Slightly more density directly beneath the feet without hard edges */}
                            <div
                                className="absolute w-[44%] h-[10px] rounded-[100%] opacity-30 mix-blend-multiply blur-[5px]"
                                style={{
                                    bottom: '5px',
                                    background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.15) 55%, transparent 80%)',
                                }}
                            />
                        </div>

                        <CmsMedia
                            media={cmsImages.hero_main}
                            fallback="/campaign-worlds/groton-home-hero-model.png"
                            className="relative z-10 h-full w-auto object-contain mix-blend-multiply drop-shadow-2xl"
                            style={{ filter: "contrast(1.05) brightness(0.98)" }}
                            alt="Center Model"
                            width={800}
                            height={1000}
                            priority
                            sizes="(max-height: 768px) 55vh, 550px"
                        />
                    </div>

                    {/* 3D ORBIT HALO — Positioned just below face / upper chest */}
                    <div id="scroll-orbit-ring" className="absolute left-1/2 w-0 h-0 transform-style-3d pointer-events-none" style={{ top: "calc(38% + 30px)" }}>
                        
                        {/* CARD 1 — 0° (AI POWERED) */}
                        <div className="absolute w-[var(--orbit-card-w)] p-2.5 lg:p-3 rounded-[16px] orbit-glass-card flex items-center gap-2.5 lg:gap-3 transform-style-3d pointer-events-auto" style={{ transform: "translate(-50%, -50%) rotateY(0deg) translateZ(var(--orbit-radius)) rotateY(calc(0deg - var(--ring-rotate-y, 0deg))) scale(var(--card-scale-0, 1))", opacity: "var(--card-op-0, 1)" }}>
                            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[10px] bg-gradient-to-br from-[#8B7CFF] to-[#c4ff38] flex items-center justify-center shadow-inner shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="GROTON AI Logo"
                                    width={26}
                                    height={26}
                                    className="w-6 h-6 lg:w-[26px] lg:h-[26px] object-contain"
                                    priority
                                />
                            </div>
                            <div className="text-left min-w-0">
                                <h4 className="font-bold text-[12.5px] lg:text-[13px] text-[#111] truncate">AI Powered</h4>
                                <p className="text-[9.5px] lg:text-[10px] text-zinc-500 font-medium truncate">Generative workflow</p>
                            </div>
                        </div>

                        {/* CARD 2 — 72° (PRODUCT) */}
                        <div className="absolute w-[var(--orbit-card-w)] p-2.5 lg:p-3 rounded-[16px] orbit-glass-card flex items-center gap-2.5 lg:gap-3 transform-style-3d pointer-events-auto" style={{ transform: "translate(-50%, -50%) rotateY(72deg) translateZ(var(--orbit-radius)) rotateY(calc(-72deg - var(--ring-rotate-y, 0deg))) scale(var(--card-scale-1, 1))", opacity: "var(--card-op-1, 1)" }}>
                            <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-[10px] overflow-hidden bg-[#f2f2f2] shrink-0">
                                <CmsMedia media={cmsImages.hero_support_1} fallback="/campaign-worlds/groton-home-hero-floating-shoes-3x4.webp" fill className="object-cover mix-blend-darken" sizes="10vw" />
                            </div>
                            <div className="text-left min-w-0">
                                <h4 className="font-bold text-[12.5px] lg:text-[13px] text-[#111] truncate">Product</h4>
                                <p className="text-[9.5px] lg:text-[10px] text-zinc-500 font-medium truncate">Clean visual capture</p>
                            </div>
                        </div>

                        {/* CARD 3 — 144° (APPAREL) */}
                        <div className="absolute w-[var(--orbit-card-w)] p-2.5 lg:p-3 rounded-[16px] orbit-glass-card flex items-center gap-2.5 lg:gap-3 transform-style-3d pointer-events-auto" style={{ transform: "translate(-50%, -50%) rotateY(144deg) translateZ(var(--orbit-radius)) rotateY(calc(-144deg - var(--ring-rotate-y, 0deg))) scale(var(--card-scale-2, 1))", opacity: "var(--card-op-2, 1)" }}>
                            <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-[10px] overflow-hidden bg-[#f2f2f2] shrink-0">
                                <CmsMedia media={cmsImages.hero_support_2} fallback="/campaign-worlds/groton-home-hero-floating-tshirt-3x4.webp" fill className="object-cover mix-blend-darken" sizes="10vw" />
                            </div>
                            <div className="text-left min-w-0">
                                <h4 className="font-bold text-[12.5px] lg:text-[13px] text-[#111] truncate">Apparel</h4>
                                <p className="text-[9.5px] lg:text-[10px] text-zinc-500 font-medium truncate">Fashion collection</p>
                            </div>
                        </div>

                        {/* CARD 4 — 216° (EYEWEAR) */}
                        <div className="absolute w-[var(--orbit-card-w)] p-2.5 lg:p-3 rounded-[16px] orbit-glass-card flex items-center gap-2.5 lg:gap-3 transform-style-3d pointer-events-auto" style={{ transform: "translate(-50%, -50%) rotateY(216deg) translateZ(var(--orbit-radius)) rotateY(calc(-216deg - var(--ring-rotate-y, 0deg))) scale(var(--card-scale-3, 1))", opacity: "var(--card-op-3, 1)" }}>
                            <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-[10px] overflow-hidden bg-[#f2f2f2] shrink-0">
                                <CmsMedia media={cmsImages.hero_support_3} fallback="/campaign-worlds/groton-home-hero-floating-sunglasses-3x4.webp" fill className="object-cover mix-blend-darken" sizes="10vw" />
                            </div>
                            <div className="text-left min-w-0">
                                <h4 className="font-bold text-[12.5px] lg:text-[13px] text-[#111] truncate">Eyewear</h4>
                                <p className="text-[9.5px] lg:text-[10px] text-zinc-500 font-medium truncate">Premium accessories</p>
                            </div>
                        </div>

                        {/* CARD 5 — 288° (CAMPAIGN) */}
                        <div className="absolute w-[var(--orbit-card-w)] p-2.5 lg:p-3 rounded-[16px] orbit-glass-card flex items-center gap-2.5 lg:gap-3 transform-style-3d pointer-events-auto" style={{ transform: "translate(-50%, -50%) rotateY(288deg) translateZ(var(--orbit-radius)) rotateY(calc(-288deg - var(--ring-rotate-y, 0deg))) scale(var(--card-scale-4, 1))", opacity: "var(--card-op-4, 1)" }}>
                            <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-[10px] overflow-hidden bg-[#f2f2f2] shrink-0">
                                <CmsMedia media={cmsImages.hero_support_4} fallback="/campaign-worlds/groton-home-hero-floating-jacket-3x4.webp" fill className="object-cover mix-blend-darken" sizes="10vw" />
                            </div>
                            <div className="text-left min-w-0">
                                <h4 className="font-bold text-[12.5px] lg:text-[13px] text-[#111] truncate">Campaign</h4>
                                <p className="text-[9.5px] lg:text-[10px] text-zinc-500 font-medium truncate">Art directed visuals</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
      </section>
    </>
  );
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
    <div className="relative bg-[#F9F8F6] overflow-x-clip [overflow-x:clip] flex flex-col font-sans text-black selection:bg-black selection:text-white">

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
      <HeroReference cmsImages={cmsImages} />

      {/* 2. CAPABILITIES */}
      <section className="relative w-full z-10 bg-[#F9F8F6] pt-[150px] pb-[150px] px-6 lg:px-20 overflow-hidden">
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-[100px]">
             <div className="max-w-[700px]">
                <CmsText cmsId="home.cap.label" as="span" className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6" fallback="CAPABILITIES" />
                <CmsText cmsId="home.cap.heading" as="h2" brClassName="" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold" fallback={'E-commerce\nvisuals,\nelevated.'} />
             </div>
             <CmsText cmsId="home.cap.desc" as="p" className="font-sans text-[15px] lg:text-[16px] leading-[1.7] text-zinc-500 max-w-[350px] mt-8 lg:mt-0" fallback={"We specialize in creating premium product\nimagery for e-commerce brands. From clean\ncatalog shots to highly art-directed campaign\nvisuals, we ensure your products look their\nabsolute best."} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
             <div className="relative flex flex-col gap-6 lg:mt-0 group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#e8e5df] overflow-hidden rounded-[20px] shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)]">
                  <CmsMedia media={cmsImages.capability_product} fallback="/campaign-worlds/groton-home-capability-product-4x5.webp" alt="Premium e-commerce product imagery for campaigns" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img1.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="PRODUCT IMAGERY" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item1.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Product Photography" />
                   <CmsText cmsId="home.cap.item1.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Studio & Lifestyle" />
                </div>
             </div>
             <div className="relative flex flex-col gap-6 lg:mt-[60px] group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#dad7d0] overflow-hidden rounded-[20px] shadow-sm transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-lg">
                  <CmsMedia media={cmsImages.capability_model} fallback="/campaign-worlds/groton-home-capability-model-4x5.webp" alt="Product-on-Model" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img2.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="PRODUCT-ON-MODEL" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item2.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Product-on-Model" />
                   <CmsText cmsId="home.cap.item2.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Fashion & Apparel" />
                </div>
             </div>
             <div className="relative flex flex-col gap-6 lg:mt-[120px] group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#d1cec7] overflow-hidden rounded-[20px] shadow-sm transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-lg">
                  <CmsMedia media={cmsImages.capability_apparel} fallback="/campaign-worlds/groton-1.jpg" alt="Fashion Apparel" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img3.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="FASHION & APPAREL" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item3.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Fashion & Apparel" />
                   <CmsText cmsId="home.cap.item3.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Catalog & Collection" />
                </div>
             </div>
             <div className="relative flex flex-col gap-6 lg:mt-[180px] group cursor-pointer" data-cursor="view">
                <div className="w-full aspect-[4/5] relative bg-[#e8e5df] overflow-hidden rounded-[20px] shadow-sm transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-lg">
                  <CmsMedia media={cmsImages.capability_editorial} fallback="/campaign-worlds/groton-home-capability-editorial-4x5.webp" alt="Editorial" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6"><CmsText cmsId="home.cap.img4.label" as="span" className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.08em]" fallback="EDITORIAL" /></div>
                </div>
                <div className="flex flex-col gap-2">
                   <CmsText cmsId="home.cap.item4.title" as="h4" className="font-sans font-bold text-[18px] tracking-[-0.02em] text-black" fallback="Catalog & Marketplace Imagery" />
                   <CmsText cmsId="home.cap.item4.desc" as="p" className="font-sans text-[14px] text-zinc-500" fallback="— Collection Consistency" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT COLLECTION / EDITORIAL ARCHIVE */}
      <section 
        id="archive-section" 
        className="relative w-full z-10 bg-[#F9F8F6] py-[120px] lg:py-[160px] pb-12 lg:pb-14 px-6 lg:px-20 overflow-hidden"
        style={{ paddingBottom: '50px' }}
      >
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 xl:gap-20">
            
            {/* LEFT SIDE: EDITORIAL COPY */}
            <div className="w-full lg:w-1/2 max-w-[640px] flex flex-col justify-center">
              <CmsText 
                cmsId="home.archive.label" 
                as="span" 
                className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6" 
                fallback="Editorial Archive" 
              />
              
              <CmsText 
                cmsId="home.archive.heading" 
                as="h2" 
                className="font-sans font-bold text-black tracking-[-0.05em] mb-8" 
                style={{ fontSize: 'clamp(40px, 4.2vw, 64px)', lineHeight: 0.96 }}
                fallback="Multiple Models. Multiple Products. Endless Possibilities." 
              />
              
              <CmsText 
                cmsId="home.archive.desc" 
                as="p" 
                className="text-zinc-600 font-sans text-base md:text-[17px] lg:text-[18px] leading-[1.6] tracking-[-0.01em] max-w-[520px]" 
                fallback="Rather than relying on unguided generation, every asset passes through an exacting studio pipeline—from art direction and model casting to lighting and textural refinement. The result is commercial imagery with the fidelity, control, and presence of a premier editorial shoot." 
              />
            </div>

            {/* RIGHT SIDE: ONE LARGE 1:1 SQUARE IMAGE (FUTURE 1:1 VIDEO) */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div 
                className="w-full aspect-square relative bg-[#dad7d0] rounded-[24px] md:rounded-[32px] overflow-hidden group" 
                style={{ 
                  maxWidth: '520px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.03)'
                }} 
                data-cursor="view"
              >
                <CmsMedia 
                  media={cmsImages.archive_hero || cmsImages.gallery_1} 
                  fallback="/campaign-worlds/How to style Cat Print T shirts.jpeg" 
                  alt="Multiple Models. Multiple Products. Endless Possibilities." 
                  fill 
                  className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-1000" 
                  sizes="(max-width: 1024px) 100vw, 50vw" 
                  priority
                />
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
                  <CmsMedia media={cmsImages.process_raw} fallback="/campaign-worlds/groton-home-process-raw-1x1.webp" alt="Raw Product Input" fill className="object-contain p-6 mix-blend-luminosity opacity-70 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700" sizes="(max-width: 768px) 50vw, 20vw" />
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
                  <CmsMedia media={cmsImages.process_final} fallback="/campaign-worlds/groton-home-process-final-4x5.webp" alt="Final Campaign Visual" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 80vw, 30vw" />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* 5. FASHION & APPAREL */}
      <section className="relative w-full z-10 bg-[#F9F8F6] py-[150px] px-6 lg:px-20 overflow-hidden">
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-[1440px] mx-auto mb-[100px] relative z-10">
          <CmsText cmsId="home.focus.label" as="span" className="font-mono text-[10px] tracking-[0.08em] font-bold text-zinc-500 uppercase block mb-6" fallback="Focus" />
          <CmsText cmsId="home.focus.heading" as="h2" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold" fallback="Fashion & Apparel." />
        </div>
        
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 relative z-10">
           <div className="w-full aspect-[3/4] relative bg-[#dad7d0] rounded-[24px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)]" data-cursor="view">
             <CmsMedia media={cmsImages.fashion_1} fallback="/campaign-worlds/groton-home-fashion-black-hoodie-3x4.webp" alt="Black Hoodie Model" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 33vw" />
           </div>
           <div className="w-full aspect-[3/4] relative bg-[#e8e5df] rounded-[24px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] md:mt-[80px]" data-cursor="view">
             <CmsMedia media={cmsImages.fashion_2} fallback="/campaign-worlds/groton-home-fashion-striped-shirt-3x4.webp" alt="Striped Shirt" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 33vw" />
           </div>
           <div className="w-full aspect-[3/4] relative bg-[#dad7d0] rounded-[24px] overflow-hidden group shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] md:mt-[160px]" data-cursor="view">
             <CmsMedia media={cmsImages.fashion_3} fallback="/campaign-worlds/groton-home-fashion-blue-hoodie-3x4.webp" alt="Blue Hoodie Model" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 33vw" />
           </div>
        </div>
      </section>

      {/* 6. HOME & LIFESTYLE */}
      {false && (<section className="relative w-full z-10 bg-[#F9F8F6] py-[150px] px-6 lg:px-20 border-t border-[rgba(0,0,0,0.05)]">
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
      {false && (<section className="relative w-full z-10 bg-[#F9F8F6] py-[150px] overflow-hidden border-t border-[rgba(0,0,0,0.05)]">
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
      <section className="relative w-full z-10 bg-[#F9F8F6] py-[150px] px-6 lg:px-20 overflow-hidden">
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-[1200px] mx-auto relative z-10">
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
      <section className="relative w-full z-10 bg-[#F9F8F6] py-[150px] px-6 lg:px-20 overflow-hidden">
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-[150px] relative z-10">
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
      <footer className="relative w-full bg-[#F9F8F6] border-t border-[rgba(0,0,0,0.05)] mt-auto overflow-hidden">
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <CmsText cmsId="global.footer.brand" as="h3" className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black" fallback="GROTON AI STUDIO" />
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 md:gap-x-8 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.about" fallback="About" /></Link>
              <Link href="/services" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
              <Link href="/work" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
              <Link href="/blog" className="hover:text-black transition-colors py-1 md:py-0">Blog</Link>
              <Link href="/team" className="hover:text-black transition-colors py-1 md:py-0">Team</Link>
              <Link href="/tools" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.tools" fallback="Tools" /></Link>
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
