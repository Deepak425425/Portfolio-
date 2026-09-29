"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import BulkProcessor, { ImgFile } from "@/components/tools/BulkProcessor";
import { jsPDF } from "jspdf";
import { getGrotonExportFilename } from "@/utils/export";

// Constants & Types
const MM_PER_INCH = 25.4;

interface Transform {
  x: number;
  y: number;
  scale: number;
  bg: string;
}

const PHOTO_STANDARDS = [
  { id: "us", name: "US Passport (2×2 in)", w: 50.8, h: 50.8 },
  { id: "in", name: "India (35×45 mm)", w: 35, h: 45 },
  { id: "uk", name: "UK (35×45 mm)", w: 35, h: 45 },
  { id: "eu", name: "Schengen/EU (35×45 mm)", w: 35, h: 45 },
  { id: "ca", name: "Canada (50×70 mm)", w: 50, h: 70 },
  { id: "custom", name: "Custom", w: 35, h: 45 }
];

const PAPER_SIZES = [
  { id: "a4", name: "A4", w: 210, h: 297 },
  { id: "a5", name: "A5", w: 148, h: 210 },
  { id: "letter", name: "Letter", w: 215.9, h: 279.4 },
  { id: "4x6", name: "4×6 in", w: 101.6, h: 152.4 }
];

const PREDEFINED_GRIDS = [
  { id: "auto", name: "Auto Fit" },
  { id: "1x1", name: "1 × 1", c: 1, r: 1 },
  { id: "2x2", name: "2 × 2", c: 2, r: 2 },
  { id: "2x3", name: "2 × 3", c: 2, r: 3 },
  { id: "3x3", name: "3 × 3", c: 3, r: 3 },
  { id: "3x4", name: "3 × 4", c: 3, r: 4 },
  { id: "4x4", name: "4 × 4", c: 4, r: 4 }
];

export default function PassportPhotoMaker() {
  const [activeTab, setActiveTab] = useState<"photo" | "sheet">("photo");
  const [photoStd, setPhotoStd] = useState("in");
  const [photoW, setPhotoW] = useState(35); // in mm
  const [photoH, setPhotoH] = useState(45); // in mm

  const [paperStd, setPaperStd] = useState("a4");
  const [paperOrient, setPaperOrient] = useState<"p" | "l">("p");
  const [copies, setCopies] = useState<number | "fill">(6);
  const [grid, setGrid] = useState("auto");
  const [margins, setMargins] = useState(10); // in mm
  const [gap, setGap] = useState(5); // in mm
  const [centerSheet, setCenterSheet] = useState(true);
  const [cutGuides, setCutGuides] = useState(true);
  const [dpi, setDpi] = useState(300);

  const [showGuides, setShowGuides] = useState(true);

  const [transforms, setTransforms] = useState<Record<string, Transform>>({});
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const std = PHOTO_STANDARDS.find(s => s.id === photoStd);
    if (std && std.id !== "custom") {
      setPhotoW(std.w);
      setPhotoH(std.h);
    }
  }, [photoStd]);

  const initTransform = (id: string, imgW: number, imgH: number) => {
    if (!transforms[id]) {
      // Calculate sensible initial scale to fit the photo frame
      const frameRatio = photoW / photoH;
      const imgRatio = imgW / imgH;
      let scale = 1;
      
      // We want the image to completely cover the frame initially (fill)
      // Actually typically passport photos are portrait, and phone photos are portrait.
      if (imgRatio > frameRatio) {
        scale = photoH / imgH; 
      } else {
        scale = photoW / imgW;
      }
      
      setTransforms(prev => ({
        ...prev,
        [id]: { x: 0, y: 0, scale: scale * 1.5, bg: "original" } // slightly zoomed in by default for faces
      }));
    }
  };

  const getTransform = (id: string) => transforms[id] || { x: 0, y: 0, scale: 1, bg: "original" };

  const updateTransform = (id: string, partial: Partial<Transform>) => {
    setTransforms(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { x: 0, y: 0, scale: 1, bg: "original" }), ...partial }
    }));
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const t = getTransform(id);
    dragStart.current = { x: clientX, y: clientY, tx: t.x, ty: t.y };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent, id: string) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Scale movement by a reasonable factor based on editor canvas size vs real physical size
    // For simplicity, just use a 1:1 screen-to-mm ratio mapping adjusted for UX.
    const dx = (clientX - dragStart.current.x) * 0.2; 
    const dy = (clientY - dragStart.current.y) * 0.2;
    
    updateTransform(id, {
      x: dragStart.current.tx + dx,
      y: dragStart.current. ty + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      // Find active image id indirectly through a ref or just rely on state if single
      // To keep it simple, we bind these dynamically in the renderPreview block
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  // Physically calculate pixels from mm
  const mmToPx = (mm: number, currentDpi: number = dpi) => (mm / MM_PER_INCH) * currentDpi;

  // Render a single photo at final physical size
  const renderSinglePhoto = async (imgFile: ImgFile, targetDpi: number = dpi): Promise<HTMLCanvasElement> => {
    const t = getTransform(imgFile.id);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const pwPx = mmToPx(photoW, targetDpi);
    const phPx = mmToPx(photoH, targetDpi);
    canvas.width = pwPx;
    canvas.height = phPx;

    const img = new Image();
    img.src = imgFile.url;
    await new Promise(r => img.onload = r);

    if (t.bg === "white") {
       ctx.fillStyle = "#ffffff";
       ctx.fillRect(0, 0, pwPx, phPx);
    } else if (t.bg === "blue") {
       ctx.fillStyle = "#d4e6f1";
       ctx.fillRect(0, 0, pwPx, phPx);
    } else {
       ctx.fillStyle = "#ffffff";
       ctx.fillRect(0, 0, pwPx, phPx);
    }

    ctx.save();
    
    // Origin is center of photo frame
    ctx.translate(pwPx / 2, phPx / 2);
    
    // Apply user translations (scaled up to physical px)
    const txPx = mmToPx(t.x, targetDpi);
    const tyPx = mmToPx(t.y, targetDpi);
    ctx.translate(txPx, tyPx);

    // Calculate base scale to make 1.0 zoom = fit width
    const baseScale = pwPx / img.width;
    const finalScale = baseScale * t.scale;
    
    ctx.scale(finalScale, finalScale);
    
    // Draw image centered at 0,0
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    return canvas;
  };

  const getSheetLayout = () => {
    const pStd = PAPER_SIZES.find(s => s.id === paperStd) || PAPER_SIZES[0];
    const rawW = paperOrient === "p" ? pStd.w : pStd.h;
    const rawH = paperOrient === "p" ? pStd.h : pStd.w;

    let availW = rawW - (margins * 2);
    let availH = rawH - (margins * 2);

    let cols = 0, rows = 0;

    if (grid === "auto") {
      cols = Math.floor((availW + gap) / (photoW + gap));
      rows = Math.floor((availH + gap) / (photoH + gap));
    } else {
      const g = PREDEFINED_GRIDS.find(x => x.id === grid);
      if (g && g.c !== undefined && g.r !== undefined) { cols = g.c; rows = g.r; }
    }

    const maxPerPage = cols * rows;
    const totalCopies = copies === "fill" ? maxPerPage : copies;
    const totalPages = Math.ceil(totalCopies / maxPerPage) || 1;

    return { rawW, rawH, availW, availH, cols, rows, maxPerPage, totalCopies, totalPages };
  };

  const renderPrintSheet = async (imgFile: ImgFile, pageIndex: number, targetDpi: number = dpi): Promise<HTMLCanvasElement> => {
    const singleCanvas = await renderSinglePhoto(imgFile, targetDpi);
    
    const layout = getSheetLayout();
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    canvas.width = mmToPx(layout.rawW, targetDpi);
    canvas.height = mmToPx(layout.rawH, targetDpi);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photosThisPage = Math.min(layout.totalCopies - (pageIndex * layout.maxPerPage), layout.maxPerPage);
    if (photosThisPage <= 0) return canvas;

    const pwPx = mmToPx(photoW, targetDpi);
    const phPx = mmToPx(photoH, targetDpi);
    const gapPx = mmToPx(gap, targetDpi);

    let startX = mmToPx(margins, targetDpi);
    let startY = mmToPx(margins, targetDpi);

    if (centerSheet) {
       const actualGridW = (layout.cols * pwPx) + ((layout.cols - 1) * gapPx);
       const actualGridH = (layout.rows * phPx) + ((layout.rows - 1) * gapPx);
       startX = (canvas.width - actualGridW) / 2;
       startY = (canvas.height - actualGridH) / 2;
    }

    let count = 0;
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        if (count >= photosThisPage) break;
        const x = startX + c * (pwPx + gapPx);
        const y = startY + r * (phPx + gapPx);
        
        ctx.drawImage(singleCanvas, x, y);

        if (cutGuides) {
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = Math.max(1, mmToPx(0.2, targetDpi));
          ctx.setLineDash([mmToPx(2, targetDpi), mmToPx(2, targetDpi)]);
          ctx.strokeRect(x, y, pwPx, phPx);
        }
        count++;
      }
    }

    return canvas;
  };

  // Preview renderer inside the browser UI (scaled down)
  const drawEditorPreview = async (currentImg: ImgFile | null) => {
    if (!currentImg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const img = new Image();
    img.src = currentImg.url;
    await new Promise(r => img.onload = r);
    
    initTransform(currentImg.id, img.width, img.height);
    const t = getTransform(currentImg.id);

    // Create a virtual coordinate system where 1 unit = 1mm for the preview logic
    // We scale it up so it looks crisp on screen
    const displayScale = 5; 
    canvas.width = photoW * displayScale;
    canvas.height = photoH * displayScale;

    if (t.bg === "white") {
       ctx.fillStyle = "#ffffff";
    } else if (t.bg === "blue") {
       ctx.fillStyle = "#d4e6f1";
    } else {
       ctx.fillStyle = "#e5e7eb"; // gray checker placeholder if original, though we just draw the image
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.translate(t.x * displayScale, t.y * displayScale);
    
    const baseScale = (canvas.width) / img.width;
    const finalScale = baseScale * t.scale;
    ctx.scale(finalScale, finalScale);
    
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Draw Head Guides overlay
    if (showGuides) {
       ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
       ctx.lineWidth = 1;
       ctx.setLineDash([5, 5]);
       
       // Center vertical line
       ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
       
       // Top of head (~10% from top)
       ctx.beginPath(); ctx.moveTo(0, canvas.height*0.1); ctx.lineTo(canvas.width, canvas.height*0.1); ctx.stroke();
       
       // Eye level (~40% from top)
       ctx.beginPath(); ctx.moveTo(0, canvas.height*0.4); ctx.lineTo(canvas.width, canvas.height*0.4); ctx.stroke();
       
       // Chin (~75% from top)
       ctx.beginPath(); ctx.moveTo(0, canvas.height*0.75); ctx.lineTo(canvas.width, canvas.height*0.75); ctx.stroke();
       
       ctx.fillStyle = "rgba(255,0,0,0.6)";
       ctx.font = "12px sans-serif";
       ctx.fillText("Top of Head", 5, canvas.height*0.1 - 5);
       ctx.fillText("Eye Level", 5, canvas.height*0.4 - 5);
       ctx.fillText("Chin", 5, canvas.height*0.75 - 5);
    }
  };

  const drawSheetPreview = async (currentImg: ImgFile | null) => {
     if (!currentImg || !previewCanvasRef.current) return;
     // For performance, we render the print sheet at a very low DPI just for the screen
     const lowDpiCanvas = await renderPrintSheet(currentImg, 0, 72);
     
     const canvas = previewCanvasRef.current;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;
     
     const maxDim = 800;
     let w = lowDpiCanvas.width;
     let h = lowDpiCanvas.height;
     if (w > maxDim || h > maxDim) {
       const r = Math.min(maxDim/w, maxDim/h);
       w *= r; h *= r;
     }
     
     canvas.width = w;
     canvas.height = h;
     ctx.drawImage(lowDpiCanvas, 0, 0, w, h);
  };

  // BulkProcessor logic delegates to these
  const processForExport = async (imgFile: ImgFile): Promise<{blob: Blob, name: string}> => {
     // Default BulkProcessor export will be the SINGLE PHOTO (not the sheet)
     const canvas = await renderSinglePhoto(imgFile, dpi);
     return new Promise((resolve) => {
       canvas.toBlob(b => resolve({ blob: b!, name: getGrotonExportFilename(`${imgFile.name}-passport.jpg`) }), "image/jpeg", 0.95);
     });
  };

  const exportPrintSheetJPG = async (images: ImgFile[], setProgress: any, setIsProcessing: any) => {
    setIsProcessing(true);
    const layout = getSheetLayout();
    
    for (let i = 0; i < images.length; i++) {
      for (let p = 0; p < layout.totalPages; p++) {
        setProgress({ current: (i * layout.totalPages) + p + 1, total: images.length * layout.totalPages });
        const canvas = await renderPrintSheet(images[i], p, dpi);
        
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/jpeg", 0.95);
        a.download = getGrotonExportFilename(`${images[i].name}-printsheet-page${p+1}.jpg`);
        a.click();
        await new Promise(r => setTimeout(r, 200));
      }
    }
    setIsProcessing(false);
  };

  const exportPDF = async (images: ImgFile[], setProgress: any, setIsProcessing: any) => {
    setIsProcessing(true);
    const layout = getSheetLayout();
    
    try {
      const pdf = new jsPDF({
        orientation: paperOrient === "p" ? "portrait" : "landscape",
        unit: "mm",
        format: [layout.rawW, layout.rawH]
      });
      pdf.deletePage(1);

      for (let i = 0; i < images.length; i++) {
        for (let p = 0; p < layout.totalPages; p++) {
          setProgress({ current: (i * layout.totalPages) + p + 1, total: images.length * layout.totalPages });
          const canvas = await renderPrintSheet(images[i], p, dpi);
          
          pdf.addPage([layout.rawW, layout.rawH], paperOrient === "p" ? "portrait" : "landscape");
          
          const compression = dpi > 300 ? "FAST" : "MEDIUM";
          // Add image covering the entire mm bounds of the page
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, layout.rawW, layout.rawH, undefined, compression);
          
          await new Promise(r => setTimeout(r, 50));
        }
      }
      
      pdf.save(getGrotonExportFilename("passport-photos.pdf"));
    } catch(e) {
      console.error(e);
      alert("Error exporting PDF.");
    }

    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Passport Photo Maker" description="Professional passport, visa, and ID photo creator. Strict dimensional accuracy for physical prints.">
      <BulkProcessor
        onProcess={processForExport}
        renderPreview={(currentImg) => {
          // Re-render when dependencies change
          useEffect(() => {
            if (activeTab === "photo") drawEditorPreview(currentImg);
            else drawSheetPreview(currentImg);
          }, [currentImg, activeTab, photoW, photoH, transforms, showGuides, paperStd, paperOrient, copies, grid, margins, gap, centerSheet, cutGuides]);

          const handleEvMove = (e: any) => {
             if (currentImg && isDragging) {
               handleMouseMove(e, currentImg.id);
             }
          };

          return (
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh] bg-[#F7F6F2] relative border border-[#DEDCD5] p-8 overflow-hidden">
               
               {/* PREVIEW TABS */}
               <div className="absolute top-4 left-4 flex gap-2 z-20">
                 <button onClick={() => setActiveTab("photo")} className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest shadow-sm border ${activeTab === "photo" ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-border-color'}`}>Photo Editor</button>
                 <button onClick={() => setActiveTab("sheet")} className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest shadow-sm border ${activeTab === "sheet" ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-border-color'}`}>Print Sheet Preview</button>
               </div>

               {!currentImg ? (
                 <span className="text-sec-text text-sm uppercase tracking-widest font-bold">Upload an image to start</span>
               ) : activeTab === "photo" ? (
                 <div className="relative shadow-2xl flex flex-col bg-white">
                   {/* Editor View */}
                   <canvas 
                     ref={canvasRef} 
                     className="max-w-full max-h-[65vh] object-contain block cursor-move"
                     onMouseDown={(e) => handleMouseDown(e, currentImg.id)}
                     onTouchStart={(e) => handleMouseDown(e, currentImg.id)}
                     onMouseMove={handleEvMove}
                     onTouchMove={handleEvMove}
                   />
                   {/* Zoom Controls Overlay */}
                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-white/90 backdrop-blur shadow-lg border border-border-color px-2 py-1 gap-2 z-20">
                      <button onClick={() => updateTransform(currentImg.id, { scale: getTransform(currentImg.id).scale * 0.9 })} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 font-bold text-lg">-</button>
                      <span className="text-[10px] font-bold w-12 text-center">{Math.round(getTransform(currentImg.id).scale * 100)}%</span>
                      <button onClick={() => updateTransform(currentImg.id, { scale: getTransform(currentImg.id).scale * 1.1 })} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 font-bold text-lg">+</button>
                      <div className="w-px h-4 bg-zinc-300 mx-1"></div>
                      <button onClick={() => updateTransform(currentImg.id, { x:0, y:0 })} className="px-3 py-1 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-100">Center</button>
                   </div>
                 </div>
               ) : (
                 <div className="relative shadow-2xl max-w-full max-h-[70vh] flex items-center justify-center">
                   {/* Print Sheet View */}
                   <canvas ref={previewCanvasRef} className="max-w-full max-h-[70vh] object-contain block bg-white border border-zinc-300" />
                   
                   {/* Quality Check Warning Overlay */}
                   {(() => {
                     const l = getSheetLayout();
                     if (l.totalPages > 1) {
                       return (
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 backdrop-blur shadow-2xl text-center pointer-events-none">
                           <span className="block text-lg font-bold">Multi-Page Sheet</span>
                           <span className="block text-[10px] uppercase tracking-widest mt-2">{l.totalCopies} photos require {l.totalPages} pages.</span>
                         </div>
                       );
                     }
                     return null;
                   })()}
                 </div>
               )}
            </div>
          );
        }}
        renderControls={(currentImg) => (
          <>
            {/* 1. PHOTO SIZE */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">1. Photo Rules</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500">Standard / Country</label>
                <select value={photoStd} onChange={e => setPhotoStd(e.target.value)} className="w-full p-3 border border-[#DEDCD5] text-xs font-bold bg-[#F7F6F2] outline-none">
                  {PHOTO_STANDARDS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {photoStd === "custom" && (
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] text-sec-text uppercase tracking-widest">Width (mm)</span>
                    <input type="number" value={photoW} onChange={e => setPhotoW(Number(e.target.value))} className="w-full border-b border-border-color py-1 bg-transparent font-bold text-center outline-none focus:border-black" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] text-sec-text uppercase tracking-widest">Height (mm)</span>
                    <input type="number" value={photoH} onChange={e => setPhotoH(Number(e.target.value))} className="w-full border-b border-border-color py-1 bg-transparent font-bold text-center outline-none focus:border-black" />
                  </div>
                </div>
              )}

              {/* GUIDES TOGGLE */}
              <label className="text-[10px] uppercase tracking-widest font-bold text-black flex items-center gap-2 cursor-pointer mt-2 bg-zinc-50 p-2">
                <input type="checkbox" checked={showGuides} onChange={e => setShowGuides(e.target.checked)} className="accent-black w-4 h-4" /> Show Face Guides
              </label>
            </div>

            {/* 2. PRINT SHEET SETTINGS */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">2. Print Layout</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Paper</label>
                  <select value={paperStd} onChange={e => setPaperStd(e.target.value)} className="w-full p-2 border border-[#DEDCD5] text-xs outline-none">
                    {PAPER_SIZES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Orientation</label>
                  <select value={paperOrient} onChange={e => setPaperOrient(e.target.value as any)} className="w-full p-2 border border-[#DEDCD5] text-xs outline-none">
                    <option value="p">Portrait</option>
                    <option value="l">Landscape</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Copies</label>
                  <select value={copies} onChange={e => setCopies(e.target.value === "fill" ? "fill" : Number(e.target.value))} className="w-full p-2 border border-[#DEDCD5] text-xs outline-none font-bold text-[#8B7CFF]">
                    <option value="fill">Fill Page (Max)</option>
                    <option value="1">1 Copy</option>
                    <option value="2">2 Copies</option>
                    <option value="4">4 Copies</option>
                    <option value="6">6 Copies</option>
                    <option value="8">8 Copies</option>
                    <option value="12">12 Copies</option>
                    <option value="20">20 Copies</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Grid Limit</label>
                  <select value={grid} onChange={e => setGrid(e.target.value)} className="w-full p-2 border border-[#DEDCD5] text-xs outline-none">
                    {PREDEFINED_GRIDS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                  <span>Margins ({margins}mm)</span> <span>Gap ({gap}mm)</span>
                </label>
                <div className="flex gap-4">
                  <input type="range" min="0" max="50" value={margins} onChange={e => setMargins(Number(e.target.value))} className="w-full accent-black" />
                  <input type="range" min="0" max="20" value={gap} onChange={e => setGap(Number(e.target.value))} className="w-full accent-black" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="text-[9px] uppercase tracking-widest font-bold text-zinc-600 flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={centerSheet} onChange={e => setCenterSheet(e.target.checked)} className="accent-black w-4 h-4" /> Center Grid on Page
                </label>
                <label className="text-[9px] uppercase tracking-widest font-bold text-zinc-600 flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cutGuides} onChange={e => setCutGuides(e.target.checked)} className="accent-black w-4 h-4" /> Cut Guides
                </label>
              </div>

              {/* LIVE LAYOUT STATUS */}
              {(() => {
                 const l = getSheetLayout();
                 return (
                   <div className="bg-[#F7F6F2] p-3 border border-border-color mt-2 flex flex-col gap-1 text-[10px] tracking-widest uppercase">
                     <div className="flex justify-between"><span className="text-zinc-500">Max Grid Capacity:</span> <span className="font-bold">{l.maxPerPage} photos/page</span></div>
                     <div className="flex justify-between"><span className="text-zinc-500">Total Requested:</span> <span className="font-bold text-[#8B7CFF]">{l.totalCopies} photos</span></div>
                     <div className="flex justify-between"><span className="text-zinc-500">Pages Generated:</span> <span className="font-bold">{l.totalPages} page(s)</span></div>
                   </div>
                 );
              })()}
            </div>

            {/* 3. QUALITY */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">3. Output Quality</h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setDpi(150)} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${dpi === 150 ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>150 DPI</button>
                <button onClick={() => setDpi(300)} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${dpi === 300 ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>300 DPI</button>
                <button onClick={() => setDpi(600)} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${dpi === 600 ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>600 DPI</button>
              </div>
            </div>
          </>
        )}
        customExportButtons={(isProcessing, processSingle, processBulkZip, images, setProgress, setIsProcessing, mode) => (
          <div className="flex flex-col gap-2 w-full mt-4">
             {/* Always allow downloading the single parsed photo regardless of mode */}
             <button disabled={isProcessing} onClick={processSingle} className="w-full py-3 border border-black text-black font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-50 disabled:opacity-50">
                Download Single Photo (JPG)
             </button>
             
             {/* Print Sheet Exports */}
             <button disabled={isProcessing} onClick={() => exportPrintSheetJPG(images, setProgress, setIsProcessing)} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 shadow-md">
                {isProcessing ? 'Generating Sheet...' : 'Export Print Sheet (JPG)'}
             </button>

             <button disabled={isProcessing} onClick={() => exportPDF(images, setProgress, setIsProcessing)} className="w-full py-4 bg-[#8B7CFF] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#6e5dcc] transition-colors disabled:opacity-50 shadow-md">
                {isProcessing ? 'Generating PDF...' : 'Export PDF Document'}
             </button>
          </div>
        )}
      />
    </ToolLayout>
  );
}