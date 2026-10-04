"use client";

import React, { useState, useRef, useEffect, useMemo, useReducer } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import {
  Clip,
  editorReducer,
  initialEditorState,
  totalDurationOf,
  clipStartTime,
  locateClip,
  canSplitAt,
} from "./editorReducer";

export default function VideoEditorPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Centralized editor state (clips, selection, undo/redo history)
  const [editor, dispatch] = useReducer(editorReducer, initialEditorState);
  const { clips, selectedClipId, past, future, sourceDuration } = editor;

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalTime, setGlobalTimeState] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  // Timeline scale is frozen while a trim handle is dragged so unrelated clips keep their width.
  const [scaleDuration, setScaleDuration] = useState<number | null>(null);

  // Export State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const rAFRef = useRef<number>(0);
  // Refs always mirror the latest state so the rAF loop and event handlers never read stale values.
  const clipsRef = useRef<Clip[]>([]);
  const globalTimeRef = useRef(0);
  const playStateRef = useRef({ playing: false, clipIndex: 0 });

  const totalDuration = useMemo(() => totalDurationOf(clips), [clips]);
  const displayDuration = Math.max(0.1, scaleDuration ?? totalDuration);
  const canUndo = past.length > 0 && scaleDuration === null;
  const canRedo = future.length > 0 && scaleDuration === null;
  const canSplit = canSplitAt(clips, globalTime);

  useEffect(() => {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress }) => setProgress(Math.max(0, Math.min(100, Math.round(progress * 100)))));
    ffmpegRef.current = ffmpeg;
    return () => {
      cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  const setPlayhead = (t: number) => {
    globalTimeRef.current = t;
    setGlobalTimeState(t);
  };

  /** Move the playhead and the <video> element to a timeline time, using an explicit clip list. */
  const applySeek = (list: Clip[], time: number) => {
    const total = totalDurationOf(list);
    const t = Math.max(0, Math.min(time, total));
    setPlayhead(t);
    const loc = locateClip(list, t);
    const v = videoRef.current;
    if (!loc || !v) return;
    playStateRef.current.clipIndex = loc.index;
    v.currentTime = list[loc.index].sourceStart + loc.offset;
  };

  const seekGlobal = (time: number) => applySeek(clipsRef.current, time);

  const pausePlayback = () => {
    playStateRef.current.playing = false;
    cancelAnimationFrame(rAFRef.current);
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  // Keep refs/video in sync whenever the clip list changes (edit, undo, redo, trim, reset).
  useEffect(() => {
    clipsRef.current = clips;
    if (clips.length === 0) return;
    applySeek(clips, globalTimeRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips, videoUrl]);

  // Apply volume / speed to the element without touching the playback loop.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackSpeed;
    v.volume = isMuted ? 0 : volume / 100;
  }, [playbackSpeed, volume, isMuted, videoUrl]);

  // Playback loop: only depends on isPlaying; reads the latest clips from refs.
  useEffect(() => {
    if (!isPlaying) return;
    playStateRef.current.playing = true;

    const tick = () => {
      if (!playStateRef.current.playing) return;
      const v = videoRef.current;
      const list = clipsRef.current;
      if (!v || list.length === 0) return;

      const idx = Math.min(playStateRef.current.clipIndex, list.length - 1);
      const clip = list[idx];
      const t = v.currentTime;

      if (t >= clip.sourceEnd - 0.02 || v.ended) {
        if (idx + 1 < list.length) {
          const next = list[idx + 1];
          playStateRef.current.clipIndex = idx + 1;
          // Contiguous clips (e.g. after a split) play straight through without a seek.
          if (Math.abs(t - next.sourceStart) > 0.08) v.currentTime = next.sourceStart;
          setPlayhead(clipStartTime(list, idx + 1));
        } else {
          v.pause();
          playStateRef.current.playing = false;
          setIsPlaying(false);
          setPlayhead(totalDurationOf(list));
          return;
        }
      } else {
        setPlayhead(clipStartTime(list, idx) + Math.max(0, t - clip.sourceStart));
      }
      rAFRef.current = requestAnimationFrame(tick);
    };

    rAFRef.current = requestAnimationFrame(tick);
    return () => {
      playStateRef.current.playing = false;
      cancelAnimationFrame(rAFRef.current);
    };
  }, [isPlaying]);

  const generateThumbnails = async (file: File) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    await new Promise(r => { video.onloadedmetadata = r; });
    const dur = video.duration;
    const numThumbs = 12;
    const interval = dur / numThumbs;
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    const thumbs: string[] = [];
    
    for (let i = 0; i < numThumbs; i++) {
      video.currentTime = i * interval;
      await new Promise(r => { 
         const onSeek = () => { video.removeEventListener('seeked', onSeek); r(null); };
         video.addEventListener('seeked', onSeek);
      });
      ctx?.drawImage(video, 0, 0, 160, 90);
      thumbs.push(canvas.toDataURL('image/jpeg', 0.5));
    }
    URL.revokeObjectURL(url);
    setThumbnails(thumbs);
  };

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    dispatch({ type: "CLEAR" });
    setPlayhead(0);
    setIsPlaying(false);
    setVideoUrl(url);
    setVideoFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    generateThumbnails(file);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setResolution({ width: v.videoWidth, height: v.videoHeight });
    // INIT is ignored by the reducer if clips already exist.
    dispatch({ type: "INIT", duration: v.duration, id: crypto.randomUUID() });
  };

  // --- Editing actions (every edit pauses playback first, then goes through the reducer) ---

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || clips.length === 0) return;
    if (isPlaying) {
      pausePlayback();
    } else {
      if (globalTimeRef.current >= totalDuration - 0.01) seekGlobal(0);
      v.playbackRate = playbackSpeed;
      v.volume = isMuted ? 0 : volume / 100;
      v.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const splitClip = () => {
    if (!canSplit) return;
    pausePlayback();
    dispatch({ type: "SPLIT", time: globalTimeRef.current, leftId: crypto.randomUUID(), rightId: crypto.randomUUID() });
  };

  const deleteClip = () => {
    if (!selectedClipId || clips.length <= 1) return;
    pausePlayback();
    globalTimeRef.current = 0;
    dispatch({ type: "DELETE" });
  };

  const duplicateClip = () => {
    if (!selectedClipId) return;
    pausePlayback();
    dispatch({ type: "DUPLICATE", id: crypto.randomUUID() });
  };

  const moveClip = (dir: -1 | 1) => {
    if (!selectedClipId) return;
    pausePlayback();
    dispatch({ type: "MOVE", dir });
  };

  const undo = () => {
    if (!canUndo) return;
    pausePlayback();
    dispatch({ type: "UNDO" });
  };

  const redo = () => {
    if (!canRedo) return;
    pausePlayback();
    dispatch({ type: "REDO" });
  };

  const resetOriginal = () => {
    if (!sourceDuration) return;
    if (confirm("Reset to original video? All edits will be lost.")) {
      pausePlayback();
      globalTimeRef.current = 0;
      dispatch({ type: "RESET", id: crypto.randomUUID() });
    }
  };

  /**
   * Trim drag. The drag works on the clip's SOURCE range only. Pixels are converted to seconds
   * with a scale frozen at drag start, so unrelated clips never change width while dragging.
   */
  const startTrim = (e: React.PointerEvent, clip: Clip, edge: "start" | "end") => {
    e.stopPropagation();
    e.preventDefault();
    const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 0;
    if (!trackWidth) return;
    const frozen = Math.max(0.1, totalDuration);
    const pxPerSec = trackWidth / frozen;
    const startX = e.clientX;
    const baseValue = edge === "start" ? clip.sourceStart : clip.sourceEnd;

    pausePlayback();
    setScaleDuration(frozen);
    dispatch({ type: "BEGIN_TRIM" });

    const move = (ev: PointerEvent) => {
      dispatch({ type: "TRIM", id: clip.id, edge, value: baseValue + (ev.clientX - startX) / pxPerSec });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dispatch({ type: "END_TRIM" });
      setScaleDuration(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // EXPORT
  const exportVideo = async () => {
    if (!videoFile || !ffmpegRef.current) return;
    pausePlayback();
    setIsProcessing(true);
    setProgress(0);
    setStatusText("Loading engine...");

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

      let hasOriginalAudio = true;
      try {
        await ffmpeg.exec(["-i", "input.mp4", "-vn", "-sn", "-c:a", "copy", "-t", "1", "check.aac"]);
        const checkData = await ffmpeg.readFile("check.aac");
        if ((checkData as Uint8Array).length === 0) hasOriginalAudio = false;
      } catch {
        hasOriginalAudio = false;
      }

      let filterComplex = "";
      let concatV = "";
      let concatA = "";

      clips.forEach((c, i) => {
         filterComplex += `[0:v]trim=start=${c.sourceStart}:end=${c.sourceEnd},setpts=PTS-STARTPTS[v${i}]; `;
         concatV += `[v${i}]`;
         if (hasOriginalAudio) {
           filterComplex += `[0:a]atrim=start=${c.sourceStart}:end=${c.sourceEnd},asetpts=PTS-STARTPTS[a${i}]; `;
           concatA += `[a${i}]`;
         }
      });
      
      filterComplex += `${concatV}concat=n=${clips.length}:v=1:a=0[concatv]; `;
      if (hasOriginalAudio) {
         filterComplex += `${concatA}concat=n=${clips.length}:v=0:a=1[concata]`;
      }

      const args = ["-i", "input.mp4", "-filter_complex", filterComplex, "-map", "[concatv]"];
      if (hasOriginalAudio) args.push("-map", "[concata]");
      
      args.push("-c:v", "libx264");
      args.push("-preset", "ultrafast"); 
      args.push("-crf", "24");
      if (hasOriginalAudio) {
        args.push("-c:a", "aac");
      }

      // Check if it's supposed to be webm based on original format or fallback
      const outName = "output.mp4";
      args.push(outName);

      setStatusText("Rendering Timeline...");
      await ffmpeg.exec(args);

      setStatusText("Finalizing...");
      const data = await ffmpeg.readFile(outName);
      const blob = new Blob([data as any], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      
      setOutputUrl(url);
      
    } catch (e) {
      console.error(e);
      alert("Export failed. File may be too large or browser ran out of memory.");
    } finally {
      setIsProcessing(false);
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
    <ToolLayout title="Video Editor" description="Trim, split, reorder and export video clips in your browser.">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 -mt-4">
        
        {!videoUrl ? (
          <UploadDropzone 
            onUpload={handleUpload} 
            multiple={false} 
            accept="video/*" 
            title="Drag your video here"
            formats={["MP4", "WEBM", "MOV"]}
            className="min-h-[16rem]"
          />
        ) : (
          <>
            {/* WORKSPACE */}
            {!outputUrl ? (
              <div className="flex flex-col gap-4">
                
                {/* PREVIEW ROW */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Video */}
                  <div className="flex-1 bg-[#111] rounded-2xl overflow-hidden shadow-sm relative aspect-video flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      onLoadedMetadata={handleLoadedMetadata}
                      onClick={togglePlay}
                      playsInline
                    />
                    
                    {/* Floating Playback Controls Overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-6 shadow-lg z-10 border border-white/10">
                      <button onClick={() => seekGlobal(0)} className="text-white hover:text-[#8B7CFF] transition-colors" title="Restart">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                      </button>
                      <button onClick={togglePlay} className="text-white hover:text-[#8B7CFF] transition-colors w-8 flex justify-center" title="Play/Pause">
                         {isPlaying ? 
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> : 
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                         }
                      </button>
                      <div className="flex items-center gap-2">
                         <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-[#8B7CFF] transition-colors" title="Mute/Unmute">
                            {isMuted || volume === 0 ? 
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> :
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            }
                         </button>
                         <input type="range" min="0" max="100" value={volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-16 accent-[#8B7CFF]" />
                      </div>
                      <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))} className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer">
                        <option value="0.5" className="text-black">0.5x</option>
                        <option value="1" className="text-black">1.0x</option>
                        <option value="1.5" className="text-black">1.5x</option>
                        <option value="2" className="text-black">2.0x</option>
                      </select>
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

                  {/* Right: Metadata & Tools */}
                  <div className="w-full md:w-72 flex flex-col gap-4">
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                       <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">File Details</h3>
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold truncate" title={fileName}>{fileName}</span>
                          <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
                             <span>{formatSize(fileSize)}</span>
                             <span>{resolution.width}x{resolution.height}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl flex flex-col gap-4 shadow-sm flex-1">
                       <div className="flex items-center justify-between">
                         <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Tools</h3>
                         <div className="flex gap-2">
                           <button onClick={undo} disabled={!canUndo} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black disabled:opacity-30">Undo</button>
                           <button onClick={redo} disabled={!canRedo} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black disabled:opacity-30">Redo</button>
                         </div>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          <button onClick={splitClip} disabled={!canSplit} className="w-full py-3 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-100 disabled:opacity-50">Split at Playhead</button>
                          
                          {selectedClipId ? (
                            <>
                              <button onClick={duplicateClip} className="w-full py-3 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-100">Duplicate Clip</button>
                              <div className="flex gap-2">
                                 <button onClick={() => moveClip(-1)} className="flex-1 py-3 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-100">&lt; Move</button>
                                 <button onClick={() => moveClip(1)} className="flex-1 py-3 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-100">Move &gt;</button>
                              </div>
                              <button onClick={deleteClip} className="w-full py-3 bg-red-50 border border-red-200 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-100">Delete Clip</button>
                            </>
                          ) : (
                            <div className="py-4 text-center text-[10px] text-zinc-400 uppercase tracking-widest border border-dashed border-zinc-200 rounded-xl mt-2">
                               Select a clip to edit
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                   <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
                      <div className="flex items-center gap-4">
                         <h3 className="text-[10px] uppercase tracking-widest font-bold text-black">Timeline</h3>
                         <span className="text-xs font-mono font-bold text-[#8B7CFF]">{formatTime(globalTime)} <span className="text-zinc-400">/ {formatTime(totalDuration)}</span></span>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={resetOriginal} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black">Reset</button>
                        <button onClick={exportVideo} disabled={isProcessing} className="text-[10px] uppercase font-bold text-white bg-[#111111] hover:bg-[#222222] px-4 py-2 rounded-full disabled:opacity-50">Export Video</button>
                      </div>
                   </div>
                   
                   <div className="w-full overflow-x-auto relative select-none p-6 bg-zinc-100 min-h-[160px] flex items-center">
                      <div ref={trackRef} className="relative h-20 bg-zinc-200 rounded-xl flex min-w-full">
                        {clips.map((clip, i) => (
                          <div 
                            key={clip.id}
                            className={`relative h-full border-y-4 border-r cursor-pointer transition-colors overflow-hidden ${selectedClipId === clip.id ? 'border-[#8B7CFF] border-l-4 z-10 shadow-md' : 'border-zinc-300 border-l hover:border-zinc-400 z-0'}`}
                            style={{ width: `${(clip.duration / displayDuration) * 100}%` }}
                            onPointerDown={() => dispatch({ type: "SELECT", id: clip.id })}
                          >
                             {/* Background Thumbnails Representation */}
                             <div className="absolute inset-0 flex opacity-40 pointer-events-none bg-black">
                               {thumbnails.length > 0 && thumbnails.map((thumb, idx) => (
                                 <img key={idx} src={thumb} alt="" className="h-full object-cover flex-1 min-w-0" />
                               ))}
                             </div>
                             
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-white drop-shadow-md">Clip {i+1}</span>
                             </div>
                             
                             {/* Trim Handles (Only visible when selected) */}
                             {selectedClipId === clip.id && (
                               <>
                                 <div 
                                   className="absolute left-0 top-0 bottom-0 w-4 bg-[#8B7CFF] cursor-ew-resize hover:bg-[#7264ed] z-20 flex items-center justify-center"
                                   onPointerDown={(e) => startTrim(e, clip, "start")}
                                 ><div className="w-1 h-4 bg-white rounded-full"></div></div>
                                 <div 
                                   className="absolute right-0 top-0 bottom-0 w-4 bg-[#8B7CFF] cursor-ew-resize hover:bg-[#7264ed] z-20 flex items-center justify-center"
                                   onPointerDown={(e) => startTrim(e, clip, "end")}
                                 ><div className="w-1 h-4 bg-white rounded-full"></div></div>
                               </>
                             )}
                          </div>
                        ))}

                        {/* Playhead Overlay */}
                        <div 
                           className="absolute inset-0 z-30 cursor-text"
                           onPointerDown={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const update = (ev: React.PointerEvent | PointerEvent) => {
                                 const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                                 seekGlobal(pct * displayDuration);
                              };
                              update(e);
                              const move = (ev: PointerEvent) => update(ev);
                              const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
                              window.addEventListener('pointermove', move);
                              window.addEventListener('pointerup', up);
                           }}
                        >
                           <div 
                             className="absolute top-[-16px] bottom-[-16px] w-0.5 bg-red-500 pointer-events-none"
                             style={{ left: `${(globalTime / displayDuration) * 100}%` }}
                           >
                             <div className="absolute -top-2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

              </div>
            ) : (
              /* OUTPUT WORKSPACE */
              <div className="bg-white p-6 md:p-8 border border-[#8B7CFF] rounded-2xl shadow-sm flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B7CFF] flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-pulse"></span>
                       Export Complete
                    </h2>
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
                       Download Final Video
                     </button>
                     <button 
                       onClick={() => setOutputUrl(null)}
                       className="py-4 px-8 bg-white text-black border border-zinc-200 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-50 transition-colors"
                     >
                       Back to Editor
                     </button>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
