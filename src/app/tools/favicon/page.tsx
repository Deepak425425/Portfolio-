"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";
import { getGrotonExportFilename } from "@/utils/export";

export default function FaviconPage() {
  const [img, setImg] = useState<any>(null);
  
  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const sizes = [16, 32, 192, 512];
    const zip = new JSZip();
    
    for (const size of sizes) {
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        
        // Square crop center
        const imgRatio = image.width / image.height;
        let drawW = size; let drawH = size;
        if(imgRatio > 1) drawW = size * imgRatio;
        else drawH = size / imgRatio;
        
        ctx?.drawImage(image, (size-drawW)/2, (size-drawH)/2, drawW, drawH);
        
        const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), "image/png"));
        zip.file(getGrotonExportFilename(`favicon-${size}x${size}.png`), blob);
        
        if (size === 32) {
            zip.file(getGrotonExportFilename(`favicon.ico`), blob); // Simple copy, not true .ico encode but works for modern browsers
        }
    }
    
    const content = await zip.generateAsync({type:"blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = getGrotonExportFilename("favicon-package.zip");
    a.click();
  };

  return (
    <ToolLayout title="Favicon Generator" description="Generate 16x16, 32x32, 192x192, and 512x512 icons instantly.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex gap-8 justify-center items-center h-[60vh]">
               <img src={img.url} className="w-16 h-16 object-cover shadow" />
               <img src={img.url} className="w-32 h-32 object-cover shadow" />
               <img src={img.url} className="w-64 h-64 object-cover shadow" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <ul className="text-xs text-zinc-500 list-disc pl-4 space-y-2">
            <li>favicon-16x16.png</li>
            <li>favicon-32x32.png</li>
            <li>favicon.ico</li>
            <li>android-chrome-192x192.png</li>
            <li>android-chrome-512x512.png</li>
          </ul>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Download ZIP</button>}
        </div>
      </div>
    </ToolLayout>
  );
}