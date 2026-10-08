"use client";

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";
// Dynamically loaded via import() when needed to prevent Next.js SSR crashes
// import { FaceDetector, FilesetResolver, Detection } from "@mediapipe/tasks-vision";
import { getGrotonExportFilename } from "@/utils/export";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  name: string;
  ext: string;
  csMeta?: any;
}

interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function FaceBlurPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const [blurMode, setBlurMode] = useState<"blur" | "pixelate">("blur");
  const [strength, setStrength] = useState(20); // 1-100
  
  const [boxes, setBoxes] = useState<Record<string, Box[]>>({}); // image id -> boxes
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({x: 0, y: 0});
  const [currentBox, setCurrentBox] = useState<Box | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    const newImgs = valid.map(f => {
      const parts = f.name.split('.');
      const ext = parts.pop() || 'jpg';
      const id = Math.random().toString(36).substring(7);
      
      let csMeta;
      try {
        const raw = localStorage.getItem(`groton_cs_meta_${f.name}`);
        if (raw) csMeta = JSON.parse(raw);
      } catch (e) { console.warn("Failed to parse contact sheet metadata"); }
      
      return {
        id,
        file: f,
        url: URL.createObjectURL(f),
        name: parts.join('.'),
        ext,
        csMeta
      };
    });
    setImages(prev => [...prev, ...newImgs]);
  };

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
    setBoxes({});
    setPreviewIndex(0);
  };

  const currentImg = images[previewIndex];
  const currentBoxes = currentImg ? (boxes[currentImg.id] || []) : [];

  useEffect(() => {
    if (!currentImg) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      renderDisplay();
    };
    img.src = currentImg.url;
  }, [currentImg, previewIndex]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.width > 0 && imgRef.current.height > 0) {
      renderDisplay();
    }
  }, [boxes, blurMode, strength, currentBox]);

  const renderDisplay = () => {
    if (!imgRef.current || !displayCanvasRef.current) return;
    
    const img = imgRef.current;
    if (img.width <= 0 || img.height <= 0) return;
    
    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Scale for display
    const maxW = 800;
    const ratio = img.width > maxW ? maxW / img.width : 1;
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const applyEffect = (box: Box) => {
      if (canvas.width <= 0 || canvas.height <= 0) return;

      const bx = box.x * ratio;
      const by = box.y * ratio;
      const bw = box.w * ratio;
      const bh = box.h * ratio;
      
      const safeX = Math.max(0, Math.min(Math.floor(bx), canvas.width - 1));
      const safeY = Math.max(0, Math.min(Math.floor(by), canvas.height - 1));

      const safeW = Math.min(
          Math.max(1, Math.floor(bw)),
          canvas.width - safeX
      );

      const safeH = Math.min(
          Math.max(1, Math.floor(bh)),
          canvas.height - safeY
      );

      if (safeW <= 0 || safeH <= 0 || safeX >= canvas.width || safeY >= canvas.height) return;
      
      try {
        const region = ctx.getImageData(safeX, safeY, safeW, safeH);
        
        if (blurMode === "pixelate") {
          const pSize = Math.max(2, Math.floor(strength / 2));
          for (let y = 0; y < safeH; y += pSize) {
            for (let x = 0; x < safeW; x += pSize) {
              const i = (y * safeW + x) * 4;
              const r = region.data[i];
              const g = region.data[i+1];
              const b = region.data[i+2];
              
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(safeX + x, safeY + y, pSize, pSize);
            }
          }
        } else {
          ctx.save();
          // CLIP strictly to the detected face region
          ctx.beginPath();
          ctx.rect(safeX, safeY, safeW, safeH);
          ctx.clip();
          
          ctx.filter = `blur(${strength / 2}px)`;
          // Draw a slightly larger source area to prevent dark/transparent edges bleeding in
          const margin = strength;
          const sx = Math.max(0, safeX - margin);
          const sy = Math.max(0, safeY - margin);
          const sw = Math.min(canvas.width - sx, safeW + margin * 2);
          const sh = Math.min(canvas.height - sy, safeH + margin * 2);
          
          ctx.drawImage(canvas, sx, sy, sw, sh, sx, sy, sw, sh);
          ctx.restore();
        }
        
        // Draw subtle bounds using original coordinates to accurately reflect user selection
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
      } catch (e) {
        console.warn("Failed to apply face blur effect region", e);
      }
    };

    currentBoxes.forEach(applyEffect);
    if (currentBox) applyEffect(currentBox);
  };

  const getCanvasCoords = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !imgRef.current) return {x:0, y:0};
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const ratio = imgRef.current.width / canvas.width;
    
    return {
      x: (e.clientX - rect.left) * scaleX * ratio,
      y: (e.clientY - rect.top) * scaleY * ratio
    };
  };

  const handleMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!currentImg) return;
    const coords = getCanvasCoords(e);
    setStartPos(coords);
    setIsDrawing(true);
    setCurrentBox({ id: 'temp', x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentImg) return;
    const coords = getCanvasCoords(e);
    
    setCurrentBox({
      id: 'temp',
      x: Math.min(startPos.x, coords.x),
      y: Math.min(startPos.y, coords.y),
      w: Math.abs(coords.x - startPos.x),
      h: Math.abs(coords.y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.w > 10 && currentBox.h > 10) {
      setBoxes(prev => ({
        ...prev,
        [currentImg.id]: [...(prev[currentImg.id] || []), { ...currentBox, id: Math.random().toString(36).substring(7) }]
      }));
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const clearBoxes = () => {
    if (!currentImg) return;
    setBoxes(prev => ({ ...prev, [currentImg.id]: [] }));
  };

  const autoDetect = async () => {
    if (!currentImg || !imgRef.current) return;
    setIsDetecting(true);
    try {
      const img = imgRef.current;
      const allRawBoxes: { x: number; y: number; w: number; h: number; score: number }[] = [];

      // 1. Optional Native Shape Detection API (instant hardware-accelerated pass in Chromium)
      if (typeof window !== "undefined" && "FaceDetector" in window) {
        try {
          const nativeDetector = new (window as any).FaceDetector({
            fastMode: false,
            maxDetectedFaces: 100
          });
          const nativeFaces = await nativeDetector.detect(img);
          for (const face of nativeFaces) {
            const bb = face.boundingBox;
            if (bb && bb.width > 10 && bb.height > 10) {
              const padX = bb.width * 0.16;
              const padTop = bb.height * 0.28;
              const padBottom = bb.height * 0.16;
              const safeX = Math.max(0, bb.x - padX);
              const safeY = Math.max(0, bb.y - padTop);
              const safeW = Math.min(img.width - safeX, bb.width + padX * 2);
              const safeH = Math.min(img.height - safeY, bb.height + padTop + padBottom);
              allRawBoxes.push({ x: safeX, y: safeY, w: safeW, h: safeH, score: 0.9 });
            }
          }
        } catch (nativeErr) {
          // Native detector optional, continue with MediaPipe
        }
      }

      // 2. Load MediaPipe Tasks-Vision with Full-Range & GPU/CPU Resilience
      const { FilesetResolver, FaceDetector } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const FULL_RANGE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_full_range/float16/1/blaze_face_full_range.tflite";
      const SHORT_RANGE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

      let faceDetector: any = null;

      // Try full range model first (better for multiple people, distant faces, varying sizes)
      try {
        faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FULL_RANGE_MODEL, delegate: "GPU" },
          runningMode: "IMAGE",
          minDetectionConfidence: 0.32,
          minSuppressionThreshold: 0.3
        });
      } catch (err1) {
        try {
          faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: { modelAssetPath: FULL_RANGE_MODEL, delegate: "CPU" },
            runningMode: "IMAGE",
            minDetectionConfidence: 0.32,
            minSuppressionThreshold: 0.3
          });
        } catch (err2) {
          // Fallback to short range model
          try {
            faceDetector = await FaceDetector.createFromOptions(vision, {
              baseOptions: { modelAssetPath: SHORT_RANGE_MODEL, delegate: "GPU" },
              runningMode: "IMAGE",
              minDetectionConfidence: 0.32,
              minSuppressionThreshold: 0.3
            });
          } catch (err3) {
            faceDetector = await FaceDetector.createFromOptions(vision, {
              baseOptions: { modelAssetPath: SHORT_RANGE_MODEL, delegate: "CPU" },
              runningMode: "IMAGE",
              minDetectionConfidence: 0.32,
              minSuppressionThreshold: 0.3
            });
          }
        }
      }

      if (!faceDetector) {
        throw new Error("Unable to initialize face detector");
      }

      // Helper to process detections and apply natural head/hair/chin padding
      const extractDetections = (
        detections: any[],
        scaleX: number,
        scaleY: number,
        offsetX: number = 0,
        offsetY: number = 0,
        minConf: number = 0.3
      ) => {
        detections.forEach((d: any) => {
          const bb = d.boundingBox;
          if (!bb) return;
          const score = (d.categories && d.categories.length > 0) ? d.categories[0].score : 0.5;
          if (score < minConf) return;

          // Convert back to original image coordinates
          const origX = bb.originX * scaleX + offsetX;
          const origY = bb.originY * scaleY + offsetY;
          const origW = bb.width * scaleX;
          const origH = bb.height * scaleY;

          // Natural head padding (covers forehead, temples, hair, and jaw)
          const padX = origW * 0.16;
          const padTop = origH * 0.28;
          const padBottom = origH * 0.16;

          const safeX = Math.max(0, origX - padX);
          const safeY = Math.max(0, origY - padTop);
          const safeW = Math.min(img.width - safeX, origW + padX * 2);
          const safeH = Math.min(img.height - safeY, origH + padTop + padBottom);

          if (safeW > 10 && safeH > 10) {
            allRawBoxes.push({ x: safeX, y: safeY, w: safeW, h: safeH, score });
          }
        });
      };

      // Helper to calculate Intersection over Union (IoU)
      const calculateIoU = (
        box1: { x: number; y: number; w: number; h: number },
        box2: { x: number; y: number; w: number; h: number }
      ) => {
        const xA = Math.max(box1.x, box2.x);
        const yA = Math.max(box1.y, box2.y);
        const xB = Math.min(box1.x + box1.w, box2.x + box2.w);
        const yB = Math.min(box1.y + box1.h, box2.y + box2.h);
        const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
        const box1Area = box1.w * box1.h;
        const box2Area = box2.w * box2.h;
        return interArea / (box1Area + box2Area - interArea);
      };

      // Branch 1: Contact Sheet Metadata Scan
      if (currentImg.csMeta && currentImg.csMeta.isContactSheet && currentImg.csMeta.cells) {
        const cells = currentImg.csMeta.cells;
        const cellCanvas = document.createElement("canvas");
        const cellCtx = cellCanvas.getContext("2d");
        if (cellCtx) {
          for (const cell of cells) {
            cellCanvas.width = cell.width;
            cellCanvas.height = cell.height;
            cellCtx.clearRect(0, 0, cell.width, cell.height);
            cellCtx.drawImage(img, cell.x, cell.y, cell.width, cell.height, 0, 0, cell.width, cell.height);
            const res = faceDetector.detect(cellCanvas);
            extractDetections(res.detections, 1, 1, cell.x, cell.y, 0.45);
          }
        }
      } else {
        // Branch 2: General Image — Multi-Scale Pyramid + Edge-Safe Tiling

        // Pass A: Primary Global Scale (catches medium & large close-up faces)
        const primaryMaxDim = 1024;
        const primaryRatio = Math.min(1, primaryMaxDim / Math.max(img.width, img.height));
        const canvasA = document.createElement("canvas");
        canvasA.width = Math.round(img.width * primaryRatio);
        canvasA.height = Math.round(img.height * primaryRatio);
        const ctxA = canvasA.getContext("2d");
        if (ctxA) {
          ctxA.drawImage(img, 0, 0, canvasA.width, canvasA.height);
          const resA = faceDetector.detect(canvasA);
          extractDetections(resA.detections, 1 / primaryRatio, 1 / primaryRatio, 0, 0, 0.32);
        }

        // Pass B: High-Res Fine Scale (catches small-to-medium faces across the frame)
        if (Math.max(img.width, img.height) > 1200) {
          const fineMaxDim = 1600;
          const fineRatio = Math.min(1, fineMaxDim / Math.max(img.width, img.height));
          const canvasB = document.createElement("canvas");
          canvasB.width = Math.round(img.width * fineRatio);
          canvasB.height = Math.round(img.height * fineRatio);
          const ctxB = canvasB.getContext("2d");
          if (ctxB) {
            ctxB.drawImage(img, 0, 0, canvasB.width, canvasB.height);
            const resB = faceDetector.detect(canvasB);
            extractDetections(resB.detections, 1 / fineRatio, 1 / fineRatio, 0, 0, 0.32);
          }
        }

        // Pass C: Low-Res Boost (enhances small images < 700px)
        if (Math.max(img.width, img.height) < 700) {
          const boostRatio = 900 / Math.max(img.width, img.height);
          const canvasC = document.createElement("canvas");
          canvasC.width = Math.round(img.width * boostRatio);
          canvasC.height = Math.round(img.height * boostRatio);
          const ctxC = canvasC.getContext("2d");
          if (ctxC) {
            ctxC.drawImage(img, 0, 0, canvasC.width, canvasC.height);
            const resC = faceDetector.detect(canvasC);
            extractDetections(resC.detections, 1 / boostRatio, 1 / boostRatio, 0, 0, 0.3);
          }
        }

        // Pass D: Edge-Safe Overlapping Tiling (for large crowd/group photos with small faces)
        if (img.width > 900 || img.height > 900) {
          const tileSize = Math.min(800, Math.max(480, Math.floor(Math.min(img.width, img.height) * 0.6)));
          const step = Math.floor(tileSize * 0.55);

          const xCoords: number[] = [];
          for (let x = 0; x < img.width; x += step) {
            const safeX = Math.min(x, Math.max(0, img.width - tileSize));
            if (!xCoords.includes(safeX)) xCoords.push(safeX);
            if (x + tileSize >= img.width) break;
          }
          const yCoords: number[] = [];
          for (let y = 0; y < img.height; y += step) {
            const safeY = Math.min(y, Math.max(0, img.height - tileSize));
            if (!yCoords.includes(safeY)) yCoords.push(safeY);
            if (y + tileSize >= img.height) break;
          }

          const tileCanvas = document.createElement("canvas");
          tileCanvas.width = tileSize;
          tileCanvas.height = tileSize;
          const tileCtx = tileCanvas.getContext("2d");

          if (tileCtx) {
            for (const ty of yCoords) {
              for (const tx of xCoords) {
                const sW = Math.min(tileSize, img.width - tx);
                const sH = Math.min(tileSize, img.height - ty);
                tileCtx.clearRect(0, 0, tileSize, tileSize);
                tileCtx.drawImage(img, tx, ty, sW, sH, 0, 0, sW, sH);

                const resTile = faceDetector.detect(tileCanvas);
                extractDetections(resTile.detections, 1, 1, tx, ty, 0.35);
              }
            }
          }
        }
      }

      // 3. Robust Non-Maximum Suppression (NMS) & Cluster Fusion
      // Sort by confidence score (highest first)
      allRawBoxes.sort((a, b) => b.score - a.score);

      const clusters: { x: number; y: number; w: number; h: number; score: number }[][] = [];

      for (const box of allRawBoxes) {
        // Discard impossible oversized boxes (> 92% of whole image)
        if (box.w > img.width * 0.92 && box.h > img.height * 0.92) continue;

        let matchedCluster: { x: number; y: number; w: number; h: number; score: number }[] | null = null;

        for (const cluster of clusters) {
          const primary = cluster[0];
          const iou = calculateIoU(box, primary);

          // Center distance check to merge matching detections with slight boundary variance
          const boxCenterX = box.x + box.w / 2;
          const boxCenterY = box.y + box.h / 2;
          const primCenterX = primary.x + primary.w / 2;
          const primCenterY = primary.y + primary.h / 2;

          const centerDistX = Math.abs(boxCenterX - primCenterX);
          const centerDistY = Math.abs(boxCenterY - primCenterY);
          const avgW = (box.w + primary.w) / 2;
          const avgH = (box.h + primary.h) / 2;
          const isSameFaceCenter = centerDistX < avgW * 0.42 && centerDistY < avgH * 0.42;

          if (iou > 0.38 || (iou > 0.22 && isSameFaceCenter)) {
            matchedCluster = cluster;
            break;
          }
        }

        if (matchedCluster) {
          matchedCluster.push(box);
        } else {
          clusters.push([box]);
        }
      }

      // Compute final clean boxes from clusters
      const finalBoxes: Box[] = clusters.map(cluster => {
        if (cluster.length === 1) {
          const b = cluster[0];
          const rx = Math.round(Math.max(0, b.x));
          const ry = Math.round(Math.max(0, b.y));
          const rw = Math.round(Math.min(img.width - rx, b.w));
          const rh = Math.round(Math.min(img.height - ry, b.h));
          return {
            id: Math.random().toString(36).substring(7),
            x: rx,
            y: ry,
            w: rw,
            h: rh
          };
        }

        // Blend highest-confidence box with cluster union to prevent box bloating
        const primary = cluster[0];
        const minX = Math.min(...cluster.map(b => b.x));
        const minY = Math.min(...cluster.map(b => b.y));
        const maxX = Math.max(...cluster.map(b => b.x + b.w));
        const maxY = Math.max(...cluster.map(b => b.y + b.h));

        const blendX = primary.x * 0.4 + minX * 0.6;
        const blendY = primary.y * 0.4 + minY * 0.6;
        const blendR = (primary.x + primary.w) * 0.4 + maxX * 0.6;
        const blendB = (primary.y + primary.h) * 0.4 + maxY * 0.6;

        const finalX = Math.max(0, blendX);
        const finalY = Math.max(0, blendY);
        const finalW = Math.min(img.width - finalX, blendR - blendX);
        const finalH = Math.min(img.height - finalY, blendB - blendY);

        return {
          id: Math.random().toString(36).substring(7),
          x: Math.round(finalX),
          y: Math.round(finalY),
          w: Math.round(finalW),
          h: Math.round(finalH)
        };
      });

      if (finalBoxes.length > 0) {
        setBoxes(prev => ({
          ...prev,
          [currentImg.id]: [...(prev[currentImg.id] || []), ...finalBoxes]
        }));
      } else {
        alert("No faces detected. You can draw manual boxes.");
      }
    } catch (err) {
      console.error(err);
      alert("Auto-detect failed. Please draw boxes manually.");
    }
    setIsDetecting(false);
  };

  const generateFinal = async (imgData: ImgFile): Promise<{blob: Blob, name: string}> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    
    const img = new Image();
    img.src = imgData.url;
    await new Promise(r => img.onload = r);
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const bxs = boxes[imgData.id] || [];
    
    bxs.forEach(box => {
      const region = ctx.getImageData(box.x, box.y, box.w, box.h);
      if (blurMode === "pixelate") {
        const pSize = Math.max(5, Math.floor(strength / 2));
        for (let y = 0; y < box.h; y += pSize) {
          for (let x = 0; x < box.w; x += pSize) {
            const i = (y * Math.floor(box.w) + x) * 4;
            ctx.fillStyle = `rgb(${region.data[i]},${region.data[i+1]},${region.data[i+2]})`;
            ctx.fillRect(box.x + x, box.y + y, pSize, pSize);
          }
        }
      } else {
        ctx.save();
        // CLIP strictly to the detected face region for the final export
        ctx.beginPath();
        ctx.rect(box.x, box.y, box.w, box.h);
        ctx.clip();
        
        ctx.filter = `blur(${strength}px)`;
        
        // Draw a slightly larger source area to ensure edges blend with surrounding pixels
        const margin = strength;
        const sx = Math.max(0, box.x - margin);
        const sy = Math.max(0, box.y - margin);
        const sw = Math.min(canvas.width - sx, box.w + margin * 2);
        const sh = Math.min(canvas.height - sy, box.h + margin * 2);
        
        ctx.drawImage(canvas, sx, sy, sw, sh, sx, sy, sw, sh);
        ctx.restore();
      }
    });

    let mime = "image/jpeg";
    if (imgData.ext.toLowerCase() === "png") mime = "image/png";
    else if (imgData.ext.toLowerCase() === "webp") mime = "image/webp";

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob: blob!,
          name: `${imgData.name}-blurred.${imgData.ext}`
        });
      }, mime, 0.95);
    });
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    for (let i = 0; i < images.length; i++) {
      if ((boxes[images[i].id] || []).length > 0) {
        const res = await generateFinal(images[i]);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.blob);
        a.download = getGrotonExportFilename(res.name);
        a.click();
        URL.revokeObjectURL(a.href);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    let count = 0;
    for (let i = 0; i < images.length; i++) {
      if ((boxes[images[i].id] || []).length > 0) {
        const res = await generateFinal(images[i]);
        zip.file(getGrotonExportFilename(res.name), res.blob);
        count++;
      }
    }
    if (count > 0) {
      const content = await zip.generateAsync({type: "blob"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = getGrotonExportFilename(`blurred_images.zip`);
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      alert("No images have blur boxes applied.");
    }
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Face Blur" description="Automatically detect and blur faces, or manually select areas to censor.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} />
          ) : (
            <div className="w-full bg-zinc-200 relative flex flex-col items-center justify-center border border-zinc-200">
              <div className="relative cursor-crosshair">
                <canvas 
                  ref={displayCanvasRef} 
                  onPointerDown={handleMouseDown}
                  onPointerMove={handleMouseMove}
                  onPointerUp={handleMouseUp}
                  onPointerLeave={handleMouseUp}
                  className="max-w-full max-h-[60vh] object-contain block shadow-lg select-none" 
                />
              </div>
              
              {images.length > 1 && (
                <div className="w-full bg-white p-4 flex gap-2 overflow-x-auto border-t border-zinc-200">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setPreviewIndex(i)} className={`relative h-16 w-16 shrink-0 border-2 transition-colors ${previewIndex === i ? 'border-[#111111]' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <img src={img.url} className="w-full h-full max-h-[70vh] object-cover" />
                      {(boxes[img.id]?.length > 0) && <span className="absolute top-1 right-1 w-2 h-2 bg-[#111111] rounded-full shadow"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 border border-zinc-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Detection</label>
              <button disabled={isDetecting || !currentImg} onClick={autoDetect} className="w-full py-3 bg-zinc-100 text-black text-xs uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {isDetecting ? 'Detecting...' : 'Auto Detect Faces'}
              </button>
              <p className="text-[9px] text-zinc-400 mt-1 italic">Or draw rectangles directly on the image for manual blur.</p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Effect Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setBlurMode("blur")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${blurMode === "blur" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111] hover:text-black'}`}>Blur</button>
                <button onClick={() => setBlurMode("pixelate")} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${blurMode === "pixelate" ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111] hover:text-black'}`}>Pixelate</button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 flex justify-between">
                <span>Strength</span> <span>{strength}</span>
              </label>
              <input type="range" min="1" max="100" value={strength} onChange={e => setStrength(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
            </div>

            <div className="h-px w-full bg-zinc-200 my-2"></div>

            {images.length > 0 && (
              <>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-zinc-500 font-light">Faces in view</span>
                  <span className="font-bold tracking-wider text-[11px]">{currentBoxes.length}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={clearBoxes} className="w-full py-2 border border-zinc-300 text-zinc-600 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors">
                    Clear Current Boxes
                  </button>
                  <button disabled={isProcessing} onClick={downloadZip} className="w-full py-4 mt-2 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:bg-zinc-300">
                    {isProcessing ? 'Processing...' : 'Download ZIP'}
                  </button>
                  <button disabled={isProcessing} onClick={downloadAll} className="w-full py-4 bg-transparent border border-[#111111] text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:border-zinc-300">
                    Download All
                  </button>
                </div>
                <button onClick={reset} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors">
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
