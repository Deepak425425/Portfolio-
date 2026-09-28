"use client";

import React, { useState, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  ext: string;
}

export default function BackgroundRemoverPage() {
  const [image, setImage] = useState<ImgFile | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [backgroundType, setBackgroundType] = useState<"transparent" | "white" | "black">("transparent");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (valid.length > 0) {
      const f = valid[0];
      const parts = f.name.split('.');
      const ext = parts.pop() || 'jpg';
      setImage({
        id: Math.random().toString(36).substring(7),
        file: f,
        url: URL.createObjectURL(f),
        name: parts.join('.'),
        ext
      });
      setProcessedUrl(null);
    }
  };

  const reset = () => {
    if (image) URL.revokeObjectURL(image.url);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setImage(null);
    setProcessedUrl(null);
    setProgress("");
  };

  const removeBackground = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress("Loading AI Model...");
    
    try {
      const { removeBackground: imglyRemoveBackground } = await import('@imgly/background-removal');
      
      const config = {
        progress: (key: string, current: number, total: number) => {
          setProgress(`Processing: ${Math.round((current / total) * 100)}%`);
        },
        publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/"
      };

      const imageBlob = await imglyRemoveBackground(image.url, config);
      const url = URL.createObjectURL(imageBlob);
      setProcessedUrl(url);
      setProgress("");
    } catch (err) {
      console.error(err);
      setProgress("Processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = async () => {
    if (!processedUrl) return;

    if (backgroundType === "transparent") {
      const a = document.createElement("a");
      a.href = processedUrl;
      a.download = `${image!.name}-nobg.png`;
      a.click();
      return;
    }

    // Process background color on canvas
    const img = new Image();
    img.src = processedUrl;
    await new Promise(r => img.onload = r);

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = backgroundType === "white" ? "#ffffff" : "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const mime = backgroundType === "white" ? "image/jpeg" : "image/png";
    const ext = backgroundType === "white" ? "jpg" : "png";

    const dataUrl = canvas.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${image!.name}-bg-${backgroundType}.${ext}`;
    a.click();
  };

  return (
    <ToolLayout title="Background Remover" description="Automatically remove backgrounds from images using local AI models in the browser.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!image ? (
            <UploadDropzone onUpload={handleUpload} multiple={false} />
          ) : (
            <div className={`w-full relative flex items-center justify-center border border-zinc-200 overflow-hidden ${backgroundType === "transparent" ? 'bg-[#e5e5f7]' : backgroundType === "white" ? 'bg-white' : 'bg-black'}`} style={{ backgroundImage: backgroundType === 'transparent' ? 'repeating-linear-gradient(45deg, #e5e5f7 25%, transparent 25%, transparent 75%, #e5e5f7 75%, #e5e5f7), repeating-linear-gradient(45deg, #e5e5f7 25%, #ffffff 25%, #ffffff 75%, #e5e5f7 75%, #e5e5f7)' : 'none', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
              <div className="relative w-full h-[60vh] flex items-center justify-center">
                {processedUrl ? (
                  <img src={processedUrl} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                ) : (
                  <img src={image.url} className={`max-w-full max-h-full object-contain ${isProcessing ? 'opacity-30 blur-sm' : ''} transition-all duration-500`} />
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="bg-white/90 px-4 py-2 font-bold tracking-widest text-xs uppercase shadow-lg text-black">{progress}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Background Output</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setBackgroundType("transparent")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${backgroundType === "transparent" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Trans</button>
                <button onClick={() => setBackgroundType("white")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${backgroundType === "white" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>White</button>
                <button onClick={() => setBackgroundType("black")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${backgroundType === "black" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Black</button>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {image && !processedUrl && (
              <button disabled={isProcessing} onClick={removeBackground} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 shadow-xl">
                {isProcessing ? 'Processing AI...' : 'Remove Background'}
              </button>
            )}

            {processedUrl && (
              <button onClick={downloadResult} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors shadow-xl">
                Download Result
              </button>
            )}

            {image && (
              <button onClick={reset} disabled={isProcessing} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors disabled:opacity-50">
                Reset / Change Image
              </button>
            )}

            <p className="text-[10px] text-zinc-400 font-light text-center italic mt-2">Model weights (~80MB) will be downloaded on first run. Processed entirely locally.</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
