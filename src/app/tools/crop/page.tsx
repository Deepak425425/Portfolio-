"use client";
import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { Cropper, CropperRef } from "@/components/tools/crop/Cropper";

type AspectRatio = number | "free";

const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: "FREE", value: "free" },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4/5 },
  { label: "3:4", value: 3/4 },
  { label: "4:3", value: 4/3 },
  { label: "3:2", value: 3/2 },
  { label: "16:9", value: 16/9 },
  { label: "9:16", value: 9/16 },
];

export default function CropPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  const cropperRef = useRef<CropperRef>(null);
  const [cropInfo, setCropInfo] = useState<{ origW: number; origH: number; cropW: number; cropH: number } | null>(null);

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setFileName(file.name);
    
    const img = new Image();
    img.onload = () => {
       setImgObj(img);
       // Select 'Original' aspect ratio by default (or free)
       // Let's just keep 'free' by default
    };
    img.src = objectUrl;
  };

  const resetAll = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setImgObj(null);
    setFileName("");
    setAspectRatio("free");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setCropInfo(null);
  };
  
  // Continuously read crop info for the "Before/After" display
  useEffect(() => {
    if (!imgObj) return;
    const t = setInterval(() => {
      if (cropperRef.current) {
        setCropInfo(cropperRef.current.getCropInfo());
      }
    }, 100);
    return () => clearInterval(t);
  }, [imgObj, aspectRatio, rotation, zoom, flipH, flipV]);

  const exportImage = (format: "png" | "jpg" | "webp") => {
    if (!cropperRef.current) return;
    const canvas = cropperRef.current.getCroppedCanvas();
    if (!canvas) return;
    
    const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
    const a = document.createElement("a");
    a.href = canvas.toDataURL(mime, 0.95);
    
    const origExt = fileName.split('.').pop() || '';
    const baseName = fileName.substring(0, fileName.length - (origExt.length ? origExt.length + 1 : 0));
    a.download = getGrotonExportFilename(`${baseName}.${format}`);
    a.click();
  };

  return (
    <ToolLayout title="Image Crop" description="Professionally crop, rotate, and frame your images.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT PANEL - PREVIEW */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!url ? (
            <div className="w-full max-w-md mx-auto mt-12">
              <UploadDropzone onUpload={handleUpload} multiple={false} accept="image/jpeg, image/png, image/webp" />
            </div>
          ) : (
            <div className="w-full bg-zinc-200 border border-zinc-200">
               {imgObj && (
                 <Cropper 
                   ref={cropperRef}
                   image={imgObj}
                   aspectRatio={aspectRatio}
                   rotation={rotation}
                   flipH={flipH}
                   flipV={flipV}
                   zoom={zoom}
                   onZoomChange={setZoom}
                 />
               )}
            </div>
          )}
          
          {cropInfo && (
            <div className="flex justify-between items-center bg-white p-4 border border-zinc-200 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
               <div>Original: {cropInfo.origW} × {cropInfo.origH}</div>
               <div className="text-black">Crop Result: {cropInfo.cropW} × {cropInfo.cropH}</div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - CONTROLS */}
        <div className="lg:col-span-4 flex flex-col lg:h-full lg:overflow-y-auto lg:max-h-[85vh] pb-12 gap-8">
           <div className={`bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-8 transition-opacity ${!url ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              
              {/* SECTION 1 - CROP */}
              <div className="flex flex-col gap-5">
                 <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Aspect Ratio</h3>
                    <button onClick={() => setAspectRatio(imgObj ? imgObj.naturalWidth / imgObj.naturalHeight : 1)} className="text-[9px] uppercase tracking-widest text-[#8B7CFF] hover:text-black">Original</button>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map(ar => (
                      <button 
                        key={ar.label} 
                        onClick={() => setAspectRatio(ar.value)} 
                        className={`py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${aspectRatio === ar.value ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}
                      >
                         {ar.label}
                      </button>
                    ))}
                 </div>
              </div>

              {/* SECTION 2 - TRANSFORM */}
              <div className="flex flex-col gap-5">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">Transform</h3>
                 
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between">
                       <span>Zoom</span>
                       <span>{Math.round(zoom * 100)}%</span>
                    </label>
                    <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                 </div>

                 <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between">
                       <span>Rotation</span>
                       <span>{rotation}°</span>
                    </label>
                    <input type="range" min="-180" max="180" step="1" value={rotation} onChange={e => setRotation(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                    <div className="grid grid-cols-5 gap-1 mt-1">
                       {[-90, -45, 0, 45, 90].map(r => (
                         <button key={r} onClick={() => setRotation(r)} className="py-2 text-[9px] font-bold border border-zinc-200 text-zinc-500 hover:border-[#111111] transition-colors">{r}°</button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="flex gap-2 mt-2">
                    <button onClick={() => setFlipH(!flipH)} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${flipH ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Flip H</button>
                    <button onClick={() => setFlipV(!flipV)} className={`flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${flipV ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Flip V</button>
                 </div>
              </div>

              {/* SECTION 3 - POSITION */}
              <div className="flex flex-col gap-5">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">Position</h3>
                 <button onClick={() => cropperRef.current?.centerImage()} className="w-full py-3 bg-zinc-100 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors border border-zinc-200">
                    Center Image
                 </button>
              </div>

              {/* SECTION 4 - EXPORT */}
              <div className="flex flex-col gap-5">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">Export</h3>
                 
                 <div className="flex gap-2">
                    <button onClick={() => exportImage("png")} className="flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">PNG</button>
                    <button onClick={() => exportImage("jpg")} className="flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">JPG</button>
                    <button onClick={() => exportImage("webp")} className="flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">WEBP</button>
                 </div>

                 <div className="flex flex-col gap-3 mt-2">
                    <button onClick={() => exportImage("jpg")} className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors">
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