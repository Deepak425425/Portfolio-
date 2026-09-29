"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { ColorGrade, FilterEffect, FilterType, DEFAULT_GRADE, DEFAULT_FILTER_PARAMS, applyColorGradeAndFilters } from "@/components/tools/filters/FiltersEngine";

// Presets grouped by Category
const PRESETS_BY_CATEGORY: Record<string, Record<string, FilterEffect[]>> = {
  "FOCUS": {
    "Cinematic Focus": [{ id: "f1", type: "cinematic_focus", enabled: true, params: { ...DEFAULT_FILTER_PARAMS.cinematic_focus } }]
  },
  "POSTER": {
    "Editorial Distressed Poster": [
      { id: "p1", type: "duotone", enabled: true, params: { shadow: "#111111", highlight: "#e3f0da", mix: 100 } },
      { id: "p2", type: "halftone", enabled: true, params: { dotSize: 15, contrast: 30 } },
      { id: "p3", type: "film_grain", enabled: true, params: { amount: 30, size: 1 } },
      { id: "p4", type: "chromatic_aberration", enabled: true, params: { amount: 15, angle: 0 } },
      { id: "p5", type: "vignette", enabled: true, params: { amount: 60, size: 40, softness: 60 } }
    ],
    "Halftone Print": [{ id: "h1", type: "halftone", enabled: true, params: { dotSize: 8, contrast: 40 } }],
    "Riso Print": [
      { id: "r1", type: "duotone", enabled: true, params: { shadow: "#000088", highlight: "#ffcccc", mix: 100 } },
      { id: "r2", type: "halftone", enabled: true, params: { dotSize: 6, contrast: 20 } }
    ]
  },
  "FILM": {
    "Vintage Analog": [
      { id: "a1", type: "film_grain", enabled: true, params: { amount: 25, size: 1 } },
      { id: "a2", type: "vignette", enabled: true, params: { amount: 80, size: 30, softness: 80 } }
    ],
    "Film Noir": [
      { id: "fn1", type: "duotone", enabled: true, params: { shadow: "#000000", highlight: "#ffffff", mix: 100 } },
      { id: "fn2", type: "film_grain", enabled: true, params: { amount: 35, size: 1 } }
    ],
    "35mm Film": [{ id: "f35", type: "film_grain", enabled: true, params: { amount: 15, size: 1 } }]
  },
  "GLITCH": {
    "Cyber Glitch": [
      { id: "g1", type: "chromatic_aberration", enabled: true, params: { amount: 30, angle: 0 } },
      { id: "g2", type: "duotone", enabled: true, params: { shadow: "#000033", highlight: "#00ffff", mix: 50 } }
    ],
    "Chromatic": [{ id: "c1", type: "chromatic_aberration", enabled: true, params: { amount: 10, angle: 0 } }]
  }
};

const GRADE_PRESETS: Record<string, Partial<ColorGrade>> = {
  "Cinematic Warm": { exposure: 5, contrast: 15, temperature: 20, tint: -5, highlights: -10, shadows: 10 },
  "Cold Night": { exposure: -10, contrast: 20, temperature: -30, tint: 10, highlights: 20, shadows: -20 },
  "Muted Editorial": { exposure: 0, contrast: -20, saturation: -30, highlights: -30, shadows: 30 },
  "Luxury Editorial": { exposure: 5, contrast: 10, saturation: -15, highlights: -5, shadows: -5 },
  "High Contrast": { exposure: 0, contrast: 50, saturation: 10, highlights: 20, shadows: -20 }
};

const EFFECT_LABELS: Record<FilterType, string> = {
  cinematic_focus: "Cinematic Focus",
  film_grain: "Film Grain",
  halftone: "Halftone Pattern",
  chromatic_aberration: "Chromatic Aberration",
  vignette: "Vignette",
  duotone: "Duotone Map"
};

export default function FiltersPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  
  const [tab, setTab] = useState<"filters" | "grading">("filters");
  const [activeCategory, setActiveCategory] = useState<string>("FOCUS");

  const [grade, setGrade] = useState<ColorGrade>({ ...DEFAULT_GRADE });
  const [effects, setEffects] = useState<FilterEffect[]>([]);
  
  const [activeEffectId, setActiveEffectId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isCompare, setIsCompare] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const updatePreview = () => {
    if (!imgObj || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    
    const maxW = 1200;
    const ratio = imgObj.width > maxW ? maxW / imgObj.width : 1;
    canvas.width = imgObj.width * ratio;
    canvas.height = imgObj.height * ratio;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
    
    if (!isCompare) {
      applyColorGradeAndFilters(canvas, grade, effects);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => updatePreview(), 50);
    return () => clearTimeout(t);
  }, [grade, effects, imgObj, isCompare]);

  // Canvas Interactions
  const handlePointerDown = (e: React.PointerEvent) => {
     if (zoom > 1 && e.button !== 2) {
       setIsDraggingPan(true);
       panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
       return;
     }

     if (tab !== "filters") return;
     const hasFocus = effects.find(f => f.type === 'cinematic_focus' && f.enabled);
     if (!hasFocus) return;

     const rect = previewCanvasRef.current?.getBoundingClientRect();
     if (!rect) return;

     const percentX = ((e.clientX - rect.left) / rect.width) * 100;
     const percentY = ((e.clientY - rect.top) / rect.height) * 100;

     setEffects(effects.map(ef => ef.type === 'cinematic_focus' ? { ...ef, params: { ...ef.params, focusX: percentX, focusY: percentY } } : ef));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (isDraggingPan) {
        setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
     }
  };

  const handlePointerUp = () => setIsDraggingPan(false);

  const setFitZoom = () => {
     setZoom(1);
     setPan({ x: 0, y: 0 });
  };

  const addEffect = (type: FilterType) => {
    const newId = Math.random().toString(36).substring(7);
    setEffects([...effects, { id: newId, type, enabled: true, params: { ...DEFAULT_FILTER_PARAMS[type] } }]);
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

  const updateGrade = (key: keyof ColorGrade, val: number) => {
    setGrade(prev => ({ ...prev, [key]: val }));
  };

  const exportImage = async (format: "png" | "jpg" | "webp") => {
    if (!imgObj || !fullCanvasRef.current) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));
    
    const canvas = fullCanvasRef.current;
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
      applyColorGradeAndFilters(canvas, grade, effects);
      
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
      `}</style>

      {/* TOP HEADER */}
      <header className="h-[72px] shrink-0 flex items-center px-8 justify-between z-10 neu-flat rounded-b-2xl mb-2">
         <div className="flex items-center gap-6">
            <Link href="/tools" className="neu-button w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#7B7F89] hover:text-[#242631]">
               ←
            </Link>
            <div>
               <h1 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#242631]">GROTON</h1>
               <h2 className="text-[10px] uppercase tracking-widest text-[#7B7F89]">Image Filters & Grade</h2>
            </div>
         </div>
      </header>

      {/* MAIN WORKSPACE */}
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
               <>
                  <div ref={containerRef} className="flex-1 neu-inset rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-4">
                     {/* Preview Target Canvas */}
                     <div className="absolute inset-0 flex items-center justify-center touch-none overflow-hidden p-6" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
                        <div 
                           className="relative flex items-center justify-center w-full h-full"
                           style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: isDraggingPan ? 'none' : 'transform 0.15s ease-out' }}
                        >
                           <canvas 
                             ref={previewCanvasRef} 
                             className={`max-w-full max-h-full object-contain neu-flat rounded-md ${effects.some(f=>f.type==='cinematic_focus' && f.enabled) && zoom === 1 ? 'cursor-crosshair' : (zoom > 1 ? (isDraggingPan ? 'cursor-grabbing' : 'cursor-grab') : '')}`} 
                           />
                        </div>
                     </div>
                     <canvas ref={fullCanvasRef} className="hidden" />

                     {isProcessing && (
                       <div className="absolute inset-0 bg-[#F3F4F7]/80 backdrop-blur-sm z-50 flex flex-col gap-4 items-center justify-center rounded-3xl">
                         <div className="w-8 h-8 border-[3px] border-[#8B7CFF] border-t-transparent rounded-full animate-spin"></div>
                         <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B7CFF]">Rendering Export...</div>
                       </div>
                     )}
                  </div>

                  {/* PREVIEW CONTROLS */}
                  <div className="h-16 shrink-0 neu-flat rounded-full px-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                           <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="neu-button w-10 h-10 rounded-full flex items-center justify-center text-[#7B7F89] hover:text-[#242631] font-bold">-</button>
                           <button onClick={setFitZoom} className={`neu-button px-6 h-10 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors ${zoom === 1 ? 'neu-active' : 'text-[#7B7F89]'}`}>FIT</button>
                           <button onClick={() => setZoom(Math.min(5, zoom + 0.25))} className="neu-button w-10 h-10 rounded-full flex items-center justify-center text-[#7B7F89] hover:text-[#242631] font-bold">+</button>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-[#7B7F89] w-12 text-center">{Math.round(zoom * 100)}%</span>
                     </div>

                     <div className="flex items-center gap-4">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#7B7F89]">Compare:</span>
                        <button 
                           onMouseDown={() => setIsCompare(true)} onMouseUp={() => setIsCompare(false)} onMouseLeave={() => setIsCompare(false)} onTouchStart={() => setIsCompare(true)} onTouchEnd={() => setIsCompare(false)}
                           className={`neu-button px-8 h-10 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors ${isCompare ? 'neu-active' : 'text-[#8B7CFF]'}`}
                        >
                           HOLD
                        </button>
                     </div>
                  </div>
               </>
            )}
         </div>

         {/* RIGHT - CONTROL WORKSPACE */}
         <div className={`w-full lg:w-[420px] shrink-0 h-full flex flex-col gap-6 pt-4 transition-opacity ${!url ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            
            {/* TAB SWITCHER */}
            <div className="neu-inset p-2 rounded-full flex">
               <button onClick={() => setTab("filters")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase rounded-full transition-colors ${tab === "filters" ? 'neu-flat text-[#8B7CFF]' : 'text-[#7B7F89] hover:text-[#242631]'}`}>Filters & Effects</button>
               <button onClick={() => setTab("grading")} className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase rounded-full transition-colors ${tab === "grading" ? 'neu-flat text-[#8B7CFF]' : 'text-[#7B7F89] hover:text-[#242631]'}`}>Colour Grading</button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 flex flex-col overflow-y-auto pr-2 gap-8 custom-scrollbar">
               {tab === "filters" ? (
                  <>
                    <div className="flex flex-col gap-6">
                       
                       {/* CATEGORY SELECTOR */}
                       <div className="flex flex-wrap gap-3">
                         {Object.keys(PRESETS_BY_CATEGORY).map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-full transition-colors ${activeCategory === cat ? 'neu-active' : 'neu-button text-[#7B7F89]'}`}>
                               {cat}
                            </button>
                         ))}
                       </div>

                       {/* FILTER CARDS */}
                       <div className="grid grid-cols-2 gap-4">
                          {Object.keys(PRESETS_BY_CATEGORY[activeCategory]).map(name => (
                             <button key={name} onClick={() => { setEffects(JSON.parse(JSON.stringify(PRESETS_BY_CATEGORY[activeCategory][name]))); setActiveEffectId(null); }} className="neu-button p-3 rounded-2xl flex flex-col gap-3 text-left items-start group">
                                <div className="w-full h-16 rounded-xl neu-inset overflow-hidden">
                                   <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110" style={{ backgroundImage: url ? `url(${url})` : 'none', filter: 'grayscale(30%)' }}></div>
                                </div>
                                <span className="text-[10px] font-bold tracking-widest text-[#242631] uppercase leading-tight">{name}</span>
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="h-px bg-[#d1d5db] w-full neu-inset my-2"></div>

                    {/* EFFECT STACK */}
                    <div className="flex flex-col gap-4">
                       <div className="flex justify-between items-center">
                          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B7F89]">Effect Stack</h3>
                          <button onClick={() => setShowAddMenu(!showAddMenu)} className="text-[10px] uppercase font-bold text-[#8B7CFF] tracking-widest hover:text-[#6657D9] transition-colors bg-transparent">+ Add Filter</button>
                       </div>

                       {showAddMenu && (
                          <div className="flex flex-col gap-2 p-4 neu-inset rounded-2xl">
                             {Object.entries(EFFECT_LABELS).map(([k, label]) => (
                                <button key={k} onClick={() => addEffect(k as FilterType)} className="text-left px-4 py-3 text-[9px] uppercase tracking-widest font-bold neu-button rounded-xl text-[#242631]">{label}</button>
                             ))}
                          </div>
                       )}

                       <div className="flex flex-col gap-4">
                          {effects.map((eff, idx) => (
                             <div key={eff.id} className="flex flex-col neu-flat rounded-2xl overflow-hidden">
                                <div className={`flex items-center justify-between p-4 cursor-pointer transition-all ${activeEffectId === eff.id ? 'bg-[#F7F6F2]' : ''}`} onClick={() => setActiveEffectId(activeEffectId === eff.id ? null : eff.id)}>
                                   <div className="flex items-center gap-3">
                                      <span className="text-[9px] font-mono text-[#7B7F89] opacity-60">0{idx + 1}</span>
                                      <span className={`text-[10px] uppercase tracking-widest font-bold ${activeEffectId === eff.id ? 'text-[#8B7CFF]' : 'text-[#242631]'}`}>{EFFECT_LABELS[eff.type]}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <button onClick={(e) => { e.stopPropagation(); toggleEffect(eff.id); }} className={`px-2 py-1 text-[9px] font-bold rounded ${eff.enabled ? 'text-[#8B7CFF] bg-[#F7F6F2] neu-inset' : 'text-[#7B7F89] bg-transparent'}`}>{eff.enabled ? 'ON' : 'OFF'}</button>
                                      <button onClick={(e) => { e.stopPropagation(); removeEffect(eff.id); }} className="text-[12px] font-bold text-[#7B7F89] hover:text-red-400 p-1">✕</button>
                                   </div>
                                </div>
                                
                                {activeEffectId === eff.id && eff.enabled && (
                                   <div className="p-5 flex flex-col gap-5 neu-inset rounded-b-2xl">
                                      {Object.entries(eff.params).map(([key, val]) => (
                                         <div key={key} className="flex flex-col gap-3">
                                            <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between">
                                               <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                               {typeof val === 'number' && <span className="text-[#242631]">{val}</span>}
                                            </label>
                                            {typeof val === 'number' ? (
                                               <input type="range" min="0" max="100" value={val} onChange={e => updateEffectParam(eff.id, key, Number(e.target.value))} />
                                            ) : typeof val === 'string' && val.startsWith('#') ? (
                                               <div className="flex items-center gap-4">
                                                 <input type="color" value={val} onChange={e => updateEffectParam(eff.id, key, e.target.value)} className="w-10 h-10 border-0 p-0 rounded-full neu-button cursor-pointer" />
                                                 <span className="text-[10px] font-mono uppercase text-[#7B7F89]">{val}</span>
                                               </div>
                                            ) : (
                                               <input type="text" value={val} onChange={e => updateEffectParam(eff.id, key, e.target.value)} className="w-full text-xs p-3 neu-inset rounded-lg text-[#242631] outline-none" />
                                            )}
                                         </div>
                                      ))}
                                   </div>
                                )}
                             </div>
                          ))}
                          {effects.length === 0 && <div className="text-center py-10 neu-inset rounded-2xl text-[#7B7F89] text-[10px] uppercase tracking-widest font-bold">No effects yet.</div>}
                       </div>
                    </div>
                  </>
               ) : (
                  <>
                    {/* COLOUR GRADING */}
                    <div className="flex flex-col gap-6">
                       <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B7F89]">Grading Presets</h3>
                       <div className="grid grid-cols-2 gap-3">
                          {Object.keys(GRADE_PRESETS).map(name => (
                             <button key={name} onClick={() => setGrade({ ...DEFAULT_GRADE, ...GRADE_PRESETS[name] })} className="px-4 py-3 neu-button rounded-xl text-[9px] uppercase tracking-widest font-bold text-[#7B7F89] hover:text-[#8B7CFF] text-left transition-colors truncate">
                                {name}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="h-px bg-[#d1d5db] w-full neu-inset my-2"></div>

                    <div className="flex flex-col gap-6 neu-flat p-6 rounded-2xl">
                       <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B7CFF]">Basic Adjustments</h3>
                       {['exposure', 'contrast', 'highlights', 'shadows'].map((key) => (
                         <div key={key} className="flex flex-col gap-3">
                            <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between">
                               <span>{key}</span>
                               <span className="text-[#242631]">{grade[key as keyof ColorGrade]}</span>
                            </label>
                            <input type="range" min="-100" max="100" value={grade[key as keyof ColorGrade]} onChange={e => updateGrade(key as keyof ColorGrade, Number(e.target.value))} />
                         </div>
                       ))}
                    </div>

                    <div className="flex flex-col gap-6 neu-flat p-6 rounded-2xl">
                       <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B7CFF]">Color Presence</h3>
                       {['temperature', 'tint', 'saturation'].map((key) => (
                         <div key={key} className="flex flex-col gap-3">
                            <label className="text-[9px] uppercase tracking-widest text-[#7B7F89] font-bold flex justify-between">
                               <span>{key}</span>
                               <span className="text-[#242631]">{grade[key as keyof ColorGrade]}</span>
                            </label>
                            <input type="range" min="-100" max="100" value={grade[key as keyof ColorGrade]} onChange={e => updateGrade(key as keyof ColorGrade, Number(e.target.value))} />
                         </div>
                       ))}
                    </div>
                  </>
               )}
            </div>

            {/* EXPORT PANEL */}
            <div className="neu-flat p-6 rounded-3xl shrink-0 flex flex-col gap-5 mt-auto">
               <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B7F89] text-center">Export Final Image</h3>
               
               <div className="flex gap-3">
                  <button onClick={() => exportImage("jpg")} disabled={isProcessing} className="flex-1 py-4 neu-button rounded-xl text-[10px] font-bold tracking-widest uppercase text-[#242631] hover:text-[#8B7CFF]">JPG</button>
                  <button onClick={() => exportImage("png")} disabled={isProcessing} className="flex-1 py-4 neu-button rounded-xl text-[10px] font-bold tracking-widest uppercase text-[#242631] hover:text-[#8B7CFF]">PNG</button>
                  <button onClick={() => exportImage("webp")} disabled={isProcessing} className="flex-1 py-4 neu-button rounded-xl text-[10px] font-bold tracking-widest uppercase text-[#242631] hover:text-[#8B7CFF]">WEBP</button>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setEffects([])} className="py-3 neu-inset rounded-xl text-[9px] uppercase tracking-widest font-bold text-[#7B7F89] hover:text-red-400 transition-colors">Reset Filters</button>
                  <button onClick={() => setGrade({...DEFAULT_GRADE})} className="py-3 neu-inset rounded-xl text-[9px] uppercase tracking-widest font-bold text-[#7B7F89] hover:text-red-400 transition-colors">Reset Grade</button>
               </div>
            </div>

         </div>
      </div>
      <style>{`
         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>
    
      {/* SEO CONTENT BLOCK */}
      <section id="seo-content-block" className="max-w-[1280px] mx-auto w-full px-6 md:px-8 py-16 md:py-24 mt-12 border-t border-zinc-200/50">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-zinc-600">
            <div className="flex flex-col gap-4 lg:col-span-2">
               <h2 className="text-2xl font-serif text-[#111111]">Free Online Filters Tool</h2>
               <p className="text-sm leading-relaxed">Process and edit your images securely in your browser with Groton's free filters utility.</p>
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
  );
}