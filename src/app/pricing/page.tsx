import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import CmsText from "@/components/CmsText";
import PricingCards from "@/components/pricing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing — GROTON AI STUDIO",
  description: "Transparent, project-based pricing for premium AI visual production.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing — GROTON AI STUDIO",
    description: "Transparent, project-based pricing for premium AI visual production.",
    url: "https://groton.in/pricing",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — GROTON AI STUDIO",
    description: "Transparent, project-based pricing for premium AI visual production.",
    images: ["https://groton.in/og-image.jpg"],
  },
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
          
          <PricingCards />
          
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
