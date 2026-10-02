"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";

type VideoState = {
  file: File | null;
  url: string | null;
  duration: number;
  width: number;
  height: number;
  size: number;
};

export default function VideoComparePage() {
  const [videoA, setVideoA] = useState<VideoState>({ file: null, url: null, duration: 0, width: 0, height: 0, size: 0 });
  const [videoB, setVideoB] = useState<VideoState>({ file: null, url: null, duration: 0, width: 0, height: 0, size: 0 });

  const [mode, setMode] = useState<"side-by-side" | "split" | "overlay" | "wipe">("split");
  
  // Shared playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Visual Controls
  const [splitPos, setSplitPos] = useState(50); // 0-100%
  const [overlayOpacity, setOverlayOpacity] = useState(50); // 0-100%
  const [wipeAngle, setWipeAngle] = useState(45); // For a diagonal wipe if we want to differentiate from Split

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const syncRAF = useRef<number>(0);
  const isSeeking = useRef(false);

  const sharedDuration = useMemo(() => {
    if (videoA.duration > 0 && videoB.duration > 0) {
      return Math.min(videoA.duration, videoB.duration);
    }
    return Math.max(videoA.duration, videoB.duration);
  }, [videoA.duration, videoB.duration]);

  const handleUploadA = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    setVideoA(prev => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { ...prev, file, url: URL.createObjectURL(file), size: file.size };
    });
  };

  const handleUploadB = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    setVideoB(prev => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { ...prev, file, url: URL.createObjectURL(file), size: file.size };
    });
  };

  const onLoadedMetadataA = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    setVideoA(prev => ({ ...prev, duration: target.duration, width: target.videoWidth, height: target.videoHeight }));
  };

  const onLoadedMetadataB = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    setVideoB(prev => ({ ...prev, duration: target.duration, width: target.videoWidth, height: target.videoHeight }));
  };

  // Sync Loop
  useEffect(() => {
    const updateSync = () => {
      if (!isSeeking.current && videoARef.current && videoBRef.current) {
        // Use A as master clock if available, else B
        const master = videoARef.current.readyState >= 2 ? videoARef.current : videoBRef.current;
        const slave = master === videoARef.current ? videoBRef.current : videoARef.current;
        
        if (master) {
           setCurrentTime(master.currentTime);
           // Correct drift if slave is playing and out of sync by > 0.1s
           if (slave && Math.abs(master.currentTime - slave.currentTime) > 0.1) {
              slave.currentTime = master.currentTime;
           }
        }
      }
      syncRAF.current = requestAnimationFrame(updateSync);
    };
    syncRAF.current = requestAnimationFrame(updateSync);
    
    return () => cancelAnimationFrame(syncRAF.current);
  }, []);

  // Apply volume & rate
  useEffect(() => {
    [videoARef.current, videoBRef.current].forEach(v => {
      if (v) {
        v.volume = isMuted ? 0 : (volume / 100);
        v.playbackRate = playbackRate;
      }
    });
  }, [volume, playbackRate, isMuted]);

  const togglePlay = () => {
    if (currentTime >= sharedDuration) {
      handleSeek(0);
    }
    
    if (isPlaying) {
      videoARef.current?.pause();
      videoBRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoARef.current?.play().catch(e=>console.error(e));
      videoBRef.current?.play().catch(e=>console.error(e));
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    let t = Math.max(0, Math.min(time, sharedDuration));
    setCurrentTime(t);
    if (videoARef.current) videoARef.current.currentTime = t;
    if (videoBRef.current) videoBRef.current.currentTime = t;
  };

  const handleSeekStart = () => {
    isSeeking.current = true;
    if (isPlaying) {
      videoARef.current?.pause();
      videoBRef.current?.pause();
    }
  };

  const handleSeekEnd = () => {
    isSeeking.current = false;
    if (isPlaying) {
      videoARef.current?.play();
      videoBRef.current?.play();
    }
  };

  // When either video ends natively, pause both if we hit sharedDuration
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.currentTarget.currentTime >= sharedDuration && isPlaying) {
      videoARef.current?.pause();
      videoBRef.current?.pause();
      setIsPlaying(false);
      setCurrentTime(sharedDuration);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
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

  const renderComparisonView = () => {
    if (!videoA.url && !videoB.url) return null;

    const vA = videoA.url ? (
      <video ref={videoARef} src={videoA.url} className="w-full h-full object-contain" onLoadedMetadata={onLoadedMetadataA} onTimeUpdate={handleTimeUpdate} playsInline />
    ) : <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">Video A Missing</div>;

    const vB = videoB.url ? (
      <video ref={videoBRef} src={videoB.url} className="w-full h-full object-contain" onLoadedMetadata={onLoadedMetadataB} onTimeUpdate={handleTimeUpdate} playsInline />
    ) : <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">Video B Missing</div>;

    if (mode === "side-by-side") {
      return (
        <div className="w-full h-full flex flex-col md:flex-row bg-black overflow-hidden relative">
           <div className="flex-1 relative border-r border-zinc-800">
             {vA}
             <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold tracking-widest uppercase z-10">Video A</div>
           </div>
           <div className="flex-1 relative">
             {vB}
             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold tracking-widest uppercase z-10">Video B</div>
           </div>
        </div>
      );
    }

    if (mode === "split") {
      return (
        <div className="w-full h-full relative bg-black overflow-hidden select-none">
           <div className="absolute inset-0">{vB}</div>
           <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}>{vA}</div>
           
           {/* Draggable Divider */}
           <div 
             className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
             style={{ left: `calc(${splitPos}% - 2px)` }}
             onPointerDown={(e) => {
                const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                const update = (ev: PointerEvent) => {
                   let p = ((ev.clientX - rect.left) / rect.width) * 100;
                   setSplitPos(Math.max(0, Math.min(100, p)));
                };
                const up = () => { window.removeEventListener('pointermove', update); window.removeEventListener('pointerup', up); };
                window.addEventListener('pointermove', update);
                window.addEventListener('pointerup', up);
             }}
           >
              <div className="w-6 h-8 bg-white rounded flex items-center justify-center shadow-md">
                 <div className="flex gap-0.5"><div className="w-0.5 h-4 bg-zinc-300"></div><div className="w-0.5 h-4 bg-zinc-300"></div></div>
              </div>
           </div>
           
           <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold tracking-widest uppercase z-10">Video A</div>
           <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold tracking-widest uppercase z-10">Video B</div>
        </div>
      );
    }

    if (mode === "overlay") {
      return (
        <div className="w-full h-full relative bg-black overflow-hidden select-none flex flex-col">
           <div className="relative flex-1">
             <div className="absolute inset-0">{vB}</div>
             <div className="absolute inset-0" style={{ opacity: overlayOpacity / 100 }}>{vA}</div>
             <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold tracking-widest uppercase z-10">A/B Blended</div>
           </div>
           
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 max-w-full px-4 py-3 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 z-20 flex items-center gap-4">
              <span className="text-[10px] text-white font-bold tracking-widest uppercase">B</span>
              <input type="range" min="0" max="100" value={overlayOpacity} onChange={e=>setOverlayOpacity(Number(e.target.value))} className="w-full accent-white" />
              <span className="text-[10px] text-white font-bold tracking-widest uppercase">A</span>
           </div>
        </div>
      );
    }

    if (mode === "wipe") {
      // Horizontal wipe (Top/Bottom) to differentiate from Vertical Split
      return (
        <div className="w-full h-full relative bg-black overflow-hidden select-none">
           <div className="absolute inset-0">{vB}</div>
           <div className="absolute inset-0" style={{ clipPath: `inset(0 0 ${100 - splitPos}% 0)` }}>{vA}</div>
           
           <div 
             className="absolute left-0 right-0 h-1 bg-white cursor-ns-resize z-20 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
             style={{ top: `calc(${splitPos}% - 2px)` }}
             onPointerDown={(e) => {
                const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                const update = (ev: PointerEvent) => {
                   let p = ((ev.clientY - rect.top) / rect.height) * 100;
                   setSplitPos(Math.max(0, Math.min(100, p)));
                };
                const up = () => { window.removeEventListener('pointermove', update); window.removeEventListener('pointerup', up); };
                window.addEventListener('pointermove', update);
                window.addEventListener('pointerup', up);
             }}
           >
              <div className="w-8 h-6 bg-white rounded flex flex-col items-center justify-center shadow-md gap-0.5">
                 <div className="w-4 h-0.5 bg-zinc-300"></div><div className="w-4 h-0.5 bg-zinc-300"></div>
              </div>
           </div>
           
           <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold tracking-widest uppercase z-10">Video A (Top)</div>
           <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold tracking-widest uppercase z-10">Video B (Bottom)</div>
        </div>
      );
    }

    return null;
  };

  const getDurationWarning = () => {
    if (videoA.duration && videoB.duration && Math.abs(videoA.duration - videoB.duration) > 1) {
       return `Durations differ! Comparison limited to shorter video (${formatTime(sharedDuration)}).`;
    }
    return null;
  };

  return (
    <ToolLayout title="Video Compare" description="Visually compare two videos with synchronized playback. Everything runs locally in your browser.">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 -mt-4 mb-20">
        
        {/* INPUT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Video A */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B7CFF]">Video A</h2>
              {!videoA.url ? (
                 <div className="h-48 border-2 border-[#8B7CFF]/30 border-dashed rounded-2xl bg-[#8B7CFF]/5">
                   <UploadDropzone onUpload={handleUploadA} multiple={false} accept="video/*" />
                 </div>
              ) : (
                 <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm text-xs">
                    <div className="p-3 border-b border-zinc-100 flex justify-between bg-zinc-50">
                       <span className="font-bold truncate pr-4 text-[#8B7CFF]">{videoA.file?.name}</span>
                       <button onClick={() => setVideoA({ file: null, url: null, duration: 0, width: 0, height: 0, size: 0 })} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-red-500">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-zinc-200 text-center">
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Res</span><span className="font-mono font-bold">{videoA.width}x{videoA.height}</span></div>
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Time</span><span className="font-mono font-bold">{formatTime(videoA.duration)}</span></div>
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Size</span><span className="font-mono font-bold">{formatSize(videoA.size)}</span></div>
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">FPS</span><span className="font-mono font-bold text-zinc-400">N/A</span></div>
                    </div>
                 </div>
              )}
           </div>

           {/* Video B */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111]">Video B</h2>
              {!videoB.url ? (
                 <div className="h-48 border-2 border-zinc-200 border-dashed rounded-2xl bg-zinc-50">
                   <UploadDropzone onUpload={handleUploadB} multiple={false} accept="video/*" />
                 </div>
              ) : (
                 <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm text-xs">
                    <div className="p-3 border-b border-zinc-100 flex justify-between bg-zinc-50">
                       <span className="font-bold truncate pr-4">{videoB.file?.name}</span>
                       <button onClick={() => setVideoB({ file: null, url: null, duration: 0, width: 0, height: 0, size: 0 })} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-red-500">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-zinc-200 text-center">
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Res</span><span className="font-mono font-bold">{videoB.width}x{videoB.height}</span></div>
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Time</span><span className="font-mono font-bold">{formatTime(videoB.duration)}</span></div>
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Size</span><span className="font-mono font-bold">{formatSize(videoB.size)}</span></div>
                       <div className="p-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">FPS</span><span className="font-mono font-bold text-zinc-400">N/A</span></div>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {getDurationWarning() && (
           <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] uppercase tracking-widest font-bold text-center rounded-xl">
             {getDurationWarning()}
           </div>
        )}

        {/* COMPARISON WORKSPACE */}
        {(videoA.url || videoB.url) && (
           <div className="flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-50">
                 <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    {(["side-by-side", "split", "overlay", "wipe"] as const).map(m => (
                       <button 
                         key={m} 
                         onClick={() => setMode(m)}
                         className={`px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase border rounded-full transition-colors whitespace-nowrap ${mode === m ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                       >
                         {m.replace(/-/g, ' ')}
                       </button>
                    ))}
                 </div>
                 
                 <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">Speed</span>
                       <select value={playbackRate} onChange={e=>setPlaybackRate(Number(e.target.value))} className="text-xs font-bold bg-white border border-zinc-200 rounded px-2 py-1 outline-none">
                          <option value="0.5">0.5x</option>
                          <option value="1">1.0x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2.0x</option>
                       </select>
                    </div>
                    <div className="w-px h-4 bg-zinc-200"></div>
                    <button onClick={() => setIsMuted(!isMuted)} className="w-8 h-8 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs transition-colors">
                       {isMuted ? '🔇' : '🔊'}
                    </button>
                 </div>
              </div>

              {/* Viewport */}
              <div className="relative w-full bg-[#111] border-b border-zinc-200" style={{ height: "65vh", minHeight: "400px" }}>
                 {renderComparisonView()}
              </div>

              {/* Transport Controls */}
              <div className="p-6 bg-white flex flex-col gap-4">
                 
                 <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-zinc-500 w-12 text-right">{formatTime(currentTime)}</span>
                    <div 
                       className="flex-1 h-3 bg-zinc-100 rounded-full relative cursor-pointer group"
                       onPointerDown={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          handleSeekStart();
                          const update = (ev: PointerEvent | React.PointerEvent) => {
                             const p = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                             handleSeek(p * sharedDuration);
                          };
                          update(e);
                          const move = (ev: PointerEvent) => update(ev);
                          const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); handleSeekEnd(); };
                          window.addEventListener('pointermove', move);
                          window.addEventListener('pointerup', up);
                       }}
                    >
                       <div 
                         className="absolute top-0 bottom-0 left-0 bg-[#8B7CFF] rounded-full pointer-events-none group-hover:bg-[#7264ed] transition-colors"
                         style={{ width: `${sharedDuration > 0 ? (currentTime / sharedDuration) * 100 : 0}%` }}
                       >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#8B7CFF] rounded-full translate-x-1/2 shadow-sm scale-0 group-hover:scale-100 transition-transform"></div>
                       </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-500 w-12">{formatTime(sharedDuration)}</span>
                 </div>

                 <div className="flex items-center justify-center pt-2">
                    <button onClick={togglePlay} className="w-14 h-14 flex items-center justify-center rounded-full bg-[#111] text-white hover:bg-[#8B7CFF] hover:scale-105 transition-all shadow-md">
                       {isPlaying ? (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                       ) : (
                          <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                       )}
                    </button>
                 </div>

              </div>

           </div>
        )}

      </div>
    </ToolLayout>
  );
}
