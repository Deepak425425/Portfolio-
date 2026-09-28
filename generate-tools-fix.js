const fs = require('fs');
const path = require('path');

const tools = [
  { id: 'crop', title: 'Image Cropper', desc: 'Crop images with standard presets or custom aspect ratios.' },
  { id: 'rotate-flip', title: 'Rotate & Flip', desc: 'Rotate and flip images in bulk.' },
  { id: 'blur', title: 'Image Blur', desc: 'Apply blur to images or specific regions.' },
  { id: 'pixelate', title: 'Pixelate Image', desc: 'Pixelate full images or regions.' },
  { id: 'filters', title: 'Image Filters', desc: 'Apply grayscale, sepia, invert, and other filters.' },
  { id: 'split', title: 'Image Splitter', desc: 'Split images into multiple sections.' },
  { id: 'canvas', title: 'Image Padding', desc: 'Increase canvas size and add padding/backgrounds.' },
  { id: 'border', title: 'Image Border', desc: 'Add solid borders and rounded corners.' },
  { id: 'rounded-image', title: 'Rounded Image', desc: 'Create transparent rounded images.' },
  { id: 'collage', title: 'Collage Maker', desc: 'Create beautiful image collages.' },
  { id: 'favicon', title: 'Favicon Generator', desc: 'Generate complete favicon packages.' },
  { id: 'social-resizer', title: 'Social Media Resizer', desc: 'Resize for Instagram, YouTube, X, and more.' },
  { id: 'passport-photo', title: 'Passport Photo', desc: 'Create printable passport photo sheets.' },
  { id: 'color-palette', title: 'Color Palette Extractor', desc: 'Extract dominant color palettes.' },
  { id: 'meme', title: 'Meme Generator', desc: 'Add impact text to images.' },
  { id: 'before-after', title: 'Before & After', desc: 'Generate comparison sliders.' }
];

const template = (title, desc) => `"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

export default function ToolPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  
  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    const newImgs = valid.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      url: URL.createObjectURL(f),
      name: f.name
    }));
    setImages(prev => [...prev, ...newImgs]);
  };

  return (
    <ToolLayout title="${title}" description="${desc}">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200 p-12 text-center text-zinc-500">
              <p>Image loaded. Interactive canvas implementation required.</p>
              <div className="mt-4 flex gap-2">
                {images.map(img => (
                  <img key={img.id} src={img.url} className="w-16 h-16 object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            <p className="text-xs text-zinc-400">Controls will appear here.</p>
            {images.length > 0 && (
              <button onClick={() => setImages([])} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}`;

const baseDir = path.join(__dirname, 'src/app/tools');

tools.forEach(tool => {
  const dir = path.join(baseDir, tool.id);
  const filePath = path.join(dir, 'page.tsx');
  fs.writeFileSync(filePath, template(tool.title, tool.desc));
  console.log('Fixed ' + tool.id);
});
