import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/blog/data";
import CmsText from "@/components/CmsText";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON Journal — Insights for Modern E-commerce & Visual Production",
  description:
    "Practical insights, visual workflows, and ideas for brands creating better product content at scale. Explore e-commerce product imagery, PDP visuals, and AI production.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "GROTON Journal — Insights for Modern E-commerce & Visual Production",
    description:
      "Practical insights, visual workflows, and ideas for brands creating better product content at scale. Explore e-commerce product imagery, PDP visuals, and AI production.",
    url: "https://groton.in/blog",
    siteName: "GROTON AI",
    locale: "en_US",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON Journal",
      },
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON Journal",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GROTON Journal — Insights for Modern E-commerce & Visual Production",
    description:
      "Practical insights, visual workflows, and ideas for brands creating better product content at scale. Explore e-commerce product imagery, PDP visuals, and AI production.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

export default function BlogLandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      <Header />
      
      <main className="flex-1 w-full relative z-10">
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

        <div className="max-w-[1300px] 2xl:max-w-[1480px] w-full mx-auto px-6 md:px-12 lg:px-16">
          {/* HERO SECTION - Compact, Editorial */}
          <section className="pt-32 sm:pt-40 md:pt-[170px] pb-8 sm:pb-10 md:pb-12">
            <div className="max-w-4xl xl:max-w-5xl">
              <CmsText 
                cmsId="blog.hero.label" 
                as="span" 
                className="text-[11px] md:text-xs tracking-[0.25em] uppercase font-bold text-zinc-400 block mb-4 sm:mb-5" 
                fallback="GROTON JOURNAL" 
              />
              <CmsText 
                cmsId="blog.hero.heading" 
                as="h1" 
                className="font-sans font-bold tracking-[-0.04em] text-3xl sm:text-5xl md:text-6xl lg:text-[68px] 2xl:text-[76px] leading-[1.05] text-black mb-4 sm:mb-6" 
                fallback={<>Insights for modern <span className="whitespace-nowrap">e-commerce.</span></>} 
              />
              <CmsText 
                cmsId="blog.hero.desc" 
                as="p" 
                className="font-sans text-base sm:text-lg md:text-xl text-zinc-500 leading-relaxed font-light max-w-2xl" 
                fallback="Practical insights, visual workflows, and ideas for brands creating better product content at scale." 
              />
            </div>
          </section>

          {/* RESTRAINED EDITORIAL ARCHIVE DIVIDER */}
          <div className="border-t border-black/[0.08] pt-4 sm:pt-5 pb-6 sm:pb-8 md:pb-10 flex items-center justify-between text-zinc-400">
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold">
              Selected Publications
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-mono font-medium">
              {BLOG_POSTS.length} Articles
            </span>
          </div>

          {/* ARTICLES GRID - 3-COLUMN EDITORIAL GRID ON DESKTOP, 2 ON TABLET, 1 ON MOBILE */}
          <section className="pb-20 sm:pb-24 md:pb-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-10 2xl:gap-x-12 gap-y-10 sm:gap-y-12 md:gap-y-14">
              {BLOG_POSTS.map((post) => (
                <Link 
                  key={post.slug} 
                  href={`/blog/${post.slug}`} 
                  className="group flex flex-col h-full focus:outline-none"
                >
                  {/* SUPPORTING COVER IMAGE - Controlled scale, restrained height */}
                  <div className="relative w-full aspect-[16/10] bg-zinc-100 mb-5 overflow-hidden rounded-xl border border-black/[0.06]">
                    <Image 
                      src={post.coverImage} 
                      alt={post.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out" 
                    />
                  </div>

                  {/* CATEGORY - Small and understated */}
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 group-hover:text-zinc-600 transition-colors mb-2.5">
                    {post.category}
                  </span>

                  {/* ARTICLE TITLE - Strongest content element */}
                  <h2 className="font-sans font-bold tracking-[-0.03em] text-xl md:text-[22px] leading-[1.25] text-black group-hover:text-zinc-600 transition-colors mb-3">
                    {post.title}
                  </h2>

                  {/* SHORT EXCERPT - Supporting context */}
                  <p className="font-sans text-[13px] md:text-sm text-zinc-500 line-clamp-2 md:line-clamp-3 leading-relaxed mb-5 font-normal">
                    {post.excerpt}
                  </p>

                  {/* METADATA - Subtle date & read time */}
                  <div className="mt-auto pt-3 border-t border-black/[0.06] flex items-center justify-between text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-400">
                    <span>{post.datePublished}</span>
                    <span>{post.readingTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
