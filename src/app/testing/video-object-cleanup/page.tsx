"use client";

import React, { useState, useRef, useEffect, MouseEvent } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
const MAX_INPUT_BYTES = 1024 * 1024 * 1024; // 1GB

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function VideoObjectCleanupPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selection, setSelection] = useState<Rect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Clean up ObjectURLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [videoUrl, processedUrl]);

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    if (file.size > MAX_INPUT_BYTES) {
      setError("Video is too large. Limit is 1GB.");
      return;
    }
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    setSelection(null);
    setStage("");
    setProgress(0);
    setError(null);
  };

  const handleReset = () => {
    setVideoFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setVideoUrl(null);
    setProcessedUrl(null);
    setSelection(null);
    setStage("");
    setProgress(0);
    setError(null);
  };

  // Convert client coordinates to intrinsic video coordinates
  const getIntrinsicCoords = (clientX: number, clientY: number) => {
    if (!videoRef.current || !containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // We scale based on actual video size vs displayed size
    // Using video.videoWidth and video.videoHeight
    const v = videoRef.current;
    if (!v.videoWidth) return null;
    
    // Calculate letterboxing/pillarboxing
    const containerRatio = rect.width / rect.height;
    const videoRatio = v.videoWidth / v.videoHeight;
    
    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;
    
    if (containerRatio > videoRatio) {
      // Pillarboxed (bars on sides)
      renderWidth = rect.height * videoRatio;
      offsetX = (rect.width - renderWidth) / 2;
    } else {
      // Letterboxed (bars on top/bottom)
      renderHeight = rect.width / videoRatio;
      offsetY = (rect.height - renderHeight) / 2;
    }
    
    // Check if click is inside the actual video area
    if (x < offsetX || x > offsetX + renderWidth || y < offsetY || y > offsetY + renderHeight) {
      return null;
    }
    
    // Map to intrinsic coords
    const intrinsicX = ((x - offsetX) / renderWidth) * v.videoWidth;
    const intrinsicY = ((y - offsetY) / renderHeight) * v.videoHeight;
    
    return { x: intrinsicX, y: intrinsicY };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (stage || processedUrl) return; // Don't draw while processing or done
    const coords = getIntrinsicCoords(e.clientX, e.clientY);
    if (!coords) return;
    setIsDrawing(true);
    setStartPoint(coords);
    setSelection({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint) return;
    const coords = getIntrinsicCoords(e.clientX, e.clientY);
    if (!coords) return;
    
    setSelection({
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      width: Math.abs(coords.x - startPoint.x),
      height: Math.abs(coords.y - startPoint.y)
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (selection && (selection.width < 10 || selection.height < 10)) {
      setSelection(null); // Too small, ignore
    }
  };

  // Draw the selection rect on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to match video intrinsic size for 1:1 drawing mapped via CSS
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (selection) {
      ctx.fillStyle = 'rgba(139, 124, 255, 0.3)';
      ctx.strokeStyle = '#8B7CFF';
      ctx.lineWidth = 4;
      ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    }
  }, [selection, videoUrl]);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) {
      return ffmpegRef.current;
    }
    setStage("Loading export engine...");
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    
    // Set up progress tracking
    ffmpeg.on('log', ({ message }) => {
      // Basic progress estimation from ffmpeg output
      // "frame=  123 fps=..."
      const frameMatch = message.match(/frame=\s*(\d+)/);
      if (frameMatch && frameMatch[1]) {
        setStage(`Processing frame ${frameMatch[1]}...`);
      }
    });

    ffmpeg.on('progress', ({ progress, time }) => {
       setProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: `${CORE_BASE}/ffmpeg-core.js`,
      wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`,
    });
    
    return ffmpeg;
  };

  const processVideo = async () => {
    if (!videoFile || !selection) return;
    
    setError(null);
    setProgress(0);
    
    try {
      const ffmpeg = await loadFFmpeg();
      
      setStage("Reading video...");
      
      const ext = (videoFile.name.split('.').pop() || 'mp4').toLowerCase();
      const inputName = `input.${ext}`;
      const outputName = `output.mp4`; // Always export MP4 for safety
      
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      
      setStage("Removing static object...");
      
      // Ensure selection is within bounds and integer
      const v = videoRef.current!;
      const x = Math.max(0, Math.floor(selection.x));
      const y = Math.max(0, Math.floor(selection.y));
      const w = Math.min(Math.floor(selection.width), v.videoWidth - x);
      const h = Math.min(Math.floor(selection.height), v.videoHeight - y);
      
      // FFmpeg delogo filter requires x, y, w, h
      const filter = `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`;
      
      // Run ffmpeg with filter and copy audio to preserve it
      // Note: Some formats might not support stream copy with mp4 container directly,
      // so we explicitly encode to aac for audio to be safe.
      await ffmpeg.exec([
        "-i", inputName,
        "-vf", filter,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "fast",
        "-crf", "23",
        outputName
      ]);
      
      setStage("Finalizing...");
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      
      setProcessedUrl(url);
      setStage("");
      
      // Cleanup FFmpeg FS
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      
    } catch (err: any) {
      console.error(err);
      setError("Processing failed: " + err.message);
      setStage("");
    }
  };

  return (
    <ToolLayout title="Video Object Cleanup" description="Remove unwanted objects, logos, text, and static overlays from video.">
      <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
        {!videoFile ? (
          <UploadDropzone
            onUpload={handleUpload}
            multiple={false}
            accept="video/*"
            formats={["MP4", "WEBM", "MOV"]}
            title="Upload Video"
          />
        ) : (
          <div className="flex flex-col gap-6">
            
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[rgba(0,0,0,0.05)] shadow-sm">
               <div className="flex flex-col">
                 <h2 className="font-bold text-sm text-black">{videoFile.name}</h2>
                 <p className="text-xs text-zinc-500">
                   {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                 </p>
               </div>
               <button 
                 onClick={handleReset}
                 className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg transition-colors"
               >
                 Clear Video
               </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}

            {!processedUrl ? (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Editor View */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400">1. Draw Selection</h3>
                    <p className="text-xs text-zinc-500">V1 supports static objects only.</p>
                  </div>
                  
                  <div 
                    ref={containerRef}
                    className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg cursor-crosshair group"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <video 
                      ref={videoRef}
                      src={videoUrl!} 
                      className="w-full h-full object-contain pointer-events-none"
                      controls={!isDrawing && !selection} // Hide controls while selecting to prevent hijacking clicks
                      onLoadedMetadata={(e) => {
                         // Force update to ensure canvas matches intrinsic size
                         setSelection(null); 
                      }}
                    />
                    <canvas 
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                    />
                    
                    {!selection && !isDrawing && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                         <div className="bg-black/50 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Click and drag to select unwanted object
                         </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Controls */}
                  {selection && !stage && (
                    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-[rgba(0,0,0,0.05)] shadow-sm">
                      <div className="flex justify-between text-xs text-zinc-500 font-mono">
                        <span>X: {Math.floor(selection.x)}</span>
                        <span>Y: {Math.floor(selection.y)}</span>
                        <span>W: {Math.floor(selection.width)}</span>
                        <span>H: {Math.floor(selection.height)}</span>
                      </div>
                      
                      <div className="flex gap-4">
                         <button 
                           onClick={() => setSelection(null)}
                           className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
                         >
                           Clear
                         </button>
                         <button 
                           onClick={processVideo}
                           className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#8B7CFF] hover:bg-[#7a6ce0] rounded-lg transition-colors shadow-sm"
                         >
                           Remove Object
                         </button>
                      </div>
                    </div>
                  )}

                  {stage && (
                    <div className="flex flex-col gap-2 bg-white p-6 rounded-xl border border-[rgba(0,0,0,0.05)] shadow-sm">
                       <h3 className="text-xs uppercase tracking-widest font-bold text-[#8B7CFF] animate-pulse">Processing</h3>
                       <p className="text-sm text-zinc-600">{stage}</p>
                       <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mt-2">
                         <div 
                           className="h-full bg-[#8B7CFF] transition-all duration-300 ease-out" 
                           style={{ width: `${Math.max(5, progress)}%` }} 
                         />
                       </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-green-500">2. Result</h3>
                 </div>
                 
                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    <video 
                      src={processedUrl} 
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                 </div>
                 
                 <div className="flex gap-4 max-w-sm mx-auto w-full">
                    <a 
                      href={processedUrl}
                      download={`cleanup_${videoFile.name}.mp4`}
                      className="flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-zinc-800 rounded-lg transition-colors shadow-sm block"
                    >
                      Download Video
                    </a>
                 </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
