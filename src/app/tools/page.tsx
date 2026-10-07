"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TOOL_REGISTRY } from "@/lib/registry/tools";
import CmsText from "@/components/CmsText";
import AskAIAssistant from "@/components/tools/AskAIAssistant";
import ScrollMechanicalSound from "@/components/tools/ScrollMechanicalSound";

const ToolCard = ({ tool, isNightMode }: { tool: any, isNightMode: boolean }) => (
  <Link 
    href={tool.route || "#"} 
    className={`group ${isNightMode ? 'bg-[#18181A] border-white/[0.04]' : 'bg-white border-[rgba(0,0,0,0.05)]'} p-8 flex flex-col rounded-[24px] hover:border-[#8B7CFF] shadow-[0_18px_40px_rgba(0,0,0,0.10)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden h-full min-h-[190px] w-full`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B7CFF] opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity rounded-full pointer-events-none"></div>
    
    <div className={`w-12 h-12 ${isNightMode ? 'bg-[#222] border-white/5 shadow-none' : 'bg-[#F9F8F6] border-[rgba(0,0,0,0.02)] shadow-sm'} border rounded-[16px] flex items-center justify-center text-xl z-10 shrink-0 mb-6 text-[#8B7CFF] transition-transform duration-500 group-hover:-translate-y-1`}>
      {tool.visual || "🔧"}
    </div>
    
    <div className="flex flex-col gap-2 z-10 h-full">
      <div className="flex justify-between items-start">
        <h3 className={`font-sans font-bold text-base tracking-[-0.05em] leading-none mt-1 ${isNightMode ? 'text-white' : 'text-black'}`}>{tool.name}</h3>
      </div>
      <p className={`text-xs ${isNightMode ? 'text-zinc-400' : 'text-zinc-500'} leading-relaxed max-w-[95%] mt-1`}>{tool.description}</p>
    </div>
  </Link>
);

const SEARCH_PLACEHOLDER_PHRASES = [
  "Search tools...",
  "Search image tools...",
  "Search background remover...",
  "Search tools..."
];
const BASE_SEARCH_PREFIX = "Search";

function useSearchPlaceholderTypewriter(isPaused: boolean) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState(SEARCH_PLACEHOLDER_PHRASES[0]);
  const [phase, setPhase] = useState<'holding' | 'deleting' | 'pause_before_type' | 'typing'>('holding');

  React.useEffect(() => {
    if (isPaused) return;

    let timeoutId: NodeJS.Timeout;

    if (phase === 'holding') {
      timeoutId = setTimeout(() => {
        setPhase('deleting');
      }, 2100);
    } else if (phase === 'deleting') {
      if (currentText.length > BASE_SEARCH_PREFIX.length) {
        timeoutId = setTimeout(() => {
          setCurrentText(prev => prev.slice(0, -1));
        }, 55);
      } else {
        timeoutId = setTimeout(() => {
          setPhase('pause_before_type');
        }, 320);
      }
    } else if (phase === 'pause_before_type') {
      timeoutId = setTimeout(() => {
        setPhraseIndex(prev => (prev + 1) % SEARCH_PLACEHOLDER_PHRASES.length);
        setPhase('typing');
      }, 80);
    } else if (phase === 'typing') {
      const target = SEARCH_PLACEHOLDER_PHRASES[phraseIndex];
      if (currentText.length < target.length) {
        timeoutId = setTimeout(() => {
          setCurrentText(target.slice(0, currentText.length + 1));
        }, 85);
      } else {
        timeoutId = setTimeout(() => {
          setPhase('holding');
        }, 2100);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [isPaused, phase, currentText, phraseIndex]);

  return currentText;
}

const ASK_AI_ENABLED = false;

export default function ToolsLandingPage() {
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const placeholderText = useSearchPlaceholderTypewriter(!mounted || isFocused || search.length > 0);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("groton_tool_theme");
    if (saved === "dark") {
      setIsNightMode(true);
    }
  }, []);

  const toggleNightMode = () => {
    setIsNightMode(prev => {
      const next = !prev;
      localStorage.setItem("groton_tool_theme", next ? "dark" : "light");
      return next;
    });
  };

  
  const searchActive = search.trim().length > 0;
  
  const AVAILABLE_TOOLS = TOOL_REGISTRY.filter(t => t.category !== 'planned');
  
  const filteredTools = searchActive ? AVAILABLE_TOOLS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    (t.keywords && t.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())))
  ) : [];

  const SECTIONS = [
    {
      title: "Featured",
      ids: ["image-compare", "collage", "background-remover"]
    },
    {
      title: "Image Tools",
      ids: [
        "resize", "crop", "compressor", "convert", "rotate-flip", "rounded-image",
        "canvas", "grid-cutter", "social-resizer", "passport-photo",
        "filters", "blur", "pixelate", "color-palette", "color-picker", "hex-to-color", "watermark",
        "favicon", "meme"
      ]
    },
    {
      title: "Video Tools",
      ids: ["video-to-gif", "video-compress", "video-compare", "video-audio-swap", "shot-cuts"]
    },
    {
      title: "Audio Tools",
      ids: ["audio-splicer", "silence-remover"]
    },
    {
      title: "PDF & Document Tools",
      ids: ["pdf-contact-sheet"]
    },
    {
      title: "File & Metadata",
      ids: ["check-metadata", "metadata-remover", "image-quality-checker", "bulk-image-renamer"]
    },
    {
      title: "Specialized / AI",
      ids: ["image-upscaler", "image-cleanup", "background-remover", "watermark-remover", "face-blur", "cinematic-focus", "hard-cut-motion-prompt", "script-board"]
    }
  ];

  const mainClasses = `min-h-screen flex flex-col font-sans relative overflow-x-hidden transition-colors duration-500 ${isNightMode ? 'bg-[#0A0A0A] text-zinc-200 selection:bg-[#8B7CFF] selection:text-white' : 'bg-[#F9F8F6] text-black selection:bg-[#8B7CFF] selection:text-white'}`;

  return (
    <main className={mainClasses} data-theme={isNightMode ? "dark" : "light"}>
      {/* GRID */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ${isNightMode ? 'opacity-20' : 'opacity-100'}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isNightMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.035)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isNightMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.035)'} 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage: "linear-gradient(to bottom, black, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />

      {/* AMBIENT GRADIENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 transition-opacity duration-700 opacity-30">
         <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-700 ${isNightMode ? 'bg-[#8B7CFF]/20' : 'bg-[#DCD7FF]'}`}></div>
         <div className={`absolute top-[20%] right-[-10%] w-[40%] h-[60%] blur-[120px] rounded-full transition-colors duration-700 ${isNightMode ? 'bg-[#5B4CFF]/10' : 'bg-[#E4E9FF]'}`}></div>
      </div>

      <Header isNightMode={isNightMode} />
      
      <div className="flex-1 w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 xl:px-20 pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-24 z-10">
        
        {/* TOP CONTROLS: SOUND TOGGLE & LIGHT/DARK TOGGLE */}
        <div className="w-full flex justify-end items-center gap-2.5 mb-4">
           {mounted && (
             <>
               <ScrollMechanicalSound isNightMode={isNightMode} />
               <button 
                 onClick={toggleNightMode}
                 className={`flex items-center gap-2 px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors shadow-sm ${isNightMode ? 'bg-[#18181A] border-white/10 hover:bg-[#222] text-zinc-300' : 'border-[rgba(0,0,0,0.05)] bg-white hover:bg-zinc-50 text-black'}`}
                 title="Toggle Night Mode"
               >
                 {isNightMode ? '☀ LIGHT' : '☾ DARK'}
               </button>
             </>
           )}
        </div>
        
        {/* HERO */}
        <div className="flex flex-col items-center justify-center text-center gap-4 mb-16 sm:mb-20 md:mb-24 w-full relative z-10">
            <CmsText cmsId="tools.hero.label" as="span" className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8B7CFF]" fallback="GROTON AI / TOOLS" />
            <CmsText cmsId="tools.hero.heading" as="h1" className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-[76px] font-sans font-bold tracking-[-0.05em] leading-tight max-w-4xl ${isNightMode ? 'text-white' : 'text-black'}`} fallback="Save the time. Keep the creativity." />
            <CmsText cmsId="tools.hero.desc" as="p" className={`text-base md:text-lg mt-2 font-light tracking-wide max-w-2xl ${isNightMode ? 'text-zinc-400' : 'text-zinc-500'}`} fallback="Built to make your creative workflow faster." />
            
            {/* Single Premium Search Bar */}
            <div className={`relative group mt-8 sm:mt-10 w-full max-w-lg xl:max-w-xl mx-auto rounded-full overflow-hidden p-[1px] transition-shadow duration-700 hover:shadow-[0_8px_30px_rgba(139,124,255,0.15)] focus-within:shadow-[0_8px_30px_rgba(139,124,255,0.2)]`}>
              
              {/* Animated Gradient Border Layer */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-full opacity-80 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-700">
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] motion-safe:animate-[spin_6s_linear_infinite]"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #8B7CFF 15%, #4C82FF 25%, transparent 40%, transparent 60%, #FF96C8 75%, #FFB47C 85%, transparent 100%)'
                  }}
                />
                {/* Reduced motion fallback */}
                <div className="absolute inset-0 hidden motion-reduce:block bg-gradient-to-r from-[rgba(139,124,255,0.4)] via-[rgba(76,130,255,0.3)] to-[rgba(139,124,255,0.4)]"></div>
              </div>
              
              {/* Inner Input Area (Opaque to mask center) */}
              <input 
                type="text" 
                aria-label="Search tools"
                placeholder={!mounted ? "Search tools..." : ""}
                value={search}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={e => setSearch(e.target.value)}
                className={`relative z-10 w-full rounded-full outline-none px-8 py-5 text-sm transition-all ${
                  isNightMode 
                    ? 'bg-[#18181A] text-white placeholder:text-zinc-500' 
                    : 'bg-white text-black placeholder:text-zinc-400'
                }`}
              />

              {/* Animated Typewriter Placeholder Layer */}
              {mounted && !isFocused && !search && (
                <div 
                  className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 z-20 flex items-center text-sm font-sans select-none overflow-hidden max-w-[calc(100%-64px)] whitespace-nowrap transition-opacity duration-150 group-focus-within:opacity-0"
                  aria-hidden="true"
                >
                  <span className={`transition-colors duration-500 ${isNightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {placeholderText}
                  </span>
                  <span 
                    className="inline-block w-[1.5px] h-[14px] bg-[#8B7CFF] ml-[2px] rounded-[1px] animate-subtle-caret" 
                  />
                </div>
              )}
            </div>
        </div>

        {searchActive ? (
          <div className="flex flex-col gap-6">
            <h2 className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isNightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredTools.map(tool => (
                 <ToolCard key={tool.id} tool={tool} isNightMode={isNightMode} />
               ))}
               {filteredTools.length === 0 && (
                 <div className="col-span-full text-center py-12 text-zinc-400 text-xs uppercase tracking-widest">No tools found.</div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {SECTIONS.map((section, idx) => {
              const tools = section.ids.map(id => AVAILABLE_TOOLS.find(t => t.id === id)).filter(Boolean);
              if (tools.length === 0) return null;
              
              return (
                <section 
                  key={idx} 
                  id={section.title === "Image Tools" ? "image-tools" : undefined} 
                  className="flex flex-col gap-8 scroll-mt-24 md:scroll-mt-32"
                >
                  <h2 className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isNightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{section.title}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool: any) => (
                      <ToolCard key={`${section.title}-${tool.id}`} tool={tool} isNightMode={isNightMode} />
                    ))}
                    
                    {/* Add Testing Lab card only in the very last section */}
                    {idx === SECTIONS.length - 1 && (
                      <Link 
                        href="/testing" 
                        className={`group ${
                          isNightMode 
                            ? 'bg-[#18181A] hover:bg-[#8B7CFF]/[0.04] border-[#8B7CFF]/10 hover:border-[#8B7CFF]/30' 
                            : 'bg-[#F9F8FF] hover:bg-[#F0EEFF] border-[#8B7CFF]/15 hover:border-[#8B7CFF]/40'
                        } p-8 flex flex-col rounded-[24px] shadow-[0_18px_40px_rgba(0,0,0,0.10)] hover:shadow-[0_25px_55px_rgba(139,124,255,0.08)] transition-all duration-500 relative overflow-hidden h-full min-h-[190px] w-full`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B7CFF] opacity-10 group-hover:opacity-20 blur-[50px] transition-opacity rounded-full pointer-events-none"></div>
                        
                        <div className="flex flex-col gap-2 z-10 h-full">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-sans font-bold text-base tracking-[-0.05em] leading-none mt-1 ${isNightMode ? 'text-white' : 'text-black'}`}>TESTING LAB</h3>
                          </div>
                          <p className={`text-xs ${isNightMode ? 'text-[#A39ED1]/70' : 'text-[#6A639A]/90'} leading-relaxed max-w-[95%] mt-1 mb-4`}>Experimental tools and features in development.</p>
                          
                          <div className={`mt-auto text-[10px] uppercase tracking-widest font-bold text-[#8B7CFF] transition-colors flex items-center gap-2`}>
                            OPEN TESTING LAB <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
        
        {ASK_AI_ENABLED && <AskAIAssistant />}
      </div>
      <Footer />
    </main>
  );
}
