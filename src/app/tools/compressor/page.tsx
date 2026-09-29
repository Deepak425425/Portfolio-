"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  origExt: string;
  origSize: number;
  width: number;
  height: number;
}

export default function CompressorPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [mode, setMode] = useState<"QUALITY" | "TARGET">("QUALITY");
  const [quality, setQuality] = useState(80);
  const [targetKB, setTargetKB] = useState(500);

  const [estSize, setEstSize] = useState<number | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    const newImgs = await Promise.all(valid.map(async f => {
      const parts = f.name.split('.');
      const ext = parts.pop() || 'jpg';
      const url = URL.createObjectURL(f);
      
      const img = new Image();
      img.src = url;
      await new Promise(r => img.onload = r);
      
      return {
        id: Math.random().toString(36).substring(7),
        file: f,
        url,
        name: parts.join('.'),
        origExt: ext,
        origSize: f.size,
        width: img.width,
        height: img.height
      };
    }));
    setImages(prev => [...prev, ...newImgs]);
  };

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setImages([]);
    setPreviewIndex(0);
    setCompressedUrl(null);
    setEstSize(null);
  };

  const processSingle = async (imgFile: ImgFile): Promise<{blob: Blob, name: string}> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    
    const img = new Image();
    img.src = imgFile.url;
    await new Promise(r => img.onload = r);
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    
    const mime = `image/${format}`;

    if (mode === "TARGET" && format !== "png") {
       const targetBytes = targetKB * 1024;
       let min = 0.05;
       let max = 1.0;
       let bestBlob: Blob | null = null;
       
       for(let i=0; i<8; i++) {
          let mid = (min + max) / 2;
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), mime, mid));
          if (!bestBlob || blob.size <= targetBytes || i === 0) bestBlob = blob;
          
          if (blob.size > targetBytes) {
             max = mid;
          } else {
             min = mid;
             // If we're within 5% of target, stop.
             if (targetBytes - blob.size < targetBytes * 0.05) break;
          }
       }
       return {
         blob: bestBlob!,
         name: `${imgFile.name}-compressed.${format === "jpeg" ? "jpg" : format}`
       };
    } else {
       const qual = quality / 100;
       return new Promise((resolve) => {
         canvas.toBlob((blob) => {
           resolve({
             blob: blob!,
             name: `${imgFile.name}-compressed.${format === "jpeg" ? "jpg" : format}`
           });
         }, mime, qual);
       });
    }
  };

  const updatePreview = async () => {
    if (!images[previewIndex]) return;
    const res = await processSingle(images[previewIndex]);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl(URL.createObjectURL(res.blob));
    setEstSize(res.blob.size);
  };

  useEffect(() => {
    // Debounce preview update slightly to avoid lagging UI while dragging slider
    const timer = setTimeout(() => {
      updatePreview();
    }, 150);
    return () => clearTimeout(timer);
  }, [images, previewIndex, format, quality, mode, targetKB]);

  const downloadAll = async () => {
    setIsProcessing(true);
    for (let i = 0; i < images.length; i++) {
      const res = await processSingle(images[i]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(res.blob);
      a.download = res.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      const res = await processSingle(images[i]);
      zip.file(res.name, res.blob);
    }
    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `compressed_images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  };

  const getCompressionRatio = () => {
    if (!estSize || !images[previewIndex]) return 0;
    const ratio = (1 - (estSize / images[previewIndex].origSize)) * 100;
    return ratio > 0 ? ratio.toFixed(1) : "0";
  };

  return (
    <ToolLayout title="Image Compressor" description="Intelligently compress images. Shrink to an exact target size or manual quality.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 min-h-[60vh] overflow-hidden">
              <div className="flex w-full h-[60vh] divide-x divide-white">
                <div className="w-1/2 flex flex-col relative bg-[#F7F6F2] items-center justify-center p-8 group">
                  <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1 shadow-sm border border-border-color">Original</span>
                  <img src={images[previewIndex].url} className="max-w-full max-h-full object-contain drop-shadow-md transition-transform group-hover:scale-[1.02] duration-500" />
                  <div className="absolute bottom-4 left-4 bg-black/80 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">{images[previewIndex].width} × {images[previewIndex].height}</div>
                </div>
                <div className="w-1/2 flex flex-col relative bg-[#F7F6F2] items-center justify-center p-8 group">
                  <span className="absolute top-4 right-4 bg-[#8B7CFF] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 shadow-sm">Compressed</span>
                  {compressedUrl && <img src={compressedUrl} className="max-w-full max-h-full object-contain drop-shadow-md transition-transform group-hover:scale-[1.02] duration-500" />}
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="w-full bg-white p-4 flex gap-2 overflow-x-auto border-t border-zinc-200">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setPreviewIndex(i)} className={`relative h-16 w-16 shrink-0 border-2 transition-colors ${previewIndex === i ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <img src={img.url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8 h-full">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-8 h-full max-h-[80vh] overflow-y-auto">
            
            {/* Format Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Output Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(["jpeg", "png", "webp"] as const).map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => setFormat(fmt)} 
                    className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${format === fmt ? 'bg-black text-white border-black' : 'bg-transparent text-sec-text border-border-color hover:border-black'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Compression Mode</label>
              <div className="flex bg-zinc-100 p-1">
                 <button 
                   onClick={() => setMode("TARGET")}
                   className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${mode === "TARGET" ? 'bg-white text-black shadow-sm' : 'text-sec-text hover:text-black'}`}
                 >Target Size</button>
                 <button 
                   onClick={() => setMode("QUALITY")}
                   className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${mode === "QUALITY" ? 'bg-white text-black shadow-sm' : 'text-sec-text hover:text-black'}`}
                 >Quality %</button>
              </div>
            </div>

            {/* Mode Controls */}
            {mode === "TARGET" && format !== "png" ? (
               <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text flex justify-between">
                      <span>Target KB</span> <span>{targetKB} KB</span>
                    </label>
                    <input type="range" min="50" max="5000" step="50" value={targetKB} onChange={e => setTargetKB(Number(e.target.value))} className="w-full accent-black" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                     {[100, 200, 500, 1000].map(val => (
                       <button key={val} onClick={() => setTargetKB(val)} className={`py-1.5 text-[9px] font-bold tracking-wider border uppercase transition-colors ${targetKB === val ? 'bg-black text-white border-black' : 'bg-transparent text-sec-text border-border-color hover:border-black'}`}>
                         {val}KB
                       </button>
                     ))}
                  </div>
               </div>
            ) : mode === "QUALITY" && format !== "png" ? (
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text flex justify-between">
                   <span>Quality</span> <span>{quality}%</span>
                 </label>
                 <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-black" />
               </div>
            ) : format === "png" && (
               <div className="p-4 bg-zinc-50 border border-zinc-100 text-xs text-sec-text text-center">
                  PNG format is lossless. Compression sliders are ignored.
               </div>
            )}

            <div className="h-px w-full bg-border-color my-2"></div>

            {/* Stats & Actions */}
            {images.length > 0 && (
              <div className="mt-auto flex flex-col gap-6">
                
                <div className="flex flex-col gap-4 bg-[#F7F6F2] p-4 border border-[#DEDCD5]">
                  <div className="flex justify-between items-center">
                    <span className="text-sec-text font-medium text-sm">Before size</span>
                    <span className="font-bold font-mono tracking-wide">{formatSize(images[previewIndex].origSize)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sec-text font-medium text-sm">After size</span>
                    <span className="font-bold font-mono tracking-wide text-green-700">{estSize ? formatSize(estSize) : '...'}</span>
                  </div>
                  <div className="h-px bg-white"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#111111] font-bold text-sm">Reduction</span>
                    <span className="font-bold font-mono text-lg tracking-tight bg-white px-2 py-0.5 border border-[#DEDCD5] text-green-700">-{getCompressionRatio()}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text text-center">{images.length} Image{images.length > 1 ? 's' : ''} Ready</span>
                  <button disabled={isProcessing} onClick={downloadZip} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50">
                    {isProcessing ? 'Processing...' : 'Download ZIP'}
                  </button>
                  <button disabled={isProcessing} onClick={downloadAll} className="w-full py-3 bg-transparent border border-black text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50">
                    Download All
                  </button>
                </div>
                <button onClick={reset} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-sec-text hover:text-black transition-colors">
                  Clear Images
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
