"use client";

import React from "react";
import Link from "next/link";

interface TestingToolCardProps {
  name: string;
  description: string;
  status: "EXPERIMENTAL" | "IN DEVELOPMENT" | "BETA" | "TESTING";
  route: string;
}

export default function TestingToolCard({ name, description, status, route }: TestingToolCardProps) {
  return (
    <Link 
      href={route}
      className="flex flex-col h-full bg-white border border-[rgba(0,0,0,0.05)] p-8 [@media(hover:hover)]:hover:border-[#8B7CFF] focus-visible:border-[#8B7CFF] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B7CFF] rounded-[24px] shadow-[0_18px_40px_rgba(0,0,0,0.10)] [@media(hover:hover)]:hover:shadow-[0_25px_55px_rgba(0,0,0,0.12)] transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B7CFF] opacity-0 [@media(hover:hover)]:group-hover:opacity-10 blur-[50px] transition-opacity rounded-full pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-6 z-10">
        <h3 className="font-sans font-bold tracking-[-0.05em] text-xl text-black">{name}</h3>
        <span className="inline-block px-2 py-1 bg-[#F9F8F6] text-[9px] uppercase tracking-widest font-bold text-[#8B7CFF] rounded-sm border border-[rgba(0,0,0,0.02)]">
          {status}
        </span>
      </div>
      <p className="text-zinc-500 font-light text-sm mb-8 leading-relaxed flex-grow z-10">
        {description}
      </p>
      <div
        className="w-full inline-block text-center py-4 border border-[rgba(0,0,0,0.05)] rounded-full text-black text-[10px] uppercase tracking-widest font-bold [@media(hover:hover)]:group-hover:bg-[#8B7CFF] [@media(hover:hover)]:group-hover:text-white [@media(hover:hover)]:group-hover:border-[#8B7CFF] transition-colors shadow-sm z-10"
      >
        Open Tool
      </div>
    </Link>
  );
}
