import React from "react";
import Link from "next/link";

export default function Navigation() {
  return (
    <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-background border-b border-border-color">
      <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-foreground">
        GROTON AI
      </Link>
      <div className="flex items-center gap-8">
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-sec-text">
          <Link href="/work" className="hover:text-foreground transition-colors">Work</Link>
          <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/tools" className="text-foreground transition-colors">Tools</Link>
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
        </nav>
        <Link href="/contact" className="px-5 py-3 bg-accent text-white text-[10px] uppercase tracking-widest font-bold hover:bg-accent-dark transition-colors">
          Contact
        </Link>
      </div>
    </header>
  );
}
