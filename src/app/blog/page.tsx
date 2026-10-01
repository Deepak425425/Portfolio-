import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/blog/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON Journal — E-commerce Visuals, AI Imagery & Creative Production",
  description: "Insights on product imagery, e-commerce visuals, creative production and modern brand content.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "GROTON Journal",
    description: "Insights on product imagery, e-commerce visuals, creative production and modern brand content.",
    url: "https://groton.in/blog",
    siteName: "GROTON AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI",
      },
    ],
    type: "website",
  },
};

export default function BlogLandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-foreground selection:text-background">
      <Navigation />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24">
        
        {/* HERO SECTION */}
        <div className="mb-20 md:mb-32">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text mb-4 block">GROTON JOURNAL</span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] mb-8">
            Insights on product<br />imagery and brand<br />visuals.
          </h1>
          <p className="text-sec-text max-w-xl text-sm md:text-base leading-relaxed">
            Thoughts, guides, and creative workflows for modern e-commerce brands, creative directors, and digital studios.
          </p>
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col">
              <div className="relative w-full aspect-[4/5] bg-zinc-100 mb-6 overflow-hidden">
                <Image 
                  src={post.coverImage} 
                  alt={post.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text mb-3">
                {post.category}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mb-3 group-hover:text-zinc-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-sec-text line-clamp-3 leading-relaxed mb-4">
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
