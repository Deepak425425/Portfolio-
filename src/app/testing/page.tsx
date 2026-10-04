import React from "react";
import Link from "next/link";
import TestingToolCard from "./components/TestingToolCard";

export default function TestingLabPage() {
  return (
    
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-[#8B7CFF] selection:text-white relative">
      {/* Subtle grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
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

      {/* HEADER */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[1400px] z-50 flex justify-between items-center px-4 py-3 md:px-6 md:py-4 bg-white/70 backdrop-blur-md border border-[rgba(0,0,0,0.05)] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-xs uppercase text-black hover:opacity-70 transition-opacity">
          GROTON AI
        </Link>
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#8B7CFF] px-3 py-1 bg-[#8B7CFF]/10 rounded-full">
          Testing Lab
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col items-center pt-40 pb-24 px-6 md:px-12 lg:px-24 z-10">
        <div className="w-full max-w-[1400px]">
          <div className="mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8B7CFF] mb-4 block">INTERNAL</span>
            <h1 className="font-sans font-bold tracking-[-0.05em] text-4xl md:text-5xl lg:text-6xl text-black mb-4">
              Testing Lab
            </h1>
            <p className="font-sans font-light text-zinc-500 text-sm md:text-base max-w-lg leading-relaxed">
              Experimental tools and features in development. These tools may be unstable or incomplete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">


            {/* Note: In the future, tools will be added here like: */}
            <TestingToolCard 
              name="Price Calculator" 
              description="Estimate your visual production cost and generate a live quotation sheet." 
              status="BETA" 
              route="/testing/price-calculator" 
            />
            
            <TestingToolCard 
              name="Script Board" 
              description="Create and organize visual scenes, motion prompts, reference images and notes in one storyboard." 
              status="EXPERIMENTAL" 
              route="/testing/script-board" 
            />
            <TestingToolCard 
              name="Image Border" 
              description="Add refined frames, shadows, and borders to images. (Moved from public tools)" 
              status="TESTING" 
              route="/testing/image-border" 
            />
            <TestingToolCard 
              name="Video Editor" 
              description="Trim, split, reorder and export video clips in your browser. (Moved from public tools)" 
              status="TESTING" 
              route="/testing/video-editor" 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
