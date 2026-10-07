"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import CmsImage from "@/components/CmsImage";
import CmsText from "@/components/CmsText";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const portfolioItems = [
  { id: 1, title: "Streetwear Comfort", category: "Fashion", image: "/campaign-worlds/GROTON-work-selected-streetwear-742x556.webp", cmsId: "work_1", aspect: "aspect-[4/3]", position: "" },
  { id: 2, title: "Sherpa Outerwear", category: "Fashion", image: "/campaign-worlds/GROTON-work-selected-sherpa-outerwear-742x990.webp", cmsId: "work_2", aspect: "aspect-[3/4]", position: "" },
  { id: 3, title: "Modern Elegance", category: "Fashion", image: "/campaign-worlds/GROTON-work-selected-modern-elegance-742x928.webp", cmsId: "work_3", aspect: "aspect-[4/5]", position: "" },
  { id: 4, title: "High-Angle Editorial", category: "Editorial", image: "/campaign-worlds/GROTON-work-selected-high-angle-editorial-742x742.webp", cmsId: "work_4", aspect: "aspect-square", position: "" },
  { id: 5, title: "Cat Print Styling", category: "Fashion", image: "/campaign-worlds/GROTON-work-selected-cat-print-742x418.webp", cmsId: "work_5", aspect: "aspect-[16/9]", position: "" },
  { id: 6, title: "Editorial Lifestyle", category: "Fashion", image: "/campaign-worlds/GROTON-work-selected-editorial-lifestyle-742x990.webp", cmsId: "work_6", aspect: "aspect-[3/4]", position: "" },
];

export default function WorkPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative bg-[#F9F8F6] overflow-x-hidden flex flex-col font-sans text-black selection:bg-black selection:text-white min-h-[100svh]">
      {/* NAVIGATION */}
      <Header />

      {/* PORTFOLIO HERO */}
      <section className="relative w-full pt-32 sm:pt-40 md:pt-48 lg:pt-[190px] pb-8 sm:pb-12 md:pb-16 bg-[#F9F8F6] z-10 px-6 md:px-12 lg:px-20 text-center">
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
        <div className="max-w-[800px] xl:max-w-[900px] mx-auto flex flex-col items-center">
          <CmsText cmsId="work.hero.heading" as="h1" className="font-sans text-4xl sm:text-6xl md:text-[76px] lg:text-[96px] 2xl:text-[104px] leading-[0.92] tracking-[-0.05em] text-black font-bold mb-4 sm:mb-6" fallback="Selected Work." />
          <CmsText cmsId="work.hero.label" as="span" className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold text-[#8B7CFF] pb-1 border-b-2 border-[#8B7CFF]" fallback="CLIENT WORK" />
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section className="relative w-full z-10 bg-[#F9F8F6] pb-20 sm:pb-28 md:pb-36 2xl:pb-[150px] px-6 md:px-12 lg:px-16 xl:px-20">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto columns-1 sm:columns-2 lg:columns-3 gap-8 md:gap-10 lg:gap-12 space-y-8 md:space-y-10 lg:space-y-12">
          {portfolioItems.map((item, idx) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : (idx % 3) * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="break-inside-avoid flex flex-col gap-5 sm:gap-6 group cursor-pointer"
            >
              <div className="w-full bg-white rounded-[20px] sm:rounded-[24px] p-2 lg:p-3 shadow-[0_18px_40px_rgba(0,0,0,0.10)] group-hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] transition-shadow duration-500">
                <div className={`w-full relative overflow-hidden rounded-[14px] sm:rounded-[16px] bg-[#f2f2f2] isolate ${item.aspect}`}>
                  <CmsImage cmsId={item.cmsId} fallbackSrc={item.image} alt={item.title} fill className={`object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 mix-blend-darken ${item.position || ''}`} />
                </div>
              </div>
              
              <div className="flex flex-col px-2">
                <CmsText cmsId={`work.p${item.id}.cat`} as="span" className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#8B7CFF] mb-1.5 sm:mb-2" fallback={item.category} />
                <CmsText cmsId={`work.p${item.id}.title`} as="h3" className="font-sans font-bold text-xl sm:text-2xl 2xl:text-[26px] tracking-[-0.03em] text-black" fallback={item.title} />
              </div>
            </motion.div>
          ))}
        </div>
        
        {portfolioItems.length === 0 && (
          <CmsText cmsId="work.empty" as="div" className="text-center py-32 text-zinc-400 font-sans font-medium text-sm" fallback="No projects found in this category yet." />
        )}
      </section>

      {/* CTA SECTION */}
      <section className="relative w-full z-10 bg-white py-16 sm:py-20 md:py-28 lg:py-36 2xl:py-[150px] px-6 md:px-12 lg:px-20 text-center border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[800px] xl:max-w-[900px] mx-auto flex flex-col items-center">
          <CmsText cmsId="work.cta.heading" as="h2" className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-[80px] leading-[0.95] tracking-[-0.05em] text-black font-bold mb-8 sm:mb-12" fallback="Ready to create something new?" />
          <MagneticButton href="/contact" className="inline-flex h-[52px] sm:h-[56px] items-center justify-center rounded-full px-8 sm:px-10 bg-black text-white text-[10px] sm:text-[11px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_18px_32px_rgba(0,0,0,0.2)]">
            <CmsText cmsId="work.cta.btn" fallback="Start A Project" />
          </MagneticButton>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
