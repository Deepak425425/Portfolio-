"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import ExifReader from "exifreader";
import { getGrotonExportFilename } from "@/utils/export";
import { jsPDF } from "jspdf";

interface MetadataState {
  fileInfo: any;
  exif: any;
  iptc: any;
  xmp: any;
  icc: any;
  other: any;
  hasGps: boolean;
  gpsRaw: any;
}

export default function CheckMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataState | null>(null);
  const [reportDataUrl, setReportDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGps, setShowGps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setImagePreview(URL.createObjectURL(f));
    setError(null);
    setShowGps(false);
    setReportDataUrl(null);

    try {
      const tags = await ExifReader.load(f, { expanded: true });
      
      const fileInfo: Record<string, string> = {
        "Filename": f.name,
        "File Type": f.type,
        "File Size": (f.size / 1024).toFixed(2) + " KB"
      };

      const exif = tags.exif || {};
      const iptc = tags.iptc || {};
      const xmp = tags.xmp || {};
      const icc = tags.icc || {};
      const fileTags = tags.file || {};

      let hasGps = false;
      let gpsRaw: any = null;

      if (tags.gps) {
        hasGps = true;
        gpsRaw = tags.gps;
      } else if (exif.GPSLatitude || exif.GPSLongitude) {
        hasGps = true;
        gpsRaw = {
          Latitude: exif.GPSLatitude,
          Longitude: exif.GPSLongitude,
        };
      }

      if (fileTags['Image Width']) fileInfo['Width'] = fileTags['Image Width'].description + " px";
      if (fileTags['Image Height']) fileInfo['Height'] = fileTags['Image Height'].description + " px";

      setMetadata({
        fileInfo,
        exif,
        iptc,
        xmp,
        icc,
        other: fileTags,
        hasGps,
        gpsRaw
      });

    } catch (e: any) {
      setError("Failed to read metadata: " + e.message);
      setMetadata(null);
    }
  };

  useEffect(() => {
    if (!metadata || !file || !imagePreview) return;
    
    let isMounted = true;
    const generateReport = async () => {
      setIsGenerating(true);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const img = new Image();
        img.src = imagePreview;
        await new Promise(r => img.onload = r);
        
        const w = 1200;
        const padding = 100;
        let currentY = padding;
        
        const MAX_HEIGHT = 10000;
        canvas.width = w;
        canvas.height = MAX_HEIGHT;
        
        // Background
        ctx.fillStyle = "#FFFFFF"; // Premium white
        ctx.fillRect(0, 0, w, MAX_HEIGHT);
        
        const drawText = (text: string, x: number, y: number, font: string, color: string) => {
           ctx.font = font;
           ctx.fillStyle = color;
           ctx.fillText(text, x, y);
           return y;
        };
        
        // 1. Header
        ctx.textAlign = "center";
        drawText("IMAGE REPORT", w/2, currentY, "bold 48px 'Inter', sans-serif", "#111111");
        currentY += 120;
        
        // 2. Image
        const maxImgW = w - (padding * 2);
        const maxImgH = 800;
        const scale = Math.min(maxImgW / img.width, maxImgH / img.height, 1);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        
        // Image box border
        ctx.strokeStyle = "#E5E5E5";
        ctx.lineWidth = 2;
        ctx.strokeRect((w - drawW)/2 - 1, currentY - 1, drawW + 2, drawH + 2);
        ctx.drawImage(img, (w - drawW)/2, currentY, drawW, drawH);
        
        currentY += drawH + 60;
        
        // 3. Filename
        drawText(file.name, w/2, currentY, "bold 28px 'Inter', monospace", "#111111");
        currentY += 100;
        
        // 4. Content Sections
        const leftX = padding;
        
        const renderDataSection = (title: string, fields: {label: string, value: string}[]) => {
           if (fields.length === 0) return;
           
           currentY += 30;
           ctx.textAlign = "left";
           drawText(title, leftX, currentY, "bold 22px 'Inter', sans-serif", "#111111");
           currentY += 20;
           
           ctx.fillStyle = "#E5E5E5";
           ctx.fillRect(leftX, currentY, w - padding*2, 2);
           currentY += 40;
           
           fields.forEach(f => {
              ctx.textAlign = "left";
              drawText(f.label, leftX, currentY, "500 20px 'Inter', sans-serif", "#666666");
              
              ctx.textAlign = "right";
              drawText(f.value, w - padding, currentY, "20px 'Inter', monospace", "#111111");
              currentY += 45;
           });
           
           currentY += 30;
        };
        
        // Calculations
        const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
        const ratioGcd = gcd(img.width, img.height);
        const aspectRatio = `${img.width/ratioGcd}:${img.height/ratioGcd}`;
        
        // Helper to extract
        const getMeta = (obj: any, key: string, fallback = "Not available") => {
           if (!obj || !obj[key]) return fallback;
           const v = obj[key].description || obj[key].value || obj[key];
           return String(v).trim() || fallback;
        };

        const hasAlpha = file.type === "image/png" || file.type === "image/webp";

        renderDataSection("FILE INFORMATION", [
           { label: "File type", value: file.type.toUpperCase().replace("IMAGE/", "") },
           { label: "File size", value: (file.size / 1024 / 1024).toFixed(2) + " MB" },
           { label: "Dimensions", value: `${img.width} × ${img.height} px` },
           { label: "Aspect ratio", value: aspectRatio },
           { label: "Color mode", value: getMeta(metadata.icc, "ColorSpaceData", getMeta(metadata.exif, "ColorSpace", "RGB")) },
           { label: "Transparency", value: hasAlpha ? "Yes" : "No" }
        ]);
        
        renderDataSection("EXIF", [
           { label: "Camera make", value: getMeta(metadata.exif, "Make") },
           { label: "Camera model", value: getMeta(metadata.exif, "Model") },
           { label: "Date/time", value: getMeta(metadata.exif, "DateTimeOriginal") },
           { label: "ISO", value: getMeta(metadata.exif, "ISOSpeedRatings") },
           { label: "Exposure", value: getMeta(metadata.exif, "ExposureTime") },
           { label: "Aperture", value: getMeta(metadata.exif, "FNumber") },
           { label: "Focal length", value: getMeta(metadata.exif, "FocalLength") },
           { label: "Orientation", value: getMeta(metadata.exif, "Orientation") }
        ]);
        
        if (metadata.hasGps && metadata.gpsRaw) {
           renderDataSection("LOCATION DATA (GPS)", [
              { label: "Latitude", value: metadata.gpsRaw.Latitude ? String(metadata.gpsRaw.Latitude) : "Not available" },
              { label: "Longitude", value: metadata.gpsRaw.Longitude ? String(metadata.gpsRaw.Longitude) : "Not available" }
           ]);
        }
        
        renderDataSection("IPTC", [
           { label: "Creator", value: getMeta(metadata.iptc, "Creator", getMeta(metadata.iptc, "By-line")) },
           { label: "Copyright", value: getMeta(metadata.iptc, "Copyright Notice") },
           { label: "Caption", value: getMeta(metadata.iptc, "Caption/Abstract") },
           { label: "Keywords", value: getMeta(metadata.iptc, "Keywords") }
        ]);
        
        // Dump XMP keys if they exist
        if (metadata.xmp && Object.keys(metadata.xmp).length > 0) {
           const xmpFields = Object.keys(metadata.xmp).slice(0, 10).map(k => ({
              label: k, 
              value: String(metadata.xmp[k].description || metadata.xmp[k].value).substring(0, 45) + (String(metadata.xmp[k].description).length > 45 ? "..." : "")
           }));
           renderDataSection("XMP", xmpFields);
        }
        
        renderDataSection("COLOR PROFILE", [
           { label: "Profile", value: getMeta(metadata.icc, "ProfileDescription") },
           { label: "Color space", value: getMeta(metadata.icc, "ColorSpaceData") }
        ]);
        
        // Footer
        currentY += 80;
        ctx.textAlign = "center";
        drawText("GROTON.IN", w/2, currentY, "bold 24px 'Inter', sans-serif", "#111111");
        currentY += 100;
        
        // Crop canvas
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = w;
        finalCanvas.height = currentY;
        const fctx = finalCanvas.getContext("2d")!;
        fctx.drawImage(canvas, 0, 0, w, currentY, 0, 0, w, currentY);
        
        finalCanvas.toBlob((blob) => {
          if (!isMounted || !blob) return;
          setReportDataUrl(URL.createObjectURL(blob));
          setIsGenerating(false);
        }, "image/png");

      } catch (err) {
        console.error(err);
        if (isMounted) setIsGenerating(false);
      }
    };
    
    generateReport();
    return () => { isMounted = false; };
  }, [metadata, file, imagePreview]);

  const reset = () => {
    setFile(null);
    setImagePreview(null);
    setMetadata(null);
    setReportDataUrl(null);
    setError(null);
    setShowGps(false);
  };

  const downloadJson = () => {
    if (!metadata || !file) return;
    const data = JSON.stringify(metadata, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = file.name.split('.').slice(0, -1).join('.');
    a.download = getGrotonExportFilename(`${baseName}.json`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPng = () => {
    if (!reportDataUrl || !file) return;
    const a = document.createElement("a");
    a.href = reportDataUrl;
    const baseName = file.name.split('.').slice(0, -1).join('.');
    a.download = getGrotonExportFilename(`${baseName}-report.png`);
    a.click();
  };

  const downloadPdf = () => {
    if (!reportDataUrl || !file) return;
    
    const img = new Image();
    img.src = reportDataUrl;
    img.onload = () => {
      // Calculate a standard A4 portrait width in points, then scale height proportionally
      const pdf = new jsPDF("p", "pt", "a4");
      const a4W = pdf.internal.pageSize.getWidth();
      const a4H = pdf.internal.pageSize.getHeight();
      
      const ratio = a4W / img.width;
      const drawH = img.height * ratio;
      
      // If height is larger than A4, we use custom dimensions so nothing is cut off
      if (drawH > a4H) {
         const customPdf = new jsPDF("p", "pt", [a4W, drawH]);
         customPdf.addImage(reportDataUrl, "PNG", 0, 0, a4W, drawH);
         const baseName = file.name.split('.').slice(0, -1).join('.');
         customPdf.save(getGrotonExportFilename(`${baseName}-report.pdf`));
      } else {
         pdf.addImage(reportDataUrl, "PNG", 0, 0, a4W, drawH);
         const baseName = file.name.split('.').slice(0, -1).join('.');
         pdf.save(getGrotonExportFilename(`${baseName}-report.pdf`));
      }
    };
  };

  const renderSection = (title: string, data: any) => {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return (
        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">{title}</h3>
          <p className="text-sm text-zinc-500">Not available</p>
        </div>
      );
    }
    return (
      <div className="mb-6">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {keys.map((k) => (
            <div key={k} className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">{k}</span>
              <span className="text-sm text-zinc-800 break-words">
                {typeof data[k] === 'object' ? data[k].description || JSON.stringify(data[k]) : String(data[k])}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ToolLayout title="Check Metadata" description="Inspect image metadata, EXIF, IPTC, XMP and generate a professional image report.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: RAW DATA (Existing Functionality Preserved) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!file ? (
             <UploadDropzone onUpload={handleUpload} multiple={false} accept="image/*" />
          ) : (
            <div className="bg-white border border-zinc-200 p-6 flex flex-col h-full">
               {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
               
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-[#111111]">Raw Metadata Inspector</h2>
                 <button onClick={reset} className="px-4 py-2 bg-zinc-100 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors">
                   Upload New Image
                 </button>
               </div>

               {metadata && (
                 <div className="flex flex-col flex-1 overflow-auto">
                    {renderSection("FILE INFORMATION", metadata.fileInfo)}
                    
                    {metadata.hasGps && (
                      <div className="mb-6">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-red-500 mb-2 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          GPS LOCATION SENSITIVE DATA
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-zinc-800">Present</span>
                          {!showGps ? (
                            <button onClick={() => setShowGps(true)} className="px-3 py-1 bg-zinc-100 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors">
                              Show GPS
                            </button>
                          ) : (
                            <div className="text-sm text-zinc-800 bg-zinc-50 p-2 border border-zinc-100">
                              <pre className="text-xs">{JSON.stringify(metadata.gpsRaw, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {renderSection("EXIF", metadata.exif)}
                    {renderSection("IPTC", metadata.iptc)}
                    {renderSection("XMP", metadata.xmp)}
                    {renderSection("ICC / COLOR PROFILE", metadata.icc)}
                    {Object.keys(metadata.other).length > 0 && renderSection("OTHER", metadata.other)}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: VISUAL REPORT & EXPORT */}
        <div className="lg:col-span-5 flex flex-col gap-8">
           <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-widest">Image Report Preview</h2>
              
              {!file ? (
                <div className="w-full aspect-[3/4] bg-zinc-50 flex items-center justify-center border border-zinc-200 text-xs text-zinc-400 uppercase tracking-widest font-bold">
                   Awaiting Image
                </div>
              ) : isGenerating ? (
                <div className="w-full aspect-[3/4] bg-zinc-50 flex items-center justify-center border border-zinc-200 text-xs text-[#8B7CFF] animate-pulse uppercase tracking-widest font-bold">
                   Generating Report...
                </div>
              ) : reportDataUrl ? (
                <div className="relative w-full overflow-y-auto max-h-[600px] border border-zinc-200 shadow-inner bg-zinc-100 p-4">
                   <img src={reportDataUrl} className="w-full h-auto shadow-md" alt="Report Preview" />
                </div>
              ) : null}
              
              {file && (
                <div className="flex flex-col gap-3 mt-4">
                  <button onClick={downloadPdf} disabled={!reportDataUrl} className="w-full py-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:opacity-50">
                    DOWNLOAD PDF
                  </button>
                  <div className="flex gap-2">
                    <button onClick={exportPng} disabled={!reportDataUrl} className="w-full flex-1 py-3 bg-white border border-[#111111] text-[#111111] text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50">
                      EXPORT PNG
                    </button>
                    <button onClick={downloadJson} className="w-full flex-1 py-3 bg-white border border-[#DEDCD5] text-zinc-600 text-[10px] uppercase tracking-widest font-bold hover:border-[#111111] transition-colors">
                      DOWNLOAD JSON
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 text-center mt-2 font-light">
                     All metadata extraction and report generation happens locally in your browser. 
                  </p>
                </div>
              )}
           </div>
        </div>
        
      </div>
    </ToolLayout>
  );
}
