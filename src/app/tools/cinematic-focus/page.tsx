"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { Effect, EffectType, DEFAULT_PARAMS, applyEffects } from "@/components/tools/cinematic/EffectsEngine";

const PRESETS: Record<string, Effect[]> = {
  "Cinematic Focus": [
    { id: "1", type: "cinematic_focus", enabled: true, params: { ...DEFAULT_PARAMS.cinematic_focus } },
    { id: "2", type: "vintage_color", enabled: true, params: { warmth: 10, contrast: 20, fade: 5 } }
  ],
  "Editorial Poster": [
    { id: "1", type: "duotone", enabled: true, params: { shadow: "#111111", highlight: "#e3f0da", mix: 100 } },
    { id: "2", type: "halftone", enabled: true, params: { dotSize: 15, contrast: 30 } },
    { id: "3", type: "film_grain", enabled: true, params: { amount: 30, size: 1 } },
    { id: "4", type: "chromatic_aberration", enabled: true, params: { amount: 15, angle: 0 } },
    { id: "5", type: "vignette", enabled: true, params: { amount: 60, size: 40, softness: 60 } }
  ],
  "Vintage Analog": [
    { id: "1", type: "vintage_color", enabled: true, params: { warmth: 40, contrast: 15, fade: 30 } },
    { id: "2", type: "film_grain", enabled: true, params: { amount: 25, size: 1 } },
    { id: "3", type: "vignette", enabled: true, params: { amount: 80, size: 30, softness: 80 } }
  ],
  "Noir Film": [
    { id: "1", type: "duotone", enabled: true, params: { shadow: "#000000", highlight: "#ffffff", mix: 100 } },
    { id: "2", type: "vintage_color", enabled: true, params: { warmth: 0, contrast: 40, fade: 0 } },
    { id: "3", type: "film_grain", enabled: true, params: { amount: 40, size: 1 } }
  ],
  "Cyber Glitch": [
    { id: "1", type: "chromatic_aberration", enabled: true, params: { amount: 30, angle: 0 } },
    { id: "2", type: "vintage_color", enabled: true, params: { warmth: -20, contrast: 50, fade: 0 } },
    { id: "3", type: "duotone", enabled: true, params: { shadow: "#000033", highlight: "#00ffff", mix: 50 } }
  ]
};

const EFFECT_LABELS: Record<EffectType, string> = {
  cinematic_focus: "Cinematic Focus",
  film_grain: "Film Grain",
  vintage_color: "Color Grade",
  halftone: "Halftone Pattern",
  chromatic_aberration: "Chromatic Aberration",
  vignette: "Vignette",
  duotone: "Duotone Map"
};

export default function CinematicFocusPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  
  const [effects, setEffects] = useState<Effect[]>(PRESETS["Cinematic Focus"]);
  const [activeEffectId, setActiveEffectId] = useState<string | null>("1");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setFileName(file.name);
    
    const img = new Image();
    img.onload = () => setImgObj(img);
    img.src = objectUrl;
  };

  const updatePreview = () => {
    if (!imgObj || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    
    // Scale down for preview
    const maxW = 1200;
    const ratio = imgObj.width > maxW ? maxW / imgObj.width : 1;
    canvas.width = imgObj.width * ratio;
    canvas.height = imgObj.height * ratio;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
    applyEffects(canvas, effects);
  };

  // Debounced update for sliders
  useEffect(() => {
    const t = setTimeout(() => {
      updatePreview();
    }, 50);
    return () => clearTimeout(t);
  }, [effects, imgObj]);

  const addEffect = (type: EffectType) => {
    const newId = Math.random().toString(36).substring(7);
    setEffects([...effects, { id: newId, type, enabled: true, params: { ...DEFAULT_PARAMS[type] } }]);
    setActiveEffectId(newId);
    setShowAddMenu(false);
  };

  const removeEffect = (id: string) => {
    setEffects(effects.filter(e => e.id !== id));
    if (activeEffectId === id) setActiveEffectId(null);
  };

  const toggleEffect = (id: string) => {
    setEffects(effects.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  const updateEffectParam = (id: string, key: string, val: number | string) => {
    setEffects(effects.map(e => e.id === id ? { ...e, params: { ...e.params, [key]: val } } : e));
  };

  const exportImage = async (format: "png" | "jpg" | "webp") => {
    if (!imgObj || !fullCanvasRef.current) return;
    setIsProcessing(true);
    
    // Allow React to render processing state
    await new Promise(r => setTimeout(r, 50));
    
    const canvas = fullCanvasRef.current;
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
      applyEffects(canvas, effects);
      
      const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
      const a = document.createElement("a");
      a.href = canvas.toDataURL(mime, 0.95);
      
      const origExt = fileName.split('.').pop() || '';
      const baseName = fileName.substring(0, fileName.length - (origExt.length ? origExt.length + 1 : 0));
      a.download = getGrotonExportFilename(`${baseName}.${format}`);
      a.click();
    }
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Cinematic Focus" description="Complete studio for cinematic focus, film grading, and distressed poster effects.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT PANEL - PREVIEW */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!url ? (
            <div className="w-full max-w-md mx-auto mt-12">
              <UploadDropzone onUpload={handleUpload} multiple={false} accept="image/jpeg, image/png, image/webp" />
            </div>
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 min-h-[65vh] overflow-hidden">
               <canvas ref={previewCanvasRef} className="max-w-full max-h-[75vh] object-contain shadow-2xl bg-white" />
               <canvas ref={fullCanvasRef} className="hidden" />
               {isProcessing && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                   <div className="text-sm font-bold uppercase tracking-widest animate-pulse">Processing High-Res Export...</div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL - CONTROLS */}
        <div className="lg:col-span-4 flex flex-col lg:h-full lg:overflow-y-auto lg:max-h-[85vh] pb-12 gap-8">
           
           {/* PRESETS */}
           <div className={`bg-white p-6 border border-zinc-200 flex flex-col gap-4 transition-opacity ${!url ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">Studio Presets</h3>
              <div className="flex flex-wrap gap-2">
                 {Object.keys(PRESETS).map(name => (
                    <button key={name} onClick={() => { setEffects(JSON.parse(JSON.stringify(PRESETS[name]))); setActiveEffectId(null); }} className="px-3 py-2 text-[9px] uppercase tracking-widest border border-zinc-200 text-zinc-600 hover:border-[#111111] transition-colors">
                       {name}
                    </button>
                 ))}
                 <button onClick={() => setEffects([])} className="px-3 py-2 text-[9px] uppercase tracking-widest border border-zinc-200 text-red-500 hover:border-red-500 transition-colors">
                    Reset
                 </button>
              </div>
           </div>

           {/* EFFECT STACK */}
           <div className={`bg-white p-6 border border-zinc-200 flex flex-col gap-4 transition-opacity ${!url ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                 <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Effect Stack</h3>
                 <button onClick={() => setShowAddMenu(!showAddMenu)} className="text-[10px] uppercase font-bold text-[#8B7CFF] tracking-widest hover:text-black transition-colors">+ Add</button>
              </div>

              {showAddMenu && (
                 <div className="flex flex-col gap-1 mb-2 p-2 bg-zinc-50 border border-zinc-200">
                    {Object.entries(EFFECT_LABELS).map(([k, label]) => (
                       <button key={k} onClick={() => addEffect(k as EffectType)} className="text-left px-3 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors">{label}</button>
                    ))}
                 </div>
              )}

              <div className="flex flex-col gap-2">
                 {effects.map((eff, idx) => (
                    <div key={eff.id} className="flex flex-col border border-zinc-200">
                       {/* Effect Header */}
                       <div className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${activeEffectId === eff.id ? 'bg-[#8B7CFF] text-white' : 'bg-white hover:bg-zinc-50'}`} onClick={() => setActiveEffectId(activeEffectId === eff.id ? null : eff.id)}>
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] font-mono opacity-50">{idx + 1}</span>
                             <span className="text-[10px] uppercase tracking-widest font-bold">{EFFECT_LABELS[eff.type]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={(e) => { e.stopPropagation(); toggleEffect(eff.id); }} className="p-1 opacity-70 hover:opacity-100 text-[10px] font-bold">
                                {eff.enabled ? 'ON' : 'OFF'}
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); removeEffect(eff.id); }} className="p-1 opacity-70 hover:opacity-100 text-[12px] font-bold">
                                ✕
                             </button>
                          </div>
                       </div>
                       
                       {/* Effect Controls */}
                       {activeEffectId === eff.id && eff.enabled && (
                          <div className="p-4 bg-zinc-50 flex flex-col gap-4 border-t border-zinc-200">
                             {Object.entries(eff.params).map(([key, val]) => (
                                <div key={key} className="flex flex-col gap-2">
                                   <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between">
                                      <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                      {typeof val === 'number' && <span>{val}</span>}
                                   </label>
                                   {typeof val === 'number' ? (
                                      <input type="range" min="0" max="100" value={val} onChange={e => updateEffectParam(eff.id, key, Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                                   ) : typeof val === 'string' && val.startsWith('#') ? (
                                      <div className="flex items-center gap-3">
                                        <input type="color" value={val} onChange={e => updateEffectParam(eff.id, key, e.target.value)} className="w-8 h-8 border-0 p-0 cursor-pointer" />
                                        <span className="text-[10px] font-mono uppercase text-zinc-500">{val}</span>
                                      </div>
                                   ) : (
                                      <input type="text" value={val} onChange={e => updateEffectParam(eff.id, key, e.target.value)} className="w-full text-xs p-2 border border-zinc-200" />
                                   )}
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 ))}
                 
                 {effects.length === 0 && (
                   <div className="text-center py-8 text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                     Stack is empty. Add an effect.
                   </div>
                 )}
              </div>
           </div>

           {/* EXPORT */}
           <div className={`bg-white p-6 border border-zinc-200 flex flex-col gap-4 transition-opacity ${!url ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">Export Final Image</h3>
              <div className="flex gap-2">
                 <button onClick={() => exportImage("jpg")} disabled={isProcessing} className="flex-1 py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:opacity-50">JPG</button>
                 <button onClick={() => exportImage("png")} disabled={isProcessing} className="flex-1 py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:opacity-50">PNG</button>
                 <button onClick={() => exportImage("webp")} disabled={isProcessing} className="flex-1 py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:opacity-50">WEBP</button>
              </div>
           </div>

        </div>
      </div>
    </ToolLayout>
  );
}
