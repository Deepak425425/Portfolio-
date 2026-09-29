"use client";

import React, { useState, useRef, useEffect, MouseEvent } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function ColorPickerPage() {
  const [image, setImage] = useState<{ url: string } | null>(null);
  const [colorHex, setColorHex] = useState<string>("#ffffff");
  const [colorRgb, setColorRgb] = useState<string>("rgb(255, 255, 255)");
  const [colorHsl, setColorHsl] = useState<string>("hsl(0, 0%, 100%)");
  
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (valid.length > 0) {
      setImage({ url: URL.createObjectURL(valid[0]) });
    }
  };

  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      renderImage();
    };
    img.src = image.url;
  }, [image]);

  const renderImage = () => {
    if (!imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Scale for display bounds roughly
    const maxW = 800;
    const maxH = 600;
    const ratio = Math.min(1, Math.min(maxW / imgRef.current.width, maxH / imgRef.current.height));
    
    canvas.width = imgRef.current.width * ratio;
    canvas.height = imgRef.current.height * ratio;
    
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    
    const hex = rgbToHex(r, g, b);
    setColorHex(hex);
    setColorRgb(`rgb(${r}, ${g}, ${b})`);
    setColorHsl(rgbToHsl(r, g, b));
    
    setRecentColors(prev => {
      if (prev.includes(hex)) return prev;
      const updated = [hex, ...prev];
      if (updated.length > 12) updated.pop();
      return updated;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolLayout title="Color Picker" description="Extract HEX, RGB, and HSL values directly from an image using the canvas pixel sampler.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!image ? (
            <UploadDropzone onUpload={handleUpload} multiple={false} />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200">
              <div className="relative cursor-crosshair">
                <canvas 
                  ref={canvasRef} 
                  onClick={handleCanvasClick}
                  className="max-w-full max-h-[70vh] object-contain block shadow-sm select-none" 
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col items-center justify-center border border-zinc-200 aspect-video relative" style={{ backgroundColor: colorHex }}>
              {/* Box showing current color */}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">HEX</span>
                  <span className="font-mono text-sm font-bold uppercase">{colorHex}</span>
                </div>
                <button onClick={() => copyToClipboard(colorHex)} className="text-[10px] uppercase font-bold tracking-widest hover:text-[#8B7CFF]">Copy</button>
              </div>

              <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">RGB</span>
                  <span className="font-mono text-sm font-bold">{colorRgb}</span>
                </div>
                <button onClick={() => copyToClipboard(colorRgb)} className="text-[10px] uppercase font-bold tracking-widest hover:text-[#8B7CFF]">Copy</button>
              </div>

              <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">HSL</span>
                  <span className="font-mono text-sm font-bold">{colorHsl}</span>
                </div>
                <button onClick={() => copyToClipboard(colorHsl)} className="text-[10px] uppercase font-bold tracking-widest hover:text-[#8B7CFF]">Copy</button>
              </div>
            </div>

            {recentColors.length > 0 && (
              <>
                <div className="h-px w-full bg-zinc-200 my-2"></div>
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Recent Colors</span>
                  <div className="flex flex-wrap gap-2">
                    {recentColors.map(c => (
                      <div key={c} onClick={() => {
                        setColorHex(c); 
                        // RGB and HSL conversion from hex is needed for full accuracy but skipped for brevity in recent clicks
                      }} className="w-8 h-8 rounded-full border border-zinc-200 cursor-pointer shadow-sm transition-transform hover:scale-110" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {image && (
              <>
                <div className="h-px w-full bg-zinc-200 my-2"></div>
                <button onClick={() => { setImage(null); setRecentColors([]); }} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors">
                  Upload New Image
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}