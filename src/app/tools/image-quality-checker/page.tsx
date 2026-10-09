"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { getGrotonExportFilename } from "@/utils/export";

type ImageStats = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  url: string;
  sharpness?: string; // Estimated sharpness
};

export default function QualityCheckerPage() {
  const [images, setImages] = useState<ImageStats[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImg = images[activeIndex];

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newStats: ImageStats[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      
      const stats = await analyzeImage(file);
      newStats.push(stats);
    }
    
    setImages(prev => [...prev, ...newStats]);
  };

  const analyzeImage = (file: File): Promise<ImageStats> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: file.size,
          type: file.type.split('/')[1].toUpperCase() || "UNKNOWN",
          width: img.width,
          height: img.height,
          url
        });
      };
      img.src = url;
    });
  };

  const getStatus = (stat: ImageStats, type: "resolution" | "size" | "aspect" | "web" | "print" | "social") => {
    switch (type) {
      case "resolution":
        return stat.width >= 1000 && stat.height >= 1000 ? "✓ Good" : "⚠ Low";
      case "size":
        return stat.size <= 5 * 1024 * 1024 ? "✓ Good" : "⚠ Large";
      case "aspect":
        return "✓ Good"; // Any aspect ratio is fine, it just varies by platform
      case "web":
        return stat.size <= 1024 * 1024 ? "✓" : "⚠"; // Under 1MB is web ready
      case "print":
        return stat.width >= 2400 && stat.height >= 2400 ? "✓" : "⚠"; // Min ~8x8 at 300DPI
      case "social":
        return stat.width >= 1080 && stat.height >= 1080 ? "✓" : "⚠";
    }
  };

  const downloadReport = () => {
    if (images.length === 0) return;
    let csv = "FILE,RESOLUTION,SIZE,FORMAT,WEB READY,PRINT READY,SOCIAL READY\n";
    images.forEach(img => {
      const res = `${img.width}x${img.height}`;
      const sizeStr = (img.size / 1024).toFixed(1) + " KB";
      const web = getStatus(img, "web") === "✓" ? "Yes" : "No";
      const print = getStatus(img, "print") === "✓" ? "Yes" : "No";
      const social = getStatus(img, "social") === "✓" ? "Yes" : "No";
      csv += `${img.name},${res},${sizeStr},${img.type},${web},${print},${social}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getGrotonExportFilename("quality-report.csv");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 mt-24">
        <h1 className="sr-only">Image Quality Checker</h1>
        <Link href="/tools" className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 hover:text-black mb-8 block">
          ← Back to Tools
        </Link>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 h-[70vh] max-h-[70vh]">
          
          {/* Main Workspace */}
          <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto h-[65vh] max-h-[65vh]">
            {images.length === 0 ? (
              <div 
                className={`flex-1 min-h-[500px] border-2 border-dashed ${isDragging ? 'border-[#111111] bg-zinc-50' : 'border-zinc-200'} flex flex-col items-center justify-center p-8 transition-colors`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
              >
                <div className="text-center mb-8">
                  <h3 className="font-serif text-3xl mb-2">Image Quality Checker</h3>
                  <p className="text-zinc-500 text-sm">Upload images to analyze resolution, size, and print/web suitability.</p>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors">
                  Upload Images
                </button>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-full">
                {/* Visual Preview */}
                <div className="w-full h-full min-h-0 bg-zinc-100 flex items-center justify-center p-4 relative border border-zinc-200">
                  <img src={activeImg.url} className="max-w-full max-h-[60vh] object-contain shadow-md" />
                </div>
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-100">
                    {images.map((img, idx) => (
                      <button 
                        key={img.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-16 h-16 shrink-0 relative overflow-hidden border-2 transition-colors ${activeIndex === idx ? 'border-[#111111]' : 'border-transparent'}`}
                      >
                        <img src={img.url} className="w-full h-full max-h-[70vh] object-cover" />
                      </button>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 shrink-0 border-2 border-dashed border-zinc-200 flex items-center justify-center hover:border-[#111111] transition-colors">
                      <span className="text-xl text-zinc-400">+</span>
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  </div>
                )}

                {/* Bulk Report Table */}
                {images.length > 1 && (
                  <div className="mt-4 border border-zinc-200 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-500">
                        <tr>
                          <th className="p-3 border-b border-zinc-200 font-bold">File</th>
                          <th className="p-3 border-b border-zinc-200 font-bold">Resolution</th>
                          <th className="p-3 border-b border-zinc-200 font-bold">Size</th>
                          <th className="p-3 border-b border-zinc-200 font-bold">Web</th>
                          <th className="p-3 border-b border-zinc-200 font-bold">Print</th>
                        </tr>
                      </thead>
                      <tbody>
                        {images.map((img, idx) => (
                          <tr key={img.id} className={`cursor-pointer hover:bg-zinc-50 ${activeIndex === idx ? 'bg-zinc-100' : ''}`} onClick={() => setActiveIndex(idx)}>
                            <td className="p-3 border-b border-zinc-100 truncate max-w-[150px]" title={img.name}>{img.name}</td>
                            <td className="p-3 border-b border-zinc-100">{img.width}×{img.height}</td>
                            <td className="p-3 border-b border-zinc-100">{(img.size / 1024).toFixed(1)} KB</td>
                            <td className="p-3 border-b border-zinc-100">{getStatus(img, "web")}</td>
                            <td className="p-3 border-b border-zinc-100">{getStatus(img, "print")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-[320px] shrink-0 bg-white lg:h-full lg:overflow-y-auto lg:max-h-[85vh]">
             {activeImg ? (
               <div className="flex flex-col gap-8">
                 <div>
                   <h2 className="font-serif text-3xl text-black mb-2">Quality Report</h2>
                   <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Analysis complete</p>
                 </div>

                 <div className="flex flex-col gap-4 p-4 border border-zinc-200 bg-zinc-50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Resolution</span>
                      <span className="font-medium text-black">{activeImg.width} × {activeImg.height} px</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-200">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">File Size</span>
                      <span className="font-medium text-black">{(activeImg.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-200">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Format</span>
                      <span className="font-medium text-black">{activeImg.type}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-200">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Aspect Ratio</span>
                      <span className="font-medium text-black">
                        {(activeImg.width / Math.min(activeImg.width, activeImg.height)).toFixed(1)}:
                        {(activeImg.height / Math.min(activeImg.width, activeImg.height)).toFixed(1)}
                      </span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Image Health</label>
                    <div className="flex flex-col gap-3 text-sm">
                       <div className="flex items-center justify-between">
                         <span>Resolution</span>
                         <span className="font-bold">{getStatus(activeImg, "resolution")}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span>File Size</span>
                         <span className="font-bold">{getStatus(activeImg, "size")}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span>Aspect Ratio</span>
                         <span className="font-bold">{getStatus(activeImg, "aspect")}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Suitability</label>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-3 border border-zinc-200 flex flex-col items-center justify-center gap-1 text-center bg-white">
                          <span className="font-bold text-lg">{getStatus(activeImg, "web")}</span>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Web Ready</span>
                       </div>
                       <div className="p-3 border border-zinc-200 flex flex-col items-center justify-center gap-1 text-center bg-white">
                          <span className="font-bold text-lg">{getStatus(activeImg, "social")}</span>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Social Ready</span>
                       </div>
                       <div className="p-3 border border-zinc-200 flex flex-col items-center justify-center gap-1 text-center bg-white col-span-2">
                          <span className="font-bold text-lg">{getStatus(activeImg, "print")}</span>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Print Ready (300 DPI)</span>
                       </div>
                    </div>
                 </div>

                 <button
                   onClick={downloadReport}
                   className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors mt-auto"
                 >
                   Download Report (CSV)
                 </button>
               </div>
             ) : (
                <div className="flex flex-col gap-8 opacity-30 pointer-events-none">
                 <div>
                   <h2 className="font-serif text-3xl text-black mb-2">Quality Report</h2>
                   <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Awaiting Image</p>
                 </div>
                 <div className="h-64 border border-zinc-200 bg-zinc-50"></div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
