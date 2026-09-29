"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";

const ASPECT_RATIOS = ["original", "1:1", "4:5", "3:4", "4:3", "3:2", "2:3", "16:9", "9:16"];

interface PresetSettings {
  pT: number; pR: number; pB: number; pL: number; uniform: boolean;
  bg: string;
  inEn: boolean; inW: number; inSp: number; inCol: string;
  outW: number; outCol: string;
  shadow: boolean; shOp: number; shBl: number; shDist: number; shAng: number;
  rad: number;
}

const DEFAULT_PRESET: PresetSettings = {
  pT: 30, pR: 30, pB: 30, pL: 30, uniform: true, bg: '#FFFFFF',
  inEn: false, inW: 2, inSp: 10, inCol: '#000000',
  outW: 0, outCol: '#000000',
  shadow: false, shOp: 20, shBl: 20, shDist: 10, shAng: 90,
  rad: 0
};

const PRESETS: { name: string, settings: Partial<PresetSettings> }[] = [
  { name: 'CLASSIC', settings: { pT: 30, pR: 30, pB: 30, pL: 30, uniform: true, bg: '#FFFFFF', inEn: false, outW: 0, shadow: false, rad: 0 } },
  { name: 'GOLDEN', settings: { pT: 40, pR: 40, pB: 40, pL: 40, uniform: true, bg: '#FFFFFF', inEn: true, inW: 2, inSp: 10, inCol: '#D4AF37', outW: 16, outCol: '#D4AF37', shadow: false, rad: 0 } },
  { name: 'DOUBLE', settings: { pT: 30, pR: 30, pB: 30, pL: 30, uniform: true, bg: '#FFFFFF', inEn: true, inW: 3, inSp: 8, inCol: '#000000', outW: 16, outCol: '#000000', shadow: false, rad: 0 } },
  { name: 'VINTAGE', settings: { pT: 50, pR: 50, pB: 50, pL: 50, uniform: true, bg: '#F4F0EA', inEn: true, inW: 1, inSp: 5, inCol: '#8C7B6B', outW: 0, shadow: false, rad: 0 } },
  { name: 'POLAROID', settings: { pT: 20, pR: 20, pB: 120, pL: 20, uniform: false, bg: '#F9F9F9', inEn: false, outW: 0, shadow: true, shOp: 20, shBl: 15, shDist: 8, shAng: 90, rad: 2 } },
  { name: 'WHITE', settings: { pT: 40, pR: 40, pB: 40, pL: 40, uniform: true, bg: '#FFFFFF', inEn: false, outW: 0, shadow: false, rad: 0 } },
  { name: 'FILM', settings: { pT: 40, pR: 20, pB: 40, pL: 20, uniform: false, bg: '#111111', inEn: true, inW: 1, inSp: 6, inCol: '#333333', outW: 0, shadow: false, rad: 0 } },
  { name: 'MINIMAL', settings: { pT: 0, pR: 0, pB: 0, pL: 0, uniform: true, bg: 'transparent', inEn: false, outW: 2, outCol: '#000000', shadow: false, rad: 0 } },
  { name: 'BOLD', settings: { pT: 0, pR: 0, pB: 0, pL: 0, uniform: true, bg: 'transparent', inEn: false, outW: 32, outCol: '#000000', shadow: false, rad: 0 } }
];

// SVG Icons
const Icons = {
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Reset: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
};

export default function BorderStudioPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileDetails, setFileDetails] = useState({ width: 0, height: 0, size: "0 MB" });
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);

  const [activePreset, setActivePreset] = useState("CLASSIC");
  const [aspectRatio, setAspectRatio] = useState("original");

  const [uniformPadding, setUniformPadding] = useState(true);
  const [padding, setPadding] = useState({ t: 30, r: 30, b: 30, l: 30 });

  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  const [outerBorderWidth, setOuterBorderWidth] = useState(0);
  const [outerBorderColor, setOuterBorderColor] = useState("#000000");

  const [innerBorderEnabled, setInnerBorderEnabled] = useState(false);
  const [innerBorderWidth, setInnerBorderWidth] = useState(2);
  const [innerBorderColor, setInnerBorderColor] = useState("#000000");
  const [innerBorderSpacing, setInnerBorderSpacing] = useState(10);
  const [innerBorderOpacity, setInnerBorderOpacity] = useState(100);

  const [cornerRadius, setCornerRadius] = useState(0);
  const [roundOuterOnly, setRoundOuterOnly] = useState(true);

  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowOpacity, setShadowOpacity] = useState(20);
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowDistance, setShadowDistance] = useState(10);
  const [shadowAngle, setShadowAngle] = useState(90);

  const [isProcessing, setIsProcessing] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setFileName(file.name);
    setFileDetails(prev => ({ ...prev, size: (file.size / (1024 * 1024)).toFixed(2) + " MB" }));
    
    const img = new Image();
    img.onload = () => {
       setFileDetails(prev => ({ ...prev, width: img.width, height: img.height }));
       setImgObj(img);
       setActivePreset("CLASSIC");
       applyPresetSettings(PRESETS[0].settings);
       setAspectRatio("original");
    };
    img.src = objectUrl;
  };

  const resetAll = () => {
     setActivePreset("CLASSIC");
     applyPresetSettings(PRESETS[0].settings);
     setAspectRatio("original");
  };

  const applyPresetSettings = (s: Partial<PresetSettings>) => {
     const p = { ...DEFAULT_PRESET, ...s };
     setUniformPadding(p.uniform);
     setPadding({ t: p.pT, r: p.pR, b: p.pB, l: p.pL });
     setBackgroundColor(p.bg);
     setInnerBorderEnabled(p.inEn);
     setInnerBorderWidth(p.inW);
     setInnerBorderSpacing(p.inSp);
     setInnerBorderColor(p.inCol);
     setOuterBorderWidth(p.outW);
     setOuterBorderColor(p.outCol);
     setShadowEnabled(p.shadow);
     setShadowOpacity(p.shOp);
     setShadowBlur(p.shBl);
     setShadowDistance(p.shDist);
     setShadowAngle(p.shAng);
     setCornerRadius(p.rad);
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
     setActivePreset(preset.name);
     applyPresetSettings(preset.settings);
  };

  // The core rendering engine for both main preview, thumbnails, and final export
  const renderCanvasEngine = (
    canvas: HTMLCanvasElement, 
    img: HTMLImageElement,
    scale: number,
    state: any
  ) => {
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const imgW = img.width * scale;
     const imgH = img.height * scale;
     
     const pT = state.padding.t * scale;
     const pR = (state.uniformPadding ? state.padding.t : state.padding.r) * scale;
     const pB = (state.uniformPadding ? state.padding.t : state.padding.b) * scale;
     const pL = (state.uniformPadding ? state.padding.t : state.padding.l) * scale;

     const minCW = imgW + pL + pR;
     const minCH = imgH + pT + pB;

     let targetRatio = 0;
     if (state.aspectRatio !== 'original') {
        const [wStr, hStr] = state.aspectRatio.split(':');
        targetRatio = parseFloat(wStr) / parseFloat(hStr);
     }

     let canvasW = minCW;
     let canvasH = minCH;
     let actualPT = pT;
     let actualPR = pR;
     let actualPB = pB;
     let actualPL = pL;

     if (targetRatio > 0) {
        const currentRatio = minCW / minCH;
        if (Math.abs(targetRatio - currentRatio) > 0.001) {
           if (targetRatio > currentRatio) {
              canvasW = minCH * targetRatio;
              const extra = canvasW - minCW;
              actualPL += extra / 2;
              actualPR += extra / 2;
           } else {
              canvasH = minCW / targetRatio;
              const extra = canvasH - minCH;
              actualPT += extra / 2;
              actualPB += extra / 2;
           }
        }
     }

     const sPad = state.shadowEnabled ? (state.shadowBlur + state.shadowDistance) * scale + 5 : 0;
     canvas.width = canvasW + sPad * 2;
     canvas.height = canvasH + sPad * 2;
     
     ctx.clearRect(0, 0, canvas.width, canvas.height);

     const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
     };

     const rx = sPad;
     const ry = sPad;
     const rw = canvasW;
     const rh = canvasH;
     const cRad = state.cornerRadius * scale;

     // Shadow implementation: Draw black shape with shadow, then destination-out the shape
     if (state.shadowEnabled) {
        ctx.save();
        const angleRad = (state.shadowAngle * Math.PI) / 180;
        ctx.shadowColor = `rgba(0,0,0,${state.shadowOpacity / 100})`;
        ctx.shadowBlur = state.shadowBlur * scale;
        ctx.shadowOffsetX = Math.cos(angleRad) * state.shadowDistance * scale;
        ctx.shadowOffsetY = Math.sin(angleRad) * state.shadowDistance * scale;
        roundRect(rx, ry, rw, rh, cRad);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill();
        ctx.restore();
     }

     // Background
     if (state.backgroundColor !== 'transparent') {
        ctx.save();
        roundRect(rx, ry, rw, rh, cRad);
        ctx.clip();
        ctx.fillStyle = state.backgroundColor;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.restore();
     }

     // Outer Border
     if (state.outerBorderWidth > 0) {
        ctx.save();
        const obW = state.outerBorderWidth * scale;
        ctx.lineWidth = obW;
        ctx.strokeStyle = state.outerBorderColor;
        roundRect(rx + obW/2, ry + obW/2, rw - obW, rh - obW, Math.max(0, cRad - obW/2));
        ctx.stroke();
        ctx.restore();
     }

     // Image
     ctx.save();
     const imgX = rx + actualPL;
     const imgY = ry + actualPT;
     if (!state.roundOuterOnly && cRad > 0) {
        const minPad = Math.min(actualPL, actualPT, actualPR, actualPB);
        const imgRad = Math.max(0, cRad - minPad);
        roundRect(imgX, imgY, imgW, imgH, imgRad);
        ctx.clip();
     }
     ctx.drawImage(img, imgX, imgY, imgW, imgH);
     ctx.restore();

     // Inner Border
     if (state.innerBorderEnabled && state.innerBorderWidth > 0) {
        ctx.save();
        const ibW = state.innerBorderWidth * scale;
        const spacing = state.innerBorderSpacing * scale;
        
        const ix = imgX - spacing - ibW/2;
        const iy = imgY - spacing - ibW/2;
        const iw = imgW + spacing*2 + ibW;
        const ih = imgH + spacing*2 + ibW;
        
        ctx.lineWidth = ibW;
        ctx.globalAlpha = state.innerBorderOpacity / 100;
        ctx.strokeStyle = state.innerBorderColor;
        
        let ibRad = 0;
        if (!state.roundOuterOnly && cRad > 0) {
           const minPad = Math.min(actualPL, actualPT, actualPR, actualPB);
           const imgRad = Math.max(0, cRad - minPad);
           ibRad = Math.max(0, imgRad + spacing + ibW/2);
        }

        roundRect(ix, iy, iw, ih, ibRad);
        ctx.stroke();
        ctx.restore();
     }
  };

  // Main Preview Hook
  useEffect(() => {
     if (previewCanvasRef.current && imgObj) {
        let scale = 1;
        const maxDim = 1200;
        if (imgObj.width > maxDim || imgObj.height > maxDim) {
           scale = maxDim / Math.max(imgObj.width, imgObj.height);
        }
        renderCanvasEngine(previewCanvasRef.current, imgObj, scale, {
           aspectRatio, uniformPadding, padding, backgroundColor, 
           outerBorderWidth, outerBorderColor, 
           innerBorderEnabled, innerBorderWidth, innerBorderColor, innerBorderSpacing, innerBorderOpacity, 
           cornerRadius, roundOuterOnly, 
           shadowEnabled, shadowOpacity, shadowBlur, shadowDistance, shadowAngle
        });
     }
  }, [
    imgObj, aspectRatio, uniformPadding, padding, backgroundColor,
    outerBorderWidth, outerBorderColor,
    innerBorderEnabled, innerBorderWidth, innerBorderColor, innerBorderSpacing, innerBorderOpacity,
    cornerRadius, roundOuterOnly,
    shadowEnabled, shadowOpacity, shadowBlur, shadowDistance, shadowAngle
  ]);

  const exportImage = async (format: "png" | "jpg" | "webp") => {
    if (!imgObj) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));
    
    const canvas = document.createElement("canvas");
    // Scale = 1 for original resolution export
    renderCanvasEngine(canvas, imgObj, 1, {
       aspectRatio, uniformPadding, padding, backgroundColor, 
       outerBorderWidth, outerBorderColor, 
       innerBorderEnabled, innerBorderWidth, innerBorderColor, innerBorderSpacing, innerBorderOpacity, 
       cornerRadius, roundOuterOnly, 
       shadowEnabled, shadowOpacity, shadowBlur, shadowDistance, shadowAngle
    });
    
    const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
    const a = document.createElement("a");
    a.href = canvas.toDataURL(mime, 0.95);
    
    const origExt = fileName.split('.').pop() || '';
    const baseName = fileName.substring(0, fileName.length - (origExt.length ? origExt.length + 1 : 0));
    a.download = getGrotonExportFilename(`${baseName}.${format}`);
    a.click();
    setIsProcessing(false);
  };

  // Tiny Canvas component for preset thumbnails
  const PresetThumbnail = ({ preset }: { preset: typeof PRESETS[0] }) => {
     const canvasRef = useRef<HTMLCanvasElement>(null);
     useEffect(() => {
        if (canvasRef.current && imgObj) {
           const pSettings = { ...DEFAULT_PRESET, ...preset.settings };
           const scale = 120 / Math.max(imgObj.width, imgObj.height);
           renderCanvasEngine(canvasRef.current, imgObj, scale, {
              aspectRatio: 'original',
              uniformPadding: pSettings.uniform,
              padding: { t: pSettings.pT, r: pSettings.pR, b: pSettings.pB, l: pSettings.pL },
              backgroundColor: pSettings.bg,
              outerBorderWidth: pSettings.outW,
              outerBorderColor: pSettings.outCol,
              innerBorderEnabled: pSettings.inEn,
              innerBorderWidth: pSettings.inW,
              innerBorderColor: pSettings.inCol,
              innerBorderSpacing: pSettings.inSp,
              innerBorderOpacity: 100,
              cornerRadius: pSettings.rad,
              roundOuterOnly: true,
              shadowEnabled: pSettings.shadow,
              shadowOpacity: pSettings.shOp,
              shadowBlur: pSettings.shBl,
              shadowDistance: pSettings.shDist,
              shadowAngle: pSettings.shAng
           });
        }
     }, [imgObj, preset]);

     return (
        <div className="w-full aspect-square rounded bg-[#F7F6F2] overflow-hidden flex items-center justify-center p-2 shadow-inner">
           {imgObj ? (
              <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain filter drop-shadow-sm transition-transform group-hover:scale-105" />
           ) : (
              <div className="w-12 h-16 bg-transparent border border-gray-200 shadow-sm rounded-sm"></div>
           )}
        </div>
     );
  };

  return (
    <main className="h-screen w-screen bg-[#F7F6F2] text-[#242631] font-sans flex flex-col overflow-hidden">
      {/* AMBIENT GRADIENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#DCD7FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[#E4E9FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#FFF4E6] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#F8DDEB] opacity-30 blur-[120px] rounded-full"></div>
      </div>

      <style>{`
        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #F3F4F7;
          box-shadow: 2px 2px 5px rgba(120,125,140,0.3), -2px -2px 5px rgba(255,255,255,1);
          cursor: pointer;
          margin-top: -6px;
        }
        input[type=range]:focus::-webkit-slider-thumb {
           box-shadow: 0 0 0 2px rgba(139, 124, 255, 0.4), 2px 2px 5px rgba(120,125,140,0.3), -2px -2px 5px rgba(255,255,255,1);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: #EEF0F4;
          border-radius: 3px;
          box-shadow: inset 2px 2px 4px rgba(120,125,140,0.15), inset -2px -2px 4px rgba(255,255,255,0.8);
        }
        .neu-flat {
          background: #F3F4F7;
          box-shadow: 6px 6px 12px rgba(120,125,140,0.12), -6px -6px 12px rgba(255,255,255,0.9);
        }
        .neu-inset {
          background: #EEF0F4;
          box-shadow: inset 4px 4px 8px rgba(120,125,140,0.12), inset -4px -4px 8px rgba(255,255,255,0.9);
        }
        .neu-button {
          background: #F3F4F7;
          box-shadow: 4px 4px 8px rgba(120,125,140,0.12), -4px -4px 8px rgba(255,255,255,0.9);
          transition: all 0.15s ease;
        }
        .neu-button:active {
          box-shadow: inset 3px 3px 6px rgba(120,125,140,0.15), inset -3px -3px 6px rgba(255,255,255,0.9);
        }
        .neu-active {
          background: #F3F4F7;
          box-shadow: inset 3px 3px 6px rgba(120,125,140,0.15), inset -3px -3px 6px rgba(255,255,255,0.9);
          color: #8B7CFF;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>

      {/* HEADER */}
      <header className="h-[72px] shrink-0 flex items-center px-8 justify-between z-10 neu-flat rounded-b-2xl mb-2">
         <div className="flex items-center gap-6">
            <Link href="/tools" className="neu-button w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#7B7F89] hover:text-[#242631]">
               <Icons.Back />
            </Link>
            <div>
               <h1 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#242631]">GROTON</h1>
               <h2 className="text-[10px] uppercase tracking-widest text-[#7B7F89]">Image Border Studio</h2>
            </div>
         </div>
         {url && (
            <button onClick={resetAll} className="neu-button px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#7B7F89] hover:text-[#242631]">
               <Icons.Reset /> Reset All
            </button>
         )}
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-4 px-4 lg:px-8 gap-8">
         
         {/* LEFT - PREVIEW */}
         <div className="flex-1 flex flex-col h-full overflow-hidden gap-6 pt-4">
            {!url ? (
               <div className="flex-1 neu-inset rounded-3xl flex items-center justify-center p-8">
                  <div className="w-full max-w-md neu-flat rounded-3xl overflow-hidden p-2">
                     <UploadDropzone onUpload={handleUpload} multiple={false} accept="image/jpeg, image/png, image/webp" />
                  </div>
               </div>
            ) : (
               <div className="flex-1 neu-inset rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-4">
                  <div className="absolute top-6 left-6 flex flex-col gap-1 z-20 pointer-events-none opacity-50">
                     <span className="text-[10px] font-bold tracking-widest uppercase">{fileName}</span>
                     <span className="text-[9px] font-mono tracking-widest">{fileDetails.width} × {fileDetails.height} px • {fileDetails.size}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden p-6 md:p-12">
                     <div className="relative flex items-center justify-center w-full h-full">
                        <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain filter drop-shadow-sm transition-transform" />
                     </div>
                  </div>
                  {isProcessing && (
                    <div className="absolute inset-0 bg-[#F7F6F2]/80 backdrop-blur-sm z-50 flex flex-col gap-4 items-center justify-center rounded-3xl">
                      <div className="w-8 h-8 border-[3px] border-[#8B7CFF] border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B7CFF]">Rendering Export...</div>
                    </div>
                  )}
               </div>
            )}
         </div>

         {/* RIGHT - CONTROLS */}
         <div className={`w-full lg:w-[420px] shrink-0 h-full flex flex-col gap-6 pt-4 transition-opacity ${!url ? 'opacity-30 pointer-events-none' : 'opacity-100'} overflow-y-auto custom-scrollbar pr-2 pb-12`}>
            
            {/* PRESETS */}
            <div className="flex flex-col gap-4 border-b border-[#d1d5db]/30 pb-6">
               <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B7F89]">Presets</h3>
               <div className="grid grid-cols-3 gap-3">
                  {PRESETS.map(p => (
                     <button key={p.name} onClick={() => handlePresetClick(p)} className={`p-3 rounded-2xl flex flex-col gap-3 items-center group transition-all ${activePreset === p.name ? 'neu-active' : 'neu-button'}`}>
                        <PresetThumbnail preset={p} />
                        <span className="text-[9px] font-bold tracking-widest uppercase">{p.name}</span>
                     </button>
                  ))}
               </div>
            </div>

            {/* ASPECT RATIO */}
            <div className="flex flex-col gap-4 border-b border-[#d1d5db]/30 pb-6">
               <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B7F89]">Aspect Ratio</h3>
               <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map(ar => (
                     <button key={ar} onClick={() => setAspectRatio(ar)} className={`px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-full transition-colors ${aspectRatio === ar ? 'neu-active text-[#8B7CFF]' : 'neu-button text-[#7B7F89] hover:text-[#242631]'}`}>
                        {ar}
                     </button>
                  ))}
               </div>
            </div>

            {/* PADDING & OUTER BORDER */}
            <div className="neu-flat p-6 rounded-2xl flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B7CFF]">Border & Padding</h3>
                  <button onClick={() => setUniformPadding(!uniformPadding)} className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full transition-colors ${uniformPadding ? 'neu-active text-[#8B7CFF]' : 'neu-button text-[#7B7F89]'}`}>Uniform</button>
               </div>
               
               {uniformPadding ? (
                  <div className="flex flex-col gap-3">
                     <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Padding</span><span className="text-[#242631]">{padding.t}px</span></label>
                     <input type="range" min="0" max="400" value={padding.t} onChange={e => setPadding({ t: Number(e.target.value), r: Number(e.target.value), b: Number(e.target.value), l: Number(e.target.value) })} />
                  </div>
               ) : (
                  <div className="grid grid-cols-2 gap-4">
                     {['t', 'b', 'l', 'r'].map((side) => (
                        <div key={side} className="flex flex-col gap-3">
                           <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>{side === 't' ? 'Top' : side === 'b' ? 'Bottom' : side === 'l' ? 'Left' : 'Right'}</span><span className="text-[#242631]">{padding[side as keyof typeof padding]}px</span></label>
                           <input type="range" min="0" max="400" value={padding[side as keyof typeof padding]} onChange={e => setPadding(p => ({ ...p, [side]: Number(e.target.value) }))} />
                        </div>
                     ))}
                  </div>
               )}

               <div className="h-px bg-[#d1d5db]/30 w-full"></div>

               <div className="flex flex-col gap-3">
                  <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Outer Line Width</span><span className="text-[#242631]">{outerBorderWidth}px</span></label>
                  <input type="range" min="0" max="100" value={outerBorderWidth} onChange={e => setOuterBorderWidth(Number(e.target.value))} />
               </div>
               <div className="flex flex-col gap-3">
                  <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold">Outer Line Color</label>
                  <div className="flex gap-3 items-center">
                     <input type="color" value={outerBorderColor} onChange={e => setOuterBorderColor(e.target.value)} className="w-10 h-10 rounded-full neu-button border-0 p-0 cursor-pointer" />
                     <span className="text-[10px] font-mono uppercase text-[#7B7F89]">{outerBorderColor}</span>
                  </div>
               </div>
            </div>

            {/* BACKGROUND */}
            <div className="neu-flat p-6 rounded-2xl flex flex-col gap-6">
               <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B7CFF]">Background</h3>
               <div className="flex gap-3 items-center">
                  <input type="color" value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor} onChange={e => setBackgroundColor(e.target.value)} disabled={backgroundColor === 'transparent'} className="w-10 h-10 rounded-full neu-button border-0 p-0 cursor-pointer disabled:opacity-50" />
                  <span className="text-[10px] font-mono uppercase text-[#7B7F89]">{backgroundColor}</span>
                  <button onClick={() => setBackgroundColor(backgroundColor === 'transparent' ? '#FFFFFF' : 'transparent')} className={`ml-auto px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-full transition-colors ${backgroundColor === 'transparent' ? 'neu-active text-[#8B7CFF]' : 'neu-button text-[#7B7F89]'}`}>Transparent</button>
               </div>
            </div>

            {/* INNER BORDER */}
            <div className="neu-flat p-6 rounded-2xl flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B7CFF]">Inner Border</h3>
                  <button onClick={() => setInnerBorderEnabled(!innerBorderEnabled)} className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full transition-colors ${innerBorderEnabled ? 'neu-active text-[#8B7CFF]' : 'neu-button text-[#7B7F89]'}`}>{innerBorderEnabled ? 'ON' : 'OFF'}</button>
               </div>
               
               {innerBorderEnabled && (
                  <>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Width</span><span className="text-[#242631]">{innerBorderWidth}px</span></label>
                        <input type="range" min="1" max="100" value={innerBorderWidth} onChange={e => setInnerBorderWidth(Number(e.target.value))} />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Spacing</span><span className="text-[#242631]">{innerBorderSpacing}px</span></label>
                        <input type="range" min="-100" max="200" value={innerBorderSpacing} onChange={e => setInnerBorderSpacing(Number(e.target.value))} />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Opacity</span><span className="text-[#242631]">{innerBorderOpacity}%</span></label>
                        <input type="range" min="0" max="100" value={innerBorderOpacity} onChange={e => setInnerBorderOpacity(Number(e.target.value))} />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold">Color</label>
                        <div className="flex gap-3 items-center">
                           <input type="color" value={innerBorderColor} onChange={e => setInnerBorderColor(e.target.value)} className="w-10 h-10 rounded-full neu-button border-0 p-0 cursor-pointer" />
                           <span className="text-[10px] font-mono uppercase text-[#7B7F89]">{innerBorderColor}</span>
                        </div>
                     </div>
                  </>
               )}
            </div>

            {/* CORNERS */}
            <div className="neu-flat p-6 rounded-2xl flex flex-col gap-6">
               <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B7CFF]">Rounded Corners</h3>
               <div className="flex flex-wrap gap-2">
                  {[0, 8, 16, 24, 40, 80].map(r => (
                     <button key={r} onClick={() => setCornerRadius(r)} className={`px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-full transition-colors ${cornerRadius === r ? 'neu-active text-[#8B7CFF]' : 'neu-button text-[#7B7F89] hover:text-[#242631]'}`}>
                        {r === 0 ? '0' : `${r}px`}
                     </button>
                  ))}
               </div>
               <div className="flex flex-col gap-3">
                  <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Custom Radius</span><span className="text-[#242631]">{cornerRadius}px</span></label>
                  <input type="range" min="0" max="200" value={cornerRadius} onChange={e => setCornerRadius(Number(e.target.value))} />
               </div>
               <button onClick={() => setRoundOuterOnly(!roundOuterOnly)} className={`px-4 py-3 mt-2 text-[9px] uppercase tracking-widest font-bold rounded-xl transition-colors ${roundOuterOnly ? 'neu-active text-[#8B7CFF]' : 'neu-button text-[#7B7F89]'}`}>Round Only Outer Frame</button>
            </div>

            {/* SHADOW */}
            <div className="neu-flat p-6 rounded-2xl flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B7CFF]">Drop Shadow</h3>
                  <button onClick={() => setShadowEnabled(!shadowEnabled)} className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full transition-colors ${shadowEnabled ? 'neu-active text-[#8B7CFF]' : 'neu-button text-[#7B7F89]'}`}>{shadowEnabled ? 'ON' : 'OFF'}</button>
               </div>
               {shadowEnabled && (
                  <>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Opacity</span><span className="text-[#242631]">{shadowOpacity}%</span></label>
                        <input type="range" min="0" max="100" value={shadowOpacity} onChange={e => setShadowOpacity(Number(e.target.value))} />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Blur</span><span className="text-[#242631]">{shadowBlur}px</span></label>
                        <input type="range" min="0" max="100" value={shadowBlur} onChange={e => setShadowBlur(Number(e.target.value))} />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Distance</span><span className="text-[#242631]">{shadowDistance}px</span></label>
                        <input type="range" min="0" max="100" value={shadowDistance} onChange={e => setShadowDistance(Number(e.target.value))} />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between"><span>Angle</span><span className="text-[#242631]">{shadowAngle}°</span></label>
                        <input type="range" min="0" max="360" value={shadowAngle} onChange={e => setShadowAngle(Number(e.target.value))} />
                     </div>
                  </>
               )}
            </div>

            {/* EXPORT PANEL */}
            <div className="neu-flat p-6 rounded-3xl shrink-0 flex flex-col gap-5 mt-4">
               <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B7F89] text-center flex items-center justify-center gap-2">
                  <Icons.Download /> Export Final Image
               </h3>
               
               <div className="flex gap-3">
                  <button onClick={() => exportImage("jpg")} disabled={isProcessing} className="flex-1 py-4 neu-button rounded-xl text-[10px] font-bold tracking-widest uppercase text-[#242631] hover:text-[#8B7CFF]">JPG</button>
                  <button onClick={() => exportImage("png")} disabled={isProcessing} className="flex-1 py-4 neu-button rounded-xl text-[10px] font-bold tracking-widest uppercase text-[#242631] hover:text-[#8B7CFF]">PNG</button>
                  <button onClick={() => exportImage("webp")} disabled={isProcessing} className="flex-1 py-4 neu-button rounded-xl text-[10px] font-bold tracking-widest uppercase text-[#242631] hover:text-[#8B7CFF]">WEBP</button>
               </div>
            </div>

         </div>
      </div>
    
      {/* SEO CONTENT BLOCK */}
      <section id="seo-content-block" className="max-w-[1280px] mx-auto w-full px-6 md:px-8 py-16 md:py-24 mt-12 border-t border-zinc-200/50">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-zinc-600">
            <div className="flex flex-col gap-4 lg:col-span-2">
               <h2 className="text-2xl font-serif text-[#111111]">Add Beautiful Borders & Frames to Images</h2>
               <p className="text-sm leading-relaxed">Enhance your photos with classic frames, vintage Polaroid borders, and custom padding.</p>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] mt-6">How to use</h3>
               <ol className="list-decimal list-inside text-sm flex flex-col gap-2">
                  <li>Select your image.</li><li>Choose a border preset or manually adjust padding.</li><li>Select colors and corner radius.</li><li>Export your framed image.</li>
               </ol>
            </div>
            <div className="flex flex-col gap-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111]">Key Features</h3>
               <ul className="list-disc list-inside text-sm flex flex-col gap-2">
                  <li>9 unique presets</li><li>Custom corner rounding</li><li>Drop shadow engine</li><li>High-res export</li>
               </ul>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] mt-6">Related Tools</h3>
               <p className="text-sm flex flex-wrap gap-2 leading-relaxed">
                  <a href="/tools/resize" className="text-[#8B7CFF] hover:underline">Image Resizer</a> • <a href="/tools/canvas" className="text-[#8B7CFF] hover:underline">Canvas Padding</a> • <a href="/tools/crop" className="text-[#8B7CFF] hover:underline">Image Cropper</a>
               </p>
            </div>
         </div>
         <div className="mt-12 text-xs text-zinc-400 max-w-3xl">
            <strong>Supported Formats:</strong> JPG, PNG, WebP. 
            All image processing is done securely. Groton AI is a suite of online image tools designed for e-commerce, creators, and visual production.
         </div>
      </section>
</main>
  );
}