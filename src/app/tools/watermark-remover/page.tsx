"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { processExemplarInpainting } from "@/components/tools/inpainting/ExemplarInpainting";

export default function WatermarkRemoverPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  
  // Editor State
  const [activeTool, setActiveTool] = useState<"remove" | "restore" | "pan">("remove");
  const [brushSize, setBrushSize] = useState(40);
  
  // Process State
  const [maskExpansion, setMaskExpansion] = useState(5);
  const [showMask, setShowMask] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // View State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  // History for mask
  const [maskHistory, setMaskHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drawing state
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setFileName(file.name);
    
    const img = new Image();
    img.onload = () => {
       setImgObj(img);
       setZoom(1);
       setPan({ x: 0, y: 0 });
    };
    img.src = objectUrl;
  };

  const resetAll = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setImgObj(null);
    setFileName("");
    setMaskHistory([]);
    setHistoryIndex(-1);
  };

  const saveMaskState = useCallback(() => {
    const maskCtx = maskCanvasRef.current?.getContext("2d");
    if (!maskCtx || !imgObj) return;
    const data = maskCtx.getImageData(0, 0, imgObj.width, imgObj.height);
    const newHistory = maskHistory.slice(0, historyIndex + 1);
    newHistory.push(data);
    setMaskHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [maskHistory, historyIndex, imgObj]);

  const undo = () => {
    if (historyIndex <= 0) {
       // Clear mask
       const maskCtx = maskCanvasRef.current?.getContext("2d");
       if (maskCtx && imgObj) {
         maskCtx.clearRect(0, 0, imgObj.width, imgObj.height);
         setHistoryIndex(-1);
       }
       return;
    }
    const maskCtx = maskCanvasRef.current?.getContext("2d");
    if (maskCtx) {
      maskCtx.putImageData(maskHistory[historyIndex - 1], 0, 0);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex >= maskHistory.length - 1) return;
    const maskCtx = maskCanvasRef.current?.getContext("2d");
    if (maskCtx) {
      maskCtx.putImageData(maskHistory[historyIndex + 1], 0, 0);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const applyTestPreset = () => {
    const maskCtx = maskCanvasRef.current?.getContext("2d");
    if (!maskCtx || !imgObj) return;

    setShowMask(true); // Force mask visibility

    // Clear existing mask
    maskCtx.clearRect(0, 0, imgObj.width, imgObj.height);

    const w = imgObj.width;
    const h = imgObj.height;
    
    // Exact bounding box derived from reference image sparkle
    const maskW = w * 0.0315;
    const maskH = h * 0.0185;
    const maskX = w * 0.9106;
    const maskY = h * 0.9492;

    maskCtx.globalCompositeOperation = "source-over";

    // Transparent mask template containing ONLY the exact 4-point sparkle shape
    const b64 = "iVBORw0KGgoAAAANSUhEUgAAABMAAAAUCAYAAABvVQZ0AAAAlElEQVR4Aa3BsY3DQAxFwfe3P5bDjCEzlsMCeRcoEARLtuGdEW9UTHPwlPFgsZF4UDHNhaeMG4uNFhuJFyqmecNTxoW4qJjmQ54yTsRJxTRf8pRxUMU0myw2Wmwk/lVM8yNPmTipmOZLnjIO4qJimg95yjgRNyqmueEp4wXxoGKaC08ZNxYbLTYSb1RMc/CU8WCx0R8Y3i7WIloCJwAAAABJRU5ErkJggg==";
    
    const img = new Image();
    img.onload = () => {
      maskCtx.drawImage(img, maskX, maskY, maskW, maskH);
      saveMaskState();
    };
    img.src = 'data:image/png;base64,' + b64;
  };

  // Initialize Canvas
  useEffect(() => {
    if (!imgObj || !canvasRef.current || !maskCanvasRef.current || !resultCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const resCanvas = resultCanvasRef.current;
    
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    maskCanvas.width = imgObj.width;
    maskCanvas.height = imgObj.height;
    resCanvas.width = imgObj.width;
    resCanvas.height = imgObj.height;
    
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(imgObj, 0, 0);
    
    const resCtx = resCanvas.getContext("2d");
    if (resCtx) resCtx.drawImage(imgObj, 0, 0);
    
  }, [imgObj]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === "pan") {
      setIsDraggingPan(true);
      let cx = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      let cy = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      panStart.current = { x: cx - pan.x, y: cy - pan.y };
      return;
    }
    
    isDrawing.current = true;
    lastPos.current = getCanvasPos(e);
    draw(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDraggingPan) {
      let cx = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      let cy = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setPan({ x: cx - panStart.current.x, y: cy - panStart.current.y });
      return;
    }
    
    if (!isDrawing.current) return;
    e.preventDefault();
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = maskCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    const pos = getCanvasPos(e);
    
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    
    if (activeTool === "remove") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(139, 124, 255, 0.7)"; // Lavender mask
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    }
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    lastPos.current = pos;
  };

  const handleUp = () => {
    if (isDraggingPan) {
      setIsDraggingPan(false);
      return;
    }
    if (isDrawing.current) {
      isDrawing.current = false;
      saveMaskState();
    }
  };




  const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5];
  
  const handleZoomIn = () => {
    setZoom(z => {
      const next = ZOOM_STEPS.find(s => s > z + 0.01);
      return next || z;
    });
  };

  const handleZoomOut = () => {
    setZoom(z => {
      const prev = [...ZOOM_STEPS].reverse().find(s => s < z - 0.01);
      return prev || z;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePan = (dx: number, dy: number) => {
    setPan(p => {
       const limit = 3000; 
       return {
         x: Math.max(-limit, Math.min(limit, p.x + dx)),
         y: Math.max(-limit, Math.min(limit, p.y + dy))
       };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
    
    switch(e.key) {
      case '=':
      case '+':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case '0':
        e.preventDefault();
        handleResetView();
        break;
      case 'ArrowUp':
        e.preventDefault();
        handlePan(0, -20);
        break;
      case 'ArrowDown':
        e.preventDefault();
        handlePan(0, 20);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handlePan(-20, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        handlePan(20, 0);
        break;
    }
  };

  const processRemoval = async () => {
    if (!resultCanvasRef.current || !maskCanvasRef.current || !imgObj) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    // Give UI a moment to show loading state
    await new Promise(r => setTimeout(r, 50));
    
    const resCtx = resultCanvasRef.current.getContext("2d");
    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (!resCtx || !maskCtx) {
      setIsProcessing(false);
      return;
    }
    
    const w = imgObj.width;
    const h = imgObj.height;
    
    const imgData = resCtx.getImageData(0, 0, w, h);
    
    // Create an expanded mask if requested
    const workMaskCanvas = document.createElement("canvas");
    workMaskCanvas.width = w;
    workMaskCanvas.height = h;
    const wCtx = workMaskCanvas.getContext("2d");
    if (wCtx) {
       wCtx.drawImage(maskCanvasRef.current, 0, 0);
       if (maskExpansion > 0) {
          wCtx.globalCompositeOperation = "source-over";
          wCtx.shadowColor = "rgba(139, 124, 255, 1)";
          wCtx.shadowBlur = maskExpansion * 2;
          wCtx.drawImage(workMaskCanvas, 0, 0);
       }
    }
    
    const maskData = wCtx ? wCtx.getImageData(0, 0, w, h) : maskCtx.getImageData(0, 0, w, h);
    
    try {
      const resultData = await processExemplarInpainting(imgData, maskData, {
        patchRadius: 5,
        searchRadius: Math.max(200, w * 0.1),
        onProgress: (p) => setProgress(p)
      });
      
      resCtx.putImageData(resultData, 0, 0);
      
      // Clear mask automatically after successful processing
      maskCtx.clearRect(0, 0, w, h);
      setHistoryIndex(-1);
      setMaskHistory([]);
    } catch (err) {
      console.error(err);
      alert("Processing failed. Please try a smaller area.");
    }
    
    setIsProcessing(false);
  };

  const exportImage = (format: "png" | "jpg" | "webp") => {
    if (!resultCanvasRef.current) return;
    const a = document.createElement("a");
    const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
    a.href = resultCanvasRef.current.toDataURL(mime, 0.95);
    
    const origExt = fileName.split('.').pop() || '';
    const baseName = fileName.substring(0, fileName.length - (origExt.length ? origExt.length + 1 : 0));
    a.download = getGrotonExportFilename(`${baseName}.${format}`);
    a.click();
  };

  return (
    <ToolLayout title="Watermark Remover" description="Content-aware object removal and intelligent image reconstruction.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT PANEL - CANVAS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!url ? (
            <div className="w-full max-w-md mx-auto mt-12">
              <UploadDropzone onUpload={handleUpload} multiple={false} accept="image/jpeg, image/png, image/webp" />
            </div>
          ) : (
            <div 
              ref={containerRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 min-h-[65vh] overflow-hidden focus:outline-none focus:border-[#8B7CFF] focus:ring-1 focus:ring-[#8B7CFF]"
            >
              <div 
                className="relative"
                style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                  transformOrigin: 'center center',
                  touchAction: 'none'
                }}
                onPointerDown={handleDown}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                onPointerLeave={handleUp}
                onTouchStart={handleDown}
                onTouchMove={handleMove}
                onTouchEnd={handleUp}
                onTouchCancel={handleUp}
              >
                {/* Result layer acts as base */}
                <canvas ref={resultCanvasRef} className="max-w-full max-h-[70vh] shadow-xl block" style={{ width: 'auto', height: 'auto' }} />
                {/* Reference layer (Original) - hidden by default unless testing */}
                <canvas ref={canvasRef} className="max-w-full max-h-[70vh] absolute top-0 left-0 hidden" style={{ width: 'auto', height: 'auto' }} />
                {/* Interactive Mask Layer */}
                <canvas 
                  ref={maskCanvasRef} 
                  className={`max-w-full max-h-[70vh] absolute top-0 left-0 ${showMask ? 'opacity-80' : 'opacity-0'} mix-blend-multiply`} 
                  style={{ width: '100%', height: '100%', cursor: activeTool === "pan" ? "grab" : "crosshair" }} 
                />
              </div>

              {isProcessing && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                   <div className="text-xs font-bold uppercase tracking-widest text-[#8B7CFF]">Reconstructing Pixels</div>
                   <div className="w-64 h-1 bg-zinc-200 overflow-hidden">
                      <div className="h-full bg-[#8B7CFF] transition-all duration-200" style={{ width: `${progress}%` }}></div>
                   </div>
                   <div className="text-[10px] font-mono font-bold text-zinc-400">{progress}%</div>
                 </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL - CONTROLS */}
        <div className="lg:col-span-4 flex flex-col lg:h-full lg:overflow-y-auto lg:max-h-[85vh] pb-12 gap-8">
           
           <div className={`bg-white p-6 border border-zinc-200 flex flex-col gap-6 transition-opacity ${!url ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              
              {/* EDITOR */}
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Editor</h3>
                 <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setActiveTool("remove")} className={`py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${activeTool === "remove" ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Remove</button>
                    <button onClick={() => setActiveTool("restore")} className={`py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${activeTool === "restore" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Restore</button>
                    <button onClick={() => setActiveTool("pan")} className={`py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${activeTool === "pan" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Pan</button>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={undo} disabled={historyIndex < 0} className="py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors disabled:opacity-30 bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">Undo Mask</button>
                    <button onClick={redo} disabled={historyIndex >= maskHistory.length - 1} className="py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors disabled:opacity-30 bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">Redo Mask</button>
                 </div>
              </div>

              {/* PRESETS */}
              {imgObj && (imgObj.width / imgObj.height < 0.8) && (
                 <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Presets</h3>
                    <button 
                      onClick={applyTestPreset} 
                      className="py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]"
                    >
                      9:16 — Bottom Right
                    </button>
                 </div>
              )}

              {/* BRUSH */}
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Brush Settings</h3>
                 
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between">
                       <span>Size</span>
                       <span>{brushSize}px</span>
                    </label>
                    <div className="flex items-center gap-4">
                       <input type="range" min="1" max="500" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                       <div className="flex gap-1">
                          <button onClick={() => setBrushSize(s => Math.max(1, s - 10))} className="w-6 h-6 flex items-center justify-center border border-zinc-200 text-xs hover:border-[#111111]">-</button>
                          <button onClick={() => setBrushSize(s => Math.min(500, s + 10))} className="w-6 h-6 flex items-center justify-center border border-zinc-200 text-xs hover:border-[#111111]">+</button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* PROCESS */}
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Smart Remove</h3>
                 
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between">
                       <span>Mask Expansion</span>
                       <span>{maskExpansion}px</span>
                    </label>
                    <input type="range" min="0" max="50" value={maskExpansion} onChange={e => setMaskExpansion(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                 </div>

                 <button onClick={processRemoval} disabled={isProcessing || historyIndex < 0} className="w-full mt-4 py-4 bg-[#8B7CFF] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#7264ed] transition-colors disabled:opacity-50">
                    Apply Content-Aware Fill
                 </button>
              </div>

              {/* VIEW */}
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">View & Pan Controls</h3>
                 
                 <div className="flex justify-between items-center bg-zinc-100 p-1 border border-zinc-200">
                    <button onClick={handleZoomOut} className="px-4 py-2 hover:bg-white text-zinc-600 font-bold transition-colors">−</button>
                    <button onClick={handleResetView} className="px-4 py-2 hover:bg-white text-[10px] uppercase tracking-widest font-bold text-zinc-600 transition-colors">{Math.round(zoom * 100)}% (Reset)</button>
                    <button onClick={handleZoomIn} className="px-4 py-2 hover:bg-white text-zinc-600 font-bold transition-colors">+</button>
                 </div>

                 <div className="flex flex-col items-center gap-1 mt-2">
                    <button onClick={() => handlePan(0, -20)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 text-xs transition-colors">↑</button>
                    <div className="flex gap-1">
                       <button onClick={() => handlePan(-20, 0)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 text-xs transition-colors">←</button>
                       <button onClick={() => handlePan(0, 20)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 text-xs transition-colors">↓</button>
                       <button onClick={() => handlePan(20, 0)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 text-xs transition-colors">→</button>
                    </div>
                 </div>
                 
                 <button onClick={() => setShowMask(!showMask)} className={`mt-2 w-full py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${showMask ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>
                    {showMask ? 'Hide Mask Overlay' : 'Show Mask Overlay'}
                 </button>
              </div>

              {/* EXPORT */}
              <div className="flex flex-col gap-4">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Export</h3>
                 
                 <div className="flex gap-2">
                    <button onClick={() => exportImage("png")} disabled={isProcessing} className="flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">PNG</button>
                    <button onClick={() => exportImage("jpg")} disabled={isProcessing} className="flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">JPG</button>
                    <button onClick={() => exportImage("webp")} disabled={isProcessing} className="flex-1 py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">WEBP</button>
                 </div>

                 <button onClick={resetAll} className="w-full mt-4 py-3 bg-white text-red-500 border border-zinc-200 text-[10px] uppercase tracking-widest font-bold hover:border-red-500 transition-colors">
                    Reset & Upload New
                 </button>
              </div>

           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
