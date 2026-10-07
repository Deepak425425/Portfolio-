import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Services — GROTON AI STUDIO",
  description:
    "E-commerce visual production studio: PDP imagery, product-on-model visuals, lifestyle scenes, and campaign creatives built for modern commerce brands.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services — GROTON AI STUDIO",
    description:
      "E-commerce visual production studio: PDP imagery, product-on-model visuals, lifestyle scenes, and campaign creatives built for modern commerce brands.",
    url: "https://groton.in/services",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI STUDIO Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services — GROTON AI STUDIO",
    description:
      "E-commerce visual production studio: PDP imagery, product-on-model visuals, lifestyle scenes, and campaign creatives built for modern commerce brands.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

const capabilities = [
  "Creative Direction",
  "Art Direction",
  "AI-Powered Production",
  "Visual Consistency",
  "Scalable Content Production",
];

const services = [
  {
    id: "ecommerce-pdp",
    category: "01 — E-COMMERCE / PDP",
    title: "E-commerce & PDP Visuals",
    description:
      "Commerce-ready visuals built for product pages, marketplaces, catalogs, and online stores.",
    deliverables: [
      "PDP imagery",
      "Product listing visuals",
      "Marketplace imagery",
      "Catalog / collection visuals",
    ],
    image: "/campaign-worlds/groton-services-advertising-3x4.webp",
    alt: "E-commerce and PDP visuals by GROTON AI",
  },
  {
    id: "product-on-model",
    category: "02 — PRODUCT-ON-MODEL",
    title: "Product-on-Model",
    description:
      "Realistic product-on-model imagery for fashion, apparel, jewellery, accessories, and other product-led brands.",
    deliverables: [
      "On-model apparel visuals",
      "Model lookbook imagery",
      "Multi-angle model styling",
      "Consistent collection fit & drape",
    ],
    image: "/campaign-worlds/groton-services-ai-product-3x4.webp",
    alt: "Product-on-model apparel imagery by GROTON AI",
  },
  {
    id: "lifestyle-editorial",
    category: "03 — LIFESTYLE",
    title: "Lifestyle & Editorial",
    description:
      "Art-directed product visuals that place products into premium lifestyle and editorial contexts.",
    deliverables: [
      "Lifestyle scenes",
      "Editorial product imagery",
      "Brand storytelling visuals",
      "Contextual product scenes",
    ],
    image: "/campaign-worlds/groton-services-lifestyle-3x4.webp",
    alt: "Lifestyle and editorial product imagery by GROTON AI",
  },
  {
    id: "campaign-advertising",
    category: "04 — CAMPAIGN",
    title: "Campaign & Advertising",
    description:
      "High-impact visual assets for product launches, campaigns, advertising, and digital brand communication.",
    deliverables: [
      "Campaign visuals",
      "Launch creatives",
      "Hero visuals",
      "Advertising creatives",
    ],
    image: "/campaign-worlds/groton-services-creative-direction-3x4.webp",
    alt: "Campaign and advertising visuals by GROTON AI",
    position: "object-[center_15%]",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header />

      {/* SERVICES CONTENT */}
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
          {/* PAGE HERO */}
          <section className="pt-32 sm:pt-40 md:pt-48 lg:pt-[210px] pb-12 sm:pb-16 md:pb-20">
            <div className="max-w-4xl xl:max-w-5xl">
              <span className="text-[11px] md:text-xs tracking-[0.25em] uppercase font-bold text-zinc-400 block mb-4 sm:mb-6">
                VISUAL PRODUCTION
              </span>
              <h1 className="font-sans font-bold tracking-[-0.05em] text-3xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-[80px] leading-[1.05] text-black mb-6 sm:mb-8 break-words">
                Visuals built for modern commerce.
              </h1>
              <p className="font-sans text-base sm:text-xl md:text-2xl text-zinc-500 leading-relaxed font-light max-w-3xl">
                From PDP and product-on-model imagery to lifestyle and campaign visuals, GROTON creates premium visual content built for e-commerce brands.
              </p>
            </div>
          </section>

          {/* UNDERLYING CAPABILITIES RIBBON */}
          <div className="py-4 sm:py-5 border-t border-b border-black/[0.08] flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2.5 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold text-zinc-400">
            {capabilities.map((cap, i) => (
              <span key={i} className="flex items-center gap-4 sm:gap-6">
                <span>{cap}</span>
                {i < capabilities.length - 1 && (
                  <span className="text-zinc-300 select-none">•</span>
                )}
              </span>
            ))}
          </div>

          {/* 4 CORE SERVICES */}
          <div className="flex flex-col">
            {services.map((service, index) => (
              <section
                key={service.id}
                id={service.id}
                className="py-12 sm:py-16 md:py-20 lg:py-24 2xl:py-28 border-b border-black/[0.08] flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center scroll-mt-24 md:scroll-mt-32"
              >
                {/* Text column */}
                <div
                  className={`w-full lg:w-1/2 flex flex-col ${
                    index % 2 !== 0 ? "lg:order-2" : ""
                  }`}
                >
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] font-bold text-zinc-400 uppercase mb-3 sm:mb-4 block">
                    {service.category}
                  </span>
                  <h2 className="font-sans font-bold tracking-[-0.04em] text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-5 text-black">
                    {service.title}
                  </h2>
                  <p className="font-sans text-sm sm:text-base md:text-lg text-zinc-600 font-light leading-relaxed mb-6 sm:mb-8">
                    {service.description}
                  </p>

                  {/* Deliverables */}
                  <div className="mb-8 sm:mb-10">
                    <h3 className="text-[10px] tracking-[0.25em] font-bold text-zinc-400 uppercase mb-3 sm:mb-4 border-b border-black/[0.06] pb-2">
                      Deliverables
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {service.deliverables.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm text-zinc-600 font-light flex items-center gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-black/40 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold text-black hover:text-zinc-600 transition-colors group"
                    >
                      <span>Inquire about {service.title}</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>

                {/* Image column */}
                <div
                  className={`w-full lg:w-1/2 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] max-h-[460px] xl:max-h-[520px] 2xl:max-h-[580px] relative bg-zinc-100 overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.06)] rounded-[20px] sm:rounded-[24px] border border-black/[0.04] ${
                    index % 2 !== 0 ? "lg:order-1" : ""
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                    className={`object-cover ${service.position || ""}`}
                  />
                </div>
              </section>
            ))}
          </div>

          {/* INDUSTRIES / CLIENT TYPES */}
          <section className="py-12 sm:py-16 md:py-20 border-b border-black/[0.08]">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 md:gap-12">
              <div className="w-full md:w-5/12">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-zinc-400 block mb-2 sm:mb-3">
                  SECTOR EXPERTISE
                </span>
                <h2 className="font-sans font-bold tracking-[-0.03em] text-xl sm:text-2xl md:text-3xl text-black">
                  Built for product-led brands.
                </h2>
              </div>
              <div className="w-full md:w-7/12">
                <p className="font-sans text-sm sm:text-base md:text-lg lg:text-xl text-zinc-600 font-light leading-relaxed">
                  Fashion, apparel, jewellery, beauty, lifestyle, D2C, and modern e-commerce brands.
                </p>
              </div>
            </div>
          </section>

          {/* POSITIONING STATEMENT */}
          <section className="py-16 sm:py-20 md:py-28 border-b border-black/[0.08]">
            <div className="max-w-4xl xl:max-w-5xl">
              <blockquote className="font-sans font-bold tracking-[-0.04em] text-2xl sm:text-4xl md:text-5xl lg:text-[52px] 2xl:text-[58px] leading-snug sm:leading-[1.15] text-black">
                “We create the visual content <span className="whitespace-nowrap">e-commerce</span> brands need to sell better — from product pages to campaigns.”
              </blockquote>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-28 md:pb-36 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-xl">
              <h2 className="font-sans font-bold tracking-[-0.03em] text-2xl sm:text-3xl md:text-4xl text-black mb-2 sm:mb-3">
                Ready to build better visuals?
              </h2>
              <p className="font-sans text-sm sm:text-base text-zinc-500 font-light leading-relaxed">
                Let’s discuss your products and visual production pipeline.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 sm:px-9 py-3.5 sm:py-4 bg-black text-white text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors rounded-full shrink-0 shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 duration-200"
            >
              Start A Project
            </Link>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
