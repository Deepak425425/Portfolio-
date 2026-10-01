"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import BulkProcessor, { ImgFile } from "@/components/tools/BulkProcessor";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { ColorResult, PaletteMode, generatePaletteColors, getHarmony, rgbToHex } from "./color-utils";

export default function PalettePage() {
  const [size, setSize] = useState<number>(6);
  const [mode, setMode] = useState<PaletteMode>("BALANCED");
  const [palette, setPalette] = useState<ColorResult[]>([]);
  const [harmonyMode, setHarmonyMode] = useState<string>("NONE");
  const [harmonySourceIndex, setHarmonySourceIndex] = useState<number>(0);
  const [exportStyle, setExportStyle] = useState<"SQUARE" | "PORTRAIT" | "LANDSCAPE">("SQUARE");
  
  const [hoverColor, setHoverColor] = useState<{hex: string, rgb: string} | null>(null);
  const [isSampling, setIsSampling] = useState(false);
  const [canvasRef] = useState(React.createRef<HTMLCanvasElement>());
  
  const exportFormatRef = useRef<"png" | "jpg" | "json">("png");
  const [processingState, setProcessingState] = useState(false);
  
  // History
  const [history, setHistory] = useState<ColorResult[][]>([]);

  const extractColors = async (url: string, count: number, pMode: PaletteMode, currentPalette: ColorResult[] = []): Promise<ColorResult[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 200; 
        const ratio = img.width > maxDim ? maxDim / img.width : 1;
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        const lockedColors = currentPalette.filter(c => c.isLocked);
        const newColors = generatePaletteColors(data, count, pMode, lockedColors);
        
        // Restore locked status
        const finalPalette = newColors.map(nc => {
          const lockedMatch = lockedColors.find(lc => lc.hex === nc.hex);
          if (lockedMatch) return { ...nc, isLocked: true, id: lockedMatch.id };
          return nc;
        });
        
        resolve(finalPalette);
      };
      img.onerror = () => resolve([]);
    });
  };

  const handleRegenerate = async (imgUrl: string) => {
    if (!imgUrl || processingState) return;
    setProcessingState(true);
    const newPalette = await extractColors(imgUrl, size, mode, palette);
    setPalette(newPalette);
    setHistory(prev => [newPalette, ...prev].slice(0, 5));
    setProcessingState(false);
  };

  const generateBoardCanvas = (colors: ColorResult[], imgName: string, expStyle: string): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    let boardW = 2000, boardH = 2000;
    if (expStyle === "PORTRAIT") boardH = 2500;
    if (expStyle === "LANDSCAPE") { boardW = 2400; boardH = 1600; }

    canvas.width = boardW;
    canvas.height = boardH;

    // Background
    ctx.fillStyle = "#F7F6F2";
    ctx.fillRect(0, 0, boardW, boardH);

    const pad = 160;
    const gap = 60;
    
    // Title
    ctx.fillStyle = "#111111";
    ctx.font = "bold 56px 'Inter', sans-serif";
    ctx.fillText("COLOR PALETTE", pad, pad + 50);
    
    ctx.fillStyle = "#6F6C66";
    ctx.font = "32px 'Inter', sans-serif";
    ctx.fillText(imgName, pad, pad + 110);

    const totalColors = colors.length;
    let cols = 3;
    if (totalColors > 6) cols = 4;
    if (totalColors > 8) cols = 5;
    if (expStyle === "LANDSCAPE") cols = Math.max(4, cols);
    
    const rows = Math.ceil(totalColors / cols);
    
    const contentW = boardW - pad * 2;
    const cardW = (contentW - gap * (cols - 1)) / cols;
    const blockPad = 32;
    const blockW = cardW - blockPad * 2;
    const blockH = blockW * 1.2; 
    const cardH = blockH + blockPad * 2 + 160; 
    
    const titleOffset = 220;
    const startY = pad + titleOffset;
    
    // Dynamically adjust board height if cards overflow
    const totalCardsHeight = rows * cardH + Math.max(0, rows - 1) * gap;
    const minRequiredHeight = startY + totalCardsHeight + 200; // 200 for footer padding
    if (boardH < minRequiredHeight) {
       boardH = minRequiredHeight;
       canvas.height = boardH;
       
       // Redraw background with new height
       ctx.fillStyle = "#F7F6F2";
       ctx.fillRect(0, 0, boardW, boardH);
       
       // Redraw Title since background wiped it
       ctx.fillStyle = "#111111";
       ctx.font = "bold 56px 'Inter', sans-serif";
       ctx.fillText("COLOR PALETTE", pad, pad + 50);
       
       ctx.fillStyle = "#6F6C66";
       ctx.font = "32px 'Inter', sans-serif";
       ctx.fillText(imgName, pad, pad + 110);
    }

    colors.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (cardW + gap);
      const y = startY + row * (cardH + gap);
      
      // Card surface
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = "#DEDCD5";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, cardW, cardH);
      
      // Color Block
      ctx.fillStyle = c.hex;
      ctx.fillRect(x + blockPad, y + blockPad, blockW, blockH);
      
      // Text (HEX)
      ctx.fillStyle = "#111111";
      ctx.font = "bold 36px 'Inter', monospace";
      ctx.fillText(c.hex, x + blockPad, y + blockPad + blockH + 60);
      
      // Text (Name)
      ctx.fillStyle = "#6F6C66";
      ctx.font = "28px 'Inter', sans-serif";
      ctx.fillText(c.name, x + blockPad, y + blockPad + blockH + 110);
    });

    // Footer mark
    ctx.fillStyle = "#111111";
    ctx.font = "bold 24px 'Inter', sans-serif";
    const footerText = "groton.in";
    const textWidth = ctx.measureText(footerText).width;
    ctx.fillText(footerText, (boardW - textWidth) / 2, boardH - 80);

    return canvas;
  };

  const processImage = async (img: ImgFile): Promise<{ blob: Blob, name: string } | null> => {
    let currentCols = palette;
    if (currentCols.length === 0) {
      currentCols = await extractColors(img.url, size, mode, []);
    }

    const allColors = [...currentCols];
    if (harmonyMode !== "NONE" && currentCols[harmonySourceIndex]) {
       const harmonies = getHarmony(currentCols[harmonySourceIndex], harmonyMode, Math.max(3, currentCols.length));
       allColors.push(...harmonies);
    }

    const format = exportFormatRef.current;
    
    if (format === "json") {
      const resultJson = {
        filename: img.name,
        mode,
        colors: allColors.map(p => ({
          name: p.name,
          hex: p.hex, 
          rgb: p.rgb,
          hsl: p.hsl
        }))
      };
      return {
        blob: new Blob([JSON.stringify(resultJson, null, 2)], { type: "application/json" }),
        name: `${img.name}-palette.json`
      };
    }
    
    const canvas = generateBoardCanvas(allColors, img.name, exportStyle);
    const mime = `image/${format === "jpg" ? "jpeg" : "png"}`;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve({ blob, name: `${img.name}-color-palette.${format}` });
        else resolve(null);
      }, mime, 1.0);
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAll = () => {
    const text = palette.map(p => `${p.name}: ${p.hex}`).join("\n");
    copyToClipboard(text);
  };

  const copyCSS = () => {
    const vars = palette.map((p, i) => `  --palette-${(i+1).toString().padStart(2, '0')}: ${p.hex};`).join("\n");
    copyToClipboard(`:root {\n${vars}\n}`);
  };

  const toggleLock = (index: number) => {
    const newPal = [...palette];
    newPal[index].isLocked = !newPal[index].isLocked;
    setPalette(newPal);
  };

  const removeColor = (id: string) => {
    setPalette(palette.filter(p => p.id !== id));
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isSampling) return;
    const img = e.currentTarget;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const data = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(data[0], data[1], data[2]);
    const rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    
    setHoverColor({hex, rgb});
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isSampling || !hoverColor) return;
    const newColor: ColorResult = {
      id: Math.random().toString(36).substring(7),
      hex: hoverColor.hex,
      rgb: hoverColor.rgb,
      hsl: "", // simplified
      r: 0, g: 0, b: 0, h: 0, s: 0, l: 0, percentage: 1, name: "Sampled", isLocked: false
    };
    setPalette([...palette, newColor]);
    setIsSampling(false);
    setHoverColor(null);
  };

  return (
    <ToolLayout title="Color Palette" description="Extract accurate, dominant color schemes into a premium editorial palette board.">
      <BulkProcessor
        onProcess={processImage}
        onReset={() => { setPalette([]); setHistory([]); }}
        customExportButtons={(isProcessing, processSingle, processBulkZip, images, setProgress, setIsProcessing, mode) => {
          const runExport = (fmt: "png" | "jpg" | "json", isZip = false) => {
            exportFormatRef.current = fmt;
            if (isZip) processBulkZip();
            else processSingle();
          };

          return (
            <div className="flex flex-col gap-3">
              <button disabled={isProcessing} onClick={() => runExport("png")} className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:opacity-50">
                {isProcessing ? 'Generating...' : 'Export PNG'}
              </button>
              <div className="flex gap-2">
                 <button disabled={isProcessing} onClick={() => runExport("jpg")} className="w-full flex-1 py-3 border border-border-color bg-background text-foreground text-[10px] uppercase tracking-widest font-bold hover:border-[#111111] transition-colors disabled:opacity-50">
                   Export JPG
                 </button>
                 <button disabled={isProcessing} onClick={() => runExport("json")} className="w-full flex-1 py-3 border border-border-color bg-background text-foreground text-[10px] uppercase tracking-widest font-bold hover:border-[#111111] transition-colors disabled:opacity-50">
                   Export JSON
                 </button>
              </div>
              <button disabled={isProcessing} onClick={() => runExport("png", true)} className="w-full py-3 mt-4 border border-[#111111] bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50">
                EXPORT ALL (ZIP)
              </button>
            </div>
          );
        }}
        renderPreview={(currentImg) => (
          currentImg ? (
            <div className="flex w-full h-full min-h-[70vh]">
              {/* LEFT: IMAGE */}
              <div className="w-1/2 p-8 flex flex-col items-center justify-center relative bg-zinc-50 border-r border-zinc-200">
                 <div className="relative group cursor-crosshair">
                   <img 
                      src={currentImg.url} 
                      className="max-h-[60vh] object-contain shadow-xl" 
                      onPointerMove={handleImageMouseMove}
                      onPointerLeave={() => setHoverColor(null)}
                      onClick={handleImageClick}
                      onMouseEnter={() => setIsSampling(true)}
                      crossOrigin="anonymous"
                   />
                   {isSampling && hoverColor && (
                     <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white px-3 py-2 rounded shadow-lg border border-zinc-200 z-10 pointer-events-none">
                        <div className="w-6 h-6 rounded border border-zinc-200 shadow-inner" style={{ backgroundColor: hoverColor.hex }}></div>
                        <span className="text-xs font-mono font-bold">{hoverColor.hex}</span>
                     </div>
                   )}
                 </div>
                 <p className="mt-8 text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                    Hover to sample colors
                 </p>
              </div>
              
              {/* RIGHT: PALETTE BOARD PREVIEW */}
              <div className="w-1/2 bg-[#F7F6F2] p-8 lg:p-12 overflow-y-auto flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-[#111111] tracking-tight">Extracted Palette</h2>
                    <div className="flex gap-2">
                       <button onClick={copyAll} className="px-3 py-1.5 bg-white border border-[#DEDCD5] text-[10px] font-bold uppercase tracking-widest hover:border-[#111111] transition-colors">Copy All</button>
                       <button onClick={copyCSS} className="px-3 py-1.5 bg-white border border-[#DEDCD5] text-[10px] font-bold uppercase tracking-widest hover:border-[#111111] transition-colors">Copy CSS</button>
                    </div>
                 </div>

                 <Reorder.Group axis="y" values={palette} onReorder={setPalette} className="flex flex-col gap-3">
                   <AnimatePresence>
                     {palette.map((c, i) => (
                       <Reorder.Item key={c.id} value={c} className="group relative bg-white border border-[#DEDCD5] p-3 flex items-center gap-4 hover:border-[#111111] transition-colors cursor-grab active:cursor-grabbing">
                          <div className="w-16 h-16 shrink-0 shadow-inner" style={{ backgroundColor: c.hex }}></div>
                          <div className="flex flex-col flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                               <span className="font-bold text-sm text-[#111111]">{c.name}</span>
                               <span className="text-[10px] text-[#6F6C66] font-bold">{c.percentage}%</span>
                             </div>
                             <div className="flex gap-3 mt-1 text-[11px] font-mono text-[#6F6C66]">
                               <button onClick={() => copyToClipboard(c.hex)} className="hover:text-black">HEX {c.hex}</button>
                               <button onClick={() => copyToClipboard(c.rgb)} className="hover:text-black">RGB</button>
                               <button onClick={() => copyToClipboard(c.hsl)} className="hover:text-black">HSL</button>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => toggleLock(i)} className={`p-2 border ${c.isLocked ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-black border-[#DEDCD5] hover:border-[#111111]'}`}>
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                             </button>
                             <button onClick={() => removeColor(c.id)} className="p-2 border border-[#DEDCD5] bg-white text-red-500 hover:border-red-500 transition-colors">
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                          </div>
                       </Reorder.Item>
                     ))}
                   </AnimatePresence>
                 </Reorder.Group>

                 {harmonyMode !== "NONE" && palette[harmonySourceIndex] && (
                   <div className="mt-8 pt-8 border-t border-[#DEDCD5]">
                      <h3 className="text-sm font-bold text-[#111111] mb-4 uppercase tracking-widest">Harmony: {harmonyMode}</h3>
                      <div className="flex flex-col gap-3">
                         {getHarmony(palette[harmonySourceIndex], harmonyMode, Math.max(3, palette.length)).map((c, i) => (
                           <div key={i} className="bg-white border border-[#DEDCD5] p-3 flex items-center gap-4 opacity-80">
                              <div className="w-12 h-12 shrink-0 shadow-inner" style={{ backgroundColor: c.hex }}></div>
                              <div className="flex flex-col flex-1 min-w-0">
                                 <span className="font-bold text-sm text-[#111111]">{c.name}</span>
                                 <span className="font-mono text-xs text-[#6F6C66]">{c.hex}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
            </div>
          ) : (
            <div className="text-zinc-400 text-sm font-bold uppercase tracking-widest min-h-[50vh] flex items-center justify-center">Upload an image to extract palette</div>
          )
        )}
        renderControls={(currentImg, isProcessing) => {
          useEffect(() => {
            if (currentImg && palette.length === 0 && !processingState) {
              setProcessingState(true);
              extractColors(currentImg.url, size, mode, []).then(p => {
                setPalette(p);
                setHistory([p]);
                setProcessingState(false);
              });
            }
          }, [currentImg]);

          return (
            <div className="flex flex-col gap-8">
              {/* Palette Size */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Color Count</label>
                <div className="grid grid-cols-5 gap-2">
                  {[3, 5, 6, 8, 10].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSize(s)} 
                      className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${size === s ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette Mode */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Palette Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['BALANCED', 'VIBRANT', 'MUTED', 'LIGHT', 'DARK'] as PaletteMode[]).map(m => (
                    <button 
                      key={m} 
                      onClick={() => setMode(m)} 
                      className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${mode === m ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'} ${m === 'BALANCED' ? 'col-span-2' : ''}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regenerate */}
              <button 
                 onClick={() => currentImg && handleRegenerate(currentImg.url)}
                 disabled={processingState || !currentImg}
                 className="w-full py-3 bg-[#111111] text-[#F7F6F2] font-bold text-[10px] uppercase tracking-widest hover:bg-[#8B7CFF] transition-colors disabled:opacity-50"
              >
                {processingState ? 'Processing...' : 'Generate New Palette'}
              </button>

              {/* History */}
              {history.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {history.map((h, i) => (
                    <button 
                       key={i} 
                       onClick={() => setPalette(h)}
                       className="shrink-0 flex items-center border border-zinc-200 hover:border-[#111111]"
                    >
                       {h.slice(0, 4).map(c => (
                         <div key={c.id} className="w-4 h-6" style={{ backgroundColor: c.hex }}></div>
                       ))}
                    </button>
                  ))}
                </div>
              )}

              {/* Harmony */}
              <div className="flex flex-col gap-3 pt-6 border-t border-zinc-100">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 flex items-center gap-2">
                   Color Harmony
                   <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-400 text-[8px] rounded">Advanced</span>
                </label>
                <select 
                   value={harmonyMode} 
                   onChange={(e) => setHarmonyMode(e.target.value)}
                   className="w-full p-2 border border-zinc-200 text-sm font-bold uppercase tracking-wider bg-transparent outline-none hover:border-[#111111]"
                >
                   <option value="NONE">None</option>
                   <option value="COMPLEMENTARY">Complementary</option>
                   <option value="ANALOGOUS">Analogous</option>
                   <option value="TRIADIC">Triadic</option>
                   <option value="SPLIT COMPLEMENTARY">Split Complementary</option>
                </select>
                {harmonyMode !== "NONE" && palette.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mt-2">
                     {palette.map((c, i) => (
                       <button 
                         key={c.id}
                         onClick={() => setHarmonySourceIndex(i)}
                         className={`w-8 h-8 shrink-0 rounded-full border-2 ${harmonySourceIndex === i ? 'border-[#111111]' : 'border-transparent'}`}
                         style={{ backgroundColor: c.hex }}
                       />
                     ))}
                  </div>
                )}
              </div>

              {/* Export Templates */}
              <div className="flex flex-col gap-3 pt-6 border-t border-zinc-100">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">Export Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SQUARE', 'PORTRAIT', 'LANDSCAPE'] as const).map(s => (
                    <button 
                      key={s} 
                      onClick={() => setExportStyle(s)} 
                      className={`py-2 text-[9px] font-bold tracking-widest border uppercase transition-colors ${exportStyle === s ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          );
        }}
      />
    </ToolLayout>
  );
}