"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function BorderPage() {
  const [img, setImg] = useState<any>(null);
  const [width, setWidth] = useState(20);
  const [radius, setRadius] = useState(0);
  const [color, setColor] = useState("#000000");

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; 
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        ctx.fillStyle = color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        ctx.save();
        ctx.beginPath();
        // A simple inner rounded rect drawing logic could go here, for now just drawing standard border over image bounds
        ctx.drawImage(image, width, width, image.width-(width*2), image.height-(width*2));
        ctx.restore();
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg");
    a.download = "bordered.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Image Border" description="Add inner borders and colors to images.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
               <img src={img.url} style={{ border: `${width}px solid ${color}`, borderRadius: `${radius}px` }} className="max-h-[50vh] object-contain shadow-lg" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="number" value={width} onChange={e=>setWidth(Number(e.target.value))} className="border p-2" placeholder="Border Width (px)" />
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="border p-2 w-full h-12" />
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold">Export</button>}
        </div>
      </div>
    </ToolLayout>
  );
}