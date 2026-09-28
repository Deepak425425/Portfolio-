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
}

export default function CompressorPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [quality, setQuality] = useState(80);

  const [estSize, setEstSize] = useState<number | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

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
        origExt: ext,
        origSize: f.size
      };
    });
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
    const qual = quality / 100;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob: blob!,
          name: `${imgFile.name}-compressed.${format === "jpeg" ? "jpg" : format}`
        });
      }, mime, qual);
    });
  };

  const updatePreview = async () => {
    if (!images[previewIndex]) return;
    const res = await processSingle(images[previewIndex]);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl(URL.createObjectURL(res.blob));
    setEstSize(res.blob.size);
  };

  useEffect(() => {
    updatePreview();
  }, [images, previewIndex, format, quality]);

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
    <ToolLayout title="Image Compressor" description="Compress images in bulk while controlling visual quality.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200">
              <div className="grid grid-cols-2 w-full h-[60vh] divide-x divide-white">
                <div className="flex flex-col relative bg-zinc-100 items-center justify-center p-4">
                  <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 shadow">Original</span>
                  <img src={images[previewIndex].url} className="max-w-full max-h-full object-contain shadow-sm" />
                </div>
                <div className="flex flex-col relative bg-zinc-100 items-center justify-center p-4">
                  <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 shadow">Compressed</span>
                  {compressedUrl && <img src={compressedUrl} className="max-w-full max-h-full object-contain shadow-sm" />}
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
                <span>Quality</span> <span>{quality}%</span>
              </label>
              <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-black" disabled={format === "png"} />
              {format === "png" && <span className="text-[9px] text-zinc-400">PNG compression is lossless (quality slider ignored).</span>}
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {images.length > 0 && (
              <>
                <div className="flex flex-col gap-3 text-sm mb-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Original Size</span>
                    <span className="font-bold tracking-wider text-[11px]">{formatSize(images[previewIndex].origSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Compressed Size</span>
                    <span className="font-bold tracking-wider text-[11px] text-green-600">{estSize ? formatSize(estSize) : '...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Saved</span>
                    <span className="font-bold tracking-wider text-[11px]">{getCompressionRatio()}%</span>
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
