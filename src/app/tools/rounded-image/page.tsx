"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import BulkProcessor, { ImgFile } from "@/components/tools/BulkProcessor";

export default function RoundedPage() {
  const [radius, setRadius] = useState(50); // percentage 0-50

  const processImage = async (imgData: ImgFile): Promise<{ blob: Blob, name: string } | null> => {
    const image = new Image();
    image.src = imgData.url;
    await new Promise(r => { image.onload = r; image.onerror = r; });
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; 
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
        const minDim = Math.min(canvas.width, canvas.height);
        // radius slider is 0-50%. Max radius is half the min dimension.
        const r = (minDim / 2) * (radius / 50); 
        
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
        
        // Clip to rounded path
        ctx.clip();
        
        // Draw image inside the clipped path (leaving corners transparent)
        ctx.drawImage(image, 0, 0);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob: blob!,
          name: `${imgData.name}-rounded.png`
        });
      }, "image/png"); // Must be PNG for transparency
    });
  };

  return (
    <ToolLayout title="Rounded Image" description="Apply transparent rounded corners to images in bulk.">
      <BulkProcessor
        onProcess={processImage}
        renderControls={() => (
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 border-b border-zinc-100 pb-2">Corner Radius</h3>
            <input type="range" min="0" max="50" value={radius} onChange={e=>setRadius(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
            <div className="flex justify-between text-xs font-mono">
               <span>Square</span>
               <span>Circle/Pill</span>
            </div>
            <p className="text-[9px] text-zinc-400 mt-2 bg-zinc-50 p-2 border border-zinc-100 italic">Images will be exported as transparent PNGs to preserve the rounded corners.</p>
          </div>
        )}
        renderPreview={(currentImg) => (
          currentImg ? (
            <div className="w-full h-full p-8 flex justify-center items-center bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
               <img src={currentImg.url} style={{ borderRadius: `${radius}%` }} className="max-h-[50vh] object-contain shadow-2xl" />
            </div>
          ) : (
            <div className="text-zinc-400 text-sm">Upload an image to apply rounded corners</div>
          )
        )}
      />
    </ToolLayout>
  );
}