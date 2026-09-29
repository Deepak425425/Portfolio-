"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import BulkProcessor, { ImgFile } from "@/components/tools/BulkProcessor";

export default function BackgroundRemoverPage() {
  const [bgType, setBgType] = useState<"transparent" | "color" | "studio">("transparent");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [shadow, setShadow] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(30);
  const [shadowY, setShadowY] = useState(15);
  const [shadowOpacity, setShadowOpacity] = useState(0.2);
  const [reflection, setReflection] = useState(false);

  // Cache processed foregrounds to avoid re-running the heavy AI model for the same image
  const [fgCache, setFgCache] = useState<Record<string, string>>({});

  const applyProductStudio = () => {
    setBgType("color");
    setBgColor("#FFFFFF");
    setShadow(true);
    setShadowBlur(40);
    setShadowY(20);
    setShadowOpacity(0.15);
    setReflection(false);
  };

  const processImage = async (img: ImgFile): Promise<{ blob: Blob, name: string } | null> => {
    let fgUrl = fgCache[img.id];
    
    // 1. Run AI removal if not in cache
    if (!fgUrl) {
      const { removeBackground } = await import('@imgly/background-removal');
      const config = { publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/" };
      const imageBlob = await removeBackground(img.url, config);
      fgUrl = URL.createObjectURL(imageBlob);
      setFgCache(prev => ({ ...prev, [img.id]: fgUrl }));
    }

    // 2. Draw to Canvas for effects
    const fgImg = new Image();
    fgImg.src = fgUrl;
    await new Promise(r => fgImg.onload = r);

    const canvas = document.createElement("canvas");
    canvas.width = fgImg.width;
    canvas.height = fgImg.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    if (bgType === "color" || bgType === "studio") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Shadow
    if (shadow) {
      ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = shadowY;
      ctx.shadowOffsetX = 0;
    }

    // Draw main image
    ctx.drawImage(fgImg, 0, 0);

    // Reset shadow for subsequent draws
    ctx.shadowColor = "transparent";

    // Reflection (simple vertical flip below subject)
    if (reflection) {
      ctx.save();
      ctx.translate(0, canvas.height + canvas.height * 0.95);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.3;
      ctx.drawImage(fgImg, 0, 0);
      ctx.restore();
      
      // Mask reflection (gradient fade)
      ctx.globalCompositeOperation = "destination-in";
      const grad = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);
      ctx.globalCompositeOperation = "source-over";
    }

    const mime = (bgType === "transparent") ? "image/png" : "image/jpeg";
    const ext = (bgType === "transparent") ? "png" : "jpg";

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob: blob!,
          name: `${img.name}-nobg.${ext}`
        });
      }, mime, 0.95);
    });
  };

  return (
    <ToolLayout title="Background Remover" description="Instantly isolate subjects and create professional Product Studio shots.">
      <BulkProcessor
        onProcess={processImage}
        onReset={() => {
           Object.values(fgCache).forEach(url => URL.revokeObjectURL(url));
           setFgCache({});
        }}
        renderPreview={(currentImg) => {
          if (!currentImg) return <div className="text-sec-text text-sm uppercase tracking-widest font-bold">Upload an image</div>;
          
          const isTransparent = bgType === "transparent";
          return (
            <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center relative p-8 transition-colors duration-500"
                 style={{ 
                   backgroundColor: isTransparent ? '#e5e5f7' : bgColor,
                   backgroundImage: isTransparent ? 'repeating-linear-gradient(45deg, #e5e5f7 25%, transparent 25%, transparent 75%, #e5e5f7 75%, #e5e5f7), repeating-linear-gradient(45deg, #e5e5f7 25%, #ffffff 25%, #ffffff 75%, #e5e5f7 75%, #e5e5f7)' : 'none', 
                   backgroundSize: '20px 20px', 
                   backgroundPosition: '0 0, 10px 10px' 
                 }}>
              
              {fgCache[currentImg.id] ? (
                 <div className="relative">
                   <img 
                     src={fgCache[currentImg.id]} 
                     className="max-h-[60vh] object-contain transition-all duration-300 relative z-10"
                     style={{ 
                       filter: shadow ? `drop-shadow(0px ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))` : 'none' 
                     }}
                   />
                   {reflection && (
                     <img 
                       src={fgCache[currentImg.id]} 
                       className="max-h-[60vh] object-contain opacity-30 blur-[2px] absolute top-full left-0 origin-top transform scale-y-[-1]"
                       style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)' }}
                     />
                   )}
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-4">
                   <img src={currentImg.url} className="max-h-[60vh] object-contain opacity-40 blur-sm grayscale" />
                   <div className="absolute flex flex-col items-center bg-white/90 backdrop-blur px-6 py-4 shadow-xl border border-border-color">
                     <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-3"></div>
                     <span className="text-[10px] font-bold tracking-widest uppercase text-black">AI is extracting subject...</span>
                   </div>
                 </div>
              )}
            </div>
          );
        }}
        renderControls={(currentImg, isProcessing) => {
          // Trigger extraction eagerly if not cached
          useEffect(() => {
            if (currentImg && !fgCache[currentImg.id]) {
              processImage(currentImg); // we call it just to trigger the cache populating
            }
          }, [currentImg]);

          return (
            <div className="flex flex-col gap-8 h-full overflow-y-auto max-h-[80vh]">
              
              {/* Product Studio Preset */}
              <div className="flex flex-col gap-2">
                 <button 
                   onClick={applyProductStudio}
                   className="w-full py-4 bg-[#8B7CFF] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#6657D9] transition-colors shadow-sm flex items-center justify-center gap-2"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                   Apply Product Studio
                 </button>
                 <span className="text-[9px] text-sec-text text-center uppercase tracking-wider font-bold">White BG + Soft Shadow</span>
              </div>

              <div className="h-px w-full bg-[#DEDCD5]"></div>

              {/* Background Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Background</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setBgType("transparent")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${bgType === "transparent" ? 'bg-black text-white border-black' : 'bg-transparent text-sec-text border-border-color hover:border-black'}`}>Transparent</button>
                  <button onClick={() => setBgType("color")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase transition-colors ${bgType === "color" ? 'bg-black text-white border-black' : 'bg-transparent text-sec-text border-border-color hover:border-black'}`}>Solid Color</button>
                </div>
                
                {bgType === "color" && (
                  <div className="flex gap-3 items-center mt-2 p-3 bg-[#F7F6F2] border border-[#DEDCD5]">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent" />
                    <span className="font-mono text-xs font-bold text-black">{bgColor.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Effects (Shadows/Reflections) */}
              <div className="flex flex-col gap-4 pt-4 border-t border-[#DEDCD5]">
                 <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Studio Effects</label>
                 
                 <div className="flex flex-col gap-4">
                   <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-black flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={shadow} onChange={e => setShadow(e.target.checked)} className="accent-black w-4 h-4" /> Drop Shadow
                   </label>
                   
                   {shadow && (
                     <div className="flex flex-col gap-3 pl-6 border-l-2 border-border-color">
                       <div className="flex flex-col gap-1">
                         <span className="text-[9px] uppercase tracking-widest text-sec-text">Blur ({shadowBlur}px)</span>
                         <input type="range" min="0" max="100" value={shadowBlur} onChange={e => setShadowBlur(Number(e.target.value))} className="w-full accent-black" />
                       </div>
                       <div className="flex flex-col gap-1">
                         <span className="text-[9px] uppercase tracking-widest text-sec-text">Offset Y ({shadowY}px)</span>
                         <input type="range" min="-50" max="100" value={shadowY} onChange={e => setShadowY(Number(e.target.value))} className="w-full accent-black" />
                       </div>
                       <div className="flex flex-col gap-1">
                         <span className="text-[9px] uppercase tracking-widest text-sec-text">Opacity ({Math.round(shadowOpacity * 100)}%)</span>
                         <input type="range" min="0" max="1" step="0.05" value={shadowOpacity} onChange={e => setShadowOpacity(Number(e.target.value))} className="w-full accent-black" />
                       </div>
                     </div>
                   )}
                 </div>

                 <div className="flex flex-col gap-4 mt-2">
                   <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-black flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={reflection} onChange={e => setReflection(e.target.checked)} className="accent-black w-4 h-4" /> Floor Reflection
                   </label>
                 </div>
              </div>
              
            </div>
          );
        }}
      />
    </ToolLayout>
  );
}
