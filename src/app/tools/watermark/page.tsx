"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function WatermarkPage() {
  const [img, setImg] = useState<{ url: string, name: string, ext: string } | null>(null);
  const [previewBefore, setPreviewBefore] = useState(false);
  
  const [type, setType] = useState<"text" | "logo">("text");
  const [text, setText] = useState("GROTON");
  const [textColor, setTextColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [isPattern, setIsPattern] = useState(true);
  
  const [size, setSize] = useState(15); // Percentage of image width (1-100)
  const [opacity, setOpacity] = useState(15); // 0-100
  const [rotation, setRotation] = useState(-30); // degrees
  
  const [hGap, setHGap] = useState(50); // pixels or percentage gap
  const [vGap, setVGap] = useState(50);
  
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [quality, setQuality] = useState(92);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Layer Mode States
  const [layerMode, setLayerMode] = useState<"over" | "behind">("over");
  const [subjectUrl, setSubjectUrl] = useState<string | null>(null);
  const [segmentationProgress, setSegmentationProgress] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (valid.length > 0) {
      const f = valid[0];
      const parts = f.name.split('.');
      const ext = parts.pop() || 'jpg';
      setImg({
        url: URL.createObjectURL(f),
        name: parts.join('.'),
        ext
      });
      if (subjectUrl) URL.revokeObjectURL(subjectUrl);
      setSubjectUrl(null);
      setLayerMode("over");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(URL.createObjectURL(e.target.files[0]));
      setType("logo");
    }
  };

  const reset = () => {
    if (img) URL.revokeObjectURL(img.url);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    if (subjectUrl) URL.revokeObjectURL(subjectUrl);
    setImg(null);
    setLogoUrl(null);
    setSubjectUrl(null);
    setIsPattern(true);
    setSize(15);
    setOpacity(15);
    setRotation(-30);
    setHGap(50);
    setVGap(50);
    setOffsetX(0);
    setOffsetY(0);
    setTextColor("#ffffff");
    setLayerMode("over");
    setSegmentationProgress("");
  };

  useEffect(() => {
    if (layerMode === "behind" && img && !subjectUrl && !segmentationProgress) {
      const generateMask = async () => {
        setSegmentationProgress("Detecting subject...");
        try {
          const { removeBackground: imglyRemoveBackground } = await import('@imgly/background-removal');
          const config = {
            progress: (key: string, current: number, total: number) => {
              setSegmentationProgress(`Detecting subject: ${Math.round((current / total) * 100)}%`);
            },
            publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/"
          };
          const imageBlob = await imglyRemoveBackground(img.url, config);
          setSubjectUrl(URL.createObjectURL(imageBlob));
          setSegmentationProgress(""); 
        } catch (err) {
          console.error(err);
          setSegmentationProgress("Subject detection failed. Please try again.");
          setLayerMode("over");
        }
      };
      generateMask();
    }
  }, [layerMode, img, subjectUrl, segmentationProgress]);

  const drawWatermark = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (opacity === 0) return;
    
    let tileW = 100;
    let tileH = 100;
    
    const tileCanvas = document.createElement('canvas');
    const tileCtx = tileCanvas.getContext('2d');
    if (!tileCtx) return;

    const baseSizePx = (width * ((size ?? 15) / 100)); 

    if (type === "text" && (text ?? "").trim().length > 0) {
      tileCtx.font = `bold ${baseSizePx}px sans-serif`;
      const metrics = tileCtx.measureText(text ?? "");
      const textW = metrics.width;
      const textH = baseSizePx; 
      
      tileW = textW + (textW * ((hGap ?? 50)/100));
      tileH = textH + (textH * ((vGap ?? 50)/100));
      
      tileCanvas.width = tileW;
      tileCanvas.height = tileH;
      
      const tCtx = tileCanvas.getContext('2d');
      if(tCtx) {
        tCtx.font = `bold ${baseSizePx}px sans-serif`;
        tCtx.fillStyle = textColor ?? "#ffffff";
        tCtx.globalAlpha = (opacity ?? 15) / 100;
        tCtx.textAlign = "center";
        tCtx.textBaseline = "middle";
        tCtx.fillText(text ?? "", tileW/2, tileH/2);
      }
      
    } else if (type === "logo" && logoUrl) {
      const logoImg = new Image();
      logoImg.src = logoUrl;
      await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; });
      
      if(logoImg.width > 0) {
        const aspect = logoImg.height / logoImg.width;
        const drawW = baseSizePx;
        const drawH = baseSizePx * aspect;
        
        tileW = drawW + (drawW * ((hGap ?? 50)/100));
        tileH = drawH + (drawH * ((vGap ?? 50)/100));
        
        tileCanvas.width = tileW;
        tileCanvas.height = tileH;
        
        const tCtx = tileCanvas.getContext('2d');
        if(tCtx) {
          tCtx.globalAlpha = (opacity ?? 15) / 100;
          tCtx.drawImage(logoImg, (tileW - drawW)/2, (tileH - drawH)/2, drawW, drawH);
        }
      }
    }

    if (tileCanvas.width === 0 || tileCanvas.height === 0) return;

    if (isPattern) {
      const pattern = ctx.createPattern(tileCanvas, 'repeat');
      if (pattern) {
        ctx.save();
        const offsetXpx = width * (offsetX / 100);
        const offsetYpx = height * (offsetY / 100);
        ctx.translate(width / 2 + offsetXpx, height / 2 + offsetYpx);
        ctx.rotate(((rotation ?? -30) * Math.PI) / 180);
        
        ctx.fillStyle = pattern;
        const diag = Math.sqrt(width**2 + height**2) * 2;
        ctx.fillRect(-diag/2, -diag/2, diag, diag);
        ctx.restore();
      }
    } else {
      ctx.save();
      const offsetXpx = width * (offsetX / 100);
      const offsetYpx = height * (offsetY / 100);
      ctx.translate(width / 2 + offsetXpx, height / 2 + offsetYpx);
      ctx.rotate(((rotation ?? -30) * Math.PI) / 180);
      
      ctx.drawImage(tileCanvas, -tileCanvas.width/2, -tileCanvas.height/2);
      ctx.restore();
    }
  };

  const updatePreview = async () => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const image = new Image();
    image.src = img.url;
    await new Promise(r => image.onload = r);
    
    const maxWidth = 1200;
    const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
    canvas.width = image.width * ratio;
    canvas.height = image.height * ratio;
    
    // Draw background (original image)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    if (!previewBefore) {
      // Draw watermark pattern
      await drawWatermark(ctx, canvas.width, canvas.height);
      
      // If BEHIND SUBJECT mode is active and we have the mask, draw the isolated subject ON TOP
      if (layerMode === "behind" && subjectUrl) {
        const subjImg = new Image();
        subjImg.src = subjectUrl;
        await new Promise(r => subjImg.onload = r);
        ctx.drawImage(subjImg, 0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    updatePreview();
  }, [img, type, text, textColor, logoUrl, isPattern, size, opacity, rotation, hGap, vGap, offsetX, offsetY, previewBefore, layerMode, subjectUrl]);

  const generateOutput = async (format: "jpeg" | "png" | "webp") => {
    if (!img) return;
    setIsProcessing(true);
    
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No context");
      
      const image = new Image();
      image.src = img.url;
      await new Promise(r => image.onload = r);
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      await drawWatermark(ctx, canvas.width, canvas.height);
      
      if (layerMode === "behind" && subjectUrl) {
        const subjImg = new Image();
        subjImg.src = subjectUrl;
        await new Promise(r => subjImg.onload = r);
        ctx.drawImage(subjImg, 0, 0, canvas.width, canvas.height);
      }
      
      let mime = `image/${format}`;
      const dataUrl = canvas.toDataURL(mime, format === 'png' ? undefined : (quality ?? 92) / 100);
      
      const a = document.createElement("a");
      a.href = dataUrl;
      const originalName = img.name;
      a.download = `${originalName}-watermarked.${format === 'jpeg' ? 'jpg' : format}`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error exporting watermark.");
    }
    
    setIsProcessing(false);
  };

  const exportAllFormats = async () => {
    await generateOutput("jpeg");
    setTimeout(async () => {
      await generateOutput("png");
      setTimeout(() => generateOutput("webp"), 500);
    }, 500);
  };

  return (
    <ToolLayout title="Watermark Pattern" description="Create professional repeated watermark patterns across your entire image.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!img ? (
            <UploadDropzone onUpload={handleUpload} multiple={false} accept="image/*" />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 p-8 min-h-[60vh] overflow-hidden" ref={wrapperRef}>
              
              {segmentationProgress && (
                <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xs font-bold uppercase tracking-widest text-black bg-white px-6 py-3 shadow-xl border border-zinc-200">{segmentationProgress}</span>
                </div>
              )}

              <div className="relative shadow-xl max-h-full max-w-full">
                <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain block bg-white" />
              </div>

              <div className="absolute top-4 left-4 flex gap-2 z-30">
                <button 
                  onMouseDown={() => setPreviewBefore(true)}
                  onMouseUp={() => setPreviewBefore(false)}
                  onMouseLeave={() => setPreviewBefore(false)}
                  onTouchStart={() => setPreviewBefore(true)}
                  onTouchEnd={() => setPreviewBefore(false)}
                  className="bg-white/90 px-4 py-2 text-[10px] uppercase tracking-widest font-bold shadow cursor-pointer select-none border border-zinc-200 hover:bg-white"
                >
                  Hold for Before
                </button>
              </div>

              {/* Pan overlay handler for pattern position */}
              <div 
                className="absolute inset-0 z-10 cursor-move"
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const initOffsetX = offsetX;
                  const initOffsetY = offsetY;
                  
                  const handleMove = (ev: MouseEvent) => {
                    if (!wrapperRef.current) return;
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    const rect = wrapperRef.current.getBoundingClientRect();
                    setOffsetX(initOffsetX + (dx / rect.width) * 100);
                    setOffsetY(initOffsetY + (dy / rect.height) * 100);
                  };
                  
                  const handleUp = () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleUp);
                  };
                  
                  document.addEventListener('mousemove', handleMove);
                  document.addEventListener('mouseup', handleUp);
                }}
              ></div>

            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-4 flex flex-col h-full overflow-y-auto max-h-[85vh] pb-12 pr-2 gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-8">
            
            {/* WATERMARK SOURCE */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">1. Watermark</h3>
              <div className="flex gap-2">
                <button onClick={() => setType("text")} className={`flex-1 py-2 text-xs font-bold tracking-widest border uppercase ${type === "text" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Text</button>
                <button onClick={() => setType("logo")} className={`flex-1 py-2 text-xs font-bold tracking-widest border uppercase ${type === "logo" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}>Logo</button>
              </div>

              {type === "text" ? (
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Text Content</label>
                  <input type="text" value={text ?? ""} onChange={e => setText(e.target.value)} className="w-full border-b border-zinc-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors font-bold text-sm" placeholder="GROTON" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Upload Transparent Logo (PNG)</label>
                  <input type="file" accept="image/png, image/webp" onChange={handleLogoUpload} className="text-xs" />
                </div>
              )}
            </div>

            {/* STYLE */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">2. Style</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                  <span>Size</span> <span>{size}%</span>
                </label>
                <input type="range" min="1" max="100" value={size ?? 15} onChange={e => setSize(Number(e.target.value))} className="w-full accent-black" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                  <span>Opacity</span> <span>{opacity}%</span>
                </label>
                <div className="flex gap-1 mb-2">
                  {[10, 20, 30, 50, 75, 100].map(v => (
                    <button key={v} onClick={() => setOpacity(v)} className={`flex-1 text-[9px] py-1 border ${opacity===v ? 'bg-zinc-200 border-zinc-300':'border-zinc-100 hover:bg-zinc-50'}`}>{v}%</button>
                  ))}
                </div>
                <input type="range" min="0" max="100" value={opacity ?? 15} onChange={e => setOpacity(Number(e.target.value))} className="w-full accent-black" />
              </div>

              {type === "text" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Color</label>
                  <div className="flex gap-2">
                    <button onClick={() => setTextColor("#ffffff")} className={`w-8 h-8 rounded-full border-2 ${textColor==="#ffffff" ? 'border-blue-500':'border-zinc-200'} bg-white shadow-sm`}></button>
                    <button onClick={() => setTextColor("#000000")} className={`w-8 h-8 rounded-full border-2 ${textColor==="#000000" ? 'border-blue-500':'border-zinc-200'} bg-black shadow-sm`}></button>
                    <input type="color" value={textColor ?? "#ffffff"} onChange={e=>setTextColor(e.target.value)} className="w-8 h-8 border-0 p-0" />
                  </div>
                </div>
              )}
            </div>

            {/* PATTERN */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2 flex justify-between items-center">
                3. Pattern
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">{isPattern ? 'ON' : 'OFF'}</span>
                  <input type="checkbox" checked={Boolean(isPattern)} onChange={e=>setIsPattern(e.target.checked)} className="accent-black w-4 h-4" />
                </label>
              </h3>
              
              {isPattern && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                      <span>Rotation</span> <span>{rotation}°</span>
                    </label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {[0, -15, -30, -45, 15, 30, 45].map(v => (
                        <button key={v} onClick={() => setRotation(v)} className={`flex-1 text-[9px] py-1 border ${rotation===v ? 'bg-zinc-200 border-zinc-300':'border-zinc-100 hover:bg-zinc-50'}`}>{v}°</button>
                      ))}
                    </div>
                    <input type="range" min="-180" max="180" value={rotation ?? -30} onChange={e => setRotation(Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                      <span>Horizontal Spacing</span> <span>{hGap}%</span>
                    </label>
                    <input type="range" min="0" max="200" value={hGap ?? 50} onChange={e => setHGap(Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                      <span>Vertical Spacing</span> <span>{vGap}%</span>
                    </label>
                    <input type="range" min="0" max="200" value={vGap ?? 50} onChange={e => setVGap(Number(e.target.value))} className="w-full accent-black" />
                  </div>
                  
                  <p className="text-[10px] text-zinc-400 italic font-light mt-1">Tip: Click and drag on the image preview to move the pattern.</p>
                </>
              )}
            </div>

            {/* WATERMARK LAYER (OVER / BEHIND) */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2 bg-zinc-50 p-2">4. Watermark Layer</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLayerMode("over")} 
                  className={`flex-1 py-3 text-xs font-bold tracking-widest border uppercase transition-colors ${layerMode === "over" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}
                >
                  Over Subject
                </button>
                <button 
                  onClick={() => setLayerMode("behind")} 
                  className={`flex-1 py-3 text-xs font-bold tracking-widest border uppercase transition-colors ${layerMode === "behind" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black'}`}
                >
                  Behind Subject
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 italic font-light">"Behind Subject" uses local browser AI to detect and preserve the main subject.</p>
            </div>

            {/* EXPORT */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2 bg-zinc-50 p-2">5. Export</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 flex justify-between">
                  <span>JPG/WEBP Quality</span><span>{quality}%</span>
                </label>
                <input type="range" min="50" max="100" value={quality ?? 92} onChange={e=>setQuality(Number(e.target.value))} className="w-full accent-black" />
              </div>

              <div className="grid grid-cols-3 gap-1 mt-2">
                <button disabled={isProcessing || !img} onClick={() => generateOutput('jpeg')} className="py-3 text-[10px] uppercase font-bold tracking-widest border border-zinc-200 hover:border-black text-black disabled:opacity-50 transition-colors">JPG</button>
                <button disabled={isProcessing || !img} onClick={() => generateOutput('png')} className="py-3 text-[10px] uppercase font-bold tracking-widest border border-zinc-200 hover:border-black text-black disabled:opacity-50 transition-colors">PNG</button>
                <button disabled={isProcessing || !img} onClick={() => generateOutput('webp')} className="py-3 text-[10px] uppercase font-bold tracking-widest border border-zinc-200 hover:border-black text-black disabled:opacity-50 transition-colors">WEBP</button>
              </div>

              <button disabled={isProcessing || !img} onClick={exportAllFormats} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-2">
                {isProcessing ? 'Processing...' : 'Export All Formats'}
              </button>
            </div>
            
            {img && (
              <button onClick={reset} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-red-500 transition-colors mt-2">
                Reset Tool
              </button>
            )}

          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
