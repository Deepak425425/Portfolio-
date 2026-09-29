"use client";
import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";

export default function BeforeAfterPage() {
  const [before, setBefore] = useState<string|null>(null);
  const [after, setAfter] = useState<string|null>(null);
  const [slider, setSlider] = useState(50);
  const [dimensions, setDimensions] = useState<{w: number, h: number} | null>(null);

  const handleBefore = (e: any) => {
    const url = URL.createObjectURL(e.target.files[0]);
    setBefore(url);
    const img = new Image();
    img.onload = () => setDimensions({ w: img.width, h: img.height });
    img.src = url;
  };
  const handleAfter = (e: any) => setAfter(URL.createObjectURL(e.target.files[0]));

  return (
    <ToolLayout title="Before & After" description="Compare two images side by side.">
      <div className="flex flex-col gap-8 items-center max-w-6xl mx-auto h-full">
        <div className="flex gap-4 w-full">
          <input type="file" onChange={handleBefore} className="border p-2 w-full" accept="image/*" />
          <input type="file" onChange={handleAfter} className="border p-2 w-full" accept="image/*" />
        </div>
        {(before && after) && (
          <div className="w-full flex-1 min-h-[400px] flex items-center justify-center bg-zinc-100 p-8 rounded-xl border border-zinc-200">
             <div 
               className="relative max-w-full max-h-[70vh] shadow-xl overflow-hidden select-none bg-white" 
               style={{ aspectRatio: dimensions ? `${dimensions.w}/${dimensions.h}` : 'auto', height: '100%' }}
             >
               <img src={after} className="absolute inset-0 w-full h-full max-h-[70vh] object-contain" />
               <div className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.5)]" style={{ width: `${slider}%` }}>
                 <img src={before} className="absolute inset-0 w-full h-full max-h-[70vh] object-contain max-w-none" style={{ width: '100%', height: '100%', objectPosition: 'left center' }} />
               </div>
               <input type="range" min="0" max="100" value={slider} onChange={e=>setSlider(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-10" />
             </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}