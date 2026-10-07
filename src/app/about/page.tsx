import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About — GROTON AI STUDIO",
  description:
    "GROTON AI is a visual production studio helping e-commerce brands create premium product visuals and campaign-ready content using AI — faster and at scale.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — GROTON AI STUDIO",
    description:
      "GROTON AI is a visual production studio helping e-commerce brands create premium product visuals and campaign-ready content using AI — faster and at scale.",
    url: "https://groton.in/about",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "About GROTON AI Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — GROTON AI STUDIO",
    description:
      "GROTON AI is a visual production studio helping e-commerce brands create premium product visuals and campaign-ready content using AI — faster and at scale.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header />

      {/* ABOUT CONTENT */}
      <main className="flex-1 w-full bg-[#F9F8F6] relative z-10">
        {/* Subtle grid background matching GROTON visual language */}
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

        <div className="max-w-[1240px] xl:max-w-[1360px] 2xl:max-w-[1480px] w-full mx-auto px-6 md:px-12 lg:px-16">
          {/* HERO / INTRO */}
          <section className="pt-32 sm:pt-40 md:pt-48 lg:pt-[210px] pb-12 sm:pb-16 md:pb-24">
            <div className="max-w-4xl xl:max-w-5xl">
              <span className="text-[11px] md:text-xs tracking-[0.25em] uppercase font-bold text-zinc-400 block mb-4 sm:mb-6">
                ABOUT GROTON
              </span>
              <h1 className="font-sans font-bold tracking-[-0.05em] text-3xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-[80px] leading-[1.05] text-black mb-6 sm:mb-8">
                Built for e-commerce brands.
              </h1>
              <p className="font-sans text-base sm:text-xl md:text-2xl text-zinc-500 leading-relaxed font-light max-w-3xl">
                GROTON AI is a visual production studio helping e-commerce brands create premium product visuals and campaign-ready content using AI — faster and at scale.
              </p>
            </div>
          </section>

          {/* COMPACT 3-COLUMN INFORMATION SECTION */}
          <section className="border-t border-black/[0.08] py-12 sm:py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-14">
              {/* 01 — OUR PURPOSE */}
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-zinc-400 mb-3 sm:mb-4 block">
                  01 — OUR PURPOSE
                </span>
                <h2 className="font-sans font-bold tracking-[-0.03em] text-lg sm:text-xl lg:text-2xl text-black mb-3 sm:mb-4 leading-snug">
                  Better visuals for bigger growth.
                </h2>
                <p className="font-sans text-sm sm:text-[15px] 2xl:text-base text-zinc-500 font-light leading-relaxed">
                  We help e-commerce brands create premium visual content that helps their products stand out and grow.
                </p>
              </div>

              {/* 02 — WHAT WE DO */}
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-zinc-400 mb-3 sm:mb-4 block">
                  02 — WHAT WE DO
                </span>
                <h2 className="font-sans font-bold tracking-[-0.03em] text-lg sm:text-xl lg:text-2xl text-black mb-3 sm:mb-4 leading-snug">
                  Product visuals, made easier.
                </h2>
                <p className="font-sans text-sm sm:text-[15px] 2xl:text-base text-zinc-500 font-light leading-relaxed">
                  From product imagery and product-on-model visuals to campaign creatives, we create high-quality visual assets for modern commerce.
                </p>
              </div>

              {/* 03 — WHO WE WORK WITH */}
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-zinc-400 mb-3 sm:mb-4 block">
                  03 — WHO WE WORK WITH
                </span>
                <h2 className="font-sans font-bold tracking-[-0.03em] text-lg sm:text-xl lg:text-2xl text-black mb-3 sm:mb-4 leading-snug">
                  Modern e-commerce brands.
                </h2>
                <p className="font-sans text-sm sm:text-[15px] 2xl:text-base text-zinc-500 font-light leading-relaxed">
                  We work with fashion, jewelry, beauty, lifestyle, D2C, and other product-led e-commerce brands.
                </p>
              </div>
            </div>
          </section>

          {/* COMPACT VISION SECTION */}
          <section className="border-t border-black/[0.08] pt-12 sm:pt-16 md:pt-24 pb-20 sm:pb-28 md:pb-36">
            <div className="max-w-4xl xl:max-w-5xl">
              <span className="text-[10px] sm:text-[11px] md:text-xs tracking-[0.25em] uppercase font-bold text-zinc-400 block mb-4 sm:mb-6">
                OUR VISION
              </span>
              <h2 className="font-sans font-bold tracking-[-0.04em] text-2xl sm:text-4xl md:text-5xl lg:text-[54px] 2xl:text-[60px] leading-[1.12] text-black mb-6 sm:mb-8">
                To make premium visual production more accessible, scalable, and effective for every e-commerce brand.
              </h2>
              <p className="font-sans text-sm sm:text-base md:text-lg text-zinc-500 font-light tracking-[-0.01em]">
                Less complexity. More creativity. Better results.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
