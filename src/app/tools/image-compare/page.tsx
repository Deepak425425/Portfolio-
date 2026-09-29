"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getGrotonExportFilename } from "@/utils/export";

type Mode = "slider" | "side" | "top" | "diff";

export default function ImageComparePage() {
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  
  const [mode, setMode] = useState<Mode>("slider");
  const [labels, setLabels] = useState({ before: "BEFORE", after: "AFTER" });

  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const [diffUrl, setDiffUrl] = useState<string | null>(null);

  // Drag handles for dropzones
  const [dragBefore, setDragBefore] = useState(false);
  const [dragAfter, setDragAfter] = useState(false);

  useEffect(() => {
    return () => {
      if (beforeUrl) URL.revokeObjectURL(beforeUrl);
      if (afterUrl) URL.revokeObjectURL(afterUrl);
      if (diffUrl) URL.revokeObjectURL(diffUrl);
    };
  }, []);

  const handleBeforeUpload = (files: FileList | null) => {
    if (files && files[0] && files[0].type.startsWith("image/")) {
      setBeforeUrl(URL.createObjectURL(files[0]));
    }
  };

  const handleAfterUpload = (files: FileList | null) => {
    if (files && files[0] && files[0].type.startsWith("image/")) {
      setAfterUrl(URL.createObjectURL(files[0]));
    }
  };

  // Handle slider drag
  useEffect(() => {
    if (mode !== "slider") return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    };
    const handleUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchend", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, mode]);

  // Generate difference image
  useEffect(() => {
    if (mode !== "diff" || !beforeUrl || !afterUrl) return;

    const generateDiff = async () => {
      const img1 = new Image();
      const img2 = new Image();
      
      await Promise.all([
        new Promise((res) => { img1.onload = res; img1.src = beforeUrl; }),
        new Promise((res) => { img2.onload = res; img2.src = afterUrl; })
      ]);

      const w = Math.max(img1.width, img2.width);
      const h = Math.max(img1.height, img2.height);

      const cvs1 = document.createElement("canvas");
      cvs1.width = w; cvs1.height = h;
      const ctx1 = cvs1.getContext("2d")!;
      ctx1.drawImage(img1, 0, 0, w, h);

      const cvs2 = document.createElement("canvas");
      cvs2.width = w; cvs2.height = h;
      const ctx2 = cvs2.getContext("2d")!;
      ctx2.drawImage(img2, 0, 0, w, h);

      const data1 = ctx1.getImageData(0, 0, w, h).data;
      const data2 = ctx2.getImageData(0, 0, w, h).data;

      const diffCvs = document.createElement("canvas");
      diffCvs.width = w; diffCvs.height = h;
      const diffCtx = diffCvs.getContext("2d")!;
      const diffImageData = diffCtx.createImageData(w, h);
      const diffData = diffImageData.data;

      for (let i = 0; i < data1.length; i += 4) {
        // Simple absolute difference
        const r = Math.abs(data1[i] - data2[i]);
        const g = Math.abs(data1[i+1] - data2[i+1]);
        const b = Math.abs(data1[i+2] - data2[i+2]);
        // Emphasize difference in red/pink if there is one, otherwise black
        const diffMag = (r + g + b) / 3;
        
        if (diffMag > 5) {
          diffData[i] = 255;
          diffData[i+1] = 50;
          diffData[i+2] = 150;
          diffData[i+3] = 255;
        } else {
          diffData[i] = 10;
          diffData[i+1] = 10;
          diffData[i+2] = 10;
          diffData[i+3] = 255;
        }
      }
      diffCtx.putImageData(diffImageData, 0, 0);
      
      diffCvs.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setDiffUrl(url);
        }
      });
    };

    generateDiff();
  }, [mode, beforeUrl, afterUrl]);

  const handleExport = async () => {
    if (!beforeUrl || !afterUrl) return;

    const img1 = new Image();
    const img2 = new Image();
    
    await Promise.all([
      new Promise((res) => { img1.onload = res; img1.src = beforeUrl; }),
      new Promise((res) => { img2.onload = res; img2.src = afterUrl; })
    ]);

    const cvs = document.createElement("canvas");
    const ctx = cvs.getContext("2d")!;

    // Export Side by side
    const w1 = img1.width;
    const h1 = img1.height;
    const w2 = img2.width;
    const h2 = img2.height;

    const padding = 100;
    const banner = 150;
    const canvasWidth = w1 + w2 + (padding * 3);
    const canvasHeight = Math.max(h1, h2) + banner + (padding * 2);

    cvs.width = canvasWidth;
    cvs.height = canvasHeight;

    // Background
    ctx.fillStyle = "#F7F6F2";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Images
    ctx.drawImage(img1, padding, banner + padding, w1, h1);
    ctx.drawImage(img2, padding * 2 + w1, banner + padding, w2, h2);

    // Labels
    ctx.fillStyle = "#111111";
    ctx.font = "bold 60px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels.before, padding + (w1 / 2), banner + padding - 40);
    ctx.fillText(labels.after, padding * 2 + w1 + (w2 / 2), banner + padding - 40);

    const a = document.createElement("a");
    a.href = cvs.toDataURL("image/jpeg", 0.9);
    a.download = getGrotonExportFilename("comparison-export.jpg");
    a.click();
  };

  const renderWorkspace = () => {
    if (!beforeUrl || !afterUrl) return null;

    if (mode === "slider") {
      return (
        <div 
          ref={sliderRef}
          className="relative w-full h-full min-h-[500px] bg-zinc-100 overflow-hidden cursor-ew-resize select-none"
          onPointerDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          {/* AFTER */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
             <img src={afterUrl} className="w-full h-full max-h-[70vh] object-contain pointer-events-none" />
          </div>

          {/* BEFORE */}
          <div 
            className="absolute inset-0 h-full overflow-hidden border-r-2 border-white pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
             <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center min-w-max" style={{ width: sliderRef.current?.clientWidth || '100%' }}>
               <img src={beforeUrl} className="w-full h-full max-h-[70vh] object-contain pointer-events-none" />
             </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 pointer-events-none z-10 shadow">
            {labels.before}
          </div>
          <div className="absolute top-4 right-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 pointer-events-none z-10 shadow">
            {labels.after}
          </div>

          {/* Handle */}
          <div 
            className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
             <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
               <div className="flex gap-1">
                 <div className="w-0.5 h-3 bg-zinc-300 rounded-full"></div>
                 <div className="w-0.5 h-3 bg-zinc-300 rounded-full"></div>
               </div>
             </div>
          </div>
        </div>
      );
    }

    if (mode === "side") {
      return (
        <div className="w-full h-full min-h-[500px] flex flex-col md:flex-row gap-4">
           <div className="flex-1 min-h-0 bg-zinc-100 relative border border-zinc-200">
             <div className="absolute top-4 left-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 z-10 shadow">{labels.before}</div>
             <img src={beforeUrl} className="w-full h-full max-h-[70vh] object-contain" />
           </div>
           <div className="flex-1 min-h-0 bg-zinc-100 relative border border-zinc-200">
             <div className="absolute top-4 right-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 z-10 shadow">{labels.after}</div>
             <img src={afterUrl} className="w-full h-full max-h-[70vh] object-contain" />
           </div>
        </div>
      );
    }

    if (mode === "top") {
      return (
        <div className="w-full h-full min-h-[700px] flex flex-col gap-4">
           <div className="flex-1 min-h-0 bg-zinc-100 relative border border-zinc-200">
             <div className="absolute top-4 left-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 z-10 shadow">{labels.before}</div>
             <img src={beforeUrl} className="w-full h-full max-h-[70vh] object-contain" />
           </div>
           <div className="flex-1 min-h-0 bg-zinc-100 relative border border-zinc-200">
             <div className="absolute bottom-4 left-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 z-10 shadow">{labels.after}</div>
             <img src={afterUrl} className="w-full h-full max-h-[70vh] object-contain" />
           </div>
        </div>
      );
    }

    if (mode === "diff") {
      return (
        <div className="w-full h-full min-h-[500px] bg-zinc-950 relative border border-zinc-800 flex items-center justify-center">
           <div className="absolute top-4 left-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 z-10 shadow">Difference Map</div>
           {diffUrl ? (
             <img src={diffUrl} className="w-full h-full max-h-[70vh] object-contain p-4" />
           ) : (
             <span className="text-zinc-500 text-xs tracking-widest uppercase font-bold">Computing Difference...</span>
           )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 mt-24">
        <Link href="/tools" className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 hover:text-black mb-8 block">
          ← Back to Tools
        </Link>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 h-[70vh] max-h-[70vh]">
          
          {/* Main Workspace */}
          <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto h-[65vh] max-h-[65vh]">
            {(!beforeUrl || !afterUrl) ? (
              <div className="flex-1 min-h-[500px] flex flex-col md:flex-row gap-6">
                
                {/* Before Upload */}
                <div 
                  className={`flex-1 border-2 border-dashed ${dragBefore ? 'border-[#111111] bg-zinc-50' : 'border-zinc-200'} flex flex-col items-center justify-center p-8 transition-colors relative cursor-pointer group`}
                  onDragOver={(e) => { e.preventDefault(); setDragBefore(true); }}
                  onDragLeave={() => setDragBefore(false)}
                  onDrop={(e) => { e.preventDefault(); setDragBefore(false); handleBeforeUpload(e.dataTransfer.files); }}
                >
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleBeforeUpload(e.target.files)} />
                  {beforeUrl ? (
                    <img src={beforeUrl} className="max-w-full max-h-[70vh] object-contain pointer-events-none" />
                  ) : (
                    <div className="text-center pointer-events-none">
                      <span className="text-3xl mb-4 block text-zinc-300 group-hover:text-black transition-colors">+</span>
                      <h3 className="font-bold text-sm tracking-widest uppercase mb-2">Upload Before</h3>
                      <p className="text-zinc-400 text-xs">Original image</p>
                    </div>
                  )}
                </div>

                {/* After Upload */}
                <div 
                  className={`flex-1 border-2 border-dashed ${dragAfter ? 'border-[#111111] bg-zinc-50' : 'border-zinc-200'} flex flex-col items-center justify-center p-8 transition-colors relative cursor-pointer group`}
                  onDragOver={(e) => { e.preventDefault(); setDragAfter(true); }}
                  onDragLeave={() => setDragAfter(false)}
                  onDrop={(e) => { e.preventDefault(); setDragAfter(false); handleAfterUpload(e.dataTransfer.files); }}
                >
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleAfterUpload(e.target.files)} />
                  {afterUrl ? (
                    <img src={afterUrl} className="max-w-full max-h-[70vh] object-contain pointer-events-none" />
                  ) : (
                    <div className="text-center pointer-events-none">
                      <span className="text-3xl mb-4 block text-zinc-300 group-hover:text-black transition-colors">+</span>
                      <h3 className="font-bold text-sm tracking-widest uppercase mb-2">Upload After</h3>
                      <p className="text-zinc-400 text-xs">Edited or processed image</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              renderWorkspace()
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-[320px] shrink-0 bg-white lg:h-full lg:overflow-y-auto lg:max-h-[85vh]">
             <div className="flex flex-col gap-8">
               <div>
                 <h2 className="font-serif text-3xl text-black mb-2">Image Compare</h2>
                 <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Visual Inspection Tool</p>
               </div>

               <div className="flex flex-col gap-4">
                  <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Compare Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "slider", label: "Slider" },
                      { id: "side", label: "Side by Side" },
                      { id: "top", label: "Top & Bottom" },
                      { id: "diff", label: "Difference" }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id as Mode)}
                        className={`p-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${mode === m.id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Custom Labels</label>
                  <div className="flex flex-col gap-3">
                     <input 
                       type="text" 
                       value={labels.before} 
                       onChange={(e) => setLabels(l => ({...l, before: e.target.value}))}
                       placeholder="Before Label"
                       className="w-full p-3 border border-zinc-200 text-xs outline-none focus:border-[#111111] transition-colors"
                     />
                     <input 
                       type="text" 
                       value={labels.after} 
                       onChange={(e) => setLabels(l => ({...l, after: e.target.value}))}
                       placeholder="After Label"
                       className="w-full p-3 border border-zinc-200 text-xs outline-none focus:border-[#111111] transition-colors"
                     />
                  </div>
               </div>

               <div className="flex flex-col gap-3 mt-auto">
                 <button
                   onClick={() => { setBeforeUrl(null); setAfterUrl(null); }}
                   className="w-full py-4 bg-transparent border border-zinc-200 text-black text-[10px] uppercase tracking-widest font-bold hover:border-[#111111] transition-colors"
                 >
                   Reset Images
                 </button>
                 <button
                   onClick={handleExport}
                   disabled={!beforeUrl || !afterUrl}
                   className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:opacity-50 disabled:bg-[#111111]"
                 >
                   Export Comparison
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
