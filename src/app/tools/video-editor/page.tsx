"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

type Clip = {
  id: string;
  sourceStart: number;
  sourceEnd: number;
  duration: number;
};

type HistoryState = {
  clips: Clip[];
};

export default function VideoEditorPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalTime, setGlobalTime] = useState(0); 
  const [originalDuration, setOriginalDuration] = useState(0);

  // Editor State
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"none" | "crop" | "speed" | "adjust" | "transform" | "export">("none");
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Global Effects State (applied to whole timeline for V1 simplicity)
  const [cropType, setCropType] = useState<"original" | "16:9" | "9:16" | "1:1" | "4:5">("original");
  const [speed, setSpeed] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [volume, setVolume] = useState(100);
  const [timelineZoom, setTimelineZoom] = useState(1);

  // Export State
  const [exportRes, setExportRes] = useState<"original" | "1080p" | "720p">("original");
  const [exportQual, setExportQual] = useState<"standard" | "high">("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const rAFRef = useRef<number>(0);
  const playStateRef = useRef({ playing: false, clipIndex: 0 });

  const totalDuration = useMemo(() => clips.reduce((acc, c) => acc + c.duration, 0), [clips]);

  useEffect(() => {
    const loadFfmpeg = async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
      ffmpegRef.current = ffmpeg;
    };
    loadFfmpeg();
    return () => {
      cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  const saveHistory = (newClips: Clip[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push({ clips: JSON.parse(JSON.stringify(newClips)) });
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setClips(JSON.parse(JSON.stringify(history[historyIndex - 1].clips)));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setClips(JSON.parse(JSON.stringify(history[historyIndex + 1].clips)));
    }
  };

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
    setFileName(file.name);
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoFile(null);
    setIsPlaying(false);
    setGlobalTime(0);
    setClips([]);
    setSelectedClipId(null);
    setHistory([]);
    setHistoryIndex(-1);
    setActiveTab("none");
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && clips.length === 0) {
      const dur = videoRef.current.duration;
      setOriginalDuration(dur);
      const initialClip = { id: crypto.randomUUID(), sourceStart: 0, sourceEnd: dur, duration: dur };
      setClips([initialClip]);
      saveHistory([initialClip]);
    }
  };

  // Playback Loop for Multi-Clip
  useEffect(() => {
    if (!videoRef.current) return;
    
    const updatePlayhead = () => {
      if (!playStateRef.current.playing) return;
      
      const v = videoRef.current;
      if (!v) return;

      const currentSrcTime = v.currentTime;
      let { clipIndex } = playStateRef.current;

      if (clipIndex < clips.length) {
        const activeClip = clips[clipIndex];
        
        // If we surpassed this clip's end boundary
        if (currentSrcTime >= activeClip.sourceEnd) {
          clipIndex++;
          if (clipIndex < clips.length) {
            // Jump to next clip
            v.currentTime = clips[clipIndex].sourceStart;
            playStateRef.current.clipIndex = clipIndex;
          } else {
            // End of timeline
            v.pause();
            playStateRef.current.playing = false;
            setIsPlaying(false);
            setGlobalTime(totalDuration);
            return;
          }
        } else {
          // Calculate global time
          let t = 0;
          for (let i = 0; i < clipIndex; i++) t += clips[i].duration;
          t += (currentSrcTime - activeClip.sourceStart);
          setGlobalTime(t);
        }
      }
      rAFRef.current = requestAnimationFrame(updatePlayhead);
    };

    if (isPlaying) {
      playStateRef.current.playing = true;
      rAFRef.current = requestAnimationFrame(updatePlayhead);
    } else {
      playStateRef.current.playing = false;
      cancelAnimationFrame(rAFRef.current);
    }
  }, [isPlaying, clips, totalDuration]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (globalTime >= totalDuration) {
        seekGlobal(0);
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekGlobal = (time: number) => {
    if (!videoRef.current) return;
    let t = Math.max(0, Math.min(time, totalDuration));
    setGlobalTime(t);
    
    // Find which clip this time belongs to
    let acc = 0;
    for (let i = 0; i < clips.length; i++) {
      if (t >= acc && t <= acc + clips[i].duration) {
        const offsetInClip = t - acc;
        videoRef.current.currentTime = clips[i].sourceStart + offsetInClip;
        playStateRef.current.clipIndex = i;
        break;
      }
      acc += clips[i].duration;
    }
  };

  const splitClip = () => {
    if (globalTime === 0 || globalTime === totalDuration) return;

    let acc = 0;
    const newClips = [...clips];
    
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i];
      if (globalTime > acc && globalTime < acc + c.duration) {
        const splitPoint = c.sourceStart + (globalTime - acc);
        
        const clip1 = { ...c, id: crypto.randomUUID(), sourceEnd: splitPoint, duration: splitPoint - c.sourceStart };
        const clip2 = { ...c, id: crypto.randomUUID(), sourceStart: splitPoint, duration: c.sourceEnd - splitPoint };
        
        newClips.splice(i, 1, clip1, clip2);
        setClips(newClips);
        saveHistory(newClips);
        setSelectedClipId(clip2.id);
        break;
      }
      acc += c.duration;
    }
  };

  const deleteClip = () => {
    if (!selectedClipId || clips.length <= 1) return;
    const newClips = clips.filter(c => c.id !== selectedClipId);
    setClips(newClips);
    saveHistory(newClips);
    setSelectedClipId(null);
    seekGlobal(0);
  };

  const updateClipBounds = (clipId: string, newStart: number, newEnd: number) => {
    const newClips = clips.map(c => {
      if (c.id === clipId) {
        const start = Math.max(0, newStart);
        const end = Math.min(originalDuration, newEnd);
        return { ...c, sourceStart: start, sourceEnd: end, duration: end - start };
      }
      return c;
    });
    setClips(newClips);
  };

  const commitClipBounds = () => {
    saveHistory(clips);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10); // 1 decimal
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // EXPORT PIPELINE
  const exportVideo = async () => {
    if (!videoFile || !ffmpegRef.current) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText("Loading engine...");
    setActiveTab("export");

    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        await ffmpeg.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        });
      }

      setStatusText("Preparing video...");
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

      // Build filter complex
      // 1. Trimming & Concatenation
      let filterComplex = "";
      let concatV = "";
      let concatA = "";

      clips.forEach((c, i) => {
         filterComplex += `[0:v]trim=start=${c.sourceStart}:end=${c.sourceEnd},setpts=PTS-STARTPTS[v${i}]; `;
         filterComplex += `[0:a]atrim=start=${c.sourceStart}:end=${c.sourceEnd},asetpts=PTS-STARTPTS[a${i}]; `;
         concatV += `[v${i}]`;
         concatA += `[a${i}]`;
      });
      
      filterComplex += `${concatV}concat=n=${clips.length}:v=1:a=0[concatv]; `;
      filterComplex += `${concatA}concat=n=${clips.length}:v=0:a=1[concata]`;

      const args = ["-i", "input.mp4", "-filter_complex", filterComplex, "-map", "[concatv]", "-map", "[concata]"];
      
      // Global FX on the output? FFmpeg complex filters can chain, but for browser robustness, 
      // chaining all global fx directly inside the same complex graph is better.
      // To keep it simple, we will do a 2-pass if there are global fx, or combine them.
      // Combined approach:
      let outV = "concatv";
      let outA = "concata";

      const fxV = [];
      if (rotation === 90) fxV.push("transpose=1");
      if (rotation === 180) fxV.push("transpose=2,transpose=2");
      if (rotation === 270) fxV.push("transpose=2");
      if (flipH) fxV.push("hflip");
      if (flipV) fxV.push("vflip");
      if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
         fxV.push(`eq=brightness=${(brightness - 100)/100}:contrast=${contrast/100}:saturation=${saturation/100}`);
      }
      if (speed !== 1) fxV.push(`setpts=${1/speed}*PTS`);

      // Crops
      let targetRatio = 0;
      if (cropType === "16:9") targetRatio = 16/9;
      if (cropType === "9:16") targetRatio = 9/16;
      if (cropType === "1:1") targetRatio = 1;
      if (cropType === "4:5") targetRatio = 4/5;
      
      if (targetRatio > 0 && videoRef.current) {
         const w = videoRef.current.videoWidth;
         const h = videoRef.current.videoHeight;
         let newW = w, newH = h;
         if (w / h > targetRatio) newW = h * targetRatio;
         else newH = w / targetRatio;
         fxV.push(`crop=${newW}:${newH}`);
      }

      // Resolutions
      if (exportRes === "1080p") fxV.push("scale=-2:1080");
      if (exportRes === "720p") fxV.push("scale=-2:720");

      if (fxV.length > 0) {
         // Modify args to add second filter_complex step
         args.length = 0; // clear
         let fullComplex = filterComplex + `; [concatv]${fxV.join(',')}[finalv]`;
         
         const fxA = [];
         if (speed !== 1) fxA.push(`atempo=${Math.max(0.5, Math.min(100, speed))}`);
         if (volume !== 100) fxA.push(`volume=${volume/100}`);
         
         if (fxA.length > 0) {
            fullComplex += `; [concata]${fxA.join(',')}[finala]`;
            args.push("-i", "input.mp4", "-filter_complex", fullComplex, "-map", "[finalv]", "-map", "[finala]");
         } else {
            args.push("-i", "input.mp4", "-filter_complex", fullComplex, "-map", "[finalv]", "-map", "[concata]");
         }
      }

      args.push("-c:v", "libx264");
      args.push("-preset", "ultrafast"); 
      args.push("-crf", exportQual === "high" ? "18" : "28");
      args.push("-c:a", "aac");
      args.push("output.mp4");

      setStatusText("Rendering Timeline...");
      await ffmpeg.exec(args);

      setStatusText("Finalizing...");
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as any], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = getGrotonExportFilename("edited-video.mp4");
      a.click();
      URL.revokeObjectURL(url);
      setActiveTab("none");
      
    } catch (e) {
      console.error(e);
      alert("Export failed. File may be too large or browser ran out of memory.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPreviewStyle = () => ({
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
  });

  const getCropAspect = () => {
    switch (cropType) {
      case "16:9": return "aspect-video";
      case "9:16": return "aspect-[9/16]";
      case "1:1": return "aspect-square";
      case "4:5": return "aspect-[4/5]";
      default: return "";
    }
  };

  return (
    <ToolLayout title="Video Editor" description="Simple browser-based video editing workspace.">
      <div className="w-full flex flex-col gap-6 -mt-4">
        {!videoUrl ? (
          <div className="w-full max-w-xl mx-auto mt-20">
            <UploadDropzone onUpload={handleUpload} multiple={false} accept="video/*" />
          </div>
        ) : (
          <div className="flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* TOP WORKSPACE: PREVIEW */}
            <div className="w-full bg-[#111] flex flex-col items-center justify-center p-4 relative" style={{ height: "60vh" }}>
              <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${getCropAspect()}`}>
                 <video 
                   ref={videoRef}
                   src={videoUrl}
                   className="w-full h-full object-contain"
                   style={getPreviewStyle()}
                   onLoadedMetadata={handleLoadedMetadata}
                   onClick={togglePlay}
                   playsInline
                 />
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 text-white">
                  <div className="text-sm font-bold uppercase tracking-[0.2em]">{statusText}</div>
                  <div className="w-64 h-1 bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-[#8B7CFF] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-400">{progress}%</div>
                </div>
              )}
            </div>

            {/* MIDDLE: PLAYBACK CONTROLS */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white">
               <div className="flex items-center gap-6">
                 <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-black transition-colors">
                    <span className="text-lg leading-none translate-x-[1px]">{isPlaying ? '⏸' : '▶'}</span>
                 </button>
                 <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold tracking-widest">{formatTime(globalTime)} <span className="text-zinc-400">/ {formatTime(totalDuration)}</span></span>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                  <button onClick={undo} disabled={historyIndex <= 0} className="text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-black disabled:opacity-30">Undo</button>
                  <button onClick={redo} disabled={historyIndex >= history.length - 1} className="text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-black disabled:opacity-30">Redo</button>
                  <div className="w-px h-4 bg-zinc-200 mx-2"></div>
                  <button onClick={splitClip} disabled={globalTime === 0 || globalTime === totalDuration} className="text-xs uppercase tracking-widest font-bold text-[#8B7CFF] hover:text-[#7264ed] disabled:opacity-50">Split</button>
                  <button onClick={deleteClip} disabled={!selectedClipId || clips.length <= 1} className="text-xs uppercase tracking-widest font-bold text-red-500 hover:text-red-600 disabled:opacity-50">Delete</button>
                  <div className="w-px h-4 bg-zinc-200 mx-2"></div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-zinc-400 font-bold">ZOOM</span>
                     <input type="range" min="1" max="5" step="0.1" value={timelineZoom} onChange={e=>setTimelineZoom(Number(e.target.value))} className="w-24 accent-black" />
                  </div>
               </div>
            </div>

            {/* BOTTOM: REAL TIMELINE */}
            <div className="w-full bg-zinc-50 border-b border-zinc-200 overflow-x-auto relative select-none p-6" style={{ minHeight: "160px" }}>
               <div className="relative h-24 mt-4" style={{ width: `${totalDuration * 20 * timelineZoom}px`, minWidth: '100%' }}>
                  
                  {/* Ruler */}
                  <div className="absolute -top-6 left-0 right-0 h-4 border-b border-zinc-300 flex text-[9px] text-zinc-400 font-mono">
                     {/* Simplified ruler ticks */}
                     {Array.from({length: Math.ceil(totalDuration)}).map((_,i) => (
                        <div key={i} className="absolute border-l border-zinc-300 h-2" style={{ left: `${(i / totalDuration) * 100}%` }}>
                           <span className="absolute -top-4 -translate-x-1/2">{formatTime(i)}</span>
                        </div>
                     ))}
                  </div>

                  {/* Clips Track */}
                  <div className="absolute inset-0 flex">
                    {clips.map((clip, i) => (
                      <div 
                        key={clip.id}
                        className={`relative h-full border-2 cursor-pointer overflow-hidden transition-colors ${selectedClipId === clip.id ? 'border-[#8B7CFF] z-10' : 'border-zinc-300 hover:border-zinc-400 z-0'}`}
                        style={{ width: `${(clip.duration / totalDuration) * 100}%`, backgroundColor: '#e4e4e7' }}
                        onClick={() => setSelectedClipId(clip.id)}
                      >
                         <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                            <span className="text-[10px] uppercase font-bold tracking-widest">Clip {i+1}</span>
                         </div>
                         
                         {/* Trim Handles (Only visible when selected) */}
                         {selectedClipId === clip.id && (
                           <>
                             <div 
                               className="absolute left-0 top-0 bottom-0 w-3 bg-[#8B7CFF] cursor-ew-resize hover:bg-[#7264ed] z-20"
                               onPointerDown={(e) => {
                                 const startX = e.clientX;
                                 const startVal = clip.sourceStart;
                                 const pWidth = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect().width;
                                 
                                 const move = (ev: PointerEvent) => {
                                   const dx = ev.clientX - startX;
                                   const dt = (dx / pWidth) * totalDuration;
                                   // Limit: can't drag past sourceEnd or before 0
                                   updateClipBounds(clip.id, startVal + dt, clip.sourceEnd);
                                 };
                                 const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); commitClipBounds(); };
                                 window.addEventListener('pointermove', move);
                                 window.addEventListener('pointerup', up);
                               }}
                             />
                             <div 
                               className="absolute right-0 top-0 bottom-0 w-3 bg-[#8B7CFF] cursor-ew-resize hover:bg-[#7264ed] z-20"
                               onPointerDown={(e) => {
                                 const startX = e.clientX;
                                 const endVal = clip.sourceEnd;
                                 const pWidth = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect().width;
                                 
                                 const move = (ev: PointerEvent) => {
                                   const dx = ev.clientX - startX;
                                   const dt = (dx / pWidth) * totalDuration;
                                   updateClipBounds(clip.id, clip.sourceStart, endVal + dt);
                                 };
                                 const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); commitClipBounds(); };
                                 window.addEventListener('pointermove', move);
                                 window.addEventListener('pointerup', up);
                               }}
                             />
                           </>
                         )}
                      </div>
                    ))}
                  </div>

                  {/* Playhead & Scrubbing Overlay */}
                  <div 
                     className="absolute inset-0 z-30 cursor-text"
                     onPointerDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const update = (ev: React.PointerEvent | PointerEvent) => {
                           const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                           seekGlobal(pct * totalDuration);
                        };
                        update(e);
                        const move = (ev: PointerEvent) => update(ev);
                        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
                        window.addEventListener('pointermove', move);
                        window.addEventListener('pointerup', up);
                     }}
                  >
                     <div 
                       className="absolute top-[-24px] bottom-[-24px] w-px bg-red-500 pointer-events-none"
                       style={{ left: `${(globalTime / totalDuration) * 100}%` }}
                     >
                       <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rotate-45 bg-red-500"></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* EDITING TOOLBAR */}
            <div className="flex flex-col bg-white">
               
               {/* Main Tools Ribbon */}
               <div className="flex items-center px-6 py-4 border-b border-zinc-100 gap-2 overflow-x-auto">
                  {(["crop", "speed", "adjust", "transform"] as const).map(tab => (
                     <button 
                       key={tab} 
                       onClick={() => setActiveTab(activeTab === tab ? "none" : tab)}
                       className={`px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase border rounded-full transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                     >
                       {tab}
                     </button>
                  ))}
                  <div className="flex-1"></div>
                  <button 
                    onClick={() => setActiveTab(activeTab === "export" ? "none" : "export")}
                    className={`px-8 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full transition-colors shadow-sm ${activeTab === "export" ? 'bg-[#111] text-white' : 'bg-[#8B7CFF] text-white hover:bg-[#7264ed]'}`}
                  >
                    Export
                  </button>
               </div>

               {/* Contextual Panels */}
               {activeTab !== "none" && (
                 <div className="p-6 bg-zinc-50 border-b border-zinc-200 min-h-[140px] flex items-start">
                    
                    {activeTab === "crop" && (
                       <div className="flex flex-col gap-4 w-full max-w-md">
                         <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Aspect Ratio</h3>
                         <div className="grid grid-cols-5 gap-2">
                           {["original", "16:9", "9:16", "1:1", "4:5"].map(t => (
                             <button key={t} onClick={() => setCropType(t as any)} className={`py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase ${cropType === t ? 'bg-[#8B7CFF] text-white border-[#8B7CFF]' : 'bg-white text-zinc-600 border-zinc-200'}`}>{t}</button>
                           ))}
                         </div>
                       </div>
                    )}

                    {activeTab === "speed" && (
                       <div className="flex flex-col gap-4 w-full max-w-2xl">
                         <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Timeline Speed</h3>
                         <div className="grid grid-cols-8 gap-2">
                           {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => (
                             <button key={s} onClick={() => { setSpeed(s); if(videoRef.current) videoRef.current.playbackRate = s; }} className={`py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase ${speed === s ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-zinc-600 border-zinc-200'}`}>{s}x</button>
                           ))}
                         </div>
                       </div>
                    )}

                    {activeTab === "adjust" && (
                       <div className="flex gap-12 w-full max-w-3xl items-center">
                         <div className="flex-1 flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between"><span>Brightness</span><span>{brightness}%</span></label>
                            <input type="range" min="0" max="200" value={brightness} onChange={e=>setBrightness(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                         </div>
                         <div className="flex-1 flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between"><span>Contrast</span><span>{contrast}%</span></label>
                            <input type="range" min="0" max="200" value={contrast} onChange={e=>setContrast(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                         </div>
                         <div className="flex-1 flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between"><span>Saturation</span><span>{saturation}%</span></label>
                            <input type="range" min="0" max="200" value={saturation} onChange={e=>setSaturation(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                         </div>
                         <div className="flex-1 flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex justify-between"><span>Volume</span><span>{volume}%</span></label>
                            <input type="range" min="0" max="100" value={volume} onChange={e=>{
                              const v = Number(e.target.value); setVolume(v); if(videoRef.current) videoRef.current.volume = v/100;
                            }} className="w-full accent-black" />
                         </div>
                       </div>
                    )}

                    {activeTab === "transform" && (
                       <div className="flex flex-col gap-4 w-full max-w-md">
                         <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Orientation</h3>
                         <div className="grid grid-cols-4 gap-2">
                           <button onClick={() => setRotation(r => (r + 270) % 360)} className="py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase bg-white text-zinc-600 border-zinc-200">↺ Left</button>
                           <button onClick={() => setRotation(r => (r + 90) % 360)} className="py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase bg-white text-zinc-600 border-zinc-200">↻ Right</button>
                           <button onClick={() => setFlipH(!flipH)} className={`py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase ${flipH ? 'bg-zinc-200 border-zinc-300' : 'bg-white text-zinc-600 border-zinc-200'}`}>Flip H</button>
                           <button onClick={() => setFlipV(!flipV)} className={`py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase ${flipV ? 'bg-zinc-200 border-zinc-300' : 'bg-white text-zinc-600 border-zinc-200'}`}>Flip V</button>
                         </div>
                       </div>
                    )}

                    {activeTab === "export" && (
                       <div className="flex items-center gap-12 w-full max-w-4xl">
                         <div className="flex flex-col gap-4 flex-1">
                           <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Resolution</h3>
                           <div className="grid grid-cols-3 gap-2">
                             {["original", "1080p", "720p"].map(r => (
                               <button key={r} onClick={() => setExportRes(r as any)} className={`py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase ${exportRes === r ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-600 border-zinc-200'}`}>{r}</button>
                             ))}
                           </div>
                         </div>
                         <div className="flex flex-col gap-4 flex-1">
                           <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Quality</h3>
                           <div className="grid grid-cols-2 gap-2">
                             {["standard", "high"].map(q => (
                               <button key={q} onClick={() => setExportQual(q as any)} className={`py-3 text-[10px] font-bold tracking-widest border rounded-xl uppercase ${exportQual === q ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-600 border-zinc-200'}`}>{q}</button>
                             ))}
                           </div>
                         </div>
                         <div className="flex flex-col gap-4 flex-1">
                           <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 opacity-0">-</h3>
                           <button onClick={exportVideo} disabled={isProcessing} className="w-full py-3 bg-[#8B7CFF] text-white text-xs uppercase tracking-widest font-bold hover:bg-[#7264ed] rounded-xl shadow-sm disabled:opacity-50">
                             {isProcessing ? 'Processing...' : 'Export Now'}
                           </button>
                         </div>
                       </div>
                    )}
                 </div>
               )}
            </div>

          </div>
        )}
      </div>
    </ToolLayout>
  );
}
