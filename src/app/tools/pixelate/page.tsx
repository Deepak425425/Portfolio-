"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function PixelatePage() {
  const [img, setImg] = useState<any>(null);
  const [size, setSize] = useState(10); // scale factor

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        const w = canvas.width * (size/100);
        const h = canvas.height * (size/100);
        
        ctx.drawImage(image, 0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = "pixelated.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Pixelate" description="Pixelate images by reducing rendering resolution.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh] overflow-hidden">
               {/* Pure CSS pixelation trick for preview */}
               <img src={img.url} className="max-h-[50vh] object-contain shadow-lg pixelated-preview" 
                    style={{ imageRendering: 'pixelated', width: `${100/size}%`, transform: `scale(${size/(100/size)})` }} />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="range" min="1" max="50" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full accent-black" />
          <p className="text-xs text-center">Pixel Size: {size}% resolution downscale</p>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export JPG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}