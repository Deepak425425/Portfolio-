import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/blog/data";
import CmsText from "@/components/CmsText";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON Journal — E-commerce Visuals, AI Imagery & Creative Production",
  description: "Insights on product imagery, e-commerce visuals, creative production and modern brand content.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "GROTON Journal — E-commerce Visuals, AI Imagery & Creative Production",
    description: "Insights on product imagery, e-commerce visuals, creative production and modern brand content.",
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
    title: "GROTON Journal — E-commerce Visuals, AI Imagery & Creative Production",
    description: "Insights on product imagery, e-commerce visuals, creative production and modern brand content.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

export default function BlogLandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      <Header />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24 relative z-10 pt-[160px]">

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
  
        
        {/* HERO SECTION */}
        <div className="mb-20 md:mb-32">
          <CmsText cmsId="blog.hero.label" as="span" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 mb-4 block" fallback="GROTON JOURNAL" />
          <CmsText cmsId="blog.hero.heading" as="h1" className="font-sans font-bold tracking-[-0.05em] text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] mb-8" fallback={"Insights on product\nimagery and brand\nvisuals."} />
          <CmsText cmsId="blog.hero.desc" as="p" className="text-zinc-500 max-w-xl text-sm md:text-base leading-relaxed" fallback="Thoughts, guides, and creative workflows for modern e-commerce brands, creative directors, and digital studios." />
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col">
              <div className="relative w-full aspect-[4/5] bg-zinc-100 mb-6 overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)] group-hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] transition-shadow duration-500 rounded-[24px]">
                <Image 
                  src={post.coverImage} 
                  alt={post.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 mb-3">
                {post.category}
              </span>
              <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl md:text-3xl mb-3 group-hover:text-zinc-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <div className="mt-auto text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                {post.datePublished} &middot; {post.readingTime}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
