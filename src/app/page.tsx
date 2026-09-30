"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, useMotionValue } from "framer-motion";
import { Manrope, DM_Mono } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700", "800"] });
const dm_mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

    useEffect(() => {
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
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const { scrollY } = useScroll();
    const smoothScrollY = useSpring(scrollY, { damping: 20, stiffness: 100, mass: 0.5 });
    const navWidth = useTransform(smoothScrollY, [0, 200], ["calc(100% - 40px)", "calc(100% - 100px)"]);
    const navBg = useTransform(smoothScrollY, [0, 200], ["rgba(255, 255, 255, 0.75)", "rgba(255, 255, 255, 0.95)"]);

    const archiveRef = useRef(null);
    const { scrollYProgress: archiveProgress } = useScroll({ target: archiveRef, offset: ["start end", "end start"] });
    const archiveX = useTransform(archiveProgress, [0, 1], ["0%", "-20%"]);

    const finalRef = useRef(null);
    const { scrollYProgress: finalProgress } = useScroll({ target: finalRef, offset: ["start end", "end start"] });
    const finalX = useTransform(finalProgress, [0, 1], ["0%", "-15%"]);

    const heroScrollY = useTransform(smoothScrollY, [0, 1000], [0, 150]);
    const heroOpacity = useTransform(smoothScrollY, [0, 800], [1, 0]);

    // Mouse Parallax Transforms
    const mainImageX = useTransform(smoothMouseX, [-1, 1], [-8, 8]);
    const mainImageY = useTransform(smoothMouseY, [-1, 1], [-8, 8]);

    const supp1X = useTransform(smoothMouseX, [-1, 1], [-18, 18]);
    const supp1Y = useTransform(smoothMouseY, [-1, 1], [-18, 18]);

    const supp2X = useTransform(smoothMouseX, [-1, 1], [-25, 25]);
    const supp2Y = useTransform(smoothMouseY, [-1, 1], [-25, 25]);

    const supp3X = useTransform(smoothMouseX, [-1, 1], [-15, 15]);
    const supp3Y = useTransform(smoothMouseY, [-1, 1], [-15, 15]);

    const supp4X = useTransform(smoothMouseX, [-1, 1], [12, -12]);
    const supp4Y = useTransform(smoothMouseY, [-1, 1], [12, -12]);

    return (
        <main className={`relative w-full min-h-screen bg-[#faf9f6] text-[#11110f] ${manrope.variable} ${dm_mono.variable} font-sans overflow-x-hidden selection:bg-[#c4ff38] selection:text-black`}>

            {/* Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}></div>

            {/* NAVIGATION */}
            <motion.nav
                style={{ width: navWidth, backgroundColor: navBg }}
                className="fixed top-5 left-1/2 -translate-x-1/2 max-w-7xl h-[66px] z-50 rounded-full flex items-center justify-between px-6 backdrop-blur-[25px] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-300"
            >
                <Link href="/" className="text-[20px] font-extrabold tracking-[-0.075em] hover:opacity-70 transition-opacity">
                    GROTON<span className="opacity-30">®</span>
                </Link>

                <div className="hidden md:flex gap-8 text-[11px] font-bold text-[#66635c] uppercase tracking-widest font-mono">
                    <Link href="#services" className="hover:text-black transition-colors">Capabilities</Link>
                    <Link href="#work" className="hover:text-black transition-colors">Work</Link>
                    <Link href="#process" className="hover:text-black transition-colors">Process</Link>
                    <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
                </div>

                <Link href="#contact" className="hidden md:flex h-[46px] px-5 bg-[#11110f] text-white rounded-full items-center gap-2 text-[10px] uppercase font-bold tracking-widest hover:-translate-y-1 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] transition-all duration-400 group">
                    <span className="w-2 h-2 rounded-full bg-[#c4ff38] group-hover:scale-125 transition-transform"></span>
                    Start A Project
                </Link>

                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
                    <div className={`w-5 h-0.5 bg-black transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-black transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-black transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </button>
            </motion.nav>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-[#faf9f6]/95 backdrop-blur-xl flex flex-col pt-32 px-8 pb-8 md:hidden"
                    >
                        <div className="flex flex-col gap-8 text-2xl font-bold tracking-[-0.04em]">
                            <Link href="#services" onClick={() => setMobileMenuOpen(false)}>Capabilities</Link>
                            <Link href="#work" onClick={() => setMobileMenuOpen(false)}>Work</Link>
                            <Link href="#process" onClick={() => setMobileMenuOpen(false)}>Process</Link>
                            <Link href="/tools" onClick={() => setMobileMenuOpen(false)}>Tools</Link>
                            <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                        </div>
                        <div className="mt-auto">
                            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="flex h-[54px] w-full bg-[#11110f] text-white rounded-full items-center justify-center gap-2 text-[12px] uppercase font-bold tracking-widest">
                                Start A Project
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HERO SECTION */}
            <section className="relative min-h-[100svh] pt-40 pb-24 overflow-hidden flex items-center">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 z-0" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)`, backgroundSize: '80px 80px', maskImage: 'linear-gradient(to bottom, black, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 90%)' }}></div>

                <div className="max-w-[1440px] mx-auto px-6 md:px-8 w-full flex flex-col lg:flex-row relative z-10 items-center">

                    {/* Left Content */}
                    <div className="w-full lg:w-[45%] pt-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <Reveal delay={0.1}>
                            <div className="font-mono text-[10px] text-[#77746c] uppercase tracking-widest flex items-center gap-2 mb-8">
                                <span className="w-2 h-2 rounded-full bg-[#c4ff38] shadow-[0_0_0_4px_rgba(196,255,56,0.14)]"></span>
                                GROTON AI STUDIO
                            </div>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <h1 className="text-[clamp(50px,8vw,140px)] font-bold leading-[0.85] tracking-[-0.08em] mb-10">
                                Product visuals<br />that make brands<br />
                                <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #11110f' }}>look better.</span>
                            </h1>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <p className="text-[15px] md:text-[16px] text-[#77746c] max-w-[420px] leading-[1.8] mb-10 ml-0 lg:ml-2">
                                Premium e-commerce imagery created for modern brands. We transform ordinary products into high-end commercial campaigns.
                            </p>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 ml-0 lg:ml-2">
                                <Link href="#work" className="h-[54px] px-7 bg-[#11110f] text-white rounded-full flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest shadow-[0_15px_35px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(0,0,0,0.23)] transition-all">
                                    View Our Work
                                    <span className="w-6 h-6 rounded-full bg-[#c4ff38] text-black flex items-center justify-center text-[14px]">↗</span>
                                </Link>
                                <Link href="#contact" className="h-[54px] px-7 bg-white/40 border border-black/10 rounded-full flex items-center text-[11px] uppercase tracking-widest font-bold hover:bg-white hover:-translate-y-1 transition-all">
                                    Start A Project
                                </Link>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right 3D Visual Composition */}
                    <motion.div
                        style={{ y: heroScrollY, opacity: heroOpacity, perspective: '1200px' }}
                        className="w-full lg:w-[55%] relative mt-24 lg:mt-0 min-h-[60vh] lg:min-h-[80vh]"
                    >
                        {/* Subtle Glow */}
                        <div className="absolute right-0 top-[10%] w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(255,255,255,0.15)_40%,transparent_70%)] blur-[40px] -z-10"></div>

                        {/* Main Image */}
                        <motion.div
                            initial={{ opacity: 0, rotateY: 0, rotateZ: 0 }}
                            animate={{ opacity: 1, rotateY: -3, rotateZ: 1 }}
                            transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ rotateY: -1, rotateX: 2, translateZ: 30, boxShadow: '0 35px 80px rgba(0,0,0,0.15)' }}
                            className="absolute right-[5%] lg:right-[8%] top-[15%] lg:top-[12%] w-[75%] lg:w-[58%] h-[70%] lg:h-[72%] rounded-[24px] lg:rounded-[45px] overflow-hidden bg-zinc-200 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-transform duration-700"
                            style={{ transformStyle: 'preserve-3d', x: mainImageX, y: mainImageY }}
                            data-cursor="view"
                        >
                            <Image src="/campaign-worlds/download (22).jpeg" alt="Activewear Model Campaign" fill className="object-cover transition-transform duration-1000 hover:scale-105" priority sizes="(max-width: 768px) 80vw, 50vw" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.25),transparent_35%)] pointer-events-none"></div>
                            <div className="absolute bottom-6 left-6 font-mono text-[9px] uppercase tracking-widest text-white bg-black/30 backdrop-blur-md px-3 py-2 rounded-full transition-transform duration-700" style={{ transform: 'translateZ(45px)' }}>
                                ACTIVEWEAR / CAMPAIGN
                            </div>
                        </motion.div>

                        {/* Supporting Image 01 (Top Left - Jacket) */}
                        <Reveal delay={0.8} className="absolute left-[0%] lg:left-[10%] top-[0%] lg:top-[5%] w-[130px] lg:w-[190px] h-[170px] lg:h-[260px] z-30">
                            <motion.div
                                className="w-full h-full rounded-[16px] lg:rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-white/50"
                                style={{ x: supp1X, y: supp1Y }}
                                animate={{ y: [0, -12, 0], rotate: [-2, 0, -2] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                                data-cursor="view"
                                whileHover={{ scale: 1.05, translateZ: 20 }}
                            >
                                <Image src="/campaign-worlds/Jacket_and_pants_fashion_display_2K_20260929162053.jpg" alt="Fashion Display" fill className="object-cover" sizes="250px" style={{ objectPosition: 'center 30%' }} />
                            </motion.div>
                        </Reveal>

                        {/* Supporting Image 02 (Top Right - White T-shirt) */}
                        <Reveal delay={1.1} className="hidden lg:block absolute right-[0%] lg:right-[0%] top-[5%] lg:top-[3%] w-[120px] lg:w-[160px] h-[160px] lg:h-[230px] z-30">
                            <motion.div
                                className="w-full h-full rounded-[16px] lg:rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-white/50"
                                style={{ x: supp4X, y: supp4Y }}
                                animate={{ y: [0, 8, 0], rotate: [3, 5, 3] }}
                                transition={{ duration: 9, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                                data-cursor="view"
                                whileHover={{ scale: 1.05, translateZ: 15 }}
                            >
                                <Image src="/campaign-worlds/Create_vertical_e-commerce_produ._2K_20260929162058.jpg" alt="White T-shirt" fill className="object-cover" sizes="250px" />
                            </motion.div>
                        </Reveal>

                        {/* Supporting Image 03 (Bottom Left - Sneakers) */}
                        <Reveal delay={0.9} className="absolute left-[-2%] lg:left-[5%] bottom-[10%] lg:bottom-[8%] w-[120px] lg:w-[170px] h-[150px] lg:h-[230px] z-30">
                            <motion.div
                                className="w-full h-full rounded-[16px] lg:rounded-[24px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] bg-white border border-white/50"
                                style={{ x: supp2X, y: supp2Y }}
                                animate={{ y: [0, -8, 0], x: [0, 4, 0], rotate: [3, 5, 3] }}
                                transition={{ duration: 8, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                                data-cursor="view"
                                whileHover={{ scale: 1.05, translateZ: 30 }}
                            >
                                <Image src="/campaign-worlds/Change_shoe_image_background_color_2K_20260929162637.jpg" alt="Sneakers" fill className="object-cover" sizes="250px" />
                            </motion.div>
                        </Reveal>

                        {/* Supporting Image 04 (Bottom Right - Sunglasses) */}
                        <Reveal delay={1.0} className="absolute right-[5%] lg:right-[3%] bottom-[12%] lg:bottom-[4%] w-[110px] lg:w-[160px] h-[140px] lg:h-[230px] z-30">
                            <motion.div
                                className="w-full h-full rounded-[16px] lg:rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-white/50"
                                style={{ x: supp3X, y: supp3Y }}
                                animate={{ y: [0, -10, 0], rotate: [-4, -2, -4] }}
                                transition={{ duration: 6.5, delay: 2, repeat: Infinity, ease: "easeInOut" }}
                                data-cursor="view"
                                whileHover={{ scale: 1.05, translateZ: 20 }}
                            >
                                <Image src="/campaign-worlds/Sunglasses_product_photography_2K_20260929162056.jpg" alt="Sunglasses" fill className="object-cover" sizes="250px" />
                            </motion.div>
                        </Reveal>

                    </motion.div>
                </div>
            </section>

            {/* MARQUEE */}
            <div className="bg-[#11110f] text-white py-5 overflow-hidden">
                <motion.div
                    className="flex w-max font-mono text-[10px] uppercase tracking-widest"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                >
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-12 whitespace-nowrap px-6">
                            <span>PRODUCT IMAGERY</span><span className="text-[#c4ff38] text-[15px]">✦</span>
                            <span>PRODUCT-ON-MODEL</span><span className="text-[#c4ff38] text-[15px]">✦</span>
                            <span>FASHION & APPAREL</span><span className="text-[#c4ff38] text-[15px]">✦</span>
                            <span>CAMPAIGN VISUALS</span><span className="text-[#c4ff38] text-[15px]">✦</span>
                            <span>EDITORIAL</span><span className="text-[#c4ff38] text-[15px]">✦</span>
                            <span>CATALOG IMAGERY</span><span className="text-[#c4ff38] text-[15px]">✦</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* INTRO */}
            <section className="py-24 md:py-36 px-6 md:px-8 max-w-[1440px] mx-auto">
                <Reveal>
                    <div className="font-mono text-[#77746c] text-[10px] uppercase tracking-widest mb-6">/ GROTON</div>
                </Reveal>
                <div className="grid md:grid-cols-12 gap-10 items-start">
                    <div className="md:col-span-8">
                        <Reveal delay={0.1}>
                            <h2 className="text-[clamp(42px,6vw,82px)] leading-[0.94] font-bold tracking-[-0.075em]">
                                E-commerce visuals,<br />
                                <span className="text-[#77746c]">elevated.</span>
                            </h2>
                        </Reveal>
                    </div>
                    <div className="md:col-span-4 mt-4 md:mt-0">
                        <Reveal delay={0.2}>
                            <p className="text-[14px] text-[#77746c] leading-[1.85]">
                                We specialize in creating premium product imagery for e-commerce brands. From clean catalog shots to highly art-directed campaign visuals, we ensure your products look their absolute best.
                            </p>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* SERVICES / CAPABILITIES */}
            <section className="pb-32 md:pb-48 px-6 md:px-8 max-w-[1440px] mx-auto" id="services">
                <Reveal>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black/10 pb-6 mb-8 md:mb-12">
                        <div>
                            <div className="font-mono text-[#77746c] text-[10px] uppercase tracking-widest mb-4">/ CAPABILITIES</div>
                            <h2 className="text-[clamp(50px,6.5vw,94px)] leading-[0.84] font-bold tracking-[-0.085em]">What we<br />create.</h2>
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-black font-bold mt-8 md:mt-0">04 SERVICES</div>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ perspective: '1200px' }}>
                    {[
                        { title: "Product\nImagery", cat: "PRODUCT", num: "01", img: "/campaign-worlds/LOGO DESIGN _ IDENTITY DESIGN _ ЛОГОТИП.jpeg", radius: "35px 8px 8px 8px", mt: "0px" },
                        { title: "Product\nOn-Model", cat: "MODEL", num: "02", img: "/campaign-worlds/groton-9.jpg", radius: "8px 35px 8px 8px", mt: "45px" },
                        { title: "Fashion &\nApparel", cat: "FASHION", num: "03", img: "/campaign-worlds/groton-1.jpg", radius: "8px 8px 35px 8px", mt: "90px" },
                        { title: "Editorial &\nCampaigns", cat: "EDITORIAL", num: "04", img: "/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg", radius: "8px 8px 8px 35px", mt: "135px" },
                    ].map((item, i) => (
                        <Reveal key={i} delay={i * 0.1} className={`lg:mt-[${item.mt}]`}>
                            <motion.article
                                whileHover={{ rotateY: -4, rotateX: 5, translateZ: 15, boxShadow: '0 25px 70px rgba(0,0,0,0.1)' }}
                                className="relative min-h-[400px] md:min-h-[470px] bg-zinc-200 overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-700"
                                style={{ borderRadius: item.radius, transformStyle: 'preserve-3d' }}
                            >
                                <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.65),transparent_60%)] pointer-events-none"></div>
                                <div className="absolute top-5 left-5 right-5 flex justify-between text-white font-mono text-[10px] tracking-widest font-bold z-10">
                                    <span>{item.num}</span><span>{item.cat}</span>
                                </div>
                                <h3 className="absolute bottom-6 left-6 text-white text-[28px] font-bold leading-[0.92] tracking-[-0.06em] whitespace-pre-line z-10 transition-transform duration-700 group-hover:translate-z-10" style={{ transform: 'translateZ(45px)' }}>
                                    {item.title}
                                </h3>
                            </motion.article>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* SELECTED WORK */}
            <section className="pb-32 md:pb-48 px-6 md:px-8 max-w-[1440px] mx-auto" id="work">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
                    <Reveal>
                        <div>
                            <div className="font-mono text-[#77746c] text-[10px] uppercase tracking-widest mb-4">/ SELECTED WORK</div>
                            <h2 className="text-[clamp(50px,6.5vw,94px)] leading-[0.84] font-bold tracking-[-0.085em]">A visual<br />collection.</h2>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="text-[14px] text-[#77746c] max-w-[380px] leading-[1.8] mt-6 md:mt-0">
                            Product, fashion, lifestyle and editorial imagery created through the GROTON visual production system.
                        </p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4" style={{ perspective: '1200px' }}>

                    <Reveal>
                        <motion.article
                            whileHover={{ rotateY: 2, rotateX: 2, translateZ: 10 }}
                            className="relative min-h-[500px] md:min-h-[650px] lg:min-h-[780px] bg-zinc-200 rounded-2xl overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-700"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <Image src="/campaign-worlds/download (22).jpeg" alt="Activewear" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.7),transparent_55%)] pointer-events-none"></div>
                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white z-10 transition-transform duration-700" style={{ transform: 'translateZ(30px)' }}>
                                <div>
                                    <div className="text-[24px] md:text-[31px] font-bold leading-[0.95] tracking-[-0.06em]">Activewear Campaign</div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest opacity-70 mt-2">PRODUCT-ON-MODEL / FASHION</div>
                                </div>
                                <div className="font-mono text-[9px] font-bold">01</div>
                            </div>
                        </motion.article>
                    </Reveal>

                    <div className="grid grid-cols-1 gap-4">
                        <Reveal delay={0.1}>
                            <motion.article
                                whileHover={{ rotateY: -2, rotateX: 2, translateZ: 10 }}
                                className="relative min-h-[400px] lg:min-h-[380px] bg-zinc-200 rounded-2xl overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.05)] lg:mt-[100px] transition-all duration-700"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <Image src="/campaign-worlds/How to style Cat Print T shirts.jpeg" alt="Fashion Story" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 40vw" />
                                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.7),transparent_55%)] pointer-events-none"></div>
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white z-10 transition-transform duration-700" style={{ transform: 'translateZ(30px)' }}>
                                    <div>
                                        <div className="text-[24px] md:text-[31px] font-bold leading-[0.95] tracking-[-0.06em]">Fashion Story</div>
                                        <div className="font-mono text-[9px] uppercase tracking-widest opacity-70 mt-2">APPAREL / EDITORIAL</div>
                                    </div>
                                    <div className="font-mono text-[9px] font-bold">02</div>
                                </div>
                            </motion.article>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <motion.article
                                whileHover={{ rotateY: -2, rotateX: 2, translateZ: 10 }}
                                className="relative min-h-[400px] lg:min-h-[380px] bg-zinc-200 rounded-2xl overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.05)] lg:mt-[-50px] transition-all duration-700"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <Image src="/campaign-worlds/Caffeine is culture ☕️.jpeg" alt="Editorial Campaign" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 40vw" />
                                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.7),transparent_55%)] pointer-events-none"></div>
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white z-10 transition-transform duration-700" style={{ transform: 'translateZ(30px)' }}>
                                    <div>
                                        <div className="text-[24px] md:text-[31px] font-bold leading-[0.95] tracking-[-0.06em]">Editorial Campaign</div>
                                        <div className="font-mono text-[9px] uppercase tracking-widest opacity-70 mt-2">MODEL / APPAREL</div>
                                    </div>
                                    <div className="font-mono text-[9px] font-bold">03</div>
                                </div>
                            </motion.article>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* PRODUCT ARCHIVE - HORIZONTAL SCROLL */}
            <section className="pb-32 md:pb-48 overflow-hidden" ref={archiveRef}>
                <div className="max-w-[1440px] mx-auto px-6 md:px-8 mb-8">
                    <Reveal>
                        <div className="font-mono text-[#77746c] text-[10px] uppercase tracking-widest">/ PRODUCT ARCHIVE</div>
                    </Reveal>
                </div>

                <motion.div style={{ x: archiveX }} className="flex gap-4 w-max pl-6 md:pl-8">
                    {[
                        { img: "/campaign-worlds/Change_shoe_image_background_color_2K_20260929162637.jpg", label: "SHOES", mt: "0px" },
                        { img: "/campaign-worlds/Create_vertical_e-commerce_produ…_2K_20260929162058.jpg", label: "APPAREL", mt: "40px" },
                        { img: "/campaign-worlds/Sunglasses_product_photography_2K_20260929162056.jpg", label: "EYEWEAR", mt: "0px" },
                        { img: "/campaign-worlds/Jacket_and_pants_fashion_display_2K_20260929162053.jpg", label: "FASHION", mt: "40px" },
                        { img: "/campaign-worlds/ghgh.jpeg", label: "PRODUCT", mt: "0px" }
                    ].map((item, i) => (
                        <motion.article
                            key={i}
                            whileHover={{ y: -8, rotate: -1 }}
                            className="relative w-[260px] sm:w-[310px] h-[360px] sm:h-[430px] rounded-[16px] overflow-hidden bg-zinc-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] group flex-shrink-0"
                            style={{ marginTop: item.mt }}
                        >
                            <Image src={item.img} alt={item.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="310px" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent_50%)] pointer-events-none"></div>
                            <div className="absolute bottom-5 left-5 text-white font-mono text-[10px] font-bold tracking-widest bg-black/30 backdrop-blur-md px-3 py-2 rounded-full z-10">
                                {item.label}
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </section>

            {/* PROCESS */}
            <section className="pb-32 md:pb-48 px-6 md:px-8 max-w-[1440px] mx-auto" id="process">
                <div className="grid md:grid-cols-[0.8fr_1.5fr] gap-12 mb-16">
                    <Reveal>
                        <div className="font-mono text-[#77746c] text-[10px] uppercase tracking-widest">/ THE PROCESS</div>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <h2 className="text-[clamp(45px,7vw,100px)] leading-[0.84] font-bold tracking-[-0.085em]">
                            From Product<br /><span className="text-[#77746c]">to Campaign.</span>
                        </h2>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-24">
                    <Reveal delay={0.2}>
                        <div className="relative min-h-[400px] md:min-h-[650px] rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.05)] group">
                            <Image src="/campaign-worlds/ghgh.jpeg" alt="Raw Product Asset" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale mix-blend-luminosity opacity-90" sizes="(max-width: 768px) 100vw, 50vw" />
                            <div className="absolute bottom-5 left-5 text-white font-mono text-[10px] font-bold tracking-widest bg-black/35 backdrop-blur-md px-3 py-2 rounded-full z-10">RAW PRODUCT ASSET</div>
                        </div>
                    </Reveal>
                    <Reveal delay={0.3}>
                        <div className="relative min-h-[400px] md:min-h-[650px] rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.05)] group">
                            <Image src="/campaign-worlds/1368386.jpg" alt="Final Campaign Visual" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                            <div className="absolute bottom-5 left-5 text-white font-mono text-[10px] font-bold tracking-widest bg-black/35 backdrop-blur-md px-3 py-2 rounded-full z-10">FINAL CAMPAIGN VISUAL</div>
                        </div>
                    </Reveal>
                </div>

                {/* Workflow Steps */}
                <div className="border-t border-black/10 pt-2">
                    {[
                        { num: "01", title: "Product", desc: "Provide your product or reference imagery." },
                        { num: "02", title: "Direction", desc: "We establish the visual direction and lighting." },
                        { num: "03", title: "Production", desc: "Products are developed into the required visual style." },
                        { num: "04", title: "Refinement", desc: "Composition, styling and details are meticulously polished." },
                        { num: "05", title: "Delivery", desc: "Final commercial-ready visuals are delivered." }
                    ].map((step, i) => (
                        <Reveal key={i} delay={i * 0.1}>
                            <div className="grid grid-cols-[45px_1fr] md:grid-cols-[80px_1fr_350px] gap-[15px] md:gap-[35px] py-8 md:py-10 border-b border-black/10 relative group cursor-default">
                                <div className="absolute left-0 bottom-[-1px] h-[1px] bg-[#11110f] w-0 transition-all duration-700 group-hover:w-full"></div>
                                <div className="font-mono text-[#77746c] font-bold mt-2">{step.num}</div>
                                <h3 className="text-[28px] md:text-[42px] leading-none font-bold tracking-[-0.065em] group-hover:translate-x-2 transition-transform duration-500">{step.title}</h3>
                                <p className="text-[13px] text-[#77746c] leading-[1.75] col-start-2 md:col-start-3 max-w-[280px] mt-2 md:mt-0">{step.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* MOTION (Dark Section) */}
            <section className="pb-32 md:pb-48 px-6 md:px-8 max-w-[1440px] mx-auto">
                <Reveal>
                    <div className="font-mono text-[#77746c] text-[10px] uppercase tracking-widest mb-6">/ MOTION</div>
                </Reveal>
                <Reveal delay={0.2}>
                    <div className="relative min-h-[500px] md:min-h-[700px] bg-[#11110f] rounded-[32px] overflow-hidden shadow-[0_50px_110px_rgba(0,0,0,0.12)]">
                        {/* Abstract Orb / Cinematic placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#333,#111_50%,#080808)]">
                            <motion.div
                                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="w-[200px] md:w-[260px] h-[200px] md:h-[260px] rounded-full bg-[radial-gradient(circle_at_28%_20%,#fff,#aaa_17%,#555_45%,#111_78%)] shadow-[inset_25px_25px_50px_rgba(255,255,255,0.5),inset_-35px_-40px_60px_rgba(0,0,0,0.7),0_60px_100px_rgba(0,0,0,0.6)]"
                            ></motion.div>
                        </div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),transparent_65%)]"></div>

                        <div className="absolute bottom-[30px] left-[25px] md:bottom-[50px] md:left-[50px] max-w-[720px] text-white z-10">
                            <div className="font-mono text-[10px] text-[#777] uppercase tracking-widest mb-4">/ VISUAL MOTION</div>
                            <h2 className="text-[clamp(55px,9vw,130px)] leading-[0.8] font-bold tracking-[-0.09em]">
                                Make it<br /><span className="text-[#777]">move.</span>
                            </h2>
                            <p className="text-[14px] text-[#aaa] max-w-[420px] leading-[1.8] mt-6">
                                Extend your product visuals into motion, social content and campaign experiences.
                            </p>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="absolute top-[25px] right-[25px] md:top-[35px] md:right-[35px] w-[50px] h-[50px] md:w-[64px] md:h-[64px] rounded-full bg-[#c4ff38] text-black flex items-center justify-center font-bold shadow-lg z-20 cursor-pointer"
                        >
                            ▶
                        </motion.div>
                    </div>
                </Reveal>
            </section>

            {/* E-COMMERCE */}
            <section className="pb-32 md:pb-48 px-6 md:px-8 max-w-[1440px] mx-auto">
                <Reveal>
                    <div className="relative min-h-[720px] md:min-h-[680px] bg-[#11110f] rounded-[32px] p-[40px_24px] md:p-[70px] text-white shadow-[0_50px_110px_rgba(0,0,0,0.12)] overflow-hidden">
                        <Image src="/campaign-worlds/mu_forart_.jpeg" alt="E-commerce Fashion" fill className="absolute right-0 bottom-0 md:top-0 w-full md:w-[52%] h-[55%] md:h-full object-cover opacity-60 mix-blend-screen" style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)', objectPosition: 'center 20%' }} sizes="(max-width: 768px) 100vw, 50vw" />

                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#111_40%,rgba(17,17,15,0.6)_70%,transparent)] md:bg-[linear-gradient(to_right,#111_35%,rgba(17,17,15,0.7)_55%,transparent)] pointer-events-none"></div>

                        <div className="relative z-10 max-w-[750px]">
                            <div className="font-mono text-[10px] text-[#777] uppercase tracking-widest mb-4">/ BUILT FOR</div>
                            <h2 className="text-[clamp(50px,8vw,120px)] leading-[0.82] font-bold tracking-[-0.09em]">
                                Built for<br /><span className="text-[#777]">E-commerce.</span>
                            </h2>
                            <p className="text-[14px] text-[#aaa] max-w-[430px] leading-[1.8] mt-8">
                                A visual production system designed around consistency, premium presentation, scalability and flexible creative direction.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[28px] max-w-[620px] mt-[45px] md:mt-[55px]">
                                {[
                                    { title: "Consistent Presentation", desc: "Maintain a unified visual language across your entire catalog." },
                                    { title: "Premium Aesthetic", desc: "Elevate your product perception with stronger visual presentation." },
                                    { title: "Scalable Production", desc: "Scale from a single collection to large product inventories." },
                                    { title: "Flexible Directions", desc: "Move from clean catalog shots to editorial campaigns." }
                                ].map((pt, i) => (
                                    <div key={i} className="pt-4 border-t border-white/15">
                                        <h4 className="text-[14px] font-bold mb-2">{pt.title}</h4>
                                        <p className="text-[11px] text-[#85837e] leading-[1.6]">{pt.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* FINAL HUGE TEXT */}
            <section className="py-20 md:py-32 overflow-hidden" ref={finalRef}>
                <motion.div style={{ x: finalX }} className="flex gap-[25px] w-max font-bold text-[clamp(80px,15vw,220px)] leading-[0.78] tracking-[-0.095em] pl-6 md:pl-8">
                    <span className="whitespace-nowrap">PRODUCT.</span>
                    <span className="whitespace-nowrap text-transparent" style={{ WebkitTextStroke: '2px #222' }}>CAMPAIGN.</span>
                    <span className="whitespace-nowrap">BETTER.</span>
                </motion.div>
            </section>

            {/* FOOTER */}
            <footer className="bg-[#11110f] text-white rounded-[28px_28px_0_0] md:rounded-[45px_45px_0_0] pt-20 md:pt-24 pb-8 mt-10" id="contact">
                <div className="max-w-[1440px] mx-auto px-6 md:px-8">
                    <div className="flex flex-col md:flex-row justify-between gap-16 md:gap-[70px]">
                        <Reveal>
                            <h2 className="text-[clamp(50px,9vw,135px)] leading-[0.8] font-bold tracking-[-0.09em]">
                                Make your<br /><span className="text-[#777]">products</span><br />look better.
                            </h2>
                            <div className="mt-8 md:mt-12">
                                <Link href="#contact" className="inline-flex h-[60px] px-8 bg-[#c4ff38] text-black rounded-full items-center gap-3 text-[12px] uppercase font-bold tracking-widest hover:bg-white hover:scale-105 transition-all duration-300">
                                    Start A Project →
                                </Link>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="flex flex-col gap-[14px] min-w-[180px]">
                                <div className="font-mono text-[10px] text-[#666] uppercase tracking-widest mb-2 font-bold">GROTON AI STUDIO</div>
                                <a href="mailto:hello@groton.in" className="text-[13px] text-[#aaa] font-mono hover:text-white hover:translate-x-2 transition-all">hello@groton.in</a>
                                <Link href="#work" className="text-[13px] text-[#aaa] hover:text-white hover:translate-x-2 transition-all mt-4">Work ↗</Link>
                                <Link href="#services" className="text-[13px] text-[#aaa] hover:text-white hover:translate-x-2 transition-all">Capabilities ↗</Link>
                                <Link href="#process" className="text-[13px] text-[#aaa] hover:text-white hover:translate-x-2 transition-all">Process ↗</Link>
                                <Link href="/tools" className="text-[13px] text-[#aaa] hover:text-white hover:translate-x-2 transition-all">Tools ↗</Link>
                            </div>
                        </Reveal>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between text-[#666] mt-24 md:mt-32 pt-6 border-t border-white/10 gap-4 md:gap-0 font-mono text-[9px] font-bold tracking-widest uppercase">
                        <span>GROTON AI STUDIO</span>
                        <span>AI IMAGE PRODUCTION</span>
                        <span>© 2026 GROTON</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
