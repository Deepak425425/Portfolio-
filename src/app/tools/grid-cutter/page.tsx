"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { getGrotonExportFilename } from "@/utils/export";

export default function GridCutterPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("image");
  const [imageExt, setImageExt] = useState<string>("jpg");
  const [imageDimensions, setImageDimensions] = useState<{w: number, h: number} | null>(null);
  
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(4);
  const [isCustom, setIsCustom] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    [1, 2], [1, 3],
    [2, 2], [2, 3], [2, 4],
    [3, 2], [3, 3], [3, 4], [3, 5],
    [4, 2], [4, 3], [4, 4], [4, 5],
    [5, 2], [5, 3], [5, 4], [5, 5]
  ];

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    // Parse name and extension
    const parts = file.name.split('.');
    const ext = parts.pop() || 'jpg';
    setImageExt(ext);
    setImageName(parts.join('.'));
    
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ w: img.width, h: img.height });
    };
    img.src = url;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const resetImage = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setImageDimensions(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectPreset = (c: number, r: number) => {
    setCols(c);
    setRows(r);
    setIsCustom(false);
  };

  const generatePanels = async (): Promise<{url: string, name: string}[]> => {
    if (!imageSrc || !imageDimensions) return [];
    
    const img = document.createElement("img");
    img.src = imageSrc;
    await new Promise(resolve => img.onload = resolve);
    
    const panelWidth = imageDimensions.w / cols;
    const panelHeight = imageDimensions.h / rows;
    
    const panels = [];
    const canvas = document.createElement("canvas");
    canvas.width = panelWidth;
    canvas.height = panelHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    
    let counter = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.clearRect(0, 0, panelWidth, panelHeight);
        ctx.drawImage(
          img,
          c * panelWidth, r * panelHeight, panelWidth, panelHeight,
          0, 0, panelWidth, panelHeight
        );
        
        // determine mime type
        let mime = "image/jpeg";
        if (imageExt.toLowerCase() === "png") mime = "image/png";
        else if (imageExt.toLowerCase() === "webp") mime = "image/webp";
        
        const dataUrl = canvas.toDataURL(mime, 1.0);
        const seq = counter.toString().padStart(2, '0');
        panels.push({
          url: dataUrl,
          name: `${imageName}_${seq}.${imageExt}`
        });
        counter++;
      }
    }
    return panels;
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    const panels = await generatePanels();
    panels.forEach((panel, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = panel.url;
        a.download = getGrotonExportFilename(panel.name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 200);
    });
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    setIsProcessing(true);
    const panels = await generatePanels();
    const zip = new JSZip();
    
    panels.forEach(panel => {
      const idx = panel.url.indexOf("base64,") + 7;
      const b64 = panel.url.substring(idx);
      zip.file(getGrotonExportFilename(panel.name), b64, {base64: true});
    });
    
    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = getGrotonExportFilename(`${imageName}_grid_${cols}x${rows}.zip`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsProcessing(false);
  };
  
  const downloadSingle = async (c: number, r: number) => {
    if (!imageSrc || !imageDimensions) return;
    
    const img = document.createElement("img");
    img.src = imageSrc;
    await new Promise(resolve => img.onload = resolve);
    
    const panelWidth = imageDimensions.w / cols;
    const panelHeight = imageDimensions.h / rows;
    
    const canvas = document.createElement("canvas");
    canvas.width = panelWidth;
    canvas.height = panelHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(
      img,
      c * panelWidth, r * panelHeight, panelWidth, panelHeight,
      0, 0, panelWidth, panelHeight
    );
    
    let mime = "image/jpeg";
    if (imageExt.toLowerCase() === "png") mime = "image/png";
    else if (imageExt.toLowerCase() === "webp") mime = "image/webp";
    
    const dataUrl = canvas.toDataURL(mime, 1.0);
    const counter = (r * cols) + c + 1;
    const seq = counter.toString().padStart(2, '0');
    
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = getGrotonExportFilename(`${imageName}_${seq}.${imageExt}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black selection:bg-[#111111] selection:text-white">
      {/* HEADER */}
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-transparent border-b border-zinc-200">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          GROTON AI STUDIO
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/services" className="hover:text-black transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/tools" className="text-black transition-colors">Tools</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col items-center pt-16 pb-24 px-6 md:px-12 lg:px-24 bg-zinc-50">
      {/* AMBIENT GRADIENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#DCD7FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[#E4E9FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#FFF4E6] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#F8DDEB] opacity-30 blur-[120px] rounded-full"></div>
      </div>

        <div className="w-full max-w-[1400px]">
          
          <div className="mb-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-zinc-400 hover:text-black transition-colors text-xs font-bold tracking-[0.2em] uppercase mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Tools
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-black mb-4">Grid Cutter</h1>
            <p className="font-sans font-light text-zinc-500 text-sm md:text-base max-w-lg">
              Upload one image and split it into multiple equal panels according to a selected grid.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT AREA: UPLOAD / PREVIEW */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {!imageSrc ? (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] md:aspect-[16/9] border-2 border-dashed border-zinc-300 hover:border-[#111111] transition-colors flex flex-col items-center justify-center bg-transparent cursor-pointer group"
                >
                  <svg className="w-10 h-10 text-zinc-300 group-hover:text-black transition-colors mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <p className="font-bold tracking-[0.1em] uppercase text-sm mb-2 text-zinc-700 group-hover:text-black transition-colors">Click or drag image to upload</p>
                  <p className="text-zinc-400 font-light text-xs">JPG, PNG, WEBP supported.</p>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center border border-zinc-200">
                  <div className="relative max-w-full max-h-[70vh]">
                    <img 
                      ref={imgRef}
                      src={imageSrc} 
                      alt="Preview" 
                      className="max-w-full max-h-[70vh] object-contain block"
                    />
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 z-10 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
                      {Array.from({ length: cols * rows }).map((_, i) => {
                        const r = Math.floor(i / cols);
                        const c = i % cols;
                        return (
                          <div key={i} className="border border-white/50 relative group pointer-events-auto flex items-center justify-center hover:bg-transparent/10 transition-colors">
                            <span className="opacity-0 group-hover:opacity-100 font-bold text-white text-xs drop-shadow-md bg-[#111111]/30 px-2 py-1 rounded absolute select-none pointer-events-none">{(i + 1).toString().padStart(2, '0')}</span>
                            <button 
                              onClick={() => downloadSingle(c, r)}
                              className="opacity-0 group-hover:opacity-100 absolute bottom-2 right-2 bg-transparent text-black p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                              title={`Download panel ${i + 1}`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT AREA: CONTROLS */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              <div className="bg-transparent p-6 md:p-8 border border-zinc-200 flex flex-col gap-8">
                
                {/* PRESETS */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold tracking-[0.2em] uppercase text-[11px] text-zinc-500">Grid Options</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {presets.slice(0, 9).map(([c, r]) => {
                      const active = !isCustom && cols === c && rows === r;
                      return (
                        <button 
                          key={`${c}x${r}`} 
                          onClick={() => selectPreset(c, r)}
                          className={`py-2 px-1 text-xs font-bold tracking-widest border transition-colors ${active ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111] hover:text-black'}`}
                        >
                          {c} × {r}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => setIsCustom(true)}
                    className={`mt-2 py-3 w-full text-xs font-bold tracking-widest border transition-colors uppercase ${isCustom ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111] hover:text-black'}`}
                  >
                    Custom Grid
                  </button>
                </div>

                {/* CUSTOM INPUTS */}
                {isCustom && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-row gap-4 overflow-hidden">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Columns</label>
                      <input 
                        type="number" min={1} max={10} value={cols} 
                        onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-[#111111] transition-colors font-light text-center"
                      />
                    </div>
                    <div className="flex items-end pb-3 text-zinc-300">×</div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Rows</label>
                      <input 
                        type="number" min={1} max={10} value={rows} 
                        onChange={(e) => setRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-[#111111] transition-colors font-light text-center"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="h-px w-full bg-zinc-200"></div>

                {/* INFO */}
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Status</span>
                    <span className="font-bold uppercase tracking-widest text-[10px] flex items-center">{imageSrc ? 'Ready' : 'Waiting for image'}</span>
                  </div>
                  {imageDimensions && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-light">Original</span>
                      <span className="font-bold tracking-wider text-[11px]">{imageDimensions.w} × {imageDimensions.h} px</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Grid</span>
                    <span className="font-bold tracking-wider text-[11px]">{cols} × {rows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-light">Total Output</span>
                    <span className="font-bold tracking-wider text-[11px]">{cols * rows} panels</span>
                  </div>
                </div>

                {/* EXPORT BUTTONS */}
                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    disabled={!imageSrc || isProcessing}
                    onClick={downloadZip}
                    className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:bg-zinc-300 disabled:text-zinc-500 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Download ZIP'}
                  </button>
                  <button 
                    disabled={!imageSrc || isProcessing}
                    onClick={downloadAll}
                    className="w-full py-4 bg-transparent border border-[#111111] text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:border-zinc-300 disabled:text-zinc-400"
                  >
                    Download All
                  </button>
                </div>
                
                {imageSrc && (
                  <button 
                    onClick={resetImage}
                    className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors"
                  >
                    Reset / Change Image
                  </button>
                )}

                <p className="text-[10px] text-zinc-400 font-light text-center mt-2 italic">
                  Images are processed locally in your browser.
                </p>

              </div>
            </div>
          </div>
        </div>
      
      {/* SEO CONTENT BLOCK */}
      <section id="seo-content-block" className="max-w-[1280px] mx-auto w-full px-6 md:px-8 py-16 md:py-24 mt-12 border-t border-zinc-200/50">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-zinc-600">
            <div className="flex flex-col gap-4 lg:col-span-2">
               <h2 className="text-2xl font-serif text-[#111111]">Free Online Grid Cutter Tool</h2>
               <p className="text-sm leading-relaxed">Process and edit your images securely in your browser with Groton's free grid cutter utility.</p>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] mt-6">How to use</h3>
               <ol className="list-decimal list-inside text-sm flex flex-col gap-2">
                  <li>Upload your image.</li><li>Adjust the tool settings.</li><li>Download your processed image.</li>
               </ol>
            </div>
            <div className="flex flex-col gap-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111]">Key Features</h3>
               <ul className="list-disc list-inside text-sm flex flex-col gap-2">
                  <li>Browser-based processing</li><li>No data stored on servers</li><li>High quality export</li><li>Free to use</li>
               </ul>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] mt-6">Related Tools</h3>
               <p className="text-sm flex flex-wrap gap-2 leading-relaxed">
                  <a href="/tools/convert" className="text-[#8B7CFF] hover:underline">Image Converter</a> • <a href="/tools/compressor" className="text-[#8B7CFF] hover:underline">Image Compressor</a>
               </p>
            </div>
         </div>
         <div className="mt-12 text-xs text-zinc-400 max-w-3xl">
            <strong>Supported Formats:</strong> JPG, PNG, WebP. 
            All image processing is done securely. Groton AI is a suite of online image tools designed for e-commerce, creators, and visual production.
         </div>
      </section>
</main>
    </div>
  );
}
