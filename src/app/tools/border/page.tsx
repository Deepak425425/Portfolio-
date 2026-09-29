"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";

export default function BorderPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  
  // Section 1: Border
  const [width, setWidth] = useState(20);
  const [color, setColor] = useState("#8B7CFF");
  const [style, setStyle] = useState<"solid"|"dashed"|"dotted">("solid");
  
  // Section 2: Shape
  const [radius, setRadius] = useState(0);
  const [position, setPosition] = useState<"inside"|"center"|"outside">("inside");
  
  // Section 3: Export
  const [format, setFormat] = useState<"png"|"jpg"|"webp">("png");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setFileName(file.name);
    
    const img = new Image();
    img.onload = () => setImgObj(img);
    img.src = objectUrl;
  };

  const resetAll = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setImgObj(null);
    setFileName("");
    setWidth(20);
    setColor("#8B7CFF");
    setStyle("solid");
    setRadius(0);
    setPosition("inside");
    setFormat("png");
  };

  useEffect(() => {
    if (!imgObj || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let cW, cH, imgX, imgY;
    if (position === 'outside') {
      cW = imgObj.width + width * 2;
      cH = imgObj.height + width * 2;
      imgX = width;
      imgY = width;
    } else if (position === 'center') {
      cW = imgObj.width + width;
      cH = imgObj.height + width;
      imgX = width / 2;
      imgY = width / 2;
    } else { // inside
      cW = imgObj.width;
      cH = imgObj.height;
      imgX = 0;
      imgY = 0;
    }
    
    canvas.width = cW;
    canvas.height = cH;
    ctx.clearRect(0, 0, cW, cH);
    
    // Draw Image
    ctx.save();
    if (radius > 0) {
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgObj.width, imgObj.height, radius);
      ctx.clip();
    }
    ctx.drawImage(imgObj, imgX, imgY, imgObj.width, imgObj.height);
    ctx.restore();
    
    // Draw Border
    if (width > 0) {
      ctx.save();
      
      let sx, sy, sw, sh, sr;
      if (position === 'outside') {
        sx = width / 2;
        sy = width / 2;
        sw = cW - width;
        sh = cH - width;
        sr = radius > 0 ? radius + width / 2 : 0;
      } else if (position === 'center') {
        sx = width / 2;
        sy = width / 2;
        sw = cW - width;
        sh = cH - width;
        sr = radius;
      } else { // inside
        sx = width / 2;
        sy = width / 2;
        sw = cW - width;
        sh = cH - width;
        sr = radius > 0 ? Math.max(0, radius - width / 2) : 0;
      }
      
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, sr);
      
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      
      if (style === 'dashed') {
        ctx.setLineDash([width * 3, width * 2]);
      } else if (style === 'dotted') {
        ctx.lineCap = 'round';
        ctx.setLineDash([0, width * 2]);
      }
      
      ctx.stroke();
      ctx.restore();
    }
  }, [imgObj, width, color, style, radius, position]);

  const exportImage = () => {
    if (!canvasRef.current || !fileName) return;
    const a = document.createElement("a");
    const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
    a.href = canvasRef.current.toDataURL(mime, 0.95);
    
    const origExt = fileName.split('.').pop() || '';
    const baseName = fileName.substring(0, fileName.length - (origExt.length ? origExt.length + 1 : 0));
    
    a.download = getGrotonExportFilename(`${baseName}.${format}`);
    a.click();
  };

  return (
    <ToolLayout title="Image Border" description="Add customizable borders to your images.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT PANEL - PREVIEW */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!url ? (
            <div className="w-full max-w-md mx-auto mt-12">
              <UploadDropzone onUpload={handleUpload} multiple={false} accept="image/jpeg, image/png, image/webp" />
            </div>
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 min-h-[60vh] overflow-hidden p-8">
               {/* Use the actual canvas for the preview to ensure 100% WYSIWYG */}
               <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain shadow-xl" />
            </div>
          )}
        </div>

        {/* RIGHT PANEL - CONTROLS */}
        <div className="lg:col-span-4 flex flex-col lg:h-full lg:overflow-y-auto lg:max-h-[85vh] pb-12 gap-8">
           <div className={`bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-8 transition-opacity ${!url ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              
              {/* SECTION 1 - BORDER */}
              <div className="flex flex-col gap-5">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">1. Border</h3>
                 
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between">
                       <span>Border Width</span>
                       <span>{width}px</span>
                    </label>
                    <input type="range" min="0" max="200" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Border Color</label>
                    <div className="flex items-center gap-3">
                       <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 border-0 p-0 cursor-pointer" />
                       <span className="text-xs font-mono uppercase text-zinc-500">{color}</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Border Style</label>
                    <div className="flex gap-2">
                       <button onClick={() => setStyle("solid")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${style === "solid" ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Solid</button>
                       <button onClick={() => setStyle("dashed")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${style === "dashed" ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Dashed</button>
                       <button onClick={() => setStyle("dotted")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${style === "dotted" ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Dotted</button>
                    </div>
                 </div>
              </div>

              {/* SECTION 2 - SHAPE */}
              <div className="flex flex-col gap-5">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">2. Shape</h3>
                 
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between">
                       <span>Border Radius</span>
                       <span>{radius}px</span>
                    </label>
                    <input type="range" min="0" max="500" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                 </div>

                 <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Border Position</label>
                    <div className="flex gap-2">
                       <button onClick={() => setPosition("inside")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${position === "inside" ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Inside</button>
                       <button onClick={() => setPosition("center")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${position === "center" ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Center</button>
                       <button onClick={() => setPosition("outside")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${position === "outside" ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Outside</button>
                    </div>
                 </div>
              </div>

              {/* SECTION 3 - EXPORT */}
              <div className="flex flex-col gap-5">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">3. Export</h3>
                 
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Format</label>
                    <div className="flex gap-2">
                       <button onClick={() => setFormat("png")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${format === "png" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>PNG</button>
                       <button onClick={() => setFormat("jpg")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${format === "jpg" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>JPG</button>
                       <button onClick={() => setFormat("webp")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${format === "webp" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>WEBP</button>
                    </div>
                 </div>

                 <div className="flex flex-col gap-3 mt-4">
                    <button onClick={exportImage} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
                      Download Image
                    </button>
                    <button onClick={resetAll} className="w-full py-3 bg-white text-zinc-400 text-[10px] uppercase tracking-widest font-bold hover:text-black transition-colors">
                      Reset
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}