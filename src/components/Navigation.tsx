"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-50 bg-background border-b border-border-color relative">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-foreground z-50 relative">
          GROTON AI
        </Link>
        <div className="flex items-center gap-4 lg:gap-8 z-50 relative">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-sec-text">
            <Link href="/work" className={`hover:text-foreground transition-colors ${pathname === '/work' ? 'text-foreground' : ''}`}>Work</Link>
            <Link href="/services" className={`hover:text-foreground transition-colors ${pathname === '/services' ? 'text-foreground' : ''}`}>Services</Link>
            <Link href="/pricing" className={`hover:text-foreground transition-colors ${pathname === '/pricing' ? 'text-foreground' : ''}`}>Pricing</Link>
            <Link href="/tools" className={`hover:text-foreground transition-colors ${pathname?.startsWith('/tools') ? 'text-foreground' : ''}`}>Tools</Link>
            <Link href="/blog" className={`hover:text-foreground transition-colors ${pathname?.startsWith('/blog') ? 'text-foreground' : ''}`}>Insights</Link>
            <Link href="/about" className={`hover:text-foreground transition-colors ${pathname === '/about' ? 'text-foreground' : ''}`}>About</Link>
          </nav>
          
          <Link href="/contact" className="hidden lg:flex px-5 py-3 bg-accent text-white text-[10px] uppercase tracking-widest font-bold hover:bg-accent-dark transition-colors">
            Contact
          </Link>

          {/* Hamburger Toggle */}
          <button 
            className="lg:hidden p-2 text-foreground focus:outline-none"
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
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col pt-24 px-6 pb-6 lg:hidden overflow-y-auto">
           <nav className="flex flex-col gap-6 text-lg font-bold tracking-[0.2em] uppercase text-sec-text mt-8">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`hover:text-foreground transition-colors ${pathname === '/' ? 'text-foreground' : ''}`}>Home</Link>
              <Link href="/work" onClick={() => setMobileMenuOpen(false)} className={`hover:text-foreground transition-colors ${pathname === '/work' ? 'text-foreground' : ''}`}>Work</Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className={`hover:text-foreground transition-colors ${pathname === '/services' ? 'text-foreground' : ''}`}>Services</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`hover:text-foreground transition-colors ${pathname === '/pricing' ? 'text-foreground' : ''}`}>Pricing</Link>
              <Link href="/tools" onClick={() => setMobileMenuOpen(false)} className={`hover:text-foreground transition-colors ${pathname?.startsWith('/tools') ? 'text-foreground' : ''}`}>Tools</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className={`hover:text-foreground transition-colors ${pathname?.startsWith('/blog') ? 'text-foreground' : ''}`}>Insights</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={`hover:text-foreground transition-colors ${pathname === '/about' ? 'text-foreground' : ''}`}>About</Link>
           </nav>
           <div className="mt-auto pt-12">
             <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-5 py-4 bg-accent text-white text-xs uppercase tracking-widest font-bold hover:bg-accent-dark transition-colors">
               Contact Us
             </Link>
           </div>
        </div>
      )}
    </>
  );
}
