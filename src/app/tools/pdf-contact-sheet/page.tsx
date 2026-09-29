"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { jsPDF } from "jspdf";
import { getGrotonExportFilename } from "@/utils/export";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

export default function PDFContactSheetPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [paper, setPaper] = useState<"a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"p" | "l">("p");
  const [grid, setGrid] = useState<2 | 3 | 4>(3);
  const [marginLevel, setMarginLevel] = useState<"small" | "medium" | "large">("medium");
  const [showFilename, setShowFilename] = useState(true);
  const [showPageNumber, setShowPageNumber] = useState(true);
  
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
  };

  const removeImage = (id: string) => {
    const target = images.find(i => i.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setImages(prev => prev.filter(i => i.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    
    setImages(prev => {
      const copy = [...prev];
      const item = copy[dragIndex];
      copy.splice(dragIndex, 1);
      copy.splice(index, 0, item);
      setDragIndex(index);
      return copy;
    });
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const generatePDF = async () => {
    setIsProcessing(true);
    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: paper
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const marginMap = { small: 5, medium: 10, large: 20 };
      const margin = marginMap[marginLevel];
      
      const cols = grid;
      const rows = grid;
      
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2) - (showPageNumber ? 10 : 0);
      
      const cellWidth = contentWidth / cols;
      const cellHeight = contentHeight / rows;
      const cellPadding = 2;
      
      let currentIdx = 0;
      let pageNum = 1;
      
      while (currentIdx < images.length) {
        if (pageNum > 1) doc.addPage();
        
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (currentIdx >= images.length) break;
            
            const imgData = images[currentIdx];
            const x = margin + (c * cellWidth) + cellPadding;
            const y = margin + (r * cellHeight) + cellPadding;
            const maxW = cellWidth - (cellPadding * 2);
            const maxH = cellHeight - (cellPadding * 2) - (showFilename ? 5 : 0);
            
            const img = new Image();
            img.src = imgData.url;
            await new Promise(res => img.onload = res);
            
            const ratio = Math.min(maxW / img.width, maxH / img.height);
            const drawW = img.width * ratio;
            const drawH = img.height * ratio;
            
            const drawX = x + (maxW - drawW) / 2;
            const drawY = y + (maxH - drawH) / 2;
            
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
              doc.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
            }
            
            if (showFilename) {
              doc.setFontSize(8);
              doc.setTextColor(100);
              const text = imgData.name.length > 20 ? imgData.name.substring(0, 17) + '...' : imgData.name;
              doc.text(text, x + maxW / 2, y + maxH + 4, { align: 'center' });
            }
            
            currentIdx++;
          }
        }
        
        if (showPageNumber) {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        }
        pageNum++;
      }
      doc.save(getGrotonExportFilename('contact-sheet.pdf'));
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="PDF Contact Sheet" description="Create a clean printable PDF grid from multiple images.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 p-6 border border-zinc-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Drag to reorder</span>
                <label className="bg-white hover:bg-zinc-50 border border-zinc-300 px-4 py-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer transition-colors">
                  Add More Images
                  <input type="file" multiple accept="image/*" className="hidden" onChange={e => {if(e.target.files) handleUpload(Array.from(e.target.files))}} />
                </label>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div 
                    key={img.id}
                    draggable
                    onDragStart={e => handleDragStart(e, i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`relative aspect-square border-2 bg-white flex flex-col cursor-move group transition-colors ${dragIndex === i ? 'border-black opacity-50' : 'border-transparent hover:border-zinc-400 shadow-sm'}`}
                  >
                    <img src={img.url} className="w-full h-full object-cover p-1" />
                    <button onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-white/90 text-black text-[9px] p-1 truncate text-center font-bold tracking-wider">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Paper Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaper("a4")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${paper === "a4" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>A4</button>
                <button onClick={() => setPaper("letter")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${paper === "letter" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Letter</button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOrientation("p")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${orientation === "p" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Portrait</button>
                <button onClick={() => setOrientation("l")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${orientation === "l" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Landscape</button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Grid Structure</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setGrid(2)} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${grid === 2 ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>2 × 2</button>
                <button onClick={() => setGrid(3)} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${grid === 3 ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>3 × 3</button>
                <button onClick={() => setGrid(4)} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${grid === 4 ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>4 × 4</button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Margins</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setMarginLevel("small")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${marginLevel === "small" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Small</button>
                <button onClick={() => setMarginLevel("medium")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${marginLevel === "medium" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Med</button>
                <button onClick={() => setMarginLevel("large")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${marginLevel === "large" ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}>Large</button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 cursor-pointer">
                <input type="checkbox" checked={showFilename} onChange={e => setShowFilename(e.target.checked)} className="accent-black" />
                Show Filenames
              </label>
              <label className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 cursor-pointer">
                <input type="checkbox" checked={showPageNumber} onChange={e => setShowPageNumber(e.target.checked)} className="accent-black" />
                Show Page Numbers
              </label>
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {images.length > 0 && (
              <>
                <button disabled={isProcessing} onClick={generatePDF} className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 shadow-xl">
                  {isProcessing ? 'Generating...' : 'Generate PDF'}
                </button>
                <button onClick={reset} disabled={isProcessing} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors disabled:opacity-50">
                  Reset / Clear Images
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
