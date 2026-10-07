import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Metadata } from "next";
import CmsImage from "@/components/CmsImage";
import CmsText from "@/components/CmsText";

export const metadata: Metadata = {
  title: "About — GROTON AI STUDIO",
  description: "A modern visual production studio merging art direction with AI generation.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — GROTON AI STUDIO",
    description: "A modern visual production studio merging art direction with AI generation.",
    url: "https://groton.in/about",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/campaign-worlds/groton-about-main-visual-16x9.webp",
        width: 1200,
        height: 675,
        alt: "About GROTON AI Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — GROTON AI STUDIO",
    description: "A modern visual production studio merging art direction with AI generation.",
    images: ["https://groton.in/campaign-worlds/groton-about-main-visual-16x9.webp"],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header />

      {/* ABOUT CONTENT */}
      <main className="flex-1 w-full bg-[#F9F8F6]">
        <section className="py-24 md:py-32 lg:py-48 px-6 md:px-12 lg:px-24 text-center relative z-10 pt-[160px] pb-[80px]">

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
  
          <CmsText
            cmsId="about.hero.heading"
            as="h1"
            brClassName=""
            className="font-sans font-bold tracking-[-0.05em] text-5xl md:text-6xl lg:text-7xl mb-12 max-w-4xl mx-auto leading-tight"
            fallback={'Art direction meets\nalgorithmic scale.'}
          />
          <CmsText
            cmsId="about.hero.desc"
            as="p"
            className="font-sans text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-light"
            fallback="GROTON is a premium visual production studio designed for modern brands. We engineer hyper-realistic, campaign-ready visual assets that blur the line between traditional photography and artificial intelligence."
          />
        </section>

        <section className="w-full h-[60vh] md:h-[80vh] relative">
          <CmsImage cmsId="about_main_visual" fallbackSrc="/campaign-worlds/groton-about-main-visual-16x9.webp" alt="GROTON AI STUDIO aesthetic" fill className="object-cover object-center" />
        </section>

        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#F9F8F6] border-b border-[rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto flex flex-col gap-16 md:gap-24">
            
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
              <div className="w-full md:w-1/3">
                <CmsText cmsId="about.prob.label" as="h3" className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400" fallback="The Problem" />
              </div>
              <div className="w-full md:w-2/3">
                <CmsText cmsId="about.prob.heading" as="h2" className="font-sans font-bold tracking-[-0.05em] text-3xl md:text-4xl mb-6" fallback="Traditional production is too slow. AI is too generic." />
                <CmsText cmsId="about.prob.p1" as="p" className="text-sm text-zinc-500 font-light leading-relaxed mb-4" fallback="Modern brands require a massive volume of visual content—from e-commerce hero shots to social media campaigns and display advertising. Traditional physical photoshoots involve heavy logistics, locations, permits, and rigid timelines." />
                <CmsText cmsId="about.prob.p2" as="p" className="text-sm text-zinc-500 font-light leading-relaxed" fallback="Conversely, standard AI generation often produces generic, unpredictable, or off-brand results that fail to meet premium brand standards." />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
              <div className="w-full md:w-1/3">
                <CmsText cmsId="about.appr.label" as="h3" className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400" fallback="Our Approach" />
              </div>
              <div className="w-full md:w-2/3">
                <CmsText cmsId="about.appr.heading" as="h2" className="font-sans font-bold tracking-[-0.05em] text-3xl md:text-4xl mb-6" fallback="Directed Generation." />
                <CmsText cmsId="about.appr.p1" as="p" className="text-sm text-zinc-500 font-light leading-relaxed mb-4" fallback="We solve this by placing experienced creative directors at the helm of advanced AI synthesis. We don't just type prompts; we establish visual systems. We define the lighting logic, the color theory, the material textures, and the compositional hierarchy." />
                <CmsText cmsId="about.appr.p2" as="p" className="text-sm text-zinc-500 font-light leading-relaxed" fallback="This hybrid approach allows us to deliver production-grade realism and brand consistency at a scale and speed that traditional studios cannot match." />
              </div>
            </div>

          </div>
        </section>

        <section className="py-24 md:py-32 px-6 text-center bg-black text-white">
          <CmsText cmsId="about.cta.heading" as="h2" className="font-sans font-bold tracking-[-0.05em] text-3xl md:text-4xl lg:text-5xl mb-8 max-w-2xl mx-auto leading-tight" fallback="Elevate your visual language." />
          <Link href="/contact" className="inline-block px-10 py-5 bg-white text-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-200 transition-colors mt-8 rounded-full">
            <CmsText cmsId="about.cta.btn" fallback="Start A Project" />
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
