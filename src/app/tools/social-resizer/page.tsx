"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";

export default function SocialResizerPage() {
  const [img, setImg] = useState<any>(null);
  const [target, setTarget] = useState({w: 1080, h: 1080, name: "Instagram Square"});

  const presets = [
    {w: 1080, h: 1080, name: "Instagram Square"},
    {w: 1080, h: 1350, name: "Instagram Portrait"},
    {w: 1080, h: 1920, name: "Instagram Story"},
    {w: 1280, h: 720, name: "YouTube Thumbnail"}
  ];

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = target.w; 
    canvas.height = target.h;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        const imgRatio = image.width / image.height;
        const boxRatio = target.w / target.h;
        let drawW = target.w; let drawH = target.h;
        if(imgRatio > boxRatio) { drawH = target.w / imgRatio; } 
        else { drawW = target.h * imgRatio; }
        
        ctx.drawImage(image, (target.w-drawW)/2, (target.h-drawH)/2, drawW, drawH);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = getGrotonExportFilename(target.name.replace(/ /g, '-') + ".jpg");
    a.click();
  };

  return (
    <ToolLayout title="Social Resizer" description="Fit images perfectly to social media dimension requirements without cropping.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
               <div className="bg-white relative shadow" style={{ aspectRatio: target.w/target.h, maxHeight: '90%', maxWidth: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <img src={img.url} className="max-w-full max-h-full object-contain" />
               </div>
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          {presets.map(p => (
            <button key={p.name} onClick={()=>setTarget(p)} className={`border p-3 text-xs ${target.name===p.name?'bg-black text-white':''}`}>{p.name} ({p.w}x{p.h})</button>
          ))}
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export JPG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}