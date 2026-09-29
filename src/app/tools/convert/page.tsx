"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import BulkProcessor, { ImgFile } from "@/components/tools/BulkProcessor";

interface FileStats {
  width: number;
  height: number;
  originalBytes: number;
  outputBytes: number;
}

export default function ConvertPage() {
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("webp");
  const [quality, setQuality] = useState(92);
  const [stats, setStats] = useState<Record<string, FileStats>>({});
  
  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Convert blob to specific format and quality
  const convertBlob = async (imgData: ImgFile, forceFormat: string, forceQuality: number): Promise<{blob: Blob, w: number, h: number}> => {
    const image = new Image();
    image.src = imgData.url;
    await new Promise(r => { image.onload = r; image.onerror = r; });
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    
    // For JPEG, fill background with white first (in case of transparent PNG)
    if (forceFormat === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);
    
    const mime = `image/${forceFormat}`;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ blob: blob!, w: canvas.width, h: canvas.height });
      }, mime, forceFormat === "png" ? undefined : forceQuality / 100);
    });
  };

  const processImage = async (imgData: ImgFile): Promise<{ blob: Blob, name: string } | null> => {
    const res = await convertBlob(imgData, format, quality);
    const ext = format === "jpeg" ? "jpg" : format;
    return {
      blob: res.blob,
      name: `${imgData.name}-converted.${ext}`
    };
  };

  return (
    <ToolLayout title="Image Converter" description="Fast, browser-based conversion between JPG, PNG, and WebP formats.">
      <BulkProcessor
        onProcess={processImage}
        renderControls={(currentImg, isProcessing) => {
          
          // Live preview calculation for stats
          useEffect(() => {
            if (currentImg) {
               convertBlob(currentImg, format, quality).then(res => {
                 setStats(prev => ({
                   ...prev,
                   [currentImg.id]: {
                     width: res.w,
                     height: res.h,
                     originalBytes: currentImg.file.size,
                     outputBytes: res.blob.size
                   }
                 }));
               });
            }
          }, [currentImg, format, quality]);

          return (
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Convert To</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {id: "jpeg", label: "JPG"}, 
                    {id: "png", label: "PNG"}, 
                    {id: "webp", label: "WEBP"}
                  ].map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setFormat(f.id as any)} 
                      className={`py-3 text-xs font-bold tracking-widest border uppercase transition-colors ${format === f.id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {format !== "png" && (
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 flex justify-between">
                    <span>Quality</span>
                    <span>{quality}</span>
                  </label>
                  <input type="range" min="50" max="100" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                </div>
              )}
              {format === "png" && (
                <div className="flex flex-col gap-2 mt-2">
                   <p className="text-[10px] uppercase tracking-widest font-bold text-accent">Lossless Output</p>
                </div>
              )}

              {/* Stats Panel */}
              {currentImg && stats[currentImg.id] && (
                <div className="mt-4 border border-zinc-100 bg-zinc-50 p-4 flex flex-col gap-3">
                   <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-200 pb-2">File Info</h4>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Format</span>
                        <span className="text-sm font-bold uppercase">{currentImg.ext} → {format === 'jpeg' ? 'JPG' : format}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Dimensions</span>
                        <span className="text-sm font-bold font-mono">{stats[currentImg.id].width} × {stats[currentImg.id].height}</span>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-200">
                     <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Original</span>
                        <span className="text-sm font-bold">{formatBytes(stats[currentImg.id].originalBytes)}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Output</span>
                        <span className="text-sm font-bold text-accent-dark">{formatBytes(stats[currentImg.id].outputBytes)}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Saved</span>
                        <span className={`text-sm font-bold ${stats[currentImg.id].originalBytes > stats[currentImg.id].outputBytes ? 'text-success' : 'text-error'}`}>
                          {stats[currentImg.id].originalBytes > stats[currentImg.id].outputBytes 
                            ? ((1 - (stats[currentImg.id].outputBytes / stats[currentImg.id].originalBytes)) * 100).toFixed(1) + '%'
                            : '+' + (((stats[currentImg.id].outputBytes / stats[currentImg.id].originalBytes) - 1) * 100).toFixed(1) + '%'
                          }
                        </span>
                     </div>
                   </div>
                </div>
              )}
            </div>
          );
        }}
        renderPreview={(currentImg) => (
          currentImg ? (
            <div className="w-full h-full p-8 flex justify-center items-center">
              <div className="relative group">
                 <img src={currentImg.url} className="max-h-[50vh] object-contain shadow-2xl transition-transform transform group-hover:scale-[1.02]" />
                 <div className="absolute -bottom-4 right-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 shadow-lg pointer-events-none">
                    Preview
                 </div>
              </div>
            </div>
          ) : null
        )}
      />
    </ToolLayout>
  );
}
