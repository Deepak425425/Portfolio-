"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import CmsImage from "@/components/CmsImage";
import CmsText from "@/components/CmsText";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative bg-[#F9F8F6] overflow-x-hidden flex flex-col font-sans text-black selection:bg-black selection:text-white min-h-[100svh]">
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
            <Link href="/work" className="text-black transition-colors"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
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
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Home</Link>
              <Link href="/work" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors text-black">Work</Link>
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

      {/* PORTFOLIO HERO */}
      <section className="relative w-full pt-[160px] pb-[40px] md:pt-[200px] md:pb-[80px] bg-[#F9F8F6] z-10 px-6 md:px-12 lg:px-20 text-center">
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
        <div className="max-w-[800px] mx-auto flex flex-col items-center">
          <CmsText cmsId="work.hero.heading" as="h1" className="font-sans text-[50px] md:text-[80px] lg:text-[100px] leading-[0.9] tracking-[-0.05em] text-black font-bold mb-6" fallback="Selected Work." />
          <CmsText cmsId="work.hero.label" as="span" className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#8B7CFF] pb-1 border-b-2 border-[#8B7CFF]" fallback="CLIENT WORK" />
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section className="relative w-full z-10 bg-[#F9F8F6] pb-[150px] px-6 lg:px-20">
        <div className="max-w-[1440px] mx-auto columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
          {portfolioItems.map((item, idx) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : (idx % 3) * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="break-inside-avoid flex flex-col gap-6 group cursor-pointer"
            >
              <div className="w-full bg-white rounded-[24px] p-2 lg:p-3 shadow-[0_18px_40px_rgba(0,0,0,0.10)] group-hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] transition-shadow duration-500">
                <div className={`w-full relative overflow-hidden rounded-[16px] bg-[#f2f2f2] isolate ${item.aspect}`}>
                  <CmsImage cmsId={item.cmsId} fallbackSrc={item.image} alt={item.title} fill className={`object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 mix-blend-darken ${item.position || ''}`} />
                </div>
              </div>
              
              <div className="flex flex-col px-2">
                <CmsText cmsId={`work.p${item.id}.cat`} as="span" className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#8B7CFF] mb-2" fallback={item.category} />
                <CmsText cmsId={`work.p${item.id}.title`} as="h3" className="font-sans font-bold text-[24px] tracking-[-0.03em] text-black" fallback={item.title} />
              </div>
            </motion.div>
          ))}
        </div>
        
        {portfolioItems.length === 0 && (
          <CmsText cmsId="work.empty" as="div" className="text-center py-32 text-zinc-400 font-sans font-medium text-sm" fallback="No projects found in this category yet." />
        )}
      </section>

      {/* CTA SECTION */}
      <section className="relative w-full z-10 bg-white py-[150px] px-6 lg:px-20 text-center border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[800px] mx-auto flex flex-col items-center">
          <CmsText cmsId="work.cta.heading" as="h2" className="font-sans text-[42px] md:text-[60px] lg:text-[80px] leading-[0.9] tracking-[-0.05em] text-black font-bold mb-12" fallback="Ready to create something new?" />
          <MagneticButton href="/contact" className="inline-flex h-[56px] items-center justify-center rounded-full px-10 bg-black text-white text-[11px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_18px_32px_rgba(0,0,0,0.2)]">
            <CmsText cmsId="work.cta.btn" fallback="Start A Project" />
          </MagneticButton>
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
              <Link href="/work" className="text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
              <Link href="/blog" className="hover:text-black transition-colors py-1 md:py-0">Blog</Link>
              <Link href="/team" className="hover:text-black transition-colors py-1 md:py-0">Team</Link>
              <Link href="/tools" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.tools" fallback="Tools" /></Link>
              <Link href="/pricing" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
              <Link href="/contact" className="hover:text-black transition-colors py-1 md:py-0"><CmsText cmsId="global.nav.contact" fallback="Contact" /></Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors py-1 md:py-0">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors py-1 md:py-0">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-[rgba(0,0,0,0.05)]">
            <CmsText cmsId="global.footer.copyright" as="p" className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold" fallback="© 2026 GROTON AI STUDIO" />
            <div className="flex items-center gap-6">
              <a href="https://www.instagram.com/d99p4k/" target="_blank" rel="noopener noreferrer" className="text-inherit opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
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
