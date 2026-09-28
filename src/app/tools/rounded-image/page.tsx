"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function RoundedPage() {
  const [img, setImg] = useState<any>(null);
  const [radius, setRadius] = useState(50); // percentage

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        const minDim = Math.min(canvas.width, canvas.height);
        const r = (minDim / 2) * (radius/100);
        
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(canvas.width - r, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
        ctx.lineTo(canvas.width, canvas.height - r);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
        ctx.lineTo(r, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        
        ctx.clip();
        ctx.drawImage(image, 0, 0);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png"); // Must be PNG for transparency
    a.download = "rounded.png";
    a.click();
  };

  return (
    <ToolLayout title="Rounded Image" description="Apply transparent rounded corners to images.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh] bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
               <img src={img.url} style={{ borderRadius: `${radius}%` }} className="max-h-[50vh] object-contain shadow-2xl" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="range" min="0" max="50" value={radius} onChange={e=>setRadius(Number(e.target.value))} className="w-full accent-black" />
          <p className="text-xs text-center">Corner Radius: {radius}%</p>
          <p className="text-[10px] text-zinc-500 text-center">Exports as PNG to preserve transparency.</p>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export PNG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}