const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src/app/tools');

function writeTool(id, content) {
  const dir = path.join(baseDir, id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log('Implemented ' + id);
}

// 11. BLUR
writeTool('blur', `"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function BlurPage() {
  const [img, setImg] = useState<any>(null);
  const [amount, setAmount] = useState(10);

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        ctx.filter = \`blur(\${amount}px)\`;
        ctx.drawImage(image, 0, 0);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = "blurred.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Image Blur" description="Apply high-quality gaussian blur to your images.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
               <img src={img.url} style={{ filter: \`blur(\${amount}px)\` }} className="max-h-[50vh] object-contain shadow-lg" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="range" min="0" max="100" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="w-full accent-black" />
          <p className="text-xs text-center">{amount}px Blur Radius</p>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export JPG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}`);

// 12. PIXELATE
writeTool('pixelate', `"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function PixelatePage() {
  const [img, setImg] = useState<any>(null);
  const [size, setSize] = useState(10); // scale factor

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        const w = canvas.width * (size/100);
        const h = canvas.height * (size/100);
        
        ctx.drawImage(image, 0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = "pixelated.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Pixelate" description="Pixelate images by reducing rendering resolution.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh] overflow-hidden">
               {/* Pure CSS pixelation trick for preview */}
               <img src={img.url} className="max-h-[50vh] object-contain shadow-lg pixelated-preview" 
                    style={{ imageRendering: 'pixelated', width: \`\${100/size}%\`, transform: \`scale(\${size/(100/size)})\` }} />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="range" min="1" max="50" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full accent-black" />
          <p className="text-xs text-center">Pixel Size: {size}% resolution downscale</p>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export JPG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}`);

// 13. ROUNDED IMAGE
writeTool('rounded-image', `"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function RoundedPage() {
  const [img, setImg] = useState<any>(null);
  const [radius, setRadius] = useState(50); // percentage

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    
    if(ctx){
        const minDim = Math.min(canvas.width, canvas.height);
        const r = (minDim / 2) * (radius/100);
        
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
        
        ctx.clip();
        ctx.drawImage(image, 0, 0);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png"); // Must be PNG for transparency
    a.download = "rounded.png";
    a.click();
  };

  return (
    <ToolLayout title="Rounded Image" description="Apply transparent rounded corners to images.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh] bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
               <img src={img.url} style={{ borderRadius: \`\${radius}%\` }} className="max-h-[50vh] object-contain shadow-2xl" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <input type="range" min="0" max="50" value={radius} onChange={e=>setRadius(Number(e.target.value))} className="w-full accent-black" />
          <p className="text-xs text-center">Corner Radius: {radius}%</p>
          <p className="text-[10px] text-zinc-500 text-center">Exports as PNG to preserve transparency.</p>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export PNG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}`);

// 14. FAVICON
writeTool('favicon', `"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

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
        zip.file(\`favicon-\${size}x\${size}.png\`, blob);
        
        if (size === 32) {
            zip.file(\`favicon.ico\`, blob); // Simple copy, not true .ico encode but works for modern browsers
        }
    }
    
    const content = await zip.generateAsync({type:"blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "favicon-package.zip";
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
}`);

// 15. COLOR PALETTE
writeTool('color-palette', `"use client";
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
}`);
