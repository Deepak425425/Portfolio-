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
    <div className="flex flex-col h-full bg-white border border-zinc-200 p-6 md:p-8 hover:border-[#111111] transition-colors group">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-serif text-2xl text-[#111111] group-hover:text-black transition-colors">{name}</h3>
        <span className="inline-block px-2 py-1 bg-zinc-100 text-[9px] uppercase tracking-widest font-bold text-zinc-500 rounded-sm">
          {status}
        </span>
      </div>
      <p className="text-zinc-500 font-light text-sm mb-8 leading-relaxed flex-grow">
        {description}
      </p>
      <Link
        href={route}
        className="w-full inline-block text-center py-3 border border-zinc-200 text-[#111111] text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-colors"
      >
        Open Tool
      </Link>
    </div>
  );
}
