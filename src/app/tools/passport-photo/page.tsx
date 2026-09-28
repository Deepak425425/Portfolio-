"use client";
import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

export default function PassportPage() {
  const [img, setImg] = useState<any>(null);

  const generate = async () => {
    if(!img) return;
    const image = new Image();
    image.src = img.url;
    await new Promise(r=>image.onload=r);
    
    const canvas = document.createElement("canvas");
    canvas.width = 2480; canvas.height = 3508; // A4 @ 300dpi
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // US Passport is 2x2 inches -> 600x600 px @ 300dpi
    const pw = 600; const ph = 600;
    const cols = 3; const rows = 4;
    const spacing = 100;
    
    const startX = (canvas.width - (cols*pw + (cols-1)*spacing)) / 2;
    const startY = (canvas.height - (rows*ph + (rows-1)*spacing)) / 2;
    
    for(let r=0; r<rows; r++) {
      for(let c=0; c<cols; c++) {
        const x = startX + c*(pw+spacing);
        const y = startY + r*(ph+spacing);
        
        const imgRatio = image.width / image.height;
        let drawW = pw; let drawH = ph;
        if(imgRatio > 1) drawW = ph * imgRatio;
        else drawH = pw / imgRatio;
        
        ctx.save();
        ctx.beginPath(); ctx.rect(x, y, pw, ph); ctx.clip();
        ctx.drawImage(image, x + (pw-drawW)/2, y + (ph-drawH)/2, drawW, drawH);
        ctx.restore();
        
        ctx.strokeStyle = "#ccc"; ctx.lineWidth = 2;
        ctx.strokeRect(x,y,pw,ph);
      }
    }
    
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = "passport-sheet-a4.jpg";
    a.click();
  };

  return (
    <ToolLayout title="Passport Photo Maker" description="Generate a printable A4 sheet of 2x2 passport photos.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {!img ? <UploadDropzone onUpload={f => setImg({url: URL.createObjectURL(f[0])})} multiple={false} /> : 
            <div className="bg-zinc-200 p-8 flex justify-center items-center h-[60vh]">
                 <img src={img.url} className="max-h-[50vh] object-cover aspect-square shadow-lg" />
            </div>
          }
        </div>
        <div className="lg:col-span-4 bg-white p-6 border flex flex-col gap-4">
          <p className="text-xs text-zinc-500">This automatically crops your image to a square, places 12 copies on an A4 300DPI sheet, and adds cut guides.</p>
          {img && <button onClick={generate} className="bg-black text-white p-4 font-bold mt-4">Export Printable JPG</button>}
        </div>
      </div>
    </ToolLayout>
  );
}