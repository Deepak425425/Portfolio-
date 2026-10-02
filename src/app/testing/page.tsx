import React from "react";
import Link from "next/link";
import TestingToolCard from "./components/TestingToolCard";

export default function TestingLabPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black selection:bg-[#111111] selection:text-white">
      {/* HEADER */}
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-transparent border-b border-zinc-200">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          GROTON AI
        </Link>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col items-center pt-16 pb-24 px-6 md:px-12 lg:px-24 bg-zinc-50">
        <div className="w-full max-w-[1400px]">
          <div className="mb-16">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-black mb-4">
              Testing Lab
            </h1>
            <p className="font-sans font-light text-zinc-500 text-sm md:text-base max-w-lg">
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
          </div>
        </div>
      </main>
    </div>
  );
}
