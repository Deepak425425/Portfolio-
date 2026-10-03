import Link from "next/link";
import type { Metadata } from "next";
import CmsText from "@/components/CmsText";

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
          <CmsText cmsId="global.nav.brand" fallback="GROTON AI STUDIO" />
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
            <Link href="/services" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
            <Link href="/pricing" className="text-black transition-colors"><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
            <Link href="/tools" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.tools" fallback="Tools" /></Link>
            <Link href="/about" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.about" fallback="About" /></Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            <CmsText cmsId="global.nav.contact" fallback="Contact" />
          </Link>
        </div>
      </header>

      {/* PRICING CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1200px] w-full">
          <div className="text-center mb-16 md:mb-24">
            <CmsText cmsId="pricing.hero.heading" as="h1" className="font-serif text-5xl md:text-6xl lg:text-7xl mb-8" fallback="Transparent Engagement." />
            <CmsText cmsId="pricing.hero.desc" as="p" className="text-base text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed" fallback="We operate on clear, project-based tiers depending on the complexity of creative direction, required variations, and the volume of visual deliverables." />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* STARTER */}
             <div className="border border-zinc-200 p-10 md:p-12 flex flex-col gap-6 hover:shadow-2xl transition-shadow bg-white h-full group">
               <CmsText cmsId="pricing.t1.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Starter" />
               <CmsText cmsId="pricing.t1.volume" as="div" className="font-serif text-4xl md:text-5xl text-black" fallback="25 Images" />
               <div className="pb-8 pt-2 border-b border-zinc-100 flex flex-col gap-2">
                 <div className="text-2xl md:text-3xl font-sans font-light tracking-tight text-zinc-800"><CmsText cmsId="pricing.t1.price" fallback="₹2,499" /><span className="text-lg text-zinc-400 ml-1">+</span></div>
                 <CmsText cmsId="pricing.t1.unit" as="div" className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase" fallback="₹100 / Image" />
               </div>
               <CmsText cmsId="pricing.t1.desc" as="p" className="text-sm text-zinc-500 font-light flex-1 leading-relaxed mt-2" fallback="Perfect for a foundational collection of high-quality product assets, clean catalog shots, or launching a new small capsule." />
             </div>
             
             {/* GROWTH (Recommended) */}
             <div className="border border-black p-10 md:p-12 flex flex-col gap-6 shadow-2xl bg-black text-white transform lg:-translate-y-4 h-full relative">
               <CmsText cmsId="pricing.t2.badge" as="div" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[9px] uppercase tracking-widest font-bold px-4 py-1" fallback="Recommended" />
               <CmsText cmsId="pricing.t2.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Growth" />
               <CmsText cmsId="pricing.t2.volume" as="div" className="font-serif text-4xl md:text-5xl text-white" fallback="50 Images" />
               <div className="pb-8 pt-2 border-b border-zinc-800 flex flex-col gap-2">
                 <div className="text-2xl md:text-3xl font-sans font-light tracking-tight text-zinc-100"><CmsText cmsId="pricing.t2.price" fallback="₹4,499" /><span className="text-lg text-zinc-500 ml-1">+</span></div>
                 <CmsText cmsId="pricing.t2.unit" as="div" className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase" fallback="₹90 / Image" />
               </div>
               <CmsText cmsId="pricing.t2.desc" as="p" className="text-sm text-zinc-400 font-light flex-1 leading-relaxed mt-2" fallback="The ideal volume for comprehensive e-commerce listings, dynamic social media batches, and cohesive brand storytelling." />
             </div>

             {/* SCALE */}
             <div className="border border-zinc-200 p-10 md:p-12 flex flex-col gap-6 hover:shadow-2xl transition-shadow bg-white h-full group">
               <CmsText cmsId="pricing.t3.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Scale" />
               <CmsText cmsId="pricing.t3.volume" as="div" className="font-serif text-4xl md:text-5xl text-black" fallback="100 Images" />
               <div className="pb-8 pt-2 border-b border-zinc-100 flex flex-col gap-2">
                 <div className="text-2xl md:text-3xl font-sans font-light tracking-tight text-zinc-800"><CmsText cmsId="pricing.t3.price" fallback="₹7,999" /><span className="text-lg text-zinc-400 ml-1">+</span></div>
                 <CmsText cmsId="pricing.t3.unit" as="div" className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase" fallback="₹80 / Image" />
               </div>
               <CmsText cmsId="pricing.t3.desc" as="p" className="text-sm text-zinc-500 font-light flex-1 leading-relaxed mt-2" fallback="Built for high-volume catalogs, robust digital marketing campaigns, and brands scaling their entire visual inventory." />
             </div>
          </div>
          
          <div className="mt-16 text-center">
            <CmsText cmsId="pricing.notes" as="p" className="text-[10px] text-zinc-400 tracking-[0.15em] uppercase font-bold max-w-3xl mx-auto leading-loose mb-12" fallback="Pricing applies to standard e-commerce/product imagery. Product-on-model, lifestyle, advanced compositing and campaign visuals are quoted separately." />
            <Link href="/contact" className="inline-block px-12 py-5 bg-black text-white text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors">
              <CmsText cmsId="pricing.cta.btn" fallback="Start A Project" />
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <CmsText cmsId="global.footer.brand" as="h3" className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black" fallback="GROTON AI STUDIO" />
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.about" fallback="About" /></Link>
              <Link href="/services" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.services" fallback="Services" /></Link>
              <Link href="/work" className="hover:text-black transition-colors"><CmsText cmsId="global.nav.work" fallback="Work" /></Link>
              <Link href="/pricing" className="text-black transition-colors"><CmsText cmsId="global.nav.pricing" fallback="Pricing" /></Link>
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
