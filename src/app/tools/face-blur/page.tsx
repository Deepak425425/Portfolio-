"use client";

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";
// Dynamically loaded via import() when needed to prevent Next.js SSR crashes
// import { FaceDetector, FilesetResolver, Detection } from "@mediapipe/tasks-vision";
import { getGrotonExportFilename } from "@/utils/export";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  ext: string;
}

interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function FaceBlurPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const [blurMode, setBlurMode] = useState<"blur" | "pixelate">("blur");
  const [strength, setStrength] = useState(20); // 1-100
  
  const [boxes, setBoxes] = useState<Record<string, Box[]>>({}); // image id -> boxes
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({x: 0, y: 0});
  const [currentBox, setCurrentBox] = useState<Box | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    const newImgs = valid.map(f => {
      const parts = f.name.split('.');
      const ext = parts.pop() || 'jpg';
      const id = Math.random().toString(36).substring(7);
      return {
        id,
        file: f,
        url: URL.createObjectURL(f),
        name: parts.join('.'),
        ext
      };
    });
    setImages(prev => [...prev, ...newImgs]);
  };

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
    setBoxes({});
    setPreviewIndex(0);
  };

  const currentImg = images[previewIndex];
  const currentBoxes = currentImg ? (boxes[currentImg.id] || []) : [];

  useEffect(() => {
    if (!currentImg) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      renderDisplay();
    };
    img.src = currentImg.url;
  }, [currentImg, previewIndex]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.width > 0 && imgRef.current.height > 0) {
      renderDisplay();
    }
  }, [boxes, blurMode, strength, currentBox]);

  const renderDisplay = () => {
    if (!imgRef.current || !displayCanvasRef.current) return;
    
    const img = imgRef.current;
    if (img.width <= 0 || img.height <= 0) return;
    
    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Scale for display
    const maxW = 800;
    const ratio = img.width > maxW ? maxW / img.width : 1;
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const applyEffect = (box: Box) => {
      if (canvas.width <= 0 || canvas.height <= 0) return;

      const bx = box.x * ratio;
      const by = box.y * ratio;
      const bw = box.w * ratio;
      const bh = box.h * ratio;
      
      const safeX = Math.max(0, Math.min(Math.floor(bx), canvas.width - 1));
      const safeY = Math.max(0, Math.min(Math.floor(by), canvas.height - 1));

      const safeW = Math.min(
          Math.max(1, Math.floor(bw)),
          canvas.width - safeX
      );

      const safeH = Math.min(
          Math.max(1, Math.floor(bh)),
          canvas.height - safeY
      );

      if (safeW <= 0 || safeH <= 0 || safeX >= canvas.width || safeY >= canvas.height) return;
      
      try {
        const region = ctx.getImageData(safeX, safeY, safeW, safeH);
        
        if (blurMode === "pixelate") {
          const pSize = Math.max(2, Math.floor(strength / 2));
          for (let y = 0; y < safeH; y += pSize) {
            for (let x = 0; x < safeW; x += pSize) {
              const i = (y * safeW + x) * 4;
              const r = region.data[i];
              const g = region.data[i+1];
              const b = region.data[i+2];
              
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(safeX + x, safeY + y, pSize, pSize);
            }
          }
        } else {
          ctx.save();
          ctx.filter = `blur(${strength / 2}px)`;
          ctx.drawImage(canvas, safeX, safeY, safeW, safeH, safeX, safeY, safeW, safeH);
          ctx.restore();
        }
        
        // Draw subtle bounds using original coordinates to accurately reflect user selection
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
      } catch (e) {
        console.warn("Failed to apply face blur effect region", e);
      }
    };

    currentBoxes.forEach(applyEffect);
    if (currentBox) applyEffect(currentBox);
  };

  const getCanvasCoords = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !imgRef.current) return {x:0, y:0};
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const ratio = imgRef.current.width / canvas.width;
    
    return {
      x: (e.clientX - rect.left) * scaleX * ratio,
      y: (e.clientY - rect.top) * scaleY * ratio
    };
  };

  const handleMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!currentImg) return;
    const coords = getCanvasCoords(e);
    setStartPos(coords);
    setIsDrawing(true);
    setCurrentBox({ id: 'temp', x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentImg) return;
    const coords = getCanvasCoords(e);
    
    setCurrentBox({
      id: 'temp',
      x: Math.min(startPos.x, coords.x),
      y: Math.min(startPos.y, coords.y),
      w: Math.abs(coords.x - startPos.x),
      h: Math.abs(coords.y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.w > 10 && currentBox.h > 10) {
      setBoxes(prev => ({
        ...prev,
        [currentImg.id]: [...(prev[currentImg.id] || []), { ...currentBox, id: Math.random().toString(36).substring(7) }]
      }));
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const clearBoxes = () => {
    if (!currentImg) return;
    setBoxes(prev => ({ ...prev, [currentImg.id]: [] }));
  };

  const autoDetect = async () => {
    if (!currentImg || !imgRef.current) return;
    setIsDetecting(true);
    try {
      const { FilesetResolver, FaceDetector } = await import("@mediapipe/tasks-vision");
      
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU"
        },
        runningMode: "IMAGE"
      });
      
      const detections = faceDetector.detect(imgRef.current);
      
      const newBoxes: Box[] = detections.detections.map((d: any) => {
        const bb = d.boundingBox;
        if (!bb) return null;
        // Expand bounding box slightly for better facial coverage
        const padW = bb.width * 0.2;
        const padH = bb.height * 0.2;
        return {
          id: Math.random().toString(),
          x: Math.max(0, bb.originX - padW/2),
          y: Math.max(0, bb.originY - padH),
          w: bb.width + padW,
          h: bb.height + padH*1.5
        };
      }).filter(Boolean) as Box[];
      
      if (newBoxes.length > 0) {
        setBoxes(prev => ({
          ...prev,
          [currentImg.id]: [...(prev[currentImg.id] || []), ...newBoxes]
        }));
      } else {
        alert("No faces detected. You can draw manual boxes.");
      }
    } catch (err) {
      console.error(err);
      alert("Auto-detect failed. Please draw boxes manually.");
    }
    setIsDetecting(false);
  };

  const generateFinal = async (imgData: ImgFile): Promise<{blob: Blob, name: string}> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    
    const img = new Image();
    img.src = imgData.url;
    await new Promise(r => img.onload = r);
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const bxs = boxes[imgData.id] || [];
    
    bxs.forEach(box => {
      const region = ctx.getImageData(box.x, box.y, box.w, box.h);
      if (blurMode === "pixelate") {
        const pSize = Math.max(5, Math.floor(strength / 2));
        for (let y = 0; y < box.h; y += pSize) {
          for (let x = 0; x < box.w; x += pSize) {
            const i = (y * Math.floor(box.w) + x) * 4;
            ctx.fillStyle = `rgb(${region.data[i]},${region.data[i+1]},${region.data[i+2]})`;
            ctx.fillRect(box.x + x, box.y + y, pSize, pSize);
          }
        }
      } else {
        ctx.save();
        ctx.filter = `blur(${strength}px)`;
        ctx.drawImage(canvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
        ctx.restore();
      }
    });

    let mime = "image/jpeg";
    if (imgData.ext.toLowerCase() === "png") mime = "image/png";
    else if (imgData.ext.toLowerCase() === "webp") mime = "image/webp";

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob: blob!,
          name: `${imgData.name}-blurred.${imgData.ext}`
        });
      }, mime, 0.95);
    });
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    for (let i = 0; i < images.length; i++) {
      if ((boxes[images[i].id] || []).length > 0) {
        const res = await generateFinal(images[i]);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.blob);
        a.download = getGrotonExportFilename(res.name);
        a.click();
        URL.revokeObjectURL(a.href);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    let count = 0;
    for (let i = 0; i < images.length; i++) {
      if ((boxes[images[i].id] || []).length > 0) {
        const res = await generateFinal(images[i]);
        zip.file(getGrotonExportFilename(res.name), res.blob);
        count++;
      }
    }
    if (count > 0) {
      const content = await zip.generateAsync({type: "blob"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = getGrotonExportFilename(`blurred_images.zip`);
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      alert("No images have blur boxes applied.");
    }
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Face Blur" description="Automatically detect and blur faces, or manually select areas to censor.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200">
              <div className="relative cursor-crosshair">
                <canvas 
                  ref={displayCanvasRef} 
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="max-w-full max-h-[60vh] object-contain block shadow-lg select-none" 
                />
              </div>
              
              {images.length > 1 && (
                <div className="w-full bg-white p-4 flex gap-2 overflow-x-auto border-t border-zinc-200">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setPreviewIndex(i)} className={`relative h-16 w-16 shrink-0 border-2 transition-colors ${previewIndex === i ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <img src={img.url} className="w-full h-full object-cover" />
                      {(boxes[img.id]?.length > 0) && <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full shadow"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Detection</label>
              <button disabled={isDetecting || !currentImg} onClick={autoDetect} className="w-full py-3 bg-zinc-100 text-black text-xs uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {isDetecting ? 'Detecting...' : 'Auto Detect Faces'}
              </button>
              <p className="text-[9px] text-zinc-400 mt-1 italic">Or draw rectangles directly on the image for manual blur.</p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Effect Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setBlurMode("blur")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${blurMode === "blur" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Blur</button>
                <button onClick={() => setBlurMode("pixelate")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${blurMode === "pixelate" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Pixelate</button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 flex justify-between">
                <span>Strength</span> <span>{strength}</span>
              </label>
              <input type="range" min="1" max="100" value={strength} onChange={e => setStrength(Number(e.target.value))} className="w-full accent-black" />
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {images.length > 0 && (
              <>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-zinc-500 font-light">Faces in view</span>
                  <span className="font-bold tracking-wider text-[11px]">{currentBoxes.length}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={clearBoxes} className="w-full py-2 border border-zinc-300 text-zinc-600 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors">
                    Clear Current Boxes
                  </button>
                  <button disabled={isProcessing} onClick={downloadZip} className="w-full py-4 mt-2 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300">
                    {isProcessing ? 'Processing...' : 'Download ZIP'}
                  </button>
                  <button disabled={isProcessing} onClick={downloadAll} className="w-full py-4 bg-transparent border border-black text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:border-zinc-300">
                    Download All
                  </button>
                </div>
                <button onClick={reset} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors">
                  Reset / Clear Images
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
