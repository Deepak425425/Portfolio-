"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function PalettePage() {
  const [img, setImg] = useState<any>(null);
  const [palette, setPalette] = useState<string[]>([]);

  const analyze = async (file: File) => {
    const url = URL.createObjectURL(file);
    setImg({url});
    
    const image = new Image();
    image.src = url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = 100; canvas.height = 100; // downsample for speed
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    
    ctx.drawImage(image, 0, 0, 100, 100);
    const data = ctx.getImageData(0,0,100,100).data;
    
    // Very naive color quantization (just grabbing distinct colors spread out)
    const colors = new Set<string>();
    for(let i=0; i<data.length; i+=400) { // step by 100 pixels
        const hex = "#" + [data[i], data[i+1], data[i+2]].map(x=>x.toString(16).padStart(2,'0')).join('');
        colors.add(hex);
        if(colors.size >= 8) break;
    }
    setPalette(Array.from(colors));
  };

  return (
    <ToolLayout title="Color Palette" description="Extract a dominant color scheme from an image.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => analyze(f[0])} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
               <img src={img.url} className="max-h-[50vh] object-contain shadow-lg" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          {palette.map((c, i) => (
             <div key={i} className="flex items-center gap-4 p-2 border">
                <div className="w-10 h-10 border" style={{ backgroundColor: c }}></div>
                <span className="font-mono text-sm uppercase">{c}</span>
             </div>
          ))}
          {img && <button onClick={()=>setImg(null)} className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Reset</button>}
        </div>
      </div>
    </ToolLayout>
  );
}