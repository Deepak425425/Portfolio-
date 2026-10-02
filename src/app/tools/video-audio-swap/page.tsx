"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function VideoAudioSwapPage() {
  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ duration: number; size: number; width: number; height: number }>({ duration: 0, size: 0, width: 0, height: 0 });

  // Audio State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMeta, setAudioMeta] = useState<{ duration: number; size: number }>({ duration: 0, size: 0 });

  // Controls
  const [keepOriginal, setKeepOriginal] = useState(false);
  const [useReplacement, setUseReplacement] = useState(true);
  const [originalVol, setOriginalVol] = useState(100);
  const [newVol, setNewVol] = useState(100);
  const [audioStart, setAudioStart] = useState(0);
  const [loopAudio, setLoopAudio] = useState(true);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  // Output
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  
  // Real-time Preview refs
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadFfmpeg = async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => setProgress(Math.max(0, Math.min(100, Math.round(progress * 100)))));
      ffmpegRef.current = ffmpeg;
    };
    loadFfmpeg();
  }, []);

  const handleVideoUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
    resetOutput();
  };

  const handleAudioUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioFile(file);
    resetOutput();
  };

  const resetOutput = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setOutputBlob(null);
    setIsProcessing(false);
    setProgress(0);
  };

  const handleVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    setVideoMeta({
      width: target.videoWidth,
      height: target.videoHeight,
      duration: target.duration,
      size: videoFile?.size || 0
    });
    // Try to sync preview volumes
    if (keepOriginal) target.volume = originalVol / 100;
    else target.volume = 0;
  };

  const handleAudioLoaded = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = e.target as HTMLAudioElement;
    setAudioMeta({
      duration: target.duration,
      size: audioFile?.size || 0
    });
  };

  // Sync preview playback
  const handlePreviewPlay = () => {
    if (previewAudioRef.current && useReplacement) {
      previewAudioRef.current.currentTime = Math.max(0, (previewVideoRef.current?.currentTime || 0) - audioStart);
      previewAudioRef.current.play().catch(e => console.error("Audio play blocked", e));
    }
  };

  const handlePreviewPause = () => {
    if (previewAudioRef.current) previewAudioRef.current.pause();
  };
  
  const handlePreviewSeek = () => {
    if (previewAudioRef.current && useReplacement && previewVideoRef.current) {
      let t = previewVideoRef.current.currentTime - audioStart;
      if (t < 0) t = 0;
      if (loopAudio && audioMeta.duration > 0) {
         t = t % audioMeta.duration;
      }
      previewAudioRef.current.currentTime = t;
    }
  };

  useEffect(() => {
    if (previewVideoRef.current) {
       previewVideoRef.current.volume = keepOriginal ? (originalVol / 100) : 0;
    }
    if (previewAudioRef.current) {
       previewAudioRef.current.volume = useReplacement ? (newVol / 100) : 0;
    }
  }, [keepOriginal, useReplacement, originalVol, newVol]);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const processVideo = async () => {
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

      setStatusText("Reading Video...");
      await ffmpeg.writeFile("input_video.mp4", await fetchFile(videoFile));

      if (useReplacement && audioFile) {
        setStatusText("Reading Audio...");
        await ffmpeg.writeFile("input_audio.tmp", await fetchFile(audioFile));
      }

      setStatusText("Analyzing Streams...");
      
      // Check if original video has audio
      let hasOriginalAudio = true;
      try {
        await ffmpeg.exec(["-i", "input_video.mp4", "-vn", "-sn", "-c:a", "copy", "-t", "1", "check.aac"]);
        const checkData = await ffmpeg.readFile("check.aac");
        if ((checkData as Uint8Array).length === 0) hasOriginalAudio = false;
      } catch {
        hasOriginalAudio = false;
      }

      setStatusText("Processing Media...");
      
      const args = [];
      args.push("-i", "input_video.mp4");

      if (useReplacement && audioFile) {
          if (loopAudio) {
              args.push("-stream_loop", "-1");
          }
          args.push("-i", "input_audio.tmp");
      }

      let complexFilter = "";
      const maps = ["-map", "0:v:0"];
      const actualKeepOriginal = keepOriginal && hasOriginalAudio;

      if (actualKeepOriginal && useReplacement && audioFile) {
          complexFilter = `[0:a]volume=${originalVol/100}[a1]; `;
          const delayMs = Math.round(audioStart * 1000);
          complexFilter += `[1:a]adelay=${delayMs}|${delayMs},volume=${newVol/100}[a2]; `;
          complexFilter += `[a1][a2]amix=inputs=2:duration=first:dropout_transition=0[aout]`;
          maps.push("-map", "[aout]");
      } else if (actualKeepOriginal && (!useReplacement || !audioFile)) {
          complexFilter = `[0:a]volume=${originalVol/100}[aout]`;
          maps.push("-map", "[aout]");
      } else if (!actualKeepOriginal && useReplacement && audioFile) {
          const delayMs = Math.round(audioStart * 1000);
          complexFilter = `[1:a]adelay=${delayMs}|${delayMs},volume=${newVol/100}[aout]`;
          maps.push("-map", "[aout]");
      }

      if (complexFilter) {
          args.push("-filter_complex", complexFilter);
      }

      args.push(...maps);

      // Force output duration to match video duration
      args.push("-t", videoMeta.duration.toString());

      // Copy video stream to preserve quality and process instantly
      args.push("-c:v", "copy");
      
      // Re-encode audio to aac for compatibility
      if (complexFilter || (!actualKeepOriginal && useReplacement && audioFile)) {
         args.push("-c:a", "aac");
         args.push("-b:a", "192k");
      }

      args.push("-y");
      args.push("output.mp4");

      setStatusText("Generating Output...");
      
      await ffmpeg.exec(args);

      setStatusText("Finalizing...");
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as any], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setOutputBlob(blob);
      setOutputUrl(url);

    } catch (error) {
      console.error(error);
      alert("Export failed. The browser might have run out of memory or encountered an unsupported format.");
    } finally {
      setIsProcessing(false);
      setStatusText("");
    }
  };

  const downloadExport = () => {
    if (!outputUrl || !videoFile) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    
    const lastDotIndex = videoFile.name.lastIndexOf(".");
    const baseName = lastDotIndex === -1 ? videoFile.name : videoFile.name.substring(0, lastDotIndex);
    
    a.download = getGrotonExportFilename(`${baseName}.mp4`);
    a.click();
  };

  return (
    <ToolLayout title="Video Audio Swap" description="Replace or mix video audio tracks entirely in your browser.">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 -mt-4">
        
        {/* TOP ROW: UPLOADERS & INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* VIDEO COLUMN */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">1. Video Source</h2>
              {!videoUrl ? (
                 <UploadDropzone 
                   onUpload={handleVideoUpload} 
                   multiple={false} 
                   accept="video/*" 
                   title="Drop your video here"
                   formats={["MP4", "WEBM", "MOV"]}
                   className="min-h-[16rem]"
                 />
              ) : (
                 <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                       <span className="text-xs font-bold truncate max-w-[70%]">{videoFile?.name}</span>
                       <button onClick={() => { setVideoUrl(null); setVideoFile(null); resetOutput(); }} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-red-500">Change</button>
                    </div>
                    <div className="bg-[#111] relative aspect-video flex items-center justify-center">
                       <video 
                         ref={previewVideoRef}
                         src={videoUrl} 
                         className="w-full h-full object-contain" 
                         controls={false}
                         onLoadedMetadata={handleVideoLoaded}
                         onPlay={handlePreviewPlay}
                         onPause={handlePreviewPause}
                         onSeeked={handlePreviewSeek}
                       />
                       {/* Overlay play button just for preview if needed, or rely on native controls */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {/* Could add custom play button here, but native controls are easier to keep in sync if we enable them. Let's enable them. */}
                       </div>
                    </div>
                    <div className="p-3 bg-zinc-50 grid grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 text-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Duration</span>
                        <span className="text-xs font-mono font-bold">{formatTime(videoMeta.duration)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Res</span>
                        <span className="text-xs font-mono font-bold">{videoMeta.width}x{videoMeta.height}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Size</span>
                        <span className="text-xs font-mono font-bold">{formatSize(videoFile?.size || 0)}</span>
                      </div>
                    </div>
                 </div>
              )}
           </div>

           {/* AUDIO COLUMN */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">2. Replacement Audio</h2>
              {!audioUrl ? (
                 <UploadDropzone 
                   onUpload={handleAudioUpload} 
                   multiple={false} 
                   accept="audio/*" 
                   title="Drop your audio here"
                   formats={["MP3", "WAV", "M4A", "OGG"]}
                   className="min-h-[16rem]"
                 />
              ) : (
                 <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                    <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                       <span className="text-xs font-bold truncate max-w-[70%] text-[#8B7CFF]">{audioFile?.name}</span>
                       <button onClick={() => { setAudioUrl(null); setAudioFile(null); resetOutput(); }} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-red-500">Change</button>
                    </div>
                    <div className="flex-1 bg-zinc-50 flex flex-col items-center justify-center p-6 gap-6">
                       <div className="w-16 h-16 rounded-full bg-[#8B7CFF]/10 flex items-center justify-center text-[#8B7CFF] text-2xl">
                          🎵
                       </div>
                       <audio 
                         ref={previewAudioRef}
                         src={audioUrl} 
                         className="w-full max-w-sm"
                         controls 
                         onLoadedMetadata={handleAudioLoaded}
                         loop={loopAudio}
                       />
                       <div className="flex items-center gap-6 text-center">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Duration</span>
                            <span className="text-sm font-mono font-bold">{formatTime(audioMeta.duration)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Size</span>
                            <span className="text-sm font-mono font-bold">{formatSize(audioFile?.size || 0)}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
           </div>

        </div>

        {/* MIDDLE ROW: CONTROLS */}
        {(videoUrl || audioUrl) && !outputUrl && (
           <div className="bg-white p-6 md:p-8 border border-zinc-200 rounded-2xl shadow-sm flex flex-col gap-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">3. Audio Controls</h2>
                 <button 
                   onClick={() => {
                     if(previewVideoRef.current) previewVideoRef.current.play();
                   }}
                   className="text-[10px] uppercase tracking-widest font-bold text-[#8B7CFF] hover:text-black border border-[#8B7CFF] hover:border-black px-4 py-1.5 rounded-full transition-colors"
                 >
                   Play Sync Preview
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 {/* Original Track Controls */}
                 <div className={`flex flex-col gap-6 ${!keepOriginal ? 'opacity-50' : ''} transition-opacity`}>
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-black">Original Video Audio</span>
                          <span className="text-[10px] text-zinc-500">Keep the sound from the uploaded video</span>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={keepOriginal} onChange={e => setKeepOriginal(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
                       </label>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                          <span>Volume</span>
                          <span>{originalVol}%</span>
                       </label>
                       <input 
                         type="range" min="0" max="200" value={originalVol} 
                         onChange={e => setOriginalVol(Number(e.target.value))} 
                         disabled={!keepOriginal}
                         className="w-full accent-black"
                       />
                    </div>
                 </div>

                 {/* Replacement Track Controls */}
                 <div className={`flex flex-col gap-6 ${!useReplacement || !audioUrl ? 'opacity-50' : ''} transition-opacity`}>
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#8B7CFF]">Replacement Audio</span>
                          <span className="text-[10px] text-zinc-500">Mix in the uploaded audio file</span>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={useReplacement} onChange={e => setUseReplacement(e.target.checked)} disabled={!audioUrl} className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B7CFF]"></div>
                       </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                             <span>Volume</span>
                             <span>{newVol}%</span>
                          </label>
                          <input 
                            type="range" min="0" max="200" value={newVol} 
                            onChange={e => setNewVol(Number(e.target.value))} 
                            disabled={!useReplacement || !audioUrl}
                            className="w-full accent-[#8B7CFF]"
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                             <span>Start Delay</span>
                             <span>{audioStart}s</span>
                          </label>
                          <input 
                            type="number" min="0" max={Math.max(0, videoMeta.duration)} step="0.1" value={audioStart} 
                            onChange={e => setAudioStart(Number(e.target.value))} 
                            disabled={!useReplacement || !audioUrl}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded p-1 text-xs outline-none"
                          />
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                       <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Loop Audio to fit Video</span>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={loopAudio} onChange={e => setLoopAudio(e.target.checked)} disabled={!useReplacement || !audioUrl} className="sr-only peer" />
                          <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#8B7CFF]"></div>
                       </label>
                    </div>
                 </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-4 pt-6 border-t border-zinc-100">
                 <button 
                   onClick={processVideo} 
                   disabled={isProcessing || !videoUrl || (!keepOriginal && (!useReplacement || !audioUrl))}
                   className="w-full py-4 bg-[#111111] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-[#222222] shadow-sm transition-colors disabled:opacity-50 relative overflow-hidden flex flex-col items-center justify-center gap-1"
                 >
                   <span>{isProcessing ? 'Processing Video...' : 'Export Video'}</span>
                   {isProcessing && (
                      <div className="absolute inset-0 bg-white/20" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
                   )}
                 </button>
                 {isProcessing && (
                    <div className="text-center mt-3 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                      {statusText} {progress > 0 && `(${progress}%)`}
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* BOTTOM ROW: OUTPUT */}
        {outputUrl && (
           <div className="bg-white p-6 md:p-8 border border-[#8B7CFF] rounded-2xl shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B7CFF] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-pulse"></span>
                    Export Complete
                 </h2>
                 <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-zinc-500 font-bold">
                    <span className="line-through">{formatSize(videoFile?.size || 0)}</span>
                    <span className="text-[#8B7CFF]">{formatSize(outputBlob?.size || 0)}</span>
                 </div>
              </div>

              <div className="bg-[#111] relative aspect-video flex items-center justify-center rounded-xl overflow-hidden border border-zinc-200">
                 <video 
                   src={outputUrl} 
                   className="w-full h-full object-contain" 
                   controls
                   autoPlay
                 />
              </div>

              <div className="flex gap-4">
                 <button 
                    onClick={downloadExport} 
                    className="flex-1 py-4 bg-[#8B7CFF] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-[#7264ed] shadow-sm transition-colors"
                  >
                    Download MP4
                  </button>
                  <button 
                    onClick={resetOutput}
                    className="py-4 px-8 bg-white text-black border border-zinc-200 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Start Over
                  </button>
              </div>
           </div>
        )}

      </div>
    </ToolLayout>
  );
}
