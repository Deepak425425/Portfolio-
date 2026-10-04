"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import CmsText from "@/components/CmsText";
import MagneticButton from "@/components/MagneticButton";

interface HeaderProps {
  isNightMode?: boolean;
}

export default function Header({ isNightMode = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const activeColor = isNightMode ? 'text-white' : 'text-black';
  const hoverColor = isNightMode ? 'hover:text-white' : 'hover:text-black';
  const inactiveColor = isNightMode ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <>
      <motion.header 
        className="fixed z-50 flex flex-row justify-between items-center transition-all duration-300"
        style={{
          top: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(1400px, calc(100% - 36px))",
          height: "64px",
          padding: "0 10px 0 22px",
          background: isNightMode ? "rgba(20, 20, 20, 0.72)" : "rgba(248, 246, 241, 0.72)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          border: isNightMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(255, 255, 255, 0.7)",
          borderRadius: "100px",
          boxShadow: isNightMode ? "0 12px 35px rgba(0, 0, 0, 0.3), inset 0 1px rgba(255, 255, 255, 0.05)" : "0 12px 35px rgba(0, 0, 0, 0.07), inset 0 1px rgba(255, 255, 255, 0.9)"
        }}
      >
        <Link href="/" className={`font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase ${isNightMode ? 'text-white' : 'text-black'}`}>
          <CmsText cmsId="global.nav.brand" fallback="GROTON AI STUDIO" />
        </Link>
        <div className="flex items-center gap-4 lg:gap-8 h-full">
          <nav className={`hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase ${inactiveColor}`}>
            <Link href="/work" className={`transition-colors ${pathname === '/work' ? activeColor : hoverColor}`}><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
            <Link href="/services" className={`transition-colors ${pathname === '/services' ? activeColor : hoverColor}`}><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
            <Link href="/pricing" className={`transition-colors ${pathname === '/pricing' ? activeColor : hoverColor}`}><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
            <Link href="/tools" className={`transition-colors ${pathname?.startsWith('/tools') ? activeColor : hoverColor}`}><CmsText cmsId="global.nav.tools" fallback="Tools" /></Link>
            <Link href="/about" className={`transition-colors ${pathname === '/about' ? activeColor : hoverColor}`}><CmsText cmsId="global.nav.about" fallback="About" /></Link>
          </nav>
          <MagneticButton href="/contact" className={`hidden lg:flex h-[44px] items-center justify-center rounded-full px-6 text-[10px] uppercase tracking-widest font-bold transition-colors ${isNightMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
            <CmsText cmsId="global.nav.contact" fallback="Contact" />
          </MagneticButton>
          
          <button 
            className={`lg:hidden flex items-center justify-center w-[44px] h-[44px] rounded-full focus:outline-none z-50 transition-colors ${isNightMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}
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

      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-40 flex flex-col pt-24 px-6 pb-6 lg:hidden overflow-y-auto ${isNightMode ? 'bg-[#111]' : 'bg-white'}`}>
           <nav className="flex flex-col gap-6 text-lg font-bold tracking-[0.2em] uppercase text-zinc-500 mt-8">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`transition-colors ${pathname === '/' ? activeColor : hoverColor}`}>Home</Link>
              <Link href="/work" onClick={() => setMobileMenuOpen(false)} className={`transition-colors ${pathname === '/work' ? activeColor : hoverColor}`}>Work</Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className={`transition-colors ${pathname === '/services' ? activeColor : hoverColor}`}>Services</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`transition-colors ${pathname === '/pricing' ? activeColor : hoverColor}`}>Pricing</Link>
              <Link href="/tools" onClick={() => setMobileMenuOpen(false)} className={`transition-colors ${pathname?.startsWith('/tools') ? activeColor : hoverColor}`}>Tools</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={`transition-colors ${pathname === '/about' ? activeColor : hoverColor}`}>About</Link>
           </nav>
           <div className="mt-auto pt-12">
             <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className={`block w-full text-center px-5 py-4 text-xs uppercase tracking-widest font-bold transition-colors ${isNightMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
               Contact Us
             </Link>
           </div>
        </div>
      )}
    </>
  );
}