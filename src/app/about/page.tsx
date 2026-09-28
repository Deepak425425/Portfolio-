import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — GROTON AI STUDIO",
  description: "A modern visual production studio merging art direction with AI generation.",
};

export default function AboutPage() {
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
            <Link href="/about" className="text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* ABOUT CONTENT */}
      <main className="flex-1 w-full bg-white">
        <section className="py-24 md:py-32 lg:py-48 px-6 md:px-12 lg:px-24 text-center">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-12 max-w-4xl mx-auto leading-tight">
            Art direction meets <br/>algorithmic scale.
          </h1>
          <p className="font-sans text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-light">
            GROTON is a premium visual production studio designed for modern brands. We engineer hyper-realistic, campaign-ready visual assets that blur the line between traditional photography and artificial intelligence.
          </p>
        </section>

        <section className="w-full h-[60vh] md:h-[80vh] relative">
          <Image src="/campaign-worlds/d9e1c8fd5191c143b2ad5e29c1a15f37.jpg" alt="GROTON AI STUDIO aesthetic" fill className="object-cover object-center" />
        </section>

        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-50 border-b border-zinc-200">
          <div className="max-w-4xl mx-auto flex flex-col gap-16 md:gap-24">
            
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
              <div className="w-full md:w-1/3">
                <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">The Problem</h3>
              </div>
              <div className="w-full md:w-2/3">
                <h2 className="font-serif text-3xl md:text-4xl mb-6">Traditional production is too slow. AI is too generic.</h2>
                <p className="text-sm text-zinc-500 font-light leading-relaxed mb-4">
                  Modern brands require a massive volume of visual content—from e-commerce hero shots to social media campaigns and display advertising. Traditional physical photoshoots involve heavy logistics, locations, permits, and rigid timelines. 
                </p>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">
                  Conversely, standard AI generation often produces generic, unpredictable, or off-brand results that fail to meet premium brand standards.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
              <div className="w-full md:w-1/3">
                <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Our Approach</h3>
              </div>
              <div className="w-full md:w-2/3">
                <h2 className="font-serif text-3xl md:text-4xl mb-6">Directed Generation.</h2>
                <p className="text-sm text-zinc-500 font-light leading-relaxed mb-4">
                  We solve this by placing experienced creative directors at the helm of advanced AI synthesis. We don&apos;t just type prompts; we establish visual systems. We define the lighting logic, the color theory, the material textures, and the compositional hierarchy.
                </p>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">
                  This hybrid approach allows us to deliver production-grade realism and brand consistency at a scale and speed that traditional studios cannot match.
                </p>
              </div>
            </div>

          </div>
        </section>

        <section className="py-24 md:py-32 px-6 text-center bg-black text-white">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-8 max-w-2xl mx-auto leading-tight">
            Elevate your visual language.
          </h2>
          <Link href="/contact" className="inline-block px-10 py-5 bg-white text-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-200 transition-colors mt-8">
            Start A Project
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">GROTON AI STUDIO</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="text-black transition-colors">About</Link>
              <Link href="/services" className="hover:text-black transition-colors">Services</Link>
              <Link href="/work" className="hover:text-black transition-colors">Work</Link>
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
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
