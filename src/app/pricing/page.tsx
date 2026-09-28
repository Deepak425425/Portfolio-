import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — GROTON AI STUDIO",
  description: "Transparent, project-based pricing for premium AI visual production.",
};

export default function PricingPage() {
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
            <Link href="/pricing" className="text-black transition-colors">Pricing</Link>
            <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* PRICING CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1200px] w-full">
          <div className="text-center mb-16 md:mb-24">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-8">Transparent Engagement.</h1>
            <p className="text-base text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed">
              We operate on clear, project-based tiers depending on the complexity of creative direction, required variations, and the volume of visual deliverables.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="border border-zinc-200 p-10 md:p-12 flex flex-col gap-6 hover:shadow-2xl transition-shadow bg-white h-full">
               <h3 className="font-sans font-bold tracking-tight text-xl md:text-2xl uppercase">Product Collection</h3>
               <div className="text-3xl md:text-4xl font-serif text-zinc-400 pb-6 border-b border-zinc-100">₹2.5L – ₹5L</div>
               <p className="text-sm text-zinc-500 font-light flex-1 leading-relaxed">
                 Ideal for foundational e-commerce imagery, social content batches, and lookbooks requiring strong art direction without massive campaign complexity.
               </p>
             </div>
             
             <div className="border border-black p-10 md:p-12 flex flex-col gap-6 shadow-2xl bg-black text-white transform lg:-translate-y-4 h-full relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[9px] uppercase tracking-widest font-bold px-4 py-1">
                 Recommended
               </div>
               <h3 className="font-sans font-bold tracking-tight text-xl md:text-2xl uppercase">Premium Campaign</h3>
               <div className="text-3xl md:text-4xl font-serif text-zinc-300 pb-6 border-b border-zinc-800">₹5L – ₹12L</div>
               <p className="text-sm text-zinc-400 font-light flex-1 leading-relaxed">
                 Comprehensive campaign production including hero visual compositing, short-form commercial reels, and extensive ad creatives for multi-channel distribution.
               </p>
             </div>

             <div className="border border-zinc-200 p-10 md:p-12 flex flex-col gap-6 hover:shadow-2xl transition-shadow bg-white h-full">
               <h3 className="font-sans font-bold tracking-tight text-xl md:text-2xl uppercase">Enterprise</h3>
               <div className="text-3xl md:text-4xl font-serif text-zinc-400 pb-6 border-b border-zinc-100">Custom</div>
               <p className="text-sm text-zinc-500 font-light flex-1 leading-relaxed">
                 Bespoke visual pipelines, ongoing retainer production, massive volume generation, and highly complex commercial film or 3D integration projects.
               </p>
             </div>
          </div>
          
          <div className="mt-24 text-center">
            <Link href="/contact" className="inline-block px-12 py-6 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors">
              Tell us about your project
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">GROTON AI STUDIO</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors">About</Link>
              <Link href="/services" className="hover:text-black transition-colors">Services</Link>
              <Link href="/work" className="hover:text-black transition-colors">Work</Link>
              <Link href="/pricing" className="text-black transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              &copy; 2026 GROTON AI STUDIO
            </p>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              A creative venture by <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-black transition-colors">Grafly Studio</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
