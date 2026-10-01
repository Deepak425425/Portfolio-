"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { TOOL_REGISTRY } from "@/lib/registry/tools";

const ToolCard = ({ tool }: { tool: any }) => (
  <Link 
    href={tool.route || "#"} 
    className="group bg-[#FCFCFB] border border-zinc-200 p-6 flex flex-col rounded-2xl hover:border-[#8B7CFF] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden h-full min-h-[170px] w-full"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B7CFF] opacity-0 group-hover:opacity-5 blur-[50px] transition-opacity rounded-full pointer-events-none"></div>
    
    <div className="w-12 h-12 bg-white shadow-sm border border-zinc-100 rounded-xl flex items-center justify-center text-xl z-10 shrink-0 mb-5 text-[#8B7CFF]">
      {tool.visual || "🔧"}
    </div>
    
    <div className="flex flex-col gap-2 z-10 h-full">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-sm tracking-tight text-[#111111] leading-none mt-1">{tool.name}</h3>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[95%]">{tool.description}</p>
    </div>
  </Link>
);

import AskAIAssistant from "@/components/tools/AskAIAssistant";

// FEATURE FLAG: Toggle this to true when Ask AI is ready to be restored
const ASK_AI_ENABLED = false;

export default function ToolsLandingPage() {
  const [search, setSearch] = useState("");

  const searchActive = search.trim().length > 0;
  
  // Filter out planned tools for the UI
  const AVAILABLE_TOOLS = TOOL_REGISTRY.filter(t => t.category !== 'planned');
  
  const filteredTools = searchActive ? AVAILABLE_TOOLS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const FEATURED_TOOLS = AVAILABLE_TOOLS.filter(t => t.category === 'featured');
  const UTILITY_TOOLS = AVAILABLE_TOOLS.filter(t => t.category === 'utility');
  const SPECIALIZED_TOOLS = AVAILABLE_TOOLS.filter(t => t.category === 'specialized');
  const OTHER_TOOLS = AVAILABLE_TOOLS.filter(t => t.category === 'other');


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
                
                {/* TESTING LAB CARD */}
                <Link 
                  href="/testing" 
                  className="group bg-zinc-900 border border-zinc-800 p-6 flex flex-col rounded-2xl hover:border-zinc-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden h-full min-h-[170px] w-full"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity rounded-full pointer-events-none"></div>
                  
                  <div className="w-12 h-12 bg-zinc-800 shadow-sm border border-zinc-700 rounded-xl flex items-center justify-center text-xl z-10 shrink-0 mb-5 text-zinc-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  
                  <div className="flex flex-col gap-2 z-10 h-full">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm tracking-tight text-white leading-none mt-1">TESTING LAB</h3>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded bg-zinc-800/50">PRIVATE / LOCKED</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[95%] mb-4">Experimental tools and features in development.</p>
                    
                    <div className="mt-auto text-[9px] uppercase tracking-widest font-bold text-zinc-300 group-hover:text-white transition-colors flex items-center gap-1">
                      OPEN TESTING LAB <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </Link>
              </div>
            </section>

          </div>
        )}
        
        {/* Floating ASK AI Assistant (Temporarily hidden via feature flag) */}
        {ASK_AI_ENABLED && <AskAIAssistant />}
      </div>
      <Footer />
    </main>
  );
}
