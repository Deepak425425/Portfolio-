"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  ext: string;
  origW: number;
  origH: number;
}

export default function ResizePage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [lockRatio, setLockRatio] = useState(true);
  const [mode, setMode] = useState<"exact" | "fit" | "fill">("fit");
  const [preset, setPreset] = useState<string>("custom");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presets = [
    { id: "ig-sq", name: "IG Square", w: 1080, h: 1080 },
    { id: "ig-pt", name: "IG Portrait", w: 1080, h: 1350 },
    { id: "ig-st", name: "IG Story", w: 1080, h: 1920 },
    { id: "amazon", name: "Amazon Product", w: 2000, h: 2000 },
    { id: "shopify", name: "Shopify Product", w: 2048, h: 2048 },
    { id: "custom", name: "Custom", w: 0, h: 0 }
  ];

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

  const handlePreset = (p: typeof presets[0]) => {
    setPreset(p.id);
    if (p.id !== "custom") {
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

  const drawPreview = () => {
    if (!images[previewIndex] || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImg = images[previewIndex];
    const img = new Image();
    img.onload = () => {
      // Logic for resize
      let outW = width || currentImg.origW;
      let outH = height || currentImg.origH;
      
      let drawW = outW;
      let drawH = outH;
      let drawX = 0;
      let drawY = 0;
      
      let sourceX = 0;
      let sourceY = 0;
      let sourceW = img.width;
      let sourceH = img.height;

      if (mode === "fit") {
        const ratio = Math.min(outW / img.width, outH / img.height);
        drawW = img.width * ratio;
        drawH = img.height * ratio;
        drawX = (outW - drawW) / 2;
        drawY = (outH - drawH) / 2;
      } else if (mode === "fill") {
        const ratio = Math.max(outW / img.width, outH / img.height);
        sourceW = outW / ratio;
        sourceH = outH / ratio;
        sourceX = (img.width - sourceW) / 2;
        sourceY = (img.height - sourceH) / 2;
      }

      // scale down to fit viewport for preview
      const maxCanvasW = 800;
      const displayScale = outW > maxCanvasW ? maxCanvasW / outW : 1;
      
      canvas.width = outW * displayScale;
      canvas.height = outH * displayScale;
      ctx.scale(displayScale, displayScale);

      // fill background (optional)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);

      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH);
    };
    img.src = currentImg.url;
  };

  useEffect(() => {
    drawPreview();
  }, [images, previewIndex, width, height, mode]);

  const processImage = async (imgFile: ImgFile): Promise<{url: string, name: string}> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    
    const img = new Image();
    img.src = imgFile.url;
    await new Promise(r => img.onload = r);
    
    let outW = width || imgFile.origW;
    let outH = height || imgFile.origH;
    
    let drawW = outW;
    let drawH = outH;
    let drawX = 0;
    let drawY = 0;
    let sourceX = 0;
    let sourceY = 0;
    let sourceW = img.width;
    let sourceH = img.height;

    if (mode === "fit") {
      const ratio = Math.min(outW / img.width, outH / img.height);
      drawW = img.width * ratio;
      drawH = img.height * ratio;
      drawX = (outW - drawW) / 2;
      drawY = (outH - drawH) / 2;
    } else if (mode === "fill") {
      const ratio = Math.max(outW / img.width, outH / img.height);
      sourceW = outW / ratio;
      sourceH = outH / ratio;
      sourceX = (img.width - sourceW) / 2;
      sourceY = (img.height - sourceH) / 2;
    }

    canvas.width = outW;
    canvas.height = outH;
    
    // Check format for background
    let mime = "image/jpeg";
    if (imgFile.ext.toLowerCase() === "png") mime = "image/png";
    else if (imgFile.ext.toLowerCase() === "webp") mime = "image/webp";

    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
    }
    
    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH);
    
    return {
      url: canvas.toDataURL(mime, 0.95),
      name: `${imgFile.name}-resized.${imgFile.ext}`
    };
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    for (let i = 0; i < images.length; i++) {
      const res = await processImage(images[i]);
      const a = document.createElement("a");
      a.href = res.url;
      a.download = res.name;
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
      zip.file(res.name, res.url.substring(idx), {base64: true});
    }
    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `resized_images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Image Resize" description="Resize images individually or in bulk with smart cropping.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200">
              <canvas ref={canvasRef} className="max-w-full max-h-[60vh] object-contain block shadow-lg" />
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

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map(p => (
                  <button key={p.id} onClick={() => handlePreset(p)} className={`py-2 px-2 text-[10px] uppercase font-bold tracking-widest border transition-colors ${preset === p.id ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Dimensions</label>
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={lockRatio} onChange={e => setLockRatio(e.target.checked)} className="accent-black" /> Lock Aspect
              </label>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500">Width (px)</span>
                <input type="number" value={width} onChange={e => handleWChange(Number(e.target.value))} className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-center" />
              </div>
              <div className="flex items-end pb-3 text-zinc-300">×</div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500">Height (px)</span>
                <input type="number" value={height} onChange={e => handleHChange(Number(e.target.value))} className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-center" />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Resize Mode</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setMode("exact")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${mode === "exact" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Exact</button>
                <button onClick={() => setMode("fit")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${mode === "fit" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Fit</button>
                <button onClick={() => setMode("fill")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${mode === "fill" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Fill / Crop</button>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {images.length > 0 && (
              <>
                <div className="flex flex-col gap-2 text-sm mb-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Original</span>
                    <span className="font-bold tracking-wider text-[11px]">{images[previewIndex]?.origW} × {images[previewIndex]?.origH}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Output</span>
                    <span className="font-bold tracking-wider text-[11px]">{width} × {height}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 text-center">{images.length} Image{images.length > 1 ? 's' : ''} Ready</span>
                  <button disabled={isProcessing} onClick={downloadZip} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300">
                    {isProcessing ? 'Processing...' : 'Download ZIP'}
                  </button>
                  <button disabled={isProcessing} onClick={downloadAll} className="w-full py-4 bg-transparent border border-black text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:border-zinc-300">
                    Download All
                  </button>
                </div>
                <button onClick={reset} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors">
                  Reset / Clear Images
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
