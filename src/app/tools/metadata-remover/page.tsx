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
  origSize: number;
}

export default function MetadataRemoverPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{id: string, url: string, newSize: number, name: string}[]>([]);

  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/') && (f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp'));
    const newImgs = valid.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
      origSize: f.size
    }));
    setImages(prev => [...prev, ...newImgs]);
  };

  const processImages = async () => {
    setIsProcessing(true);
    const newResults = [];
    for (const imgData of images) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      const img = new Image();
      img.src = imgData.url;
      await new Promise(r => img.onload = r);
      
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) ctx.drawImage(img, 0, 0);
      
      const parts = imgData.name.split('.');
      const ext = parts.pop() || 'jpg';
      let mime = "image/jpeg";
      if (ext.toLowerCase() === "png") mime = "image/png";
      if (ext.toLowerCase() === "webp") mime = "image/webp";
      
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, mime, 1.0));
      if (blob) {
        newResults.push({
          id: imgData.id,
          url: URL.createObjectURL(blob),
          newSize: blob.size,
          name: `${parts.join('.')}-cleaned.${ext}`
        });
      }
    }
    setResults(newResults);
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      const a = document.createElement("a");
      a.href = res.url;
      a.download = res.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const downloadZip = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    for (const res of results) {
      const blob = await fetch(res.url).then(r => r.blob());
      zip.file(res.name, blob);
    }
    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `cleaned_images.zip`;
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

  return (
    <ToolLayout title="Metadata Remover" description="Strip EXIF data, location tags, and camera metadata for privacy by completely reconstructing the image pixel data in the browser.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} accept="image/jpeg, image/png, image/webp" />
          ) : (
            <div className="w-full bg-zinc-200 border border-zinc-200 flex flex-col p-6 max-h-[70vh] overflow-y-auto">
              {images.map((img) => {
                const res = results.find(r => r.id === img.id);
                return (
                  <div key={img.id} className="bg-white p-4 flex items-center justify-between border-b border-zinc-100 last:border-0">
                    <div className="flex items-center gap-4">
                      <img src={img.url} className="w-12 h-12 object-cover border border-zinc-200" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold truncate max-w-[200px]">{img.name}</span>
                        <span className="text-[10px] text-zinc-500">{formatSize(img.origSize)}</span>
                      </div>
                    </div>
                    {res ? (
                      <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-green-600">Cleaned</span>
                          <span className="text-[10px] text-zinc-500">{formatSize(res.newSize)}</span>
                        </div>
                        <a href={res.url} download={res.name} className="px-3 py-1 bg-black text-white text-[10px] uppercase font-bold tracking-wider hover:bg-zinc-800 transition-colors">DL</a>
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              When you take a photo, cameras embed EXIF metadata including your exact GPS location, camera model, date, and exposure settings. 
              <br/><br/>
              This tool completely strips all metadata by decoding the raw pixels onto an isolated HTML5 Canvas and re-encoding a pure, metadata-free image entirely inside your browser.
            </p>
            <div className="h-px w-full bg-zinc-200"></div>
            
            {images.length > 0 && (
              <div className="flex flex-col gap-3">
                {results.length === 0 ? (
                  <button disabled={isProcessing} onClick={processImages} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300">
                    {isProcessing ? 'Scrubbing Metadata...' : 'Remove Metadata'}
                  </button>
                ) : (
                  <>
                    <button disabled={isProcessing} onClick={downloadZip} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300">
                      Download ZIP
                    </button>
                    <button disabled={isProcessing} onClick={downloadAll} className="w-full py-4 bg-transparent border border-black text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:border-zinc-300">
                      Download All
                    </button>
                  </>
                )}
                
                <button onClick={() => { setImages([]); setResults([]); }} className="w-full py-2 mt-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors">
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}