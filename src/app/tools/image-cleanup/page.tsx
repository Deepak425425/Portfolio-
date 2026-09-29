"use client";

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";

interface Point { x: number, y: number }

export default function ImageCleanupPage() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgName, setImgName] = useState("");
  const [imgDims, setImgDims] = useState<{w: number, h: number} | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  // Editor state
  const [activeTool, setActiveTool] = useState<"draw" | "erase" | "pan">("draw");
  const [brushSize, setBrushSize] = useState(30);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comparePos, setComparePos] = useState(50);
  const [isComparing, setIsComparing] = useState(false);
  
  // Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Dragging state
  const isDragging = useRef(false);
  const lastPos = useRef<Point | null>(null);
  const lastPan = useRef<Point | null>(null);

  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, []);

  // Initialize editor
  useEffect(() => {
    if (imgUrl && imgDims && canvasRef.current && maskCanvasRef.current) {
      const cvs = canvasRef.current;
      const mCvs = maskCanvasRef.current;
      cvs.width = imgDims.w;
      cvs.height = imgDims.h;
      mCvs.width = imgDims.w;
      mCvs.height = imgDims.h;
      
      const img = new Image();
      img.onload = () => {
        cvs.getContext("2d")?.drawImage(img, 0, 0);
        saveHistoryState();
      };
      img.src = imgUrl;

      // Reset view
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        const minScale = Math.min((r.width - 40) / imgDims.w, (r.height - 40) / imgDims.h);
        setScale(Math.min(1, minScale));
        setPan({ x: 0, y: 0 });
      }
    }
  }, [imgUrl, imgDims]);

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImgDims({ w: img.width, h: img.height });
      setImgName(file.name);
      setImgUrl(url);
      setResultUrl(null);
      setHistory([]);
      setHistoryIndex(-1);
    };
    img.src = url;
  };

  const getPos = (e: ReactMouseEvent | ReactTouchEvent): Point | null => {
    if (!canvasRef.current || !containerRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
    
    // Convert to canvas coordinates taking scale into account
    const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);
    return { x, y };
  };

  const saveHistoryState = () => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      restoreHistoryState(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      restoreHistoryState(historyIndex + 1);
    }
  };

  const restoreHistoryState = (index: number) => {
    if (!maskCanvasRef.current || index < 0 || index >= history.length) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(history[index], 0, 0);
  };

  const handleDown = (e: ReactMouseEvent | ReactTouchEvent) => {
    if (activeTool === "pan") {
      isDragging.current = true;
      lastPan.current = { 
        x: 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX,
        y: 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY 
      };
      return;
    }

    const pos = getPos(e);
    if (!pos) return;
    isDragging.current = true;
    lastPos.current = pos;
    drawPoint(pos.x, pos.y);
  };

  const handleMove = (e: ReactMouseEvent | ReactTouchEvent) => {
    if (!isDragging.current) return;

    if (activeTool === "pan" && lastPan.current) {
      const cx = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
      const dx = cx - lastPan.current.x;
      const dy = cy - lastPan.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPan.current = { x: cx, y: cy };
      return;
    }

    const pos = getPos(e);
    if (!pos || !lastPos.current) return;
    drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    lastPos.current = pos;
  };

  const handleUp = () => {
    if (isDragging.current && activeTool !== "pan") {
      saveHistoryState();
    }
    isDragging.current = false;
    lastPos.current = null;
    lastPan.current = null;
  };

  const drawPoint = (x: number, y: number) => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (!ctx) return;
    
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = activeTool === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
    
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (!ctx) return;
    
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = activeTool === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setScale(s => Math.min(s * 1.1, 5));
    } else {
      setScale(s => Math.max(s / 1.1, 0.1));
    }
  };

  // Perform basic local diffusion inpainting
  const processCleanup = async () => {
    if (!canvasRef.current || !maskCanvasRef.current || !imgDims) return;
    setIsProcessing(true);
    setProgress(0);

    // Yield to let UI update
    await new Promise(r => setTimeout(r, 50));

    const outCanvas = document.createElement("canvas");
    outCanvas.width = imgDims.w;
    outCanvas.height = imgDims.h;
    const outCtx = outCanvas.getContext("2d")!;
    outCtx.drawImage(canvasRef.current, 0, 0);

    const imgData = outCtx.getImageData(0, 0, imgDims.w, imgDims.h);
    const maskCtx = maskCanvasRef.current.getContext("2d")!;
    const maskData = maskCtx.getImageData(0, 0, imgDims.w, imgDims.h);

    const w = imgDims.w;
    const h = imgDims.h;
    
    // Find masked pixels
    const masked: number[] = [];
    for (let i = 0; i < maskData.data.length; i += 4) {
      if (maskData.data[i + 3] > 10) { // If alpha > 10, it's masked
        masked.push(i / 4);
      }
    }

    if (masked.length === 0) {
      alert("No area selected to clean.");
      setIsProcessing(false);
      return;
    }

    const data = imgData.data;
    const iterations = 50; // Fast diffusion

    for (let iter = 0; iter < iterations; iter++) {
      const nextData = new Uint8ClampedArray(data);
      
      for (let i = 0; i < masked.length; i++) {
        const idx = masked[i];
        const x = idx % w;
        const y = Math.floor(idx / w);
        
        let r = 0, g = 0, b = 0, count = 0;
        
        // Sample 4 neighbors
        const neighbors = [
          [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
        ];
        
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = (ny * w + nx) * 4;
            r += data[nIdx];
            g += data[nIdx + 1];
            b += data[nIdx + 2];
            count++;
          }
        }
        
        if (count > 0) {
          const pIdx = idx * 4;
          // Add a tiny bit of noise matching to avoid flat blur
          const noise = (Math.random() - 0.5) * 2;
          nextData[pIdx] = (r / count) + noise;
          nextData[pIdx + 1] = (g / count) + noise;
          nextData[pIdx + 2] = (b / count) + noise;
        }
      }
      
      data.set(nextData);
      
      if (iter % 10 === 0) {
        setProgress(Math.round((iter / iterations) * 100));
        await new Promise(r => setTimeout(r, 0));
      }
    }

    outCtx.putImageData(imgData, 0, 0);
    
    outCanvas.toBlob(blob => {
      if (blob) {
        setResultUrl(URL.createObjectURL(blob));
      }
      setIsProcessing(false);
      setProgress(100);
    });
  };

  const handleCompareMove = (e: MouseEvent | TouchEvent) => {
    if (!isComparing || !compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setComparePos((x / rect.width) * 100);
  };

  const handleCompareUp = () => setIsComparing(false);

  useEffect(() => {
    if (isComparing) {
      window.addEventListener("mousemove", handleCompareMove);
      window.addEventListener("touchmove", handleCompareMove);
      window.addEventListener("mouseup", handleCompareUp);
      window.addEventListener("touchend", handleCompareUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleCompareMove);
      window.removeEventListener("touchmove", handleCompareMove);
      window.removeEventListener("mouseup", handleCompareUp);
      window.removeEventListener("touchend", handleCompareUp);
    };
  }, [isComparing]);

  const exportResult = (format: "jpg" | "png" | "webp") => {
    if (!resultUrl || !imgName) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const origExt = imgName.split('.').pop();
    const baseName = imgName.substring(0, imgName.length - (origExt ? origExt.length + 1 : 0));
    a.download = getGrotonExportFilename(`${baseName}.${format}`);
    a.click();
  };

  const resetAll = () => {
    setResultUrl(null);
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      saveHistoryState();
    }
  };

  return (
    <ToolLayout title="Image Cleanup" description="Remove unwanted elements from your images using local client-side processing.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!imgUrl ? (
            <UploadDropzone onUpload={handleUpload} multiple={false} />
          ) : resultUrl ? (
            <div 
              ref={compareRef}
              className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 min-h-[60vh] overflow-hidden select-none cursor-ew-resize"
              onPointerDown={() => setIsComparing(true)}
              onTouchStart={() => setIsComparing(true)}
            >
              <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                 <img src={resultUrl} className="max-w-full max-h-[70vh] object-contain pointer-events-none" />
              </div>
              <div 
                className="absolute inset-0 h-full overflow-hidden border-r-2 border-white pointer-events-none"
                style={{ width: `${comparePos}%` }}
              >
                 <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center min-w-max" style={{ width: compareRef.current?.clientWidth || '100%' }}>
                   <img src={imgUrl} className="max-w-full max-h-[70vh] object-contain pointer-events-none" />
                 </div>
              </div>
              <div className="absolute top-4 left-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 pointer-events-none z-10 shadow">Before</div>
              <div className="absolute top-4 right-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 pointer-events-none z-10 shadow">After</div>
              <div className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center z-20 pointer-events-none" style={{ left: `${comparePos}%` }}>
                 <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                   <div className="flex gap-1"><div className="w-0.5 h-3 bg-zinc-300 rounded-full"></div><div className="w-0.5 h-3 bg-zinc-300 rounded-full"></div></div>
                 </div>
              </div>
            </div>
          ) : (
            <div 
              ref={containerRef}
              className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 min-h-[60vh] overflow-hidden"
              onWheel={handleWheel}
            >
              <div className="absolute top-4 left-4 z-10 bg-[#111111] text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold shadow">
                Draw mask over unwanted objects
              </div>

              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <button onClick={() => setScale(s => Math.min(s * 1.2, 5))} className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center shadow">+</button>
                <button onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center shadow">-</button>
              </div>

              <div 
                className="relative"
                style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, 
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
                <canvas ref={canvasRef} className="max-w-none shadow-xl pointer-events-none" />
                <canvas ref={maskCanvasRef} className="max-w-none absolute top-0 left-0 opacity-60" style={{ cursor: activeTool === "pan" ? "grab" : "crosshair" }} />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8 bg-white p-6 border border-zinc-200 lg:max-h-[85vh] lg:overflow-y-auto">
           {resultUrl ? (
             <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-serif text-3xl text-black mb-2">Cleanup Complete</h2>
                  <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Export your image</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button onClick={() => exportResult("jpg")} className="w-full py-4 border border-zinc-200 text-black text-[10px] uppercase tracking-widest font-bold hover:border-[#111111] transition-colors">Download JPG</button>
                  <button onClick={() => exportResult("png")} className="w-full py-4 border border-zinc-200 text-black text-[10px] uppercase tracking-widest font-bold hover:border-[#111111] transition-colors">Download PNG</button>
                  <button onClick={() => exportResult("webp")} className="w-full py-4 border border-zinc-200 text-black text-[10px] uppercase tracking-widest font-bold hover:border-[#111111] transition-colors">Download WebP</button>
                </div>

                <button onClick={resetAll} className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors mt-8">Clean Another Area</button>
             </div>
           ) : imgUrl ? (
             <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-serif text-3xl text-black mb-2">Image Cleanup</h2>
                  <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mb-4">Local Object Removal</p>
                  <p className="text-[10px] leading-relaxed text-zinc-400">Uses client-side iterative diffusion to blend surrounding pixels. Best for small spots, dust, and minor text.</p>
                </div>

                <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                  <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Active Tool</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setActiveTool("draw")} className={`py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${activeTool === "draw" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Brush</button>
                    <button onClick={() => setActiveTool("erase")} className={`py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${activeTool === "erase" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Erase</button>
                    <button onClick={() => setActiveTool("pan")} className={`py-3 text-[10px] font-bold tracking-widest border uppercase transition-colors ${activeTool === "pan" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>Pan</button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                  <div className="flex justify-between">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Brush Size</label>
                    <span className="text-[10px] font-bold">{brushSize}px</span>
                  </div>
                  <input type="range" min="2" max="150" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                </div>

                <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                  <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">History</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={undo} disabled={historyIndex <= 0} className="py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors disabled:opacity-30 bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">Undo</button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors disabled:opacity-30 bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]">Redo</button>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  {isProcessing ? (
                    <div className="w-full bg-zinc-100 h-12 flex items-center justify-center relative overflow-hidden border border-zinc-200">
                      <div className="absolute top-0 left-0 h-full bg-[#8B7CFF]/20" style={{ width: `${progress}%` }}></div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-black relative z-10">Cleaning Image... {progress}%</span>
                    </div>
                  ) : (
                    <button onClick={processCleanup} className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors">
                      Clean Image
                    </button>
                  )}
                </div>
             </div>
           ) : (
             <div className="flex flex-col gap-8 opacity-30 pointer-events-none">
                 <div>
                   <h2 className="font-serif text-3xl text-black mb-2">Image Cleanup</h2>
                   <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Awaiting Image</p>
                 </div>
                 <div className="h-64 border border-zinc-200 bg-zinc-50"></div>
             </div>
           )}
        </div>
      </div>
    </ToolLayout>
  );
}
