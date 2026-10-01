import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog/data";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${post.title} — GROTON AI`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://groton.in/blog/${post.slug}`,
      siteName: "GROTON AI",
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 800,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.datePublished,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  
  if (!post) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [
      `https://groton.in${post.coverImage}`
    ],
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    author: [{
      "@type": "Organization",
      name: "GROTON AI",
      url: "https://groton.in"
    }],
    publisher: {
      "@type": "Organization",
      name: "GROTON AI",
      logo: {
        "@type": "ImageObject",
        url: "https://groton.in/og-image.jpg"
      }
    },
    description: post.excerpt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://groton.in/blog/${post.slug}`
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-foreground selection:text-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navigation />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-16 md:py-24">
        
        {/* ARTICLE HEADER */}
        <div className="max-w-3xl mx-auto mb-12">
          <Link href="/blog" className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text hover:text-foreground transition-colors mb-8 inline-flex items-center gap-2">
            &larr; Back to Journal
          </Link>
          <div className="mt-8 mb-6 flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">
            <span>{post.category}</span>
            <span>&middot;</span>
            <span>{post.datePublished}</span>
            <span>&middot;</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-8">
            {post.title}
          </h1>
        </div>

        {/* COVER IMAGE */}
        <div className="w-full aspect-[16/9] md:aspect-[21/9] relative mb-16 bg-zinc-100 overflow-hidden">
          <Image 
            src={post.coverImage} 
            alt={post.title} 
            fill 
            priority
            className="object-cover object-center" 
          />
        </div>

        {/* ARTICLE BODY */}
        <article className="max-w-2xl mx-auto">
          {post.content}
          
          <div className="mt-16 pt-8 border-t border-border-color">
            <h3 className="text-xl font-serif mb-4">Share this article</h3>
            <div className="flex gap-4">
              <a href={`https://twitter.com/intent/tweet?url=https://groton.in/blog/${post.slug}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-bold text-sec-text hover:text-foreground">X (Twitter)</a>
              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=https://groton.in/blog/${post.slug}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-bold text-sec-text hover:text-foreground">LinkedIn</a>
            </div>
          </div>
        </article>

        {/* RELATED ARTICLES */}
        <div className="mt-24 pt-16 border-t border-border-color max-w-5xl mx-auto">
          <h3 className="text-2xl font-serif mb-8 text-center md:text-left">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3).map(relatedPost => (
              <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group flex flex-col">
                <div className="relative w-full aspect-[4/5] bg-zinc-100 mb-4 overflow-hidden">
                  <Image 
                    src={relatedPost.coverImage} 
                    alt={relatedPost.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                </div>
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-sec-text mb-2">
                  {relatedPost.category}
                </span>
                <h4 className="font-serif text-lg mb-2 group-hover:text-zinc-600 transition-colors">
                  {relatedPost.title}
                </h4>
                <div className="mt-auto text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                  {relatedPost.datePublished} &middot; {relatedPost.readingTime}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
