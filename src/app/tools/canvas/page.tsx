"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function CanvasPage() {
  const [img, setImg] = useState<any>(null);
  const [pad, setPad] = useState(50);
  const [color, setColor] = useState("#ffffff");

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width + (pad*2); 
    canvas.height = image.height + (pad*2);
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        ctx.fillStyle = color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(image, pad, pad);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg");
    a.download = "padded.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Image Padding" description="Expand the canvas size and add a background color.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
               <div style={{ backgroundColor: color, padding: `${Math.min(pad, 100)}px` }} className="shadow-lg transition-all">
                 <img src={img.url} className="max-h-[40vh] object-contain" />
               </div>
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="number" value={pad} onChange={e=>setPad(Number(e.target.value))} className="border p-2" placeholder="Padding (px)" />
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="border p-2 w-full h-12" />
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold">Export</button>}
        </div>
      </div>
    </ToolLayout>
  );
}