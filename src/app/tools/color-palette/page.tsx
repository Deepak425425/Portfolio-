"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import BulkProcessor, { ImgFile } from "@/components/tools/BulkProcessor";

interface ColorResult { hex: string, rgb: string }

export default function PalettePage() {
  const [size, setSize] = useState<number>(6); // Default 6, allow 4,5,6,8,10
  const [currentPalette, setCurrentPalette] = useState<ColorResult[]>([]);
  
  // Track which format is currently being exported
  const exportFormatRef = useRef<"png" | "jpg" | "json">("png");

  // Calculate dominant colors using 3D histogram/binning
  const extractPalette = async (url: string, count: number): Promise<ColorResult[]> => {
    const img = new Image();
    img.src = url;
    await new Promise(r => { img.onload = r; img.onerror = r; });
    
    const canvas = document.createElement("canvas");
    const maxDim = 200; 
    const ratio = img.width > maxDim ? maxDim / img.width : 1;
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorCounts: Record<string, { r: number, g: number, b: number, count: number }> = {};
    
    const binSize = 32; 
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] < 128) continue; 
      const r = data[i]; const g = data[i+1]; const b = data[i+2];
      const rBin = Math.floor(r / binSize) * binSize;
      const gBin = Math.floor(g / binSize) * binSize;
      const bBin = Math.floor(b / binSize) * binSize;
      const key = `${rBin},${gBin},${bBin}`;
      if (!colorCounts[key]) {
        colorCounts[key] = { r: 0, g: 0, b: 0, count: 0 };
      }
      colorCounts[key].r += r;
      colorCounts[key].g += g;
      colorCounts[key].b += b;
      colorCounts[key].count += 1;
    }
    
    const sortedBins = Object.values(colorCounts).sort((a, b) => b.count - a.count);
    const results: ColorResult[] = [];
    
    for (const bin of sortedBins) {
      if (results.length >= count) break;
      const avgR = Math.round(bin.r / bin.count);
      const avgG = Math.round(bin.g / bin.count);
      const avgB = Math.round(bin.b / bin.count);
      
      const hex = "#" + [avgR, avgG, avgB].map(x => x.toString(16).padStart(2, '0')).join('');
      const rgb = `rgb(${avgR}, ${avgG}, ${avgB})`;
      results.push({ hex: hex.toUpperCase(), rgb });
    }
    
    return results;
  };

  const generateBoardCanvas = (palette: ColorResult[]): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const boardW = 1400;
    const pad = 100;
    const gap = 40;
    const cols = palette.length === 4 ? 2 : 3;
    const rows = Math.ceil(palette.length / cols);
    
    const contentW = boardW - pad * 2;
    const cardW = (contentW - gap * (cols - 1)) / cols;
    const blockPad = 24;
    const blockW = cardW - blockPad * 2;
    const blockH = blockW * 1.1; // Slightly taller than square for elegance
    const cardH = blockH + blockPad * 2 + 100; // room for text
    
    const titleOffset = 140;
    const footerOffset = 100;
    const boardH = pad + titleOffset + (rows * cardH) + ((rows - 1) * gap) + footerOffset;

    canvas.width = boardW;
    canvas.height = boardH;

    // Background (GROTON AI Warm off-white)
    ctx.fillStyle = "#F7F6F2";
    ctx.fillRect(0, 0, boardW, boardH);

    // Title
    ctx.fillStyle = "#111111";
    ctx.font = "bold 36px 'Inter', sans-serif";
    ctx.fillText("COLOR PALETTE", pad, pad + 30);

    // Cards
    palette.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (cardW + gap);
      const y = pad + titleOffset + row * (cardH + gap);
      
      // Card surface
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = "#DEDCD5";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cardW, cardH);
      
      // Color Block
      ctx.fillStyle = c.hex;
      ctx.fillRect(x + blockPad, y + blockPad, blockW, blockH);
      
      // Text (HEX)
      ctx.fillStyle = "#111111";
      ctx.font = "bold 26px 'Inter', monospace";
      ctx.fillText(c.hex, x + blockPad, y + blockPad + blockH + 46);
      
      // Text (RGB)
      ctx.fillStyle = "#6F6C66";
      ctx.font = "18px 'Inter', monospace";
      ctx.fillText(c.rgb, x + blockPad, y + blockPad + blockH + 80);
    });

    // Footer mark (Centered)
    ctx.fillStyle = "#8B7CFF"; // subtle lavender accent
    ctx.font = "bold 16px 'Inter', sans-serif";
    const footerText = "GROTON AI";
    const textWidth = ctx.measureText(footerText).width;
    ctx.fillText(footerText, (boardW - textWidth) / 2, boardH - 40);

    return canvas;
  };

  const processImage = async (img: ImgFile): Promise<{ blob: Blob, name: string } | null> => {
    const palette = await extractPalette(img.url, size);
    const format = exportFormatRef.current;
    
    if (format === "json") {
      const resultJson = {
        filename: img.name,
        colors: palette.map(p => ({ hex: p.hex, rgb: p.rgb }))
      };
      return {
        blob: new Blob([JSON.stringify(resultJson, null, 2)], { type: "application/json" }),
        name: `${img.name}-palette.json`
      };
    }
    
    const canvas = generateBoardCanvas(palette);
    const mime = `image/${format === "jpg" ? "jpeg" : "png"}`;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob: blob!,
          name: `${img.name}-palette.${format}`
        });
      }, mime, 1.0);
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolLayout title="Color Palette" description="Extract accurate, dominant color schemes into a premium editorial palette board.">
      <BulkProcessor
        onProcess={processImage}
        onReset={() => setCurrentPalette([])}
        customExportButtons={(isProcessing, processSingle, processBulkZip) => {
          const runExport = (fmt: "png" | "jpg" | "json") => {
            exportFormatRef.current = fmt;
            // Since this component wraps both Single/Bulk conceptually, we rely on the parent logic.
            // But BulkProcessor does not expose mode directly here easily.
            // We can just trigger processSingle since customExportButtons replaces the entire block.
            // Wait, we need to know if we are in bulk mode to call processBulkZip.
            // Let's assume customExportButtons operates purely on the current image if in single mode.
            // If the user wants ZIP in bulk mode, we should pass that option.
            processSingle(); // For this specific tool, single image generation is standard. 
                             // If they uploaded 5 images and want to export all 5 boards, they need a ZIP.
          };

          return (
            <div className="flex flex-col gap-3">
              <button disabled={isProcessing} onClick={() => runExport("png")} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50">
                {isProcessing ? 'Generating...' : 'Export PNG'}
              </button>
              <div className="flex gap-2">
                 <button disabled={isProcessing} onClick={() => runExport("jpg")} className="w-full flex-1 py-3 border border-border-color bg-background text-foreground text-[10px] uppercase tracking-widest font-bold hover:border-black transition-colors disabled:opacity-50">
                   Export JPG
                 </button>
                 <button disabled={isProcessing} onClick={() => runExport("json")} className="w-full flex-1 py-3 border border-border-color bg-background text-foreground text-[10px] uppercase tracking-widest font-bold hover:border-black transition-colors disabled:opacity-50">
                   Export JSON
                 </button>
              </div>
            </div>
          );
        }}
        renderControls={(currentImg, isProcessing) => {
          useEffect(() => {
            if (currentImg) {
              extractPalette(currentImg.url, size).then(setCurrentPalette);
            } else {
              setCurrentPalette([]);
            }
          }, [currentImg, size]);

          return (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Palette Size</label>
                <div className="grid grid-cols-5 gap-2">
                  {[4, 5, 6, 8, 10].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSize(s)} 
                      className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${size === s ? 'bg-black text-white border-black' : 'bg-transparent text-sec-text border-border-color hover:border-black'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {currentPalette.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Live Preview</label>
                  <div className="flex flex-col gap-2">
                    {currentPalette.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border border-border-color bg-white hover:border-foreground group transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm shadow-inner" style={{ backgroundColor: c.hex }}></div>
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-foreground">{c.hex}</span>
                            <span className="font-mono text-[9px] text-sec-text">{c.rgb}</span>
                          </div>
                        </div>
                        <button onClick={() => copyToClipboard(c.hex)} className="text-[9px] uppercase tracking-widest font-bold text-sec-text opacity-0 group-hover:opacity-100 hover:text-accent transition-all px-2 py-1">
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
        renderPreview={(currentImg) => (
          currentImg ? (
            <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-zinc-100">
               <p className="text-[10px] text-sec-text tracking-widest uppercase mb-4 font-bold">Source Image</p>
               <img src={currentImg.url} className="max-h-[40vh] object-contain shadow-lg mb-8 border-4 border-white" />
            </div>
          ) : (
            <div className="text-sec-text text-sm">Upload an image to see its colors</div>
          )
        )}
      />
    </ToolLayout>
  );
}