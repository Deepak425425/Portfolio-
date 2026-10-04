import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import CmsText from "@/components/CmsText";

export const metadata: Metadata = {
  title: "Pricing — GROTON AI STUDIO",
  description: "Transparent, project-based pricing for premium AI visual production.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      
      {/* HEADER */}
      <Header />

      {/* PRICING CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center py-24 md:py-32 px-6 md:px-12 lg:px-24 relative z-10 pt-[160px] pb-[80px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            maskImage: "linear-gradient(to bottom, black, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 90%)",
          }}
        />
  
        <div className="max-w-[1200px] w-full">
          <div className="text-center mb-16 md:mb-24">
            <CmsText cmsId="pricing.hero.heading" as="h1" className="font-sans font-bold tracking-[-0.05em] text-5xl md:text-6xl lg:text-7xl mb-8" fallback="Transparent Engagement." />
            <CmsText cmsId="pricing.hero.desc" as="p" className="text-base text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed" fallback="We operate on clear, project-based tiers depending on the complexity of creative direction, required variations, and the volume of visual deliverables." />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* STARTER */}
             <div className="bg-white rounded-[24px] p-10 md:p-12 flex flex-col gap-6 shadow-[0_18px_40px_rgba(0,0,0,0.10)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] transition-shadow duration-500 h-full group">
               <CmsText cmsId="pricing.t1.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Starter" />
               <CmsText cmsId="pricing.t1.volume" as="div" className="font-sans font-bold tracking-[-0.05em] text-4xl md:text-5xl text-black" fallback="25 Images" />
               <div className="pb-8 pt-2 border-b border-zinc-100 flex flex-col gap-2">
                 <div className="text-2xl md:text-3xl font-sans font-light tracking-tight text-zinc-800"><CmsText cmsId="pricing.t1.price" fallback="₹2,499" /><span className="text-lg text-zinc-400 ml-1">+</span></div>
                 <CmsText cmsId="pricing.t1.unit" as="div" className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase" fallback="₹100 / Image" />
               </div>
               <CmsText cmsId="pricing.t1.desc" as="p" className="text-sm text-zinc-500 font-light flex-1 leading-relaxed mt-2" fallback="Perfect for a foundational collection of high-quality product assets, clean catalog shots, or launching a new small capsule." />
             </div>
             
             {/* GROWTH (Recommended) */}
             <div className="border border-black rounded-[24px] p-10 md:p-12 flex flex-col gap-6 shadow-2xl bg-black text-white transform lg:-translate-y-4 h-full relative">
               <CmsText cmsId="pricing.t2.badge" as="div" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8B7CFF] text-black text-[9px] uppercase tracking-widest font-bold px-4 py-1 rounded-full" fallback="Recommended" />
               <CmsText cmsId="pricing.t2.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Growth" />
               <CmsText cmsId="pricing.t2.volume" as="div" className="font-sans font-bold tracking-[-0.05em] text-4xl md:text-5xl text-white" fallback="50 Images" />
               <div className="pb-8 pt-2 border-b border-zinc-800 flex flex-col gap-2">
                 <div className="text-2xl md:text-3xl font-sans font-light tracking-tight text-zinc-100"><CmsText cmsId="pricing.t2.price" fallback="₹4,499" /><span className="text-lg text-zinc-500 ml-1">+</span></div>
                 <CmsText cmsId="pricing.t2.unit" as="div" className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase" fallback="₹90 / Image" />
               </div>
               <CmsText cmsId="pricing.t2.desc" as="p" className="text-sm text-zinc-400 font-light flex-1 leading-relaxed mt-2" fallback="The ideal volume for comprehensive e-commerce listings, dynamic social media batches, and cohesive brand storytelling." />
             </div>

             {/* SCALE */}
             <div className="bg-white rounded-[24px] p-10 md:p-12 flex flex-col gap-6 shadow-[0_18px_40px_rgba(0,0,0,0.10)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] transition-shadow duration-500 h-full group">
               <CmsText cmsId="pricing.t3.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Scale" />
               <CmsText cmsId="pricing.t3.volume" as="div" className="font-sans font-bold tracking-[-0.05em] text-4xl md:text-5xl text-black" fallback="100 Images" />
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
      <Footer />
    </div>
  );
}
