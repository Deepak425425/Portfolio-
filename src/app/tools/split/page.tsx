"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";
import { getGrotonExportFilename } from "@/utils/export";

export default function SplitPage() {
  const [img, setImg] = useState<any>(null);
  const [grid, setGrid] = useState({r: 3, c: 3});

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const zip = new JSZip();
    const w = Math.floor(image.width / grid.c);
    const h = Math.floor(image.height / grid.r);
    
    for(let r=0; r<grid.r; r++) {
      for(let c=0; c<grid.c; c++) {
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(image, c*w, r*h, w, h, 0, 0, w, h);
        const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), "image/jpeg"));
        zip.file(getGrotonExportFilename(`slice-${r}-${c}.jpg`), blob);
      }
    }
    const content = await zip.generateAsync({type:"blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = getGrotonExportFilename("split-images.zip");
    a.click();
  };

  return (
    <ToolLayout title="Image Splitter" description="Slice images into exact grid coordinates for Instagram grids.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
               <div className="relative">
                 <img src={img.url} className="max-h-[50vh] object-contain shadow-lg" />
                 <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${grid.c}, 1fr)`, gridTemplateRows: `repeat(${grid.r}, 1fr)` }}>
                   {Array.from({length: grid.r * grid.c}).map((_,i) => <div key={i} className="border border-white/50"></div>)}
                 </div>
               </div>
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <button onClick={()=>setGrid({r:3,c:3})} className="border p-2">3x3 Grid (Instagram)</button>
          <button onClick={()=>setGrid({r:2,c:2})} className="border p-2">2x2 Grid</button>
          <button onClick={()=>setGrid({r:4,c:3})} className="border p-2">4x3 Grid</button>
          {img && <button onClick={generate} className="bg-[#111111] text-white p-4 font-bold mt-4">Download ZIP</button>}
        </div>
      </div>
    </ToolLayout>
  );
}