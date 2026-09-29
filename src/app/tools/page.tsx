"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// We keep arrays separate to maintain logical categories.
const FEATURED_TOOLS = [
  { id: "filters", name: "Image Filters & Grade", desc: "Professional creative filters and colour grading studio.", link: "/tools/filters", visual: "✦" },
  { id: "image-compare", name: "Image Compare", desc: "Compare two images visually with side-by-side or slider tools.", link: "/tools/image-compare", visual: "◧" },
  { id: "collage", name: "Collage Maker", desc: "Professional grid layout builder with precise constraints.", link: "/tools/collage", visual: "⊞" },
  { id: "border", name: "Image Border", desc: "Add refined frames, shadows, and borders to images.", link: "/tools/image-border", visual: "□" },
];

const UTILITY_TOOLS = [
  { id: "resize", name: "Resize", desc: "Scale images to exact dimensions.", link: "/tools/resize", visual: "⤡" },
  { id: "crop", name: "Crop", desc: "Crop and reframe photos.", link: "/tools/crop", visual: "◩" },
  { id: "compressor", name: "Compress", desc: "Reduce file sizes aggressively.", link: "/tools/compressor", visual: "⇲" },
  { id: "convert", name: "Convert", desc: "Convert formats (JPG, PNG, WebP).", link: "/tools/convert", visual: "⇄" },
  { id: "rotate-flip", name: "Rotate", desc: "Rotate or mirror images.", link: "/tools/rotate-flip", visual: "↺" },
  { id: "rounded-image", name: "Rounded", desc: "Transparent curved corners.", link: "/tools/rounded-image", visual: "╭╮" },
];

const SPECIALIZED_TOOLS = [
  { id: "passport-photo", name: "Passport Photo Maker", desc: "Format to standard ID dimensions.", link: "/tools/passport-photo", visual: "🪪" },
  { id: "color-palette", name: "Color Palette", desc: "Extract dominant hex colors.", link: "/tools/color-palette", visual: "🎨" },
  { id: "image-quality-checker", name: "Quality Checker", desc: "Analyze images for web & print suitability.", link: "/tools/image-quality-checker", visual: "✓" },
  { id: "image-upscaler", name: "Image Upscaler", desc: "Increase resolution preserving quality.", link: "/tools/image-upscaler", visual: "⤢" },
  { id: "watermark", name: "Watermark", desc: "Apply repeated watermark patterns.", link: "/tools/watermark", visual: "©" },
  { id: "before-after", name: "Before & After", desc: "Create vertical comparison sliders.", link: "/tools/before-after", visual: "◨" },
];

const OTHER_TOOLS = [
  { id: "metadata-remover", name: "Metadata Remover", desc: "Strip EXIF data from photos.", link: "/tools/metadata-remover", visual: "✕" },
  { id: "image-cleanup", name: "Image Cleanup", desc: "Remove unwanted elements & dust.", link: "/tools/image-cleanup", visual: "✨" },
  { id: "blur", name: "Image Blur", desc: "Apply gaussian blur effects.", link: "/tools/blur", visual: "☁" },
  { id: "pixelate", name: "Pixelate Image", desc: "Create 8-bit style pixelation.", link: "/tools/pixelate", visual: "■" },
  { id: "canvas", name: "Canvas / Padding", desc: "Add surrounding padding/margins.", link: "/tools/canvas", visual: "⛶" },
  { id: "grid-cutter", name: "Grid Cutter", desc: "Slice an image into an Instagram grid.", link: "/tools/grid-cutter", visual: "▦" },
  { id: "meme", name: "Meme Generator", desc: "Add classic impact font text.", link: "/tools/meme", visual: "T" },
  { id: "pdf-contact-sheet", name: "Contact Sheet", desc: "Generate multi-image PDF galleries.", link: "/tools/pdf-contact-sheet", visual: "▤" },
  { id: "bulk-image-renamer", name: "Bulk Image Renamer", desc: "Rename hundreds of images quickly.", link: "/tools/bulk-image-renamer", visual: "✎" },
  { id: "face-blur", name: "Face Blur", desc: "Auto-detect and blur faces.", link: "/tools/face-blur", visual: "👤" },
  { id: "background-remover", name: "Background Remover", desc: "Isolate subjects instantly.", link: "/tools/background-remover", visual: "✂" },
  { id: "social-resizer", name: "Social Media Resizer", desc: "Format for Instagram, YouTube, etc.", link: "/tools/social-resizer", visual: "📱" },
  { id: "favicon", name: "Favicon Generator", desc: "Create .ico and webapp icons.", link: "/tools/favicon", visual: "◆" },
  { id: "color-picker", name: "Color Picker", desc: "Sample specific pixels.", link: "/tools/color-picker", visual: "💉" },
];

const ALL_TOOLS = [...FEATURED_TOOLS, ...UTILITY_TOOLS, ...SPECIALIZED_TOOLS, ...OTHER_TOOLS];

const ToolCard = ({ tool }: { tool: any }) => (
  <Link 
    href={tool.link} 
    className="group bg-[#FCFCFB] border border-zinc-200 p-6 flex flex-col rounded-2xl hover:border-[#8B7CFF] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden h-full min-h-[170px] w-full"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B7CFF] opacity-0 group-hover:opacity-5 blur-[50px] transition-opacity rounded-full pointer-events-none"></div>
    
    {/* Consistent 48x48 Icon Container */}
    <div className="w-12 h-12 bg-white shadow-sm border border-zinc-100 rounded-xl flex items-center justify-center text-xl z-10 shrink-0 mb-5 text-[#8B7CFF]">
      {tool.visual || "🔧"}
    </div>
    
    <div className="flex flex-col gap-2 z-10 h-full">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-sm tracking-tight text-[#111111] leading-none mt-1">{tool.name}</h3>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[95%]">{tool.desc}</p>
    </div>
  </Link>
);

export default function ToolsLandingPage() {
  const [search, setSearch] = useState("");

  const searchActive = search.trim().length > 0;
  const filteredTools = searchActive ? ALL_TOOLS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.desc.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <main className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#111111] font-sans relative overflow-x-hidden">
      {/* AMBIENT GRADIENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#DCD7FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[#E4E9FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#FFF4E6] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#F8DDEB] opacity-30 blur-[120px] rounded-full"></div>
      </div>

      <Navigation />
      
      {/* SAME MASTER CONTAINER WIDTH */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-8 py-16 md:py-24 z-10">
        
        {/* HERO */}
        <div className="flex flex-col items-center justify-center text-center gap-4 mb-24 w-full">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8B7CFF]">GROTON AI / TOOLS</span>
            <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight">Image tools, without the busywork.</h1>
            <p className="text-base text-zinc-500 mt-2 font-light tracking-wide">Small tools. Serious image work.</p>
            
            <div className="relative group mt-8 w-full max-w-md">
              <input 
                type="text" 
                placeholder="Search tools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border border-zinc-200 px-6 py-4 text-sm w-full rounded-full focus:outline-none focus:border-[#8B7CFF] transition-all shadow-sm"
              />
            </div>
        </div>

        {searchActive ? (
          <div className="flex flex-col gap-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredTools.map(tool => (
                 <ToolCard key={tool.id} tool={tool} />
               ))}
               {filteredTools.length === 0 && (
                 <div className="col-span-full text-center py-12 text-zinc-400 text-xs uppercase tracking-widest">No tools found.</div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            
            <section className="flex flex-col gap-6">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {FEATURED_TOOLS.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Utility</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {UTILITY_TOOLS.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Specialized</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {SPECIALIZED_TOOLS.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">All Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {OTHER_TOOLS.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
