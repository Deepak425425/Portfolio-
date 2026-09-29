"use client";
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, MouseEvent, TouchEvent } from "react";

export interface CropperRef {
  getCroppedCanvas: () => HTMLCanvasElement | null;
  reset: () => void;
  centerImage: () => void;
  getCropInfo: () => { origW: number; origH: number; cropW: number; cropH: number } | null;
}

interface CropperProps {
  image: HTMLImageElement;
  aspectRatio: number | "free";
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  onZoomChange: (z: number) => void;
}

export const Cropper = forwardRef<CropperRef, CropperProps>(({ image, aspectRatio, rotation, flipH, flipV, zoom, onZoomChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [imgBox, setImgBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [baseImgBox, setBaseImgBox] = useState({ x: 0, y: 0, w: 0, h: 0 }); // Box at zoom = 1

  // Dragging state
  const [isDragging, setIsDragging] = useState<"image" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null>(null);
  const dragStart = useRef({ x: 0, y: 0, cx: 0, cy: 0, cw: 0, ch: 0, ix: 0, iy: 0 });

  const getRotatedSize = () => {
    const isRot = Math.abs(rotation) === 90 || Math.abs(rotation) === 270;
    return {
      w: isRot ? image.naturalHeight : image.naturalWidth,
      h: isRot ? image.naturalWidth : image.naturalHeight
    };
  };

  // Initialize
  useEffect(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    
    const rs = getRotatedSize();
    
    // Fit into container with 40px padding
    const padding = 40;
    const availW = cw - padding * 2;
    const availH = ch - padding * 2;
    
    const scale = Math.min(availW / rs.w, availH / rs.h);
    const fw = rs.w * scale;
    const fh = rs.h * scale;
    
    const bx = (cw - fw) / 2;
    const by = (ch - fh) / 2;
    
    const initialBox = { x: bx, y: by, w: fw, h: fh };
    setBaseImgBox(initialBox);
    setImgBox({ x: bx, y: by, w: fw * zoom, h: fh * zoom });
    
    // Initial crop box = full image OR max aspect ratio size
    let cw_crop = fw;
    let ch_crop = fh;
    if (typeof aspectRatio === 'number') {
       if (fw / fh > aspectRatio) {
         cw_crop = fh * aspectRatio;
       } else {
         ch_crop = fw / aspectRatio;
       }
    }
    
    setCropBox({
      x: bx + (fw - cw_crop)/2,
      y: by + (fh - ch_crop)/2,
      w: cw_crop,
      h: ch_crop
    });
  }, [image, rotation]); // Reset base positions when image or rotation changes

  // Handle Aspect Ratio changes
  useEffect(() => {
    if (cropBox.w === 0) return;
    if (typeof aspectRatio === 'number') {
       let nw = cropBox.w;
       let nh = cropBox.h;
       
       if (nw / nh > aspectRatio) {
         nw = nh * aspectRatio;
       } else {
         nh = nw / aspectRatio;
       }
       
       // Ensure it still fits in image
       if (nw > imgBox.w) { nw = imgBox.w; nh = nw / aspectRatio; }
       if (nh > imgBox.h) { nh = imgBox.h; nw = nh * aspectRatio; }
       
       const cx = cropBox.x + cropBox.w/2;
       const cy = cropBox.y + cropBox.h/2;
       
       let nx = cx - nw/2;
       let ny = cy - nh/2;
       
       // Clamp to imgBox
       if (nx < imgBox.x) nx = imgBox.x;
       if (ny < imgBox.y) ny = imgBox.y;
       if (nx + nw > imgBox.x + imgBox.w) nx = imgBox.x + imgBox.w - nw;
       if (ny + nh > imgBox.y + imgBox.h) ny = imgBox.y + imgBox.h - nh;
       
       setCropBox({ x: nx, y: ny, w: nw, h: nh });
    }
  }, [aspectRatio]);

  // Handle Zoom
  useEffect(() => {
     if (baseImgBox.w === 0) return;
     const nw = baseImgBox.w * zoom;
     const nh = baseImgBox.h * zoom;
     
     // Zoom around center of cropBox
     const cx = cropBox.x + cropBox.w/2;
     const cy = cropBox.y + cropBox.h/2;
     
     // Where was cx, cy relative to imgBox?
     const relX = (cx - imgBox.x) / imgBox.w;
     const relY = (cy - imgBox.y) / imgBox.h;
     
     let nx = cx - (nw * relX);
     let ny = cy - (nh * relY);
     
     // Clamp so image always covers cropbox
     if (nx > cropBox.x) nx = cropBox.x;
     if (ny > cropBox.y) ny = cropBox.y;
     if (nx + nw < cropBox.x + cropBox.w) nx = cropBox.x + cropBox.w - nw;
     if (ny + nh < cropBox.y + cropBox.h) ny = cropBox.y + cropBox.h - nh;
     
     setImgBox({ x: nx, y: ny, w: nw, h: nh });
  }, [zoom]);

  useImperativeHandle(ref, () => ({
    getCroppedCanvas: () => {
      const rs = getRotatedSize();
      const virtCanvas = document.createElement('canvas');
      virtCanvas.width = rs.w;
      virtCanvas.height = rs.h;
      const vCtx = virtCanvas.getContext('2d');
      if(!vCtx) return null;
      
      vCtx.translate(rs.w/2, rs.h/2);
      vCtx.rotate(rotation * Math.PI / 180);
      vCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      vCtx.drawImage(image, -image.naturalWidth/2, -image.naturalHeight/2);
      
      const scale = rs.w / imgBox.w;
      
      const cropX = (cropBox.x - imgBox.x) * scale;
      const cropY = (cropBox.y - imgBox.y) * scale;
      const cropW = cropBox.w * scale;
      const cropH = cropBox.h * scale;
      
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = cropW;
      finalCanvas.height = cropH;
      const fCtx = finalCanvas.getContext('2d');
      if(!fCtx) return null;
      
      fCtx.drawImage(virtCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      return finalCanvas;
    },
    reset: () => {
      onZoomChange(1);
    },
    centerImage: () => {
       let nx = cropBox.x + cropBox.w/2 - imgBox.w/2;
       let ny = cropBox.y + cropBox.h/2 - imgBox.h/2;
       if (nx > cropBox.x) nx = cropBox.x;
       if (ny > cropBox.y) ny = cropBox.y;
       if (nx + imgBox.w < cropBox.x + cropBox.w) nx = cropBox.x + cropBox.w - imgBox.w;
       if (ny + imgBox.h < cropBox.y + cropBox.h) ny = cropBox.y + cropBox.h - imgBox.h;
       setImgBox(prev => ({...prev, x: nx, y: ny}));
    },
    getCropInfo: () => {
       const rs = getRotatedSize();
       const scale = rs.w / imgBox.w;
       return {
         origW: rs.w,
         origH: rs.h,
         cropW: Math.round(cropBox.w * scale),
         cropH: Math.round(cropBox.h * scale)
       };
    }
  }));

  const handlePointerDown = (e: React.PointerEvent, type: "image" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w") => {
     e.preventDefault();
     e.stopPropagation();
     setIsDragging(type);
     dragStart.current = {
       x: e.clientX, y: e.clientY,
       cx: cropBox.x, cy: cropBox.y, cw: cropBox.w, ch: cropBox.h,
       ix: imgBox.x, iy: imgBox.y
     };
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      if (isDragging === "image") {
        let nx = dragStart.current.ix + dx;
        let ny = dragStart.current.iy + dy;
        
        // Clamp image to cover cropbox
        if (nx > cropBox.x) nx = cropBox.x;
        if (ny > cropBox.y) ny = cropBox.y;
        if (nx + imgBox.w < cropBox.x + cropBox.w) nx = cropBox.x + cropBox.w - imgBox.w;
        if (ny + imgBox.h < cropBox.y + cropBox.h) ny = cropBox.y + cropBox.h - imgBox.h;
        
        setImgBox(prev => ({...prev, x: nx, y: ny}));
      } else {
        // Resize crop box
        let { cx, cy, cw, ch } = dragStart.current;
        
        if (isDragging.includes("w")) { cx += dx; cw -= dx; }
        if (isDragging.includes("e")) { cw += dx; }
        if (isDragging.includes("n")) { cy += dy; ch -= dy; }
        if (isDragging.includes("s")) { ch += dy; }
        
        // Enforce aspect ratio
        if (typeof aspectRatio === 'number') {
           if (isDragging === "n" || isDragging === "s") {
              cw = ch * aspectRatio;
              if (isDragging.includes("w")) cx = dragStart.current.cx + dragStart.current.cw - cw;
           } else {
              ch = cw / aspectRatio;
              if (isDragging.includes("n")) cy = dragStart.current.cy + dragStart.current.ch - ch;
           }
        }
        
        // Min size
        if (cw < 50) { cw = 50; if (isDragging.includes("w")) cx = dragStart.current.cx + dragStart.current.cw - 50; }
        if (ch < 50) { ch = 50; if (isDragging.includes("n")) cy = dragStart.current.cy + dragStart.current.ch - 50; }
        
        // Clamp to imgBox
        if (cx < imgBox.x) { cw -= (imgBox.x - cx); cx = imgBox.x; }
        if (cy < imgBox.y) { ch -= (imgBox.y - cy); cy = imgBox.y; }
        if (cx + cw > imgBox.x + imgBox.w) { cw = imgBox.x + imgBox.w - cx; }
        if (cy + ch > imgBox.y + imgBox.h) { ch = imgBox.y + imgBox.h - cy; }
        
        // Re-enforce aspect ratio if cramped
        if (typeof aspectRatio === 'number') {
           if (cw / ch > aspectRatio) {
             cw = ch * aspectRatio;
           } else {
             ch = cw / aspectRatio;
           }
        }
        
        setCropBox({ x: cx, y: cy, w: cw, h: ch });
      }
    };
    
    const handleUp = () => setIsDragging(null);
    
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging, cropBox, imgBox, aspectRatio]);

  const handleWheel = (e: React.WheelEvent) => {
     if (e.deltaY < 0) onZoomChange(Math.min(3, zoom + 0.1));
     else onZoomChange(Math.max(1, zoom - 0.1));
  };

  return (
    <div ref={containerRef} onWheel={handleWheel} className="w-full h-[65vh] bg-zinc-200 relative overflow-hidden touch-none" style={{ userSelect: 'none' }}>
       {/* Background Image (darkened) */}
       <div 
         className="absolute opacity-40 pointer-events-none"
         style={{
           left: imgBox.x, top: imgBox.y, width: imgBox.w, height: imgBox.h,
           transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
           backgroundImage: `url(${image.src})`,
           backgroundSize: '100% 100%'
         }}
       />
       
       {/* Crop Area */}
       <div 
         className="absolute border border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-move"
         style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h }}
         onPointerDown={e => handlePointerDown(e, "image")}
       >
          {/* Inner visible image */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div 
               className="absolute"
               style={{
                 left: imgBox.x - cropBox.x, 
                 top: imgBox.y - cropBox.y, 
                 width: imgBox.w, 
                 height: imgBox.h,
                 transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                 backgroundImage: `url(${image.src})`,
                 backgroundSize: '100% 100%'
               }}
             />
          </div>
          
          {/* Grid lines (rule of thirds) */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
             <div className="border-r border-b border-white"></div>
             <div className="border-r border-b border-white"></div>
             <div className="border-b border-white"></div>
             <div className="border-r border-b border-white"></div>
             <div className="border-r border-b border-white"></div>
             <div className="border-b border-white"></div>
             <div className="border-r border-white"></div>
             <div className="border-r border-white"></div>
             <div></div>
          </div>
          
          {/* Handles */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-white cursor-nwse-resize z-10" onPointerDown={e => handlePointerDown(e, "nw")} />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-white cursor-nesw-resize z-10" onPointerDown={e => handlePointerDown(e, "ne")} />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white cursor-nesw-resize z-10" onPointerDown={e => handlePointerDown(e, "sw")} />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white cursor-nwse-resize z-10" onPointerDown={e => handlePointerDown(e, "se")} />
          
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-white cursor-ns-resize z-10" onPointerDown={e => handlePointerDown(e, "n")} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-white cursor-ns-resize z-10" onPointerDown={e => handlePointerDown(e, "s")} />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-6 bg-white cursor-ew-resize z-10" onPointerDown={e => handlePointerDown(e, "w")} />
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-6 bg-white cursor-ew-resize z-10" onPointerDown={e => handlePointerDown(e, "e")} />
       </div>
    </div>
  );
});
Cropper.displayName = "Cropper";
