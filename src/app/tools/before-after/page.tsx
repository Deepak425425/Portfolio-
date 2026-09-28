"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";

export default function BeforeAfterPage() {
  const [before, setBefore] = useState<string|null>(null);
  const [after, setAfter] = useState<string|null>(null);
  const [slider, setSlider] = useState(50);

  const handleBefore = (e: any) => setBefore(URL.createObjectURL(e.target.files[0]));
  const handleAfter = (e: any) => setAfter(URL.createObjectURL(e.target.files[0]));

  return (
    <ToolLayout title="Before & After" description="Compare two images side by side.">
      <div className="flex flex-col gap-8 items-center max-w-4xl mx-auto">
        <div className="flex gap-4 w-full">
          <input type="file" onChange={handleBefore} className="border p-2 w-full" accept="image/*" />
          <input type="file" onChange={handleAfter} className="border p-2 w-full" accept="image/*" />
        </div>
        {(before && after) && (
          <div className="relative w-full aspect-video bg-zinc-200 overflow-hidden select-none border">
            <img src={after} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ width: `${slider}%` }}>
              <img src={before} className="absolute inset-0 w-full h-full object-cover max-w-none" style={{ width: '100vw' }} />
              <div className="absolute inset-y-0 right-0 w-1 bg-white cursor-col-resize shadow-lg"></div>
            </div>
            <input type="range" min="0" max="100" value={slider} onChange={e=>setSlider(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}