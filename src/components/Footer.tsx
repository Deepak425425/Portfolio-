import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border-color mt-auto">
      <div className="max-w-[1600px] mx-auto p-8 md:p-16 flex flex-col gap-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-foreground">GROTON AI</h3>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 md:gap-x-8 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">
            <Link href="/about" className="hover:text-foreground transition-colors py-2 md:py-0">About</Link>
            <Link href="/services" className="hover:text-foreground transition-colors py-2 md:py-0">Services</Link>
            <Link href="/work" className="hover:text-foreground transition-colors py-2 md:py-0">Work</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors py-2 md:py-0">Pricing</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors py-2 md:py-0">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors py-2 md:py-0">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors py-2 md:py-0">Terms & Conditions</Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-border-color/50">
          <p className="text-[10px] text-sec-text tracking-[0.2em] uppercase font-bold">
            &copy; 2026 GROTON AI
          </p>
          <p className="text-[10px] text-sec-text tracking-[0.2em] uppercase font-bold">
            A creative venture by <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Grafly Studio</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
