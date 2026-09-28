"use client";
import React, { useState, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

export default function RotateFlipPage() {
  const [images, setImages] = useState<any[]>([]);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (files: File[]) => {
    const newImgs = files.filter(f=>f.type.startsWith('image/')).map(f => ({
      id: Math.random().toString(), file: f, url: URL.createObjectURL(f), name: f.name
    }));
    setImages(prev => [...prev, ...newImgs]);
  };

  const processImage = async (img: any): Promise<Blob> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        let targetW = image.width;
        let targetH = image.height;
        if (rotation % 180 !== 0) {
          targetW = image.height;
          targetH = image.width;
        }
        
        canvas.width = targetW;
        canvas.height = targetH;
        
        ctx?.translate(targetW / 2, targetH / 2);
        ctx?.rotate((rotation * Math.PI) / 180);
        ctx?.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx?.drawImage(image, -image.width / 2, -image.height / 2);
        
        canvas.toBlob(b => resolve(b!), "image/jpeg", 0.95);
      };
      image.src = img.url;
    });
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    for (const img of images) {
      const blob = await processImage(img);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'modified-' + img.name; a.click();
    }
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Rotate & Flip" description="Real client-side rotation and flipping.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {images.length === 0 ? <UploadDropzone onUpload={handleUpload} multiple={true} /> : 
            <div className="bg-zinc-200 p-8 flex flex-wrap gap-4 justify-center overflow-hidden">
              {images.map(img => (
                <img key={img.id} src={img.url} className="w-48 h-48 object-contain transition-transform" 
                     style={{ transform: `rotate(${rotation}deg) scaleX(${flipH?-1:1}) scaleY(${flipV?-1:1})` }} />
              ))}
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <button onClick={()=>setRotation(r=>(r+90)%360)} className="border p-2">Rotate 90°</button>
          <button onClick={()=>setFlipH(!flipH)} className="border p-2">Flip Horizontal</button>
          <button onClick={()=>setFlipV(!flipV)} className="border p-2">Flip Vertical</button>
          {images.length > 0 && <button disabled={isProcessing} onClick={downloadAll} className="bg-black text-white p-4 font-bold mt-4">Download All</button>}
        </div>
      </div>
    </ToolLayout>
  );
}