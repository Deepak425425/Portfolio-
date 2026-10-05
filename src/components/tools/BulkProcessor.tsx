"use client";

import React, { useState } from "react";
import UploadDropzone from "./UploadDropzone";
import JSZip from "jszip";
import { getGrotonExportFilename } from "@/utils/export";

export interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  ext: string;
}

interface BulkProcessorProps {
  // Required to actually perform the transformation
  onProcess: (img: ImgFile) => Promise<{ blob: Blob, name: string } | null>;
  
  // Custom UI for the specific tool controls (sliders, buttons, etc)
  renderControls: (currentImg: ImgFile | null, isProcessing: boolean) => React.ReactNode;
  
  // Custom UI for the preview (canvas, img, etc)
  renderPreview: (currentImg: ImgFile | null) => React.ReactNode;
  
  // Allow tool to reset its own state
  onReset?: () => void;
  
  // Custom download logic if tool needs to override the default single download
  onDownloadSingle?: (img: ImgFile) => Promise<void>;
  
  // Disable bulk mode if the tool only makes sense for single image (e.g. color picker)
  disableBulk?: boolean;
  
  // Custom export buttons to override the default "Export Image" button area
  customExportButtons?: (
    isProcessing: boolean, 
    processSingle: () => Promise<void>, 
    processBulkZip: () => Promise<void>,
    images: ImgFile[],
    setProgress: React.Dispatch<React.SetStateAction<{current: number, total: number}>>,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    mode: "single" | "bulk"
  ) => React.ReactNode;
}

export default function BulkProcessor({ onProcess, renderControls, renderPreview, onReset, onDownloadSingle, disableBulk, customExportButtons }: BulkProcessorProps) {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

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
        ext
      };
    });
    
    if (mode === "single" || disableBulk) {
      if (images.length > 0) images.forEach(i => URL.revokeObjectURL(i.url));
      setImages([newImgs[0]]);
      setPreviewIndex(0);
    } else {
      setImages(prev => [...prev, ...newImgs]);
    }
  };

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
    setPreviewIndex(0);
    setProgress({ current: 0, total: 0 });
    if (onReset) onReset();
  };

  const removeImg = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newImgs = images.filter(i => i.id !== id);
    const removed = images.find(i => i.id === id);
    if (removed) URL.revokeObjectURL(removed.url);
    
    setImages(newImgs);
    if (previewIndex >= newImgs.length) {
      setPreviewIndex(Math.max(0, newImgs.length - 1));
    }
  };

  const processSingle = async () => {
    if (!images[previewIndex]) return;
    if (onDownloadSingle) {
      await onDownloadSingle(images[previewIndex]);
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await onProcess(images[previewIndex]);
      if (res) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.blob);
        a.download = getGrotonExportFilename(res.name);
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch (e) {
      console.error(e);
      alert("Error processing image.");
    }
    setIsProcessing(false);
  };

  const processBulkZip = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: images.length });
    
    const zip = new JSZip();
    let successCount = 0;
    let failedNames: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      setProgress({ current: i + 1, total: images.length });
      try {
        const res = await onProcess(images[i]);
        if (res) {
          zip.file(getGrotonExportFilename(res.name), res.blob);
          successCount++;
        } else {
          failedNames.push(images[i].name);
        }
      } catch (e) {
        console.error(`Failed to process ${images[i].name}`, e);
        failedNames.push(images[i].name);
      }
      // Yield to main thread
      await new Promise(r => setTimeout(r, 50));
    }
    
    if (successCount > 0) {
      if (failedNames.length > 0) {
        alert(`Finished with errors. ${failedNames.length} image(s) failed to process: ${failedNames.slice(0, 3).join(", ")}${failedNames.length > 3 ? '...' : ''}`);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "groton-export.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      alert("No images were successfully processed.");
    }
    
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
  };

  const currentImg = images.length > 0 ? images[previewIndex] : null;

  // IMPORTANT: Execute render props unconditionally to preserve React hook order
  const previewContent = renderPreview(currentImg);
  const controlsContent = renderControls(currentImg, isProcessing);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* LEFT PANEL */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Mode Selector */}
        {!disableBulk && (
          <div className="flex gap-2">
            <button 
              onClick={() => { setMode("single"); if(images.length > 1) { const keep = images[0]; images.slice(1).forEach(i => URL.revokeObjectURL(i.url)); setImages([keep]); setPreviewIndex(0); } }}
              className={`flex-1 py-3 text-xs font-bold tracking-widest border uppercase transition-colors ${mode === "single" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}
            >
              Single
            </button>
            <button 
              onClick={() => setMode("bulk")}
              className={`flex-1 py-3 text-xs font-bold tracking-widest border uppercase transition-colors ${mode === "bulk" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}
            >
              Bulk Mode
            </button>
          </div>
        )}

        {images.length === 0 ? (
          <UploadDropzone onUpload={handleUpload} multiple={mode === "bulk"} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Main Preview Area */}
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 min-h-[60vh] overflow-hidden">
              {previewContent}
            </div>

            {/* Bulk Thumbnails List */}
            {mode === "bulk" && images.length > 0 && (
              <div className="w-full bg-white p-4 flex gap-2 overflow-x-auto border border-zinc-200 items-center">
                {/* Add More Button */}
                <label className="relative h-16 w-16 shrink-0 border-2 border-dashed border-zinc-300 flex items-center justify-center cursor-pointer hover:border-black hover:bg-zinc-50 transition-colors">
                  <span className="text-xl text-zinc-400">+</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => { if(e.target.files) handleUpload(Array.from(e.target.files)); }} className="hidden" />
                </label>

                {images.map((img, i) => (
                  <div key={img.id} className="relative group">
                    <button onClick={() => setPreviewIndex(i)} className={`relative h-16 w-16 shrink-0 border-2 transition-colors ${previewIndex === i ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <img src={img.url} className="w-full h-full object-cover" />
                    </button>
                    <button onClick={(e) => removeImg(img.id, e)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 shadow transition-opacity">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL - CONTROLS */}
      <div className="lg:col-span-4 flex flex-col lg:h-full lg:overflow-y-auto lg:max-h-[85vh] pb-12 lg:pr-2 gap-8">
        <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
          
          {controlsContent}

          {images.length > 0 && (
            <div className="flex flex-col gap-3 mt-4 border-t border-zinc-100 pt-6">
              
              {customExportButtons ? (
                customExportButtons(isProcessing, processSingle, processBulkZip, images, setProgress, setIsProcessing, mode)
              ) : (
                mode === "single" || disableBulk ? (
                  <button disabled={isProcessing} onClick={processSingle} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50">
                    {isProcessing ? 'Processing...' : 'Export Image'}
                  </button>
                ) : (
                  <>
                    <button disabled={isProcessing} onClick={processBulkZip} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1">
                      <span>{isProcessing ? `Processing ${progress.current} / ${progress.total}` : `Export ${images.length} Image${images.length>1?'s':''} as ZIP`}</span>
                      {isProcessing && progress.total > 0 && (
                        <div className="w-3/4 h-1 bg-zinc-800 mt-2 overflow-hidden">
                          <div className="h-full bg-white transition-all" style={{ width: `${(progress.current/progress.total)*100}%` }}></div>
                        </div>
                      )}
                    </button>
                    
                    <button disabled={isProcessing} onClick={processSingle} className="w-full py-3 border border-black text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50">
                      Export Current Only
                    </button>
                  </>
                )
              )}

              <button onClick={reset} disabled={isProcessing} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-red-500 transition-colors mt-2">
                Reset / Clear {mode==="bulk"?"All":""}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
