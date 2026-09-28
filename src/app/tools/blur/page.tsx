"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function BlurPage() {
  const [img, setImg] = useState<any>(null);
  const [amount, setAmount] = useState(10);

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        ctx.filter = `blur(${amount}px)`;
        ctx.drawImage(image, 0, 0);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = "blurred.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Image Blur" description="Apply high-quality gaussian blur to your images.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
               <img src={img.url} style={{ filter: `blur(${amount}px)` }} className="max-h-[50vh] object-contain shadow-lg" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="range" min="0" max="100" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="w-full accent-black" />
          <p className="text-xs text-center">{amount}px Blur Radius</p>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export JPG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}