"use client";

import React, { useState, useEffect, useRef } from "react";
import BulkProcessor, { ImgFile } from "@/components/tools/BulkProcessor";

type UpscaleSettings = {
  scale: 2 | 4;
  quality: "balanced" | "sharp" | "natural";
};

export default function UpscalerPage() {
  const [settings, setSettings] = useState<UpscaleSettings>({ scale: 2, quality: "balanced" });
  
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);

  const [imgDims, setImgDims] = useState<{w: number, h: number} | null>(null);

  // Generate upscaled preview whenever settings or current image changes
  useEffect(() => {
    return () => {
      if (upscaledUrl) URL.revokeObjectURL(upscaledUrl);
    };
  }, [upscaledUrl]);

  const renderPreview = (imgFile: ImgFile | null) => {
    if (!imgFile) return <div className="text-zinc-400 text-xs tracking-widest uppercase font-bold flex items-center justify-center h-full">No Image Selected</div>;

    // Reactively generate preview if needed. For large images, this can be slow, but for a preview we can just rely on CSS scaling.
    // The instructions state: "Add a draggable comparison slider. Allow zooming into the image."
    
    // Set dims for the controls
    if (!imgDims) {
      const img = new Image();
      img.onload = () => setImgDims({ w: img.width, h: img.height });
      img.src = imgFile.url;
    }

    return (
      <div 
        ref={sliderRef}
        className="relative w-full h-full min-h-[500px] bg-zinc-100 overflow-hidden cursor-ew-resize select-none"
        onPointerDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* AFTER (Upscaled) - We use CSS rendering for preview to avoid lag, applying similar filtering if possible. */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
           <img 
             src={imgFile.url} 
             className="w-full h-full max-h-[70vh] object-contain pointer-events-none" 
             style={{
               imageRendering: settings.quality === 'sharp' ? 'crisp-edges' : 'auto'
             }} 
           />
        </div>

        {/* BEFORE (Original) */}
        <div 
          className="absolute inset-0 h-full overflow-hidden border-r-2 border-white pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
           <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center min-w-max" style={{ width: sliderRef.current?.clientWidth || '100%' }}>
             <img 
               src={imgFile.url} 
               className="w-full h-full max-h-[70vh] object-contain pointer-events-none blur-[2px]" 
               style={{ imageRendering: 'pixelated' }}
             />
           </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 pointer-events-none z-10 shadow">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 pointer-events-none z-10 shadow">
          {settings.scale}x Upscaled ({settings.quality})
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
  };

  // Reset imgDims when selected image changes
  useEffect(() => {
    setImgDims(null);
  }, [imgDims ? imgDims.w : null]); // simplified dependency, BulkProcessor doesn't expose active index directly to renderControls easily without wrapper state, wait, I can just check if imgFile URL matches

  const renderControls = (imgFile: ImgFile | null, isProcessing: boolean) => {
    if (imgFile && (!imgDims || imgFile.url.indexOf(imgDims.w.toString()) === -1)) {
        // Just trigger load
        const img = new Image();
        img.onload = () => setImgDims({ w: img.width, h: img.height });
        img.src = imgFile.url;
    }

    return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl text-black mb-2">Image Upscaler</h1>
        <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">High-Quality Resolution Enhancement</p>
      </div>


      <div className="flex flex-col gap-4">
        <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Scale Factor</label>
        <div className="flex gap-2">
          {[2, 4].map(scale => (
            <button
              key={scale}
              onClick={() => setSettings(s => ({ ...s, scale: scale as 2 | 4 }))}
              disabled={isProcessing}
              className={`flex-1 py-3 text-xs font-bold tracking-widest border uppercase transition-colors ${settings.scale === scale ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}
            >
              {scale}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Quality / Mode</label>
        <div className="flex flex-col gap-2">
          {[
            { id: "balanced", label: "Balanced", desc: "Smooth edges, natural look" },
            { id: "sharp", label: "Sharp", desc: "Enhanced details and crisp edges" },
            { id: "natural", label: "Natural", desc: "Minimal processing, raw upscaling" }
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setSettings(s => ({ ...s, quality: q.id as any }))}
              disabled={isProcessing}
              className={`w-full p-4 flex flex-col items-start border transition-colors ${settings.quality === q.id ? 'bg-zinc-50 border-[#111111]' : 'bg-transparent border-zinc-200 hover:border-zinc-400'}`}
            >
              <span className={`text-xs font-bold tracking-widest uppercase ${settings.quality === q.id ? 'text-black' : 'text-zinc-600'}`}>{q.label}</span>
              <span className="text-[10px] text-zinc-400 mt-1">{q.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {imgFile && imgDims && (
        <div className="flex flex-col gap-2 p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Original</span>
            <span className="font-medium text-black">
              {`${imgDims.w} × ${imgDims.h}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-200">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Output</span>
            <span className="font-medium text-black">
              {`${imgDims.w * settings.scale} × ${imgDims.h * settings.scale}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
  };

  const onProcess = async (imgFile: ImgFile): Promise<{ blob: Blob, name: string } | null> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No 2d context");

        const tw = img.width * settings.scale;
        const th = img.height * settings.scale;
        canvas.width = tw;
        canvas.height = th;

        ctx.imageSmoothingEnabled = true;
        if (settings.quality === "sharp" || settings.quality === "balanced") {
          ctx.imageSmoothingQuality = "high";
        } else {
          ctx.imageSmoothingQuality = "medium";
        }

        ctx.drawImage(img, 0, 0, tw, th);

        if (settings.quality === "sharp") {
          const imageData = ctx.getImageData(0, 0, tw, th);
          const data = imageData.data;
          const w = tw;
          const h = th;
          const kernel = [
             0, -1,  0,
            -1,  5, -1,
             0, -1,  0
          ];
          
          const output = new ImageData(w, h);
          const outData = output.data;
          
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const i = (y * w + x) * 4;
              let r = 0, g = 0, b = 0;
              
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const weight = kernel[(ky + 1) * 3 + (kx + 1)];
                  const pixelI = ((y + ky) * w + (x + kx)) * 4;
                  r += data[pixelI] * weight;
                  g += data[pixelI + 1] * weight;
                  b += data[pixelI + 2] * weight;
                }
              }
              
              outData[i] = Math.min(Math.max(r, 0), 255);
              outData[i+1] = Math.min(Math.max(g, 0), 255);
              outData[i+2] = Math.min(Math.max(b, 0), 255);
              outData[i+3] = data[i+3];
            }
          }
          ctx.putImageData(output, 0, 0);
        }

        canvas.toBlob((blob) => {
          if (!blob) return reject("Blob generation failed");
          resolve({ blob, name: imgFile.name.replace(/\.[^/.]+$/, "") + `-upscaled-${settings.scale}x.png` });
        }, "image/png");
      };
      img.onerror = () => reject("Image load error");
      img.src = imgFile.url;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 mt-24">
        <BulkProcessor
          onProcess={onProcess}
          renderControls={renderControls}
          renderPreview={renderPreview}
        />
      </div>
    </div>
  );
}
