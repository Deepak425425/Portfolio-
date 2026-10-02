"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function VideoCompressPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ width: number, height: number, duration: number }>({ width: 0, height: 0, duration: 0 });
  
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium"); // medium = CRF 28, low = CRF 35, high = CRF 23
  const [resolution, setResolution] = useState<"original" | "1080p" | "720p" | "480p">("original");
  const [fps, setFps] = useState<"original" | "30" | "24">("original");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    const loadFfmpeg = async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
      ffmpegRef.current = ffmpeg;
    };
    loadFfmpeg();
  }, []);

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
    setCompressedBlob(null);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl(null);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    setVideoMeta({
      width: target.videoWidth,
      height: target.videoHeight,
      duration: target.duration
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setIsProcessing(false);
    setProgress(0);
  };

  const compressVideo = async () => {
    if (!videoFile || !ffmpegRef.current) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText("Initializing Engine...");

    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        await ffmpeg.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        });
      }

      setStatusText("Reading File...");
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

      const args = ["-i", "input.mp4"];

      // Video Filters
      const vf = [];
      if (resolution === "1080p") vf.push("scale=-2:1080");
      if (resolution === "720p") vf.push("scale=-2:720");
      if (resolution === "480p") vf.push("scale=-2:480");
      if (fps !== "original") vf.push(`fps=${fps}`);

      if (vf.length > 0) {
        args.push("-vf", vf.join(","));
      }

      // Quality settings (CRF)
      let crf = "28"; // medium
      if (quality === "low") crf = "35"; // max compression, lower quality
      if (quality === "high") crf = "23"; // high quality, less compression

      args.push("-c:v", "libx264");
      args.push("-preset", "ultrafast"); // fastest encoding
      args.push("-crf", crf);
      args.push("-c:a", "aac");
      args.push("-b:a", "128k");
      args.push("output.mp4");

      setStatusText("Compressing (this may take a while)...");
      await ffmpeg.exec(args);

      setStatusText("Finalizing...");
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as any], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setCompressedBlob(blob);
      setCompressedUrl(url);

    } catch (error) {
      console.error(error);
      alert("Compression failed. The file might be too large for browser memory, or the format is unsupported.");
    } finally {
      setIsProcessing(false);
      setStatusText("");
    }
  };

  const downloadCompressed = () => {
    if (!compressedUrl || !videoFile) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    
    // Change extension to mp4 for output
    const lastDotIndex = videoFile.name.lastIndexOf(".");
    const baseName = lastDotIndex === -1 ? videoFile.name : videoFile.name.substring(0, lastDotIndex);
    
    a.download = getGrotonExportFilename(`${baseName}.mp4`);
    a.click();
  };

  const estimateRatio = () => {
    let ratio = 1.0;
    if (quality === "low") ratio *= 0.3;
    else if (quality === "medium") ratio *= 0.5;
    else ratio *= 0.8;

    if (resolution === "1080p" && videoMeta.height > 1080) ratio *= 0.7;
    if (resolution === "720p" && videoMeta.height > 720) ratio *= 0.5;
    if (resolution === "480p") ratio *= 0.3;

    if (fps !== "original") ratio *= 0.8;

    return Math.max(0.1, ratio);
  };

  return (
    <ToolLayout title="Video Compress" description="Compress video file size locally in your browser. No server uploads.">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 -mt-4">
        
        {!videoUrl ? (
          <div className="mt-12">
            <UploadDropzone onUpload={handleUpload} multiple={false} accept="video/*" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: SETTINGS */}
            <div className="lg:col-span-1 flex flex-col gap-6 bg-white p-6 border border-zinc-200 shadow-sm rounded-2xl h-fit">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">Compression Settings</h2>
                <button onClick={resetAll} className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black">Reset</button>
              </div>

              {!compressedUrl ? (
                <>
                  {/* Quality */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Compression Strength</label>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setQuality("high")} className={`p-3 border text-left text-xs transition-colors rounded-xl flex items-center justify-between ${quality === "high" ? 'border-[#111] ring-1 ring-[#111] bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                        <span className="font-bold">Light (High Quality)</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">CRF 23</span>
                      </button>
                      <button onClick={() => setQuality("medium")} className={`p-3 border text-left text-xs transition-colors rounded-xl flex items-center justify-between ${quality === "medium" ? 'border-[#111] ring-1 ring-[#111] bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                        <span className="font-bold">Balanced</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">CRF 28</span>
                      </button>
                      <button onClick={() => setQuality("low")} className={`p-3 border text-left text-xs transition-colors rounded-xl flex items-center justify-between ${quality === "low" ? 'border-[#111] ring-1 ring-[#111] bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                        <span className="font-bold">Maximum Compression</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">CRF 35</span>
                      </button>
                    </div>
                  </div>

                  {/* Resolution */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Output Resolution</label>
                    <select 
                      value={resolution} 
                      onChange={(e) => setResolution(e.target.value as any)}
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-[#111]"
                    >
                      <option value="original">Original ({videoMeta.width && videoMeta.height ? `${videoMeta.width}x${videoMeta.height}` : 'Unknown'})</option>
                      <option value="1080p">1080p (FHD)</option>
                      <option value="720p">720p (HD)</option>
                      <option value="480p">480p (SD)</option>
                    </select>
                  </div>

                  {/* FPS */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Frame Rate</label>
                    <select 
                      value={fps} 
                      onChange={(e) => setFps(e.target.value as any)}
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-[#111]"
                    >
                      <option value="original">Original</option>
                      <option value="30">30 FPS</option>
                      <option value="24">24 FPS</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <div className="mb-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Estimated Output</span>
                      <span className="text-sm font-bold text-black">~{formatSize((videoFile?.size || 0) * estimateRatio())}</span>
                    </div>
                    
                    <button 
                      onClick={compressVideo} 
                      disabled={isProcessing}
                      className="w-full py-4 bg-[#8B7CFF] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-[#7264ed] shadow-sm transition-colors disabled:opacity-50 relative overflow-hidden"
                    >
                      {isProcessing ? 'Processing...' : 'Compress Video'}
                      {isProcessing && (
                         <div className="absolute inset-0 bg-white/20" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
                      )}
                    </button>
                    {isProcessing && (
                       <div className="text-center mt-3 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                         {statusText} ({progress}%)
                       </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-6">
                   <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex flex-col gap-2">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-green-700">Compression Complete</span>
                     <div className="flex items-end gap-2">
                       <span className="text-2xl font-bold text-black">{formatSize(compressedBlob?.size || 0)}</span>
                       <span className="text-xs font-bold text-green-600 mb-1">
                         (-{Math.max(0, Math.round((1 - ((compressedBlob?.size || 0) / (videoFile?.size || 1))) * 100))}%)
                       </span>
                     </div>
                   </div>

                   <button 
                      onClick={downloadCompressed} 
                      className="w-full py-4 bg-[#111111] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-[#222222] shadow-sm transition-colors"
                    >
                      Download MP4
                    </button>
                    
                    <button 
                      onClick={resetAll}
                      className="w-full py-3 bg-white text-black border border-zinc-200 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-50 transition-colors"
                    >
                      Compress Another
                    </button>
                </div>
              )}
            </div>

            {/* RIGHT: PREVIEW AREA */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {!compressedUrl ? (
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                    <div className="flex items-center gap-2 overflow-hidden pr-4">
                       <span className="w-2 h-2 rounded-full bg-[#8B7CFF]"></span>
                       <span className="text-xs font-bold truncate">{videoFile?.name}</span>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 whitespace-nowrap">{formatSize(videoFile?.size || 0)}</span>
                  </div>
                  <div className="relative bg-[#111] flex items-center justify-center" style={{ height: "60vh" }}>
                    <video 
                      src={videoUrl} 
                      className="w-full h-full object-contain" 
                      controls
                      onLoadedMetadata={handleLoadedMetadata}
                    />
                  </div>
                  <div className="p-4 bg-zinc-50 grid grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Duration</span>
                      <span className="text-xs font-mono font-bold">{formatDuration(videoMeta.duration)}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Resolution</span>
                      <span className="text-xs font-mono font-bold">{videoMeta.width} x {videoMeta.height}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Original Size</span>
                      <span className="text-xs font-mono font-bold">{formatSize(videoFile?.size || 0)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col ring-2 ring-[#8B7CFF]">
                  <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                    <div className="flex items-center gap-2 overflow-hidden pr-4">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                       <span className="text-xs font-bold truncate">Compressed: {videoFile?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-mono tracking-widest text-zinc-400 line-through mr-1">{formatSize(videoFile?.size || 0)}</span>
                       <span className="text-[10px] font-mono tracking-widest text-green-600 font-bold whitespace-nowrap">{formatSize(compressedBlob?.size || 0)}</span>
                    </div>
                  </div>
                  <div className="relative bg-[#111] flex items-center justify-center" style={{ height: "60vh" }}>
                    <video 
                      src={compressedUrl} 
                      className="w-full h-full object-contain" 
                      controls
                      autoPlay
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
