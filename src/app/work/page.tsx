"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const portfolioItems = [
  { id: 1, title: "Automotive Concept", category: "Campaign", image: "/campaign-worlds/8ba03716f09635d4a54c4dfbd7ca2687.jpg", aspect: "aspect-[4/3]" },
  { id: 2, title: "Modern Elegance", category: "Fashion", image: "/campaign-worlds/24f5f63a08c1fa2434bdb5edfe06e4bb.jpg", aspect: "aspect-[3/4]" },
  { id: 3, title: "Precision Craft", category: "Jewellery", image: "/campaign-worlds/c85eebec43abf0ea972f6a8fcd15371d.jpg", aspect: "aspect-[4/5]" },
  { id: 4, title: "Skin Deep", category: "Beauty", image: "/campaign-worlds/f8bc3ba5d07efbee4c99ce1f6c028602.jpg", aspect: "aspect-square" },
  { id: 5, title: "Volume Study", category: "Product", image: "/campaign-worlds/5548c29a92a965abad9325b905a07cdd.jpg", aspect: "aspect-[16/9]" },
  { id: 6, title: "Cinematic Atmosphere", category: "Lifestyle", image: "/campaign-worlds/96162aabb92e6fedb4c4918e9b746219.jpg", aspect: "aspect-[3/4]" },
];

const categories = ["All", "Jewellery", "Fashion", "Beauty", "Lifestyle", "Product", "Campaign"];

export default function WorkPage() {
  const [filter, setFilter] = useState("All");

  const filteredItems = filter === "All" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === filter);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-white border-b border-zinc-200">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          GROTON AI STUDIO
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="text-black transition-colors">Work</Link>
            <Link href="/services" className="hover:text-black transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* PORTFOLIO CONTENT */}
      <main className="flex-1 w-full flex flex-col">
        <section className="pt-24 md:pt-32 pb-12 px-6 md:px-12 lg:px-24 text-center bg-zinc-50">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-12">Selected Work.</h1>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-3xl mx-auto">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`text-[10px] tracking-[0.2em] uppercase font-bold transition-colors pb-1 border-b-2 ${filter === cat ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-24 px-6 md:px-12 lg:px-24 flex-1">
          <div className="max-w-[1400px] mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredItems.map(item => (
              <div key={item.id} className="break-inside-avoid flex flex-col gap-4 group cursor-pointer mb-8">
                <div className={`w-full ${item.aspect} bg-zinc-200 relative overflow-hidden`}>
                  <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10"></div>
                </div>
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-serif text-lg md:text-xl">{item.title}</h3>
                  <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-32 text-zinc-400 font-light text-sm">
              No projects found in this category yet.
            </div>
          )}
        </section>

        <section className="py-24 md:py-32 px-6 text-center border-t border-zinc-200 bg-white">
          <h2 className="font-serif text-3xl md:text-4xl mb-8">Ready to create something new?</h2>
          <Link href="/contact" className="inline-block px-10 py-5 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors">
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
              <Link href="/about" className="hover:text-black transition-colors">About</Link>
              <Link href="/services" className="hover:text-black transition-colors">Services</Link>
              <Link href="/work" className="text-black transition-colors">Work</Link>
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
