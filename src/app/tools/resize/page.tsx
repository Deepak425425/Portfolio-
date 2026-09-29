"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";
import { getGrotonExportFilename } from "@/utils/export";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  ext: string;
  origW: number;
  origH: number;
}

const platformPresets = [
  { id: "ig-sq", name: "Instagram Post", w: 1080, h: 1080 },
  { id: "ig-st", name: "Instagram Story", w: 1080, h: 1920 },
  { id: "yt-th", name: "YouTube Thumbnail", w: 1280, h: 720 },
  { id: "fb-po", name: "Facebook Post", w: 1200, h: 630 },
  { id: "li-po", name: "LinkedIn Post", w: 1200, h: 627 },
  { id: "pin", name: "Pinterest Pin", w: 1000, h: 1500 },
  { id: "web", name: "Website Hero", w: 1920, h: 1080 },
  { id: "amazon", name: "Amazon Product", w: 2000, h: 2000 },
  { id: "shopify", name: "Shopify Product", w: 2048, h: 2048 },
  { id: "custom", name: "Custom Size", w: 0, h: 0 }
];

export default function ResizePage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [preset, setPreset] = useState("ig-sq");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [lockRatio, setLockRatio] = useState(false);
  const [mode, setMode] = useState<"fill" | "fit" | "exact">("fill"); // fill=Crop, fit=Contain, exact=Stretch
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [transparentBg, setTransparentBg] = useState(false);
  const [padding, setPadding] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    const newImgs: ImgFile[] = [];
    
    for (const f of valid) {
      const parts = f.name.split('.');
      const ext = parts.pop() || 'jpg';
      const url = URL.createObjectURL(f);
      
      const img = new Image();
      img.src = url;
      await new Promise(r => img.onload = r);
      
      newImgs.push({
        id: Math.random().toString(36).substring(7),
        file: f,
        url,
        name: parts.join('.'),
        ext,
        origW: img.width,
        origH: img.height
      });
    }
    setImages(prev => [...prev, ...newImgs]);
  };

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
    setPreviewIndex(0);
  };

  const handlePreset = (pid: string) => {
    setPreset(pid);
    const p = platformPresets.find(x => x.id === pid);
    if (p && pid !== "custom") {
      setWidth(p.w);
      setHeight(p.h);
    }
  };

  const handleWChange = (val: number) => {
    setPreset("custom");
    setWidth(val);
    if (lockRatio && images[previewIndex]) {
      const ratio = images[previewIndex].origH / images[previewIndex].origW;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHChange = (val: number) => {
    setPreset("custom");
    setHeight(val);
    if (lockRatio && images[previewIndex]) {
      const ratio = images[previewIndex].origW / images[previewIndex].origH;
      setWidth(Math.round(val * ratio));
    }
  };

  const getDrawParams = (imgW: number, imgH: number, outW: number, outH: number) => {
    const innerW = Math.max(1, outW - padding * 2);
    const innerH = Math.max(1, outH - padding * 2);

    let drawW = innerW;
    let drawH = innerH;
    let drawX = padding;
    let drawY = padding;
    let sourceX = 0;
    let sourceY = 0;
    let sourceW = imgW;
    let sourceH = imgH;

    if (mode === "fit") { // Contain
      const ratio = Math.min(innerW / imgW, innerH / imgH);
      drawW = imgW * ratio;
      drawH = imgH * ratio;
      drawX = padding + (innerW - drawW) / 2;
      drawY = padding + (innerH - drawH) / 2;
    } else if (mode === "fill") { // Cover/Crop
      const ratio = Math.max(innerW / imgW, innerH / imgH);
      sourceW = innerW / ratio;
      sourceH = innerH / ratio;
      sourceX = (imgW - sourceW) / 2;
      sourceY = (imgH - sourceH) / 2;
    }

    return { drawX, drawY, drawW, drawH, sourceX, sourceY, sourceW, sourceH };
  };

  const drawPreview = () => {
    if (!images[previewIndex] || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImg = images[previewIndex];
    const img = new Image();
    img.onload = () => {
      let outW = width || currentImg.origW;
      let outH = height || currentImg.origH;
      
      const { drawX, drawY, drawW, drawH, sourceX, sourceY, sourceW, sourceH } = getDrawParams(img.width, img.height, outW, outH);

      const maxCanvasW = 800;
      const maxCanvasH = 600;
      const displayScale = Math.min(1, maxCanvasW / outW, maxCanvasH / outH);
      
      canvas.width = outW * displayScale;
      canvas.height = outH * displayScale;
      
      ctx.scale(displayScale, displayScale);
      
      ctx.clearRect(0, 0, outW, outH);

      // Draw Checkered background for transparency preview
      if (transparentBg) {
        ctx.fillStyle = "#E5E5E5";
        const tileSize = 20;
        for (let y = 0; y < outH; y += tileSize) {
          for (let x = 0; x < outW; x += tileSize) {
            if ((x / tileSize + y / tileSize) % 2 === 0) ctx.fillRect(x, y, tileSize, tileSize);
          }
        }
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, outW, outH);
      }

      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH);
    };
    img.src = currentImg.url;
  };

  useEffect(() => {
    drawPreview();
  }, [images, previewIndex, width, height, mode, bgColor, transparentBg, padding]);

  const processImage = async (imgFile: ImgFile): Promise<{url: string, name: string}> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    
    const img = new Image();
    img.src = imgFile.url;
    await new Promise(r => img.onload = r);
    
    let outW = width || imgFile.origW;
    let outH = height || imgFile.origH;
    
    const { drawX, drawY, drawW, drawH, sourceX, sourceY, sourceW, sourceH } = getDrawParams(img.width, img.height, outW, outH);

    canvas.width = outW;
    canvas.height = outH;
    
    let mime = "image/jpeg";
    let ext = "jpg";
    if (transparentBg || imgFile.ext.toLowerCase() === "png") {
      mime = "image/png";
      ext = "png";
    }

    if (!transparentBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outW, outH);
    }
    
    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH);
    
    return {
      url: canvas.toDataURL(mime, 0.95),
      name: `${imgFile.name}-resized.${ext}`
    };
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    for (let i = 0; i < images.length; i++) {
      const res = await processImage(images[i]);
      const a = document.createElement("a");
      a.href = res.url;
      a.download = getGrotonExportFilename(res.name);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      const res = await processImage(images[i]);
      const idx = res.url.indexOf("base64,") + 7;
      zip.file(getGrotonExportFilename(res.name), res.url.substring(idx), {base64: true});
    }
    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = getGrotonExportFilename(`resized_images.zip`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Image Resizer" description="Resize and format images precisely for any social media or e-commerce platform.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-[#F7F6F2] relative flex flex-col items-center justify-center border border-[#DEDCD5] min-h-[60vh] p-8 overflow-hidden">
              <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain block shadow-xl transition-all duration-300 bg-white" />
              
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 border border-[#DEDCD5] text-[10px] uppercase font-bold tracking-widest shadow-sm">
                Output: {width} × {height}
              </div>

              {images.length > 1 && (
                <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur p-4 flex gap-2 overflow-x-auto border-t border-[#DEDCD5]">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setPreviewIndex(i)} className={`relative h-14 w-14 shrink-0 border-2 transition-all ${previewIndex === i ? 'border-[#8B7CFF] shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img.url} className="w-full h-full max-h-[70vh] object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8 h-full">
          <div className="bg-white p-6 md:p-8 border border-[#DEDCD5] flex flex-col gap-6 h-full max-h-[80vh] overflow-y-auto">
            
            {/* PLATFORM PRESETS */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Resize For Platform</label>
              <select 
                 value={preset} 
                 onChange={(e) => handlePreset(e.target.value)}
                 className="w-full p-3 border border-[#DEDCD5] text-sm font-bold bg-[#F7F6F2] outline-none hover:border-[#111111] focus:border-[#111111] transition-colors"
              >
                 {platformPresets.map(p => (
                   <option key={p.id} value={p.id}>{p.name} {p.w > 0 ? `(${p.w} × ${p.h})` : ''}</option>
                 ))}
              </select>
            </div>

            {/* DIMENSIONS */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#DEDCD5]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Dimensions</label>
                <label className="text-[9px] tracking-widest uppercase font-bold text-sec-text flex items-center gap-1.5 cursor-pointer hover:text-black">
                  <input type="checkbox" checked={lockRatio} onChange={e => setLockRatio(e.target.checked)} className="accent-[#8B7CFF]" /> Lock Aspect
                </label>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] text-sec-text uppercase tracking-widest">Width</span>
                  <input type="number" value={width} onChange={e => handleWChange(Number(e.target.value))} className="w-full border-b-2 border-[#DEDCD5] py-2 bg-transparent focus:outline-none focus:border-[#111111] transition-colors font-mono font-bold text-lg text-center" />
                </div>
                <div className="flex items-end pb-3 text-[#DEDCD5] text-xl">×</div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] text-sec-text uppercase tracking-widest">Height</span>
                  <input type="number" value={height} onChange={e => handleHChange(Number(e.target.value))} className="w-full border-b-2 border-[#DEDCD5] py-2 bg-transparent focus:outline-none focus:border-[#111111] transition-colors font-mono font-bold text-lg text-center" />
                </div>
              </div>
            </div>

            {/* RESIZE MODE */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#DEDCD5]">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Resize Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setMode("fill")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${mode === "fill" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-sec-text border-[#DEDCD5] hover:border-[#111111]'}`}>Fill / Crop</button>
                <button onClick={() => setMode("fit")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${mode === "fit" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-sec-text border-[#DEDCD5] hover:border-[#111111]'}`}>Contain</button>
                <button onClick={() => setMode("exact")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${mode === "exact" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-sec-text border-[#DEDCD5] hover:border-[#111111]'}`}>Stretch</button>
              </div>
            </div>

            {/* BACKGROUND & PADDING (Only relevant for Contain) */}
            <div className={`flex flex-col gap-4 pt-4 border-t border-[#DEDCD5] transition-opacity ${mode === "fit" ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
               <div className="flex items-center justify-between">
                 <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Background</label>
                 <label className="text-[9px] tracking-widest uppercase font-bold text-sec-text flex items-center gap-1.5 cursor-pointer hover:text-black">
                   <input type="checkbox" checked={transparentBg} onChange={e => setTransparentBg(e.target.checked)} className="accent-[#8B7CFF]" /> Transparent (PNG)
                 </label>
               </div>
               
               {!transparentBg && (
                 <div className="flex gap-2 items-center">
                   <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" />
                   <span className="font-mono text-xs text-sec-text">{bgColor.toUpperCase()}</span>
                 </div>
               )}

               <div className="flex flex-col gap-2 mt-2">
                 <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text flex justify-between">
                   <span>Padding</span> <span>{padding}px</span>
                 </label>
                 <input type="range" min="0" max="200" value={padding} onChange={e => setPadding(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
               </div>
            </div>

            <div className="flex-1 min-h-[1rem]"></div>

            {images.length > 0 && (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#DEDCD5]">
                <div className="flex justify-between items-center bg-[#F7F6F2] p-3 border border-[#DEDCD5] mb-2">
                  <span className="text-sec-text text-sm font-medium">Original</span>
                  <span className="font-bold font-mono tracking-tight">{images[previewIndex]?.origW} × {images[previewIndex]?.origH}</span>
                </div>
                
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text text-center">{images.length} Image{images.length > 1 ? 's' : ''} Ready</span>
                <button disabled={isProcessing} onClick={downloadZip} className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#8B7CFF] transition-colors disabled:opacity-50">
                  {isProcessing ? 'Processing...' : 'Download ZIP'}
                </button>
                <button disabled={isProcessing} onClick={downloadAll} className="w-full py-3 bg-transparent border border-[#111111] text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50">
                  Download All
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
