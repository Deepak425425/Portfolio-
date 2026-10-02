"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../Navigation";
import Footer from "../Footer";

interface ToolLayoutProps {
  title: string;
  description: string;
  category?: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, description, category = "TOOL", children }: ToolLayoutProps) {
  const [isNightMode, setIsNightMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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

  const mainClasses = `tool-mobile-fix min-h-screen flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300 ${isNightMode ? 'tool-dark bg-[#121212] text-zinc-200' : 'bg-[#F7F6F2] text-[#111111]'}`;

  return (
    <main className={mainClasses} data-theme={isNightMode ? "dark" : "light"}>


      {/* AMBIENT GRADIENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#DCD7FF] opacity-40 blur-[120px] rounded-full transition-opacity duration-300"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[#E4E9FF] opacity-40 blur-[120px] rounded-full transition-opacity duration-300"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#FFF4E6] opacity-40 blur-[120px] rounded-full transition-opacity duration-300"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#F8DDEB] opacity-40 blur-[120px] rounded-full transition-opacity duration-300"></div>
      </div>

      <div className="z-10 flex flex-col min-h-screen">
        <Navigation />
        
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col">
          
          {/* Header Section */}
          <div className="mb-8 md:mb-12 flex flex-col items-start gap-4 w-full">
            <div className="flex justify-between items-center w-full">
              <Link 
                href="/tools" 
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-[#8B7CFF] transition-colors flex items-center gap-2"
              >
                <span className="text-[14px]">←</span> Back to Tools
              </Link>
              
              {mounted && (
                <button 
                  onClick={toggleNightMode}
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-200 bg-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors shadow-sm"
                  title="Toggle Night Mode"
                >
                  {isNightMode ? '☀ LIGHT' : '☾ DARK'}
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#8B7CFF]">{category}</span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#111111] tracking-tight transition-colors duration-300">{title}</h1>
              <p className="text-sm md:text-base text-zinc-500 max-w-2xl mt-2 leading-relaxed transition-colors duration-300">{description}</p>
            </div>
          </div>

          {/* Workspace */}
          <div className="flex-1 flex flex-col relative z-20">
            {children}
          </div>
          
        </div>
        
        <Footer />
      </div>
    </main>
  );
}
