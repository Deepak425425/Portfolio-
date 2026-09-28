"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  origExt: string;
}

export default function ConvertPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("png");
  const [quality, setQuality] = useState(90);

  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    const newImgs = valid.map(f => {
      const parts = f.name.split('.');
      const ext = parts.pop() || 'jpg';
      return {
        id: Math.random().toString(36).substring(7),
        file: f,
        url: URL.createObjectURL(f),
        name: parts.join('.'),
        origExt: ext
      };
    });
    setImages(prev => [...prev, ...newImgs]);
  };

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
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
    const qual = quality / 100;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob: blob!,
          name: `${imgFile.name}-converted.${format === "jpeg" ? "jpg" : format}`
        });
      }, mime, qual);
    });
  };

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
    a.download = `converted_images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Format Converter" description="Convert JPG, PNG and WebP images in bulk without data extraction.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 p-8 border border-zinc-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square border border-zinc-300 bg-zinc-100 flex items-center justify-center overflow-hidden group">
                    <img src={img.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[9px] p-1 truncate text-center">
                      {img.origExt.toUpperCase()} → {format.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Output Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setFormat("jpeg")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${format === "jpeg" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>JPG</button>
                <button onClick={() => setFormat("png")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${format === "png" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>PNG</button>
                <button onClick={() => setFormat("webp")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${format === "webp" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>WEBP</button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 flex justify-between">
                <span>Quality (JPG/WEBP)</span> <span>{quality}%</span>
              </label>
              <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-black" disabled={format === "png"} />
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {images.length > 0 && (
              <>
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
