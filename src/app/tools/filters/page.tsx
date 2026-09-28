"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function FiltersPage() {
  const [images, setImages] = useState<any[]>([]);
  const [filter, setFilter] = useState("none");

  const handleUpload = (files: File[]) => {
    const newImgs = files.filter(f=>f.type.startsWith('image/')).map(f => ({
      id: Math.random().toString(), file: f, url: URL.createObjectURL(f), name: f.name
    }));
    setImages(prev => [...prev, ...newImgs]);
  };

  const processImage = async (img: any): Promise<Blob> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width; canvas.height = image.height;
        if (ctx) {
          ctx.filter = filter;
          ctx.drawImage(image, 0, 0);
        }
        canvas.toBlob(b => resolve(b!), "image/jpeg", 0.95);
      };
      image.src = img.url;
    });
  };

  const downloadAll = async () => {
    for (const img of images) {
      const blob = await processImage(img);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'filtered-' + img.name; a.click();
    }
  };

  return (
    <ToolLayout title="Image Filters" description="Real client-side CSS-to-Canvas filters.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {images.length === 0 ? <UploadDropzone onUpload={handleUpload} multiple={true} /> : 
            <div className="bg-zinc-200 p-8 flex flex-wrap gap-4 justify-center">
              {images.map(img => (
                <img key={img.id} src={img.url} className="w-64 h-64 object-contain" style={{ filter }} />
              ))}
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-2">
          {["none", "grayscale(100%)", "sepia(100%)", "invert(100%)", "brightness(150%)", "contrast(200%)", "blur(5px)"].map(f => (
            <button key={f} onClick={()=>setFilter(f)} className={`p-2 border ${filter===f?'bg-black text-white':''}`}>{f}</button>
          ))}
          {images.length > 0 && <button onClick={downloadAll} className="bg-black text-white p-4 mt-4">Download</button>}
        </div>
      </div>
    </ToolLayout>
  );
}