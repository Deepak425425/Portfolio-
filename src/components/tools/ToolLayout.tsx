"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ToolLayout({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-white border-b border-zinc-200">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          GROTON AI STUDIO
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/services" className="hover:text-black transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/tools" className="text-black transition-colors">Tools</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col items-center pt-16 pb-24 px-6 md:px-12 lg:px-24 bg-zinc-50">
        <div className="w-full max-w-[1400px]">
          <div className="mb-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-zinc-400 hover:text-black transition-colors text-xs font-bold tracking-[0.2em] uppercase mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tools
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-black mb-4">{title}</h1>
            <p className="font-sans font-light text-zinc-500 text-sm md:text-base max-w-lg">
              {description}
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
