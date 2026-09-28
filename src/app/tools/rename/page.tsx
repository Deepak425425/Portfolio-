"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  origName: string;
  ext: string;
}

export default function BulkRenamePage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [baseName, setBaseName] = useState("product");
  const [startNum, setStartNum] = useState(1);
  const [padding, setPadding] = useState(3);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  const handleUpload = (files: File[]) => {
    const newImgs = files.map(f => {
      const parts = f.name.split('.');
      const ext = parts.length > 1 ? parts.pop() || 'unknown' : 'unknown';
      return {
        id: Math.random().toString(36).substring(7),
        file: f,
        url: URL.createObjectURL(f),
        origName: parts.join('.'),
        ext
      };
    });
    setImages(prev => [...prev, ...newImgs]);
  };

  const getNewName = (index: number, ext: string) => {
    const num = String(startNum + index).padStart(padding, '0');
    const base = baseName ? `-${baseName}` : '';
    const pre = prefix ? `${prefix}-` : '';
    const suf = suffix ? `-${suffix}` : '';
    
    if (!baseName && !prefix && !suffix) return `file-${num}.${ext}`;
    
    return `${pre}${baseName ? baseName + '-' : ''}${num}${suf}.${ext}`.replace(/--/g, '-').replace(/-\./g, '.');
  };

  const downloadZip = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const newName = getNewName(i, img.ext);
      const blob = await fetch(img.url).then(r => r.blob());
      zip.file(newName, blob);
    }
    
    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `renamed_files.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Bulk Renamer" description="Rename multiple images sequentially in the browser without uploading them anywhere.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} accept="*" />
          ) : (
            <div className="w-full bg-zinc-200 border border-zinc-200 flex flex-col p-6 max-h-[70vh] overflow-y-auto gap-2">
              <div className="grid grid-cols-2 text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-4 pb-2 border-b border-zinc-300">
                <span>Original Filename</span>
                <span>New Filename</span>
              </div>
              {images.map((img, i) => (
                <div key={img.id} className="bg-white p-4 grid grid-cols-2 gap-4 items-center border border-zinc-100">
                  <div className="flex items-center gap-4 truncate">
                    <img src={img.url} className="w-8 h-8 object-cover border border-zinc-200 shrink-0" />
                    <span className="text-xs text-zinc-500 truncate" title={`${img.origName}.${img.ext}`}>
                      {img.origName}.{img.ext}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-black truncate" title={getNewName(i, img.ext)}>
                    {getNewName(i, img.ext)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Base Filename</label>
              <input type="text" value={baseName} onChange={e => setBaseName(e.target.value)} placeholder="e.g. product" className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Start Number</label>
                <input type="number" min="0" value={startNum} onChange={e => setStartNum(Number(e.target.value))} className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Padding (001)</label>
                <input type="number" min="1" max="6" value={padding} onChange={e => setPadding(Number(e.target.value))} className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Prefix</label>
                <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="e.g. img" className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Suffix</label>
                <input type="text" value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="e.g. web" className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" />
              </div>
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {images.length > 0 && (
              <div className="flex flex-col gap-3">
                <button disabled={isProcessing} onClick={downloadZip} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300">
                  {isProcessing ? 'Packaging...' : 'Download ZIP'}
                </button>
                <button onClick={() => setImages([])} className="w-full py-2 mt-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors">
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