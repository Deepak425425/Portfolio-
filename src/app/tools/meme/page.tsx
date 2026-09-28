"use client";
import React, { useState, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function MemePage() {
  const [img, setImg] = useState<any>(null);
  const [top, setTop] = useState("TOP TEXT");
  const [bottom, setBottom] = useState("BOTTOM TEXT");
  
  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    
    ctx.drawImage(image, 0, 0);
    ctx.font = `bold ${image.height/10}px Impact, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = image.height/100;
    
    ctx.strokeText(top.toUpperCase(), canvas.width/2, image.height/8);
    ctx.fillText(top.toUpperCase(), canvas.width/2, image.height/8);
    
    ctx.strokeText(bottom.toUpperCase(), canvas.width/2, image.height - image.height/16);
    ctx.fillText(bottom.toUpperCase(), canvas.width/2, image.height - image.height/16);
    
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg");
    a.download = "meme.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Meme Generator" description="Classic top/bottom text meme maker.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="relative w-full bg-black flex justify-center p-8">
               <img src={img.url} className="max-h-[60vh] object-contain" />
               <div className="absolute top-12 w-full text-center text-white font-black text-4xl" style={{WebkitTextStroke:'2px black'}}>{top}</div>
               <div className="absolute bottom-12 w-full text-center text-white font-black text-4xl" style={{WebkitTextStroke:'2px black'}}>{bottom}</div>
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input value={top} onChange={e=>setTop(e.target.value)} className="border p-2" placeholder="Top Text" />
          <input value={bottom} onChange={e=>setBottom(e.target.value)} className="border p-2" placeholder="Bottom Text" />
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold">Download Meme</button>}
        </div>
      </div>
    </ToolLayout>
  );
}