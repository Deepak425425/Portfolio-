import React from "react";
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
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navigation />
      
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col">
        
        {/* Header Section */}
        <div className="mb-8 md:mb-12 flex flex-col items-start gap-4">
          <Link 
            href="/tools" 
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-sec-text hover:text-accent transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Tools
          </Link>
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent">{category}</span>
            <h1 className="text-3xl md:text-5xl font-serif text-foreground tracking-tight">{title}</h1>
            <p className="text-sm md:text-base text-sec-text max-w-2xl mt-2">{description}</p>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
      </div>
      
      <Footer />
    </main>
  );
}
