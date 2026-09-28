"use client";

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

interface ImgData {
  id: string;
  file: File;
  url: string;
  name: string;
  fit: "fill" | "fit";
  zoom: number;
  panX: number; // percentage offset -50 to 50
  panY: number; // percentage offset -50 to 50
  originalW: number;
  originalH: number;
}

export default function CollageMakerPage() {
  const [images, setImages] = useState<ImgData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Layout State
  const [columns, setColumns] = useState(3);
  const [ratioStr, setRatioStr] = useState("1:1");
  const ratioValues: Record<string, number> = {
    "1:1": 1,
    "4:5": 4/5,
    "3:4": 3/4,
    "4:3": 4/3,
    "3:2": 3/2,
    "16:9": 16/9,
    "9:16": 9/16,
  };
  
  // Spacing
  const [gap, setGap] = useState(16);
  const [padding, setPadding] = useState(32);
  
  // Labels
  const [showLabels, setShowLabels] = useState(true);
  const [fontSize, setFontSize] = useState(12);
  
  // Background
  const [bgColor, setBgColor] = useState("#ffffff");

  // Export
  const [quality, setQuality] = useState(92);
  const [resScale, setResScale] = useState<number>(2); // Multiplier for export size
  const [isProcessing, setIsProcessing] = useState(false);

  // Dragging inside box for Pan
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0, origPanX: 0, origPanY: 0 });

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    
    const newImgs: ImgData[] = [];
    for (const f of valid) {
      const url = URL.createObjectURL(f);
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = url; });
      const parts = f.name.split('.');
      parts.pop();
      newImgs.push({
        id: Math.random().toString(36).substring(7),
        file: f,
        url,
        name: parts.join('.'),
        fit: "fit",
        zoom: 1,
        panX: 0,
        panY: 0,
        originalW: img.width,
        originalH: img.height
      });
    }
    setImages(prev => [...prev, ...newImgs]);
  };

  // Reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setImages(prev => {
      const copy = [...prev];
      const item = copy[dragIndex];
      copy.splice(dragIndex, 1);
      copy.splice(index, 0, item);
      setDragIndex(index);
      return copy;
    });
  };
  const handleDragEnd = () => setDragIndex(null);

  const updateImage = (id: string, updates: Partial<ImgData>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const removeImage = (id: string) => {
    const img = images.find(i => i.id === id);
    if (img) URL.revokeObjectURL(img.url);
    setImages(prev => prev.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Pan Interaction
  const handlePanStart = (e: ReactMouseEvent, img: ImgData) => {
    setSelectedId(img.id);
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY, origPanX: img.panX, origPanY: img.panY });
  };
  const handlePanMove = (e: ReactMouseEvent, img: ImgData) => {
    if (!isPanning || selectedId !== img.id) return;
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    // Scale pixel movement to percentage roughly based on box size (approx 300px for sensitivity)
    const sens = 0.2 / img.zoom;
    updateImage(img.id, {
      panX: Math.max(-50, Math.min(50, startPan.origPanX + (dx * sens))),
      panY: Math.max(-50, Math.min(50, startPan.origPanY + (dy * sens)))
    });
  };
  const handlePanEnd = () => setIsPanning(false);

  const getCanvasDataUrl = async (format: string, qualityVal: number): Promise<string> => {
    if (!previewContainerRef.current) throw new Error("No preview");
    const el = previewContainerRef.current;
    
    // Create offscreen canvas with matching layout
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No ctx");

    // We base the canvas size on a high-res multiplier of the current screen container
    // Or mathematically based on the columns/ratio
    const targetWidth = 1200 * resScale;
    
    const rows = Math.ceil(images.length / columns);
    const boxW = (targetWidth - (padding * 2) - (gap * (columns - 1))) / columns;
    const boxH = boxW / (ratioValues[ratioStr] || 1);
    
    const targetHeight = (padding * 2) + (rows * boxH) + ((rows - 1) * gap);
    // Add extra height for labels if needed
    const labelHeight = showLabels ? (fontSize * 2.5) : 0;
    const totalHeight = targetHeight + (rows * labelHeight);

    canvas.width = targetWidth;
    canvas.height = totalHeight;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const r = Math.floor(i / columns);
      const c = i % columns;

      const x = padding + (c * (boxW + gap));
      const y = padding + (r * (boxH + gap + labelHeight));

      // Draw Image
      const imageObj = new Image();
      imageObj.src = img.url;
      await new Promise(resolve => { imageObj.onload = resolve; });

      ctx.save();
      
      // Create clipping path for the box
      ctx.beginPath();
      ctx.rect(x, y, boxW, boxH);
      ctx.clip();

        // Fit (Contain)
        const imgRatio = img.originalW / img.originalH;
        const boxRatio = boxW / boxH;
        let drawW = boxW;
        let drawH = boxH;

        if (imgRatio > boxRatio) {
          drawH = boxW / imgRatio;
        } else {
          drawW = boxH * imgRatio;
        }

        drawW *= img.zoom;
        drawH *= img.zoom;

        // Apply Pan
        const panXpx = (img.panX / 100) * boxW;
        const panYpx = (img.panY / 100) * boxH;

        const drawX = x + (boxW - drawW) / 2 + panXpx;
        const drawY = y + (boxH - drawH) / 2 + panYpx;

        ctx.drawImage(imageObj, drawX, drawY, drawW, drawH);

      ctx.restore();

      // Draw Label
      if (showLabels) {
        ctx.fillStyle = bgColor === '#000000' || bgColor === 'black' ? '#ffffff' : '#000000';
        ctx.font = `${fontSize * (targetWidth / 800)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(img.name, x + (boxW / 2), y + boxH + (fontSize * 0.8));
      }
    }

    return canvas.toDataURL(`image/${format}`, quality / 100);
  };

  const downloadFile = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const exportCollage = async (format: "jpeg" | "png" | "webp") => {
    setIsProcessing(true);
    try {
      const dataUrl = await getCanvasDataUrl(format, quality);
      downloadFile(dataUrl, `groton-collage.${format === 'jpeg' ? 'jpg' : format}`);
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    }
    setIsProcessing(false);
  };

  const exportAllFormats = async () => {
    setIsProcessing(true);
    try {
      const jpg = await getCanvasDataUrl("jpeg", quality);
      downloadFile(jpg, `groton-collage.jpg`);
      await new Promise(r => setTimeout(r, 500));
      
      const png = await getCanvasDataUrl("png", quality);
      downloadFile(png, `groton-collage.png`);
      await new Promise(r => setTimeout(r, 500));
      
      const webp = await getCanvasDataUrl("webp", quality);
      downloadFile(webp, `groton-collage.webp`);
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const exportIndividuals = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const blob = await fetch(img.url).then(r => r.blob());
      const ext = img.file.name.split('.').pop() || 'jpg';
      const num = String(i + 1).padStart(2, '0');
      zip.file(`${num}-${img.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${ext}`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "individual-images.zip";
    a.click();
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Collage Maker" description="Professional grid layout builder with precise constraints, equal-sized containers, and high-resolution export.">
      {images.length === 0 ? (
        <div className="max-w-4xl mx-auto w-full">
          <UploadDropzone onUpload={handleUpload} multiple={true} accept="image/*" />
        </div>
      ) : (
        <div className="w-full flex flex-col xl:flex-row gap-6 h-[80vh]">
          
          {/* LEFT: Image List */}
          <div className="w-full xl:w-72 bg-white border border-zinc-200 flex flex-col h-full shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 sticky top-0 bg-white z-10 flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Layers ({images.length})</span>
              <label className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-black text-zinc-400">
                + Add
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleUpload(Array.from(e.target.files))} />
              </label>
            </div>
            <div className="flex flex-col p-2 gap-2">
              {images.map((img, i) => (
                <div 
                  key={img.id}
                  draggable
                  onDragStart={e => handleDragStart(e, i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedId(img.id)}
                  className={`flex items-center gap-3 p-2 border transition-colors cursor-move group ${selectedId === img.id ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'} ${dragIndex === i ? 'opacity-50' : ''}`}
                >
                  <span className="text-[9px] font-bold text-zinc-400 w-4">{String(i + 1).padStart(2, '0')}</span>
                  <img src={img.url} className="w-10 h-10 object-cover border border-zinc-200" />
                  <input 
                    type="text" 
                    value={img.name} 
                    onChange={e => updateImage(img.id, { name: e.target.value })}
                    className="flex-1 min-w-0 text-xs bg-transparent focus:outline-none border-b border-transparent focus:border-zinc-300 px-1"
                  />
                  <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: Live Preview */}
          <div className="flex-1 bg-zinc-200 border border-zinc-200 relative overflow-hidden flex items-center justify-center p-8"
               onMouseUp={handlePanEnd} onMouseLeave={handlePanEnd}>
            
            {/* The scaled preview wrapper */}
            <div 
              ref={previewContainerRef}
              className="relative shadow-2xl transition-all duration-300"
              style={{
                backgroundColor: bgColor,
                padding: `${padding}px`,
                width: "100%",
                maxWidth: "800px",
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`
              }}
            >
              {images.map(img => (
                <div key={img.id} className="flex flex-col items-center">
                  <div 
                    className={`relative w-full overflow-hidden border transition-colors cursor-grab active:cursor-grabbing ${selectedId === img.id ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.5)] z-10' : 'border-transparent'}`}
                    style={{ aspectRatio: ratioValues[ratioStr] }}
                    onMouseDown={e => handlePanStart(e, img)}
                    onMouseMove={e => handlePanMove(e, img)}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(img.id); }}
                  >
                    <img 
                      src={img.url} 
                      className="absolute max-w-none pointer-events-none"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${img.panX}%), calc(-50% + ${img.panY}%)) scale(${img.zoom})`
                      }} 
                    />
                  </div>
                  {showLabels && (
                    <div 
                      className="mt-3 text-center w-full truncate px-2"
                      style={{ 
                        color: bgColor === '#000000' || bgColor === 'black' ? '#ffffff' : '#000000',
                        fontSize: `${fontSize}px` 
                      }}
                    >
                      {img.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 text-[9px] uppercase tracking-widest font-bold shadow">
              Live Preview
            </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="w-full xl:w-80 bg-white border border-zinc-200 flex flex-col h-full shrink-0 overflow-y-auto p-6 gap-8">
            
            {/* LAYOUT */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">1. Layout</h3>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500">Columns</label>
                <div className="grid grid-cols-5 gap-1">
                  {[1,2,3,4,5].map(c => (
                    <button key={c} onClick={() => setColumns(c)} className={`py-1 text-[10px] border ${columns === c ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500">Image Ratio</label>
                <div className="grid grid-cols-4 gap-1">
                  {["1:1","4:5","3:4","4:3","3:2","16:9","9:16"].map(r => (
                    <button key={r} onClick={() => setRatioStr(r)} className={`py-1 text-[10px] border ${ratioStr === r ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black'}`}>{r}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* IMAGE CONTROLS */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">
                2. Image {selectedId ? '(Selected)' : '(Select an image)'}
              </h3>
              <div className={`flex flex-col gap-4 ${!selectedId ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                    <span>Zoom</span>
                    <span>{images.find(i=>i.id===selectedId)?.zoom.toFixed(2)}x</span>
                  </label>
                  <input type="range" min="0.5" max="3" step="0.05" value={images.find(i=>i.id===selectedId)?.zoom || 1} onChange={e => selectedId && updateImage(selectedId, { zoom: parseFloat(e.target.value) })} className="w-full accent-black" />
                </div>
                <button onClick={() => selectedId && updateImage(selectedId, { zoom:1, panX:0, panY:0 })} className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black text-left">Reset Image Position</button>
              </div>
            </div>

            {/* SPACING */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">3. Spacing & Style</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Image Gap</label>
                  <input type="number" value={gap} onChange={e => setGap(Number(e.target.value))} className="w-full border-b border-zinc-300 py-1 bg-transparent text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Padding</label>
                  <input type="number" value={padding} onChange={e => setPadding(Number(e.target.value))} className="w-full border-b border-zinc-300 py-1 bg-transparent text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500">Background</label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <button onClick={() => setBgColor("#ffffff")} className={`h-6 border ${bgColor==='#ffffff'?'border-black':'border-zinc-200'} bg-white`}></button>
                  <button onClick={() => setBgColor("#000000")} className={`h-6 border ${bgColor==='#000000'?'border-blue-500':'border-zinc-200'} bg-black`}></button>
                  <button onClick={() => setBgColor("transparent")} className={`h-6 border ${bgColor==='transparent'?'border-black':'border-zinc-200'} bg-[#e5e5f7]`} style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)', backgroundSize: '10px 10px' }}></button>
                </div>
              </div>
            </div>

            {/* LABELS */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2 flex justify-between items-center">
                4. Labels
                <input type="checkbox" checked={showLabels} onChange={e=>setShowLabels(e.target.checked)} className="accent-black" />
              </h3>
              {showLabels && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Font Size ({fontSize}px)</label>
                  <input type="range" min="8" max="32" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full accent-black" />
                </div>
              )}
            </div>

            {/* EXPORT */}
            <div className="flex flex-col gap-4 mt-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2 bg-zinc-50 p-2">5. Export</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500">Resolution Multiplier</label>
                <div className="grid grid-cols-4 gap-1">
                  <button onClick={() => setResScale(1)} className={`py-1 text-[10px] border ${resScale===1 ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black'}`}>1x</button>
                  <button onClick={() => setResScale(2)} className={`py-1 text-[10px] border ${resScale===2 ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black'}`}>2x</button>
                  <button onClick={() => setResScale(3)} className={`py-1 text-[10px] border ${resScale===3 ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black'}`}>3x</button>
                  <button onClick={() => setResScale(4)} className={`py-1 text-[10px] border ${resScale===4 ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black'}`}>4x</button>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                  <span>JPG/WEBP Quality</span><span>{quality}%</span>
                </label>
                <input type="range" min="50" max="100" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-full accent-black" />
              </div>

              <div className="grid grid-cols-3 gap-1 mt-2">
                <button disabled={isProcessing} onClick={() => exportCollage('jpeg')} className="py-2 text-[10px] uppercase font-bold tracking-widest bg-black text-white hover:bg-zinc-800 disabled:opacity-50">JPG</button>
                <button disabled={isProcessing} onClick={() => exportCollage('png')} className="py-2 text-[10px] uppercase font-bold tracking-widest bg-black text-white hover:bg-zinc-800 disabled:opacity-50">PNG</button>
                <button disabled={isProcessing} onClick={() => exportCollage('webp')} className="py-2 text-[10px] uppercase font-bold tracking-widest bg-black text-white hover:bg-zinc-800 disabled:opacity-50">WEBP</button>
              </div>

              <button disabled={isProcessing} onClick={exportAllFormats} className="w-full py-3 border border-black text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50">
                Export All Formats
              </button>

              <button disabled={isProcessing} onClick={exportIndividuals} className="w-full py-3 border border-zinc-200 text-zinc-600 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors mt-2 disabled:opacity-50">
                Export Individual Images (ZIP)
              </button>
            </div>
            
          </div>
        </div>
      )}
    </ToolLayout>
  );
}