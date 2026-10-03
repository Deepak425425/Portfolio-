"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CmsImage from "@/components/CmsImage";
import CmsText from "@/components/CmsText";

const portfolioItems = [
  { id: 1, title: "Streetwear Comfort", category: "Fashion", image: "/campaign-worlds/download (27).jpeg", cmsId: "work_1", aspect: "aspect-[4/3]", position: "object-[center_20%]" },
  { id: 2, title: "Sherpa Outerwear", category: "Fashion", image: "/campaign-worlds/Caffeine is culture ☕️.jpeg", cmsId: "work_2", aspect: "aspect-[3/4]", position: "" },
  { id: 3, title: "Modern Elegance", category: "Fashion", image: "/campaign-worlds/groton-3.jpg", cmsId: "work_3", aspect: "aspect-[4/5]", position: "" },
  { id: 4, title: "High-Angle Editorial", category: "Editorial", image: "/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg", cmsId: "work_4", aspect: "aspect-square", position: "" },
  { id: 5, title: "Cat Print Styling", category: "Fashion", image: "/campaign-worlds/How to style Cat Print T shirts.jpeg", cmsId: "work_5", aspect: "aspect-[16/9]", position: "object-[center_20%]" },
  { id: 6, title: "Editorial Lifestyle", category: "Fashion", image: "/campaign-worlds/mu_forart_.jpeg", cmsId: "work_6", aspect: "aspect-[3/4]", position: "" },
];

export default function WorkPage() {

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-white border-b border-zinc-200">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          <CmsText cmsId="global.nav.brand" fallback="GROTON AI STUDIO" />
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="text-black transition-colors"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
            <Link href="/services" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
            <Link href="/pricing" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
            <Link href="/tools" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.tools" fallback="Tools" /></Link>
            <Link href="/about" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.about" fallback="About" /></Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            <CmsText cmsId="global.nav.contact" fallback="Contact" />
          </Link>
        </div>
      </header>

      {/* PORTFOLIO CONTENT */}
      <main className="flex-1 w-full flex flex-col">
        <section className="pt-24 md:pt-32 pb-12 px-6 md:px-12 lg:px-24 text-center bg-zinc-50">
          <CmsText cmsId="work.hero.heading" as="h1" className="font-serif text-5xl md:text-6xl lg:text-7xl mb-12" fallback="Selected Work." />
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-3xl mx-auto">
            <CmsText cmsId="work.hero.label" as="span" className="text-[10px] tracking-[0.2em] uppercase font-bold text-black pb-1 border-b-2 border-black" fallback="CLIENT WORK" />
          </div>
        </section>

        <section className="py-12 md:py-24 px-6 md:px-12 lg:px-24 flex-1">
          <div className="max-w-[1400px] mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {portfolioItems.map(item => (
              <div key={item.id} className="break-inside-avoid flex flex-col gap-4 group cursor-pointer mb-8">
                <div className={`w-full ${item.aspect} bg-zinc-200 relative overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.10)]`}>
                  <CmsImage cmsId={item.cmsId} fallbackSrc={item.image} alt={item.title} fill className={`object-cover transition-transform duration-1000 ease-out group-hover:scale-105 ${item.position || ''}`} />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10"></div>
                </div>
                <div className="flex justify-between items-center px-1">
                  <CmsText cmsId={`work.p${item.id}.title`} as="h3" className="font-serif text-lg md:text-xl" fallback={item.title} />
                  <CmsText cmsId={`work.p${item.id}.cat`} as="span" className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400" fallback={item.category} />
                </div>
              </div>
            ))}
          </div>
          
          {portfolioItems.length === 0 && (
            <CmsText cmsId="work.empty" as="div" className="text-center py-32 text-zinc-400 font-light text-sm" fallback="No projects found in this category yet." />
          )}
        </section>

        <section className="py-24 md:py-32 px-6 text-center border-t border-zinc-200 bg-white">
          <CmsText cmsId="work.cta.heading" as="h2" className="font-serif text-3xl md:text-4xl mb-8" fallback="Ready to create something new?" />
          <Link href="/contact" className="inline-block px-10 py-5 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors">
            <CmsText cmsId="work.cta.btn" fallback="Start A Project" />
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <CmsText cmsId="global.footer.brand" as="h3" className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black" fallback="GROTON AI STUDIO" />
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.about" fallback="About" /></Link>
              <Link href="/services" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
              <Link href="/work" className="text-black transition-colors"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
              <Link href="/pricing" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
              <Link href="/contact" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.contact" fallback="Contact" /></Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <CmsText cmsId="global.footer.copyright" as="p" className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold" fallback="© 2026 GROTON AI STUDIO" />
            <div className="flex items-center gap-6">
              <a href="https://www.instagram.com/d99p4k/" target="_blank" rel="noopener noreferrer" className="text-inherit opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://in.linkedin.com/in/deepak-kumawat-grafly" target="_blank" rel="noopener noreferrer" className="text-inherit opacity-60 hover:opacity-100 hover:text-[#0a66c2] transition-all duration-300 hover:-translate-y-1" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
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
