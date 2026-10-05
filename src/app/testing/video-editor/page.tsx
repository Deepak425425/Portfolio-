"use client";

import React, { useState, useRef, useEffect, useMemo, useReducer } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { exportTimeline, ExportError } from "./exportEngine";
import {
  Clip,
  editorReducer,
  initialEditorState,
  totalDurationOf,
  clipStartTime,
  locateClip,
  canSplitAt,
  ASPECT_RATIOS,
  SPEED_PRESETS,
} from "./editorReducer";

export default function VideoEditorPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Centralized editor state (clips, selection, undo/redo history)
  const [editor, dispatch] = useReducer(editorReducer, initialEditorState);
  const { clips, selectedClipId, past, future, sourceDuration, aspect, fit } = editor;
  const selectedClip = clips.find((c) => c.id === selectedClipId) ?? null;
  const aspectDef = ASPECT_RATIOS.find((a) => a.id === aspect) ?? ASPECT_RATIOS[0];

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalTime, setGlobalTimeState] = useState(0);
  // Timeline scale is frozen while a trim handle is dragged so unrelated clips keep their width.
  const [scaleDuration, setScaleDuration] = useState<number | null>(null);

  // Export State
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [exportError, setExportError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputInfo, setOutputInfo] = useState<{ width: number; height: number; duration: number; size: number; hasAudio: boolean } | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const exportBusyRef = useRef(false);
  const mountedRef = useRef(true);
  // Object URLs are tracked in refs so they can always be revoked (including on unmount).
  const videoUrlRef = useRef<string | null>(null);
  const outputUrlRef = useRef<string | null>(null);
  const rAFRef = useRef<number>(0);
  // Refs always mirror the latest state so the rAF loop and event handlers never read stale values.
  const clipsRef = useRef<Clip[]>([]);
  const globalTimeRef = useRef(0);
  const playStateRef = useRef({ playing: false, clipIndex: 0 });
  const audioStateRef = useRef({ originalMuted: false, originalVolume: 100 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [replacementAudioUrl, setReplacementAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editor.replacementAudioFile) {
       const url = URL.createObjectURL(editor.replacementAudioFile);
       setReplacementAudioUrl(url);
       return () => URL.revokeObjectURL(url);
    } else {
       setReplacementAudioUrl(null);
    }
  }, [editor.replacementAudioFile]);

  const totalDuration = useMemo(() => totalDurationOf(clips), [clips]);
  const displayDuration = Math.max(0.1, scaleDuration ?? totalDuration);
  const canUndo = past.length > 0 && scaleDuration === null;
  const canRedo = future.length > 0 && scaleDuration === null;
  const canSplit = canSplitAt(clips, globalTime);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rAFRef.current);
      try {
        ffmpegRef.current?.terminate();
      } catch {
        /* not running */
      }
      ffmpegRef.current = null;
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    };
  }, []);

  const setPlayhead = (t: number) => {
    globalTimeRef.current = t;
    setGlobalTimeState(t);
  };

  /** Apply a clip's speed / volume / mute to the <video> element (preview audio + rate). */
  const applyClipMedia = (clip: Clip | undefined) => {
    const v = videoRef.current;
    if (!v || !clip) return;
    v.playbackRate = clip.speed;
    const projectOriginalVolume = audioStateRef.current.originalMuted ? 0 : audioStateRef.current.originalVolume / 100;
    const clipVolume = clip.muted ? 0 : clip.volume / 100;
    v.volume = projectOriginalVolume * clipVolume;
  };

  const applySeek = (list: Clip[], time: number) => {
    const total = totalDurationOf(list);
    const t = Math.max(0, Math.min(time, total));
    setPlayhead(t);
    const loc = locateClip(list, t);
    const v = videoRef.current;
    if (!loc || !v) return;
    playStateRef.current.clipIndex = loc.index;
    const clip = list[loc.index];
    applyClipMedia(clip);
    // Timeline offset -> source offset
    v.currentTime = clip.sourceStart + loc.offset * clip.speed;

    const a = audioRef.current;
    if (a && replacementAudioUrl) {
       // if t is past duration, audio stops
       a.currentTime = t;
    }
  };

  const seekGlobal = (time: number) => {
    const list = clipsRef.current;
    if (list.length === 0) return;
    applySeek(list, time);
  };

  const pausePlayback = () => {
    playStateRef.current.playing = false;
    cancelAnimationFrame(rAFRef.current);
    videoRef.current?.pause();
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  // Keep refs/video in sync whenever the clip list changes (edit, undo, redo, trim, reset).
  useEffect(() => {
    clipsRef.current = clips;
    audioStateRef.current = { originalMuted: editor.originalAudioMuted, originalVolume: editor.originalAudioVolume };
    if (clips.length === 0) return;
    if (playStateRef.current.playing) {
      // Live volume / mute change while playing: update the element without seeking.
      applyClipMedia(clips[Math.min(playStateRef.current.clipIndex, clips.length - 1)]);
      return;
    }
    applySeek(clips, globalTimeRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips, videoUrl, editor.originalAudioMuted, editor.originalAudioVolume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = editor.replacementAudioMuted ? 0 : editor.replacementAudioVolume / 100;
    }
  }, [editor.replacementAudioMuted, editor.replacementAudioVolume]);

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
          applyClipMedia(next);
          // Contiguous clips (e.g. after a split) play straight through without a seek.
          if (Math.abs(t - next.sourceStart) > 0.08) v.currentTime = next.sourceStart;
          setPlayhead(clipStartTime(list, idx + 1));
        } else {
          v.pause();
          audioRef.current?.pause();
          playStateRef.current.playing = false;
          setIsPlaying(false);
          setPlayhead(totalDurationOf(list));
          return;
        }
      } else {
        // Source time -> timeline time (divide by speed)
        setPlayhead(clipStartTime(list, idx) + Math.max(0, t - clip.sourceStart) / clip.speed);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || (active as HTMLElement).isContentEditable)) {
         return;
      }
      
      if (e.key === " ") {
         e.preventDefault();
         togglePlay();
      } else if (e.key.toLowerCase() === "s") {
         e.preventDefault();
         splitClip();
      } else if (e.key === "Backspace" || e.key === "Delete") {
         e.preventDefault();
         deleteClip();
      } else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         if (e.shiftKey) redo();
         else undo();
      } else if (e.key === "ArrowLeft") {
         e.preventDefault();
         seekGlobal(globalTimeRef.current - 0.1);
      } else if (e.key === "ArrowRight") {
         e.preventDefault();
         seekGlobal(globalTimeRef.current + 0.1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }); // no dep array so it gets the latest closures every render, but only binds once per render

  const handleUpload = async (files: File[]) => {
    setLoadError(null);
    if (!files.length) return;
    const file = files[0];
    
    if (!file.type.startsWith("video/")) {
       setLoadError("Please upload a valid video file.");
       return;
    }

    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    outputUrlRef.current = null;
    setOutputUrl(null);
    setOutputInfo(null);
    setExportError(null);
    const url = URL.createObjectURL(file);
    videoUrlRef.current = url;
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
    if (v.duration === Infinity || isNaN(v.duration) || v.duration === 0) {
       setLoadError("The video file could not be read properly or has an invalid duration.");
       clearProject(true);
       return;
    }
    setResolution({ width: v.videoWidth, height: v.videoHeight });
    // INIT is ignored by the reducer if clips already exist.
    dispatch({ type: "INIT", duration: v.duration, id: crypto.randomUUID(), width: v.videoWidth, height: v.videoHeight });
  };

  // --- Editing actions (every edit pauses playback first, then goes through the reducer) ---

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || clips.length === 0) return;
    if (isPlaying) {
      pausePlayback();
    } else {
      if (globalTimeRef.current >= totalDuration - 0.01) seekGlobal(0);
      const loc = locateClip(clips, globalTimeRef.current);
      if (loc) applyClipMedia(clips[loc.index]);
      v.play().catch(() => setIsPlaying(false));
      const a = audioRef.current;
      if (a && replacementAudioUrl) {
         if (a.currentTime < a.duration || isNaN(a.duration)) {
             a.play().catch(console.error);
         }
      }
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

  const setSpeed = (speed: number) => {
    if (!selectedClip || selectedClip.speed === speed) return;
    pausePlayback();
    dispatch({ type: "SET_SPEED", speed });
  };

  const toggleMute = () => {
    if (!selectedClip) return;
    dispatch({ type: "SET_MUTED", muted: !selectedClip.muted });
  };

  const setAspect = (id: typeof aspect) => {
    if (id === aspect) return;
    pausePlayback();
    dispatch({ type: "SET_ASPECT", aspect: id });
  };

  const setFit = (mode: typeof fit) => {
    if (mode === fit) return;
    pausePlayback();
    dispatch({ type: "SET_FIT", fit: mode });
  };

  const resetOriginal = () => {
    if (!sourceDuration) return;
    if (confirm("Reset to original video? All edits and audio replacements will be lost.")) {
      pausePlayback();
      globalTimeRef.current = 0;
      dispatch({ type: "RESET", id: crypto.randomUUID() });
    }
  };

  const clearProject = (force = false) => {
    if (force || confirm("Clear this project and start over? All work will be lost.")) {
       pausePlayback();
       dispatch({ type: "CLEAR" });
       setVideoUrl(null);
       setVideoFile(null);
       setOutputUrl(null);
       setOutputInfo(null);
       if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
       if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
       videoUrlRef.current = null;
       outputUrlRef.current = null;
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
      // Pixels are timeline seconds; multiply by speed to get source seconds.
      dispatch({ type: "TRIM", id: clip.id, edge, value: baseValue + ((ev.clientX - startX) / pxPerSec) * clip.speed });
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
    if (!videoFile || exportBusyRef.current) return;
    exportBusyRef.current = true;
    pausePlayback();
    setExportError(null);
    setIsProcessing(true);
    setStatusText("Starting export");

    // Snapshot everything the export depends on, so edits made while it runs cannot change the result.
    const snapshotClips = clips.map((c) => ({
      sourceStart: c.sourceStart,
      sourceEnd: c.sourceEnd,
      duration: c.duration,
      speed: c.speed,
      volume: c.volume,
      muted: c.muted,
    }));
    const ffmpeg = ffmpegRef.current ?? (ffmpegRef.current = new FFmpeg());

    try {
      const result = await exportTimeline(ffmpeg, {
        file: videoFile,
        clips: snapshotClips,
        aspect,
        fit,
        srcWidth: resolution.width,
        srcHeight: resolution.height,
        originalAudioMuted: editor.originalAudioMuted,
        originalAudioVolume: editor.originalAudioVolume,
        replacementAudioFile: editor.replacementAudioFile,
        replacementAudioVolume: editor.replacementAudioVolume,
        replacementAudioMuted: editor.replacementAudioMuted,
        onStage: (stage) => setStatusText(stage),
      });
      if (!mountedRef.current) return;
      // Only now (valid, verified file) do we expose a result.
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
      const url = URL.createObjectURL(result.blob);
      outputUrlRef.current = url;
      setOutputInfo({
        width: result.width,
        height: result.height,
        duration: result.duration,
        size: result.blob.size,
        hasAudio: result.hasAudio,
      });
      setOutputUrl(url);
    } catch (e) {
      console.error(e);
      // After a failure the wasm instance may be in a bad state: discard it so the next attempt starts clean.
      try {
        ffmpeg.terminate();
      } catch {
        /* already terminated */
      }
      ffmpegRef.current = null;
      if (mountedRef.current) {
        setExportError(
          e instanceof ExportError
            ? e.message
            : "Export failed unexpectedly. The browser may have run out of memory or the video format may not be supported.",
        );
      }
    } finally {
      exportBusyRef.current = false;
      if (mountedRef.current) setIsProcessing(false);
    }
  };

  const closeOutput = () => {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    outputUrlRef.current = null;
    setOutputUrl(null);
    setOutputInfo(null);
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
          <div className="flex flex-col items-center text-center gap-6 py-16">
             <div className="flex flex-col gap-2 max-w-lg">
                <h2 className="text-2xl font-bold tracking-tight">GROTON Video Editor</h2>
                <p className="text-sm text-zinc-500">
                  Easily trim, split, reorder clips, change playback speed, resize for social media, and replace background audio securely in your browser. No files are uploaded to the cloud.
                </p>
             </div>
             
             {loadError && (
               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold w-full max-w-xl">
                  {loadError}
               </div>
             )}

             <div className="w-full max-w-xl">
               <UploadDropzone 
                 onUpload={handleUpload} 
                 multiple={false} 
                 accept="video/*" 
                 title="Drag your video here or click to upload"
                 formats={["MP4", "WEBM", "MOV"]}
                 className="min-h-[16rem] bg-white border-2 border-dashed border-zinc-200 hover:border-[#8B7CFF] transition-colors"
               />
             </div>
          </div>
        ) : (
          <>
            {/* WORKSPACE */}
            {!outputUrl ? (
              <div className="flex flex-col gap-4">
                
                {/* PREVIEW ROW */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Video */}
                  <div className="flex-1 bg-[#111] rounded-2xl overflow-hidden shadow-sm relative aspect-video">
                    {/* Canvas: sized to the active aspect ratio inside the 16:9 stage; black like the export background */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black overflow-hidden ring-1 ring-white/25"
                      style={{
                        aspectRatio: `${aspectDef.w} / ${aspectDef.h}`,
                        ...(aspectDef.w / aspectDef.h >= 16 / 9
                          ? { width: "100%" }
                          : { height: "100%" }),
                      }}
                    >
                      <video 
                        ref={videoRef}
                        src={videoUrl}
                        className={`w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
                        onLoadedMetadata={handleLoadedMetadata}
                        onClick={togglePlay}
                        playsInline
                      />
                    </div>
                    <span className="absolute top-3 left-3 z-10 text-[10px] font-mono font-bold text-white/80 bg-black/60 rounded-full px-2.5 py-1 pointer-events-none">
                      {aspect} · {fit === "cover" ? "Fill" : "Fit"}
                    </span>
                    
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
                    </div>

                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 text-white" role="status" aria-live="polite">
                        <div className="text-sm font-bold uppercase tracking-[0.2em]">{statusText}</div>
                        {/* Indeterminate: ffmpeg cannot report accurate progress for a multi-clip filter graph. */}
                        <div className="relative w-64 h-1 bg-zinc-800 overflow-hidden rounded-full">
                          <div className="absolute inset-y-0 w-1/3 bg-[#8B7CFF] rounded-full" style={{ animation: "gvx-indeterminate 1.2s ease-in-out infinite" }}></div>
                        </div>
                        <style>{`@keyframes gvx-indeterminate { 0% { left: -33%; } 100% { left: 100%; } }`}</style>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500">Keep this tab open</div>
                      </div>
                    )}

                    {exportError && !isProcessing && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-5 text-white px-8 text-center" role="alert">
                        <div className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">Export failed</div>
                        <p className="text-xs text-zinc-300 max-w-md leading-relaxed">{exportError}</p>
                        <div className="flex gap-3">
                          <button onClick={exportVideo} className="text-[10px] uppercase font-bold text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-full">Try again</button>
                          <button onClick={() => setExportError(null)} className="text-[10px] uppercase font-bold text-white border border-white/30 hover:bg-white/10 px-4 py-2 rounded-full">Dismiss</button>
                        </div>
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
                          <div className="flex flex-col gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Canvas</span>
                            <div className="grid grid-cols-4 gap-1.5">
                              {ASPECT_RATIOS.map((a) => (
                                <button key={a.id} id={`aspect-${a.id.replace(":", "x")}`} onClick={() => setAspect(a.id)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${aspect === a.id ? "bg-[#111] text-white border-[#111]" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"}`}>{a.id}</button>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button id="fit-contain" onClick={() => setFit("contain")} className={`py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg border transition-colors ${fit === "contain" ? "bg-[#111] text-white border-[#111]" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"}`}>Fit</button>
                              <button id="fit-cover" onClick={() => setFit("cover")} className={`py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg border transition-colors ${fit === "cover" ? "bg-[#111] text-white border-[#111]" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"}`}>Fill</button>
                            </div>
                          </div>

                          {/* Project Audio */}
                          <div className="flex flex-col gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Project Audio</span>
                            
                            <div className="flex flex-col gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-600">Original Audio</span>
                                <button onClick={() => dispatch({ type: "SET_ORIGINAL_AUDIO_MUTED", muted: !editor.originalAudioMuted })} className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${editor.originalAudioMuted ? "bg-red-50 text-red-500 border-red-200" : "bg-white text-zinc-600 border-zinc-200"}`}>{editor.originalAudioMuted ? "Off" : "On"}</button>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="range" min="0" max="100" value={editor.originalAudioVolume} onChange={(e) => dispatch({ type: "SET_ORIGINAL_AUDIO_VOLUME", volume: Number(e.target.value) })} disabled={editor.originalAudioMuted} onPointerDown={() => dispatch({ type: "BEGIN_TRIM" })} onPointerUp={() => dispatch({ type: "END_TRIM" })} className="flex-1 accent-[#8B7CFF] min-w-0 disabled:opacity-40" />
                                <span className="w-8 text-right text-[10px] font-mono text-zinc-500">{editor.originalAudioVolume}%</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-600">Replacement Audio</span>
                                {editor.replacementAudioFile ? (
                                   <div className="flex gap-2">
                                      <button onClick={() => dispatch({ type: "SET_REPLACEMENT_AUDIO_MUTED", muted: !editor.replacementAudioMuted })} className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${editor.replacementAudioMuted ? "bg-red-50 text-red-500 border-red-200" : "bg-white text-zinc-600 border-zinc-200"}`}>{editor.replacementAudioMuted ? "Off" : "On"}</button>
                                      <button onClick={() => dispatch({ type: "SET_REPLACEMENT_AUDIO_FILE", file: null })} className="px-2 py-1 text-[10px] font-bold rounded border bg-white text-red-500 border-zinc-200 transition-colors">Remove</button>
                                   </div>
                                ) : (
                                   <label className="px-2 py-1 text-[10px] font-bold rounded border bg-white text-zinc-600 border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                                     Add Audio
                                     <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && dispatch({ type: "SET_REPLACEMENT_AUDIO_FILE", file: e.target.files[0] })} />
                                   </label>
                                )}
                              </div>
                              {editor.replacementAudioFile && (
                                <>
                                  <span className="text-[10px] text-zinc-400 truncate max-w-[150px]" title={editor.replacementAudioFile.name}>{editor.replacementAudioFile.name}</span>
                                  <div className="flex items-center gap-2">
                                    <input type="range" min="0" max="100" value={editor.replacementAudioVolume} onChange={(e) => dispatch({ type: "SET_REPLACEMENT_AUDIO_VOLUME", volume: Number(e.target.value) })} disabled={editor.replacementAudioMuted} onPointerDown={() => dispatch({ type: "BEGIN_TRIM" })} onPointerUp={() => dispatch({ type: "END_TRIM" })} className="flex-1 accent-[#8B7CFF] min-w-0 disabled:opacity-40" />
                                    <span className="w-8 text-right text-[10px] font-mono text-zinc-500">{editor.replacementAudioVolume}%</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {selectedClip && (
                            <>
                              <div className="flex flex-col gap-2 mb-2">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Speed</span>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {SPEED_PRESETS.map((s) => (
                                    <button key={s} id={`speed-${s}`} onClick={() => setSpeed(s)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${selectedClip.speed === s ? "bg-[#111] text-white border-[#111]" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"}`}>{s}×</button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 mb-2">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Audio</span>
                                <div className="flex items-center gap-3">
                                  <button id="audio-mute" onClick={toggleMute} className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg border transition-colors ${selectedClip.muted ? "bg-[#111] text-white border-[#111]" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"}`}>{selectedClip.muted ? "Muted" : "Mute"}</button>
                                  <input
                                    id="audio-volume"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={selectedClip.volume}
                                    disabled={selectedClip.muted}
                                    onPointerDown={() => dispatch({ type: "BEGIN_TRIM" })}
                                    onPointerUp={() => dispatch({ type: "END_TRIM" })}
                                    onPointerCancel={() => dispatch({ type: "END_TRIM" })}
                                    onBlur={() => dispatch({ type: "END_TRIM" })}
                                    onChange={(e) => dispatch({ type: "SET_VOLUME", value: Number(e.target.value) })}
                                    className="flex-1 min-w-0 accent-[#8B7CFF] disabled:opacity-40"
                                  />
                                  <span className="w-9 text-right text-[10px] font-mono font-bold text-zinc-500">{selectedClip.muted ? "0" : selectedClip.volume}%</span>
                                </div>
                              </div>
                            </>
                          )}

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
                        <button onClick={() => clearProject(false)} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-red-500 transition-colors mr-2">Clear Project</button>
                        <button onClick={resetOriginal} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black transition-colors">Reset Edits</button>
                        <button onClick={exportVideo} disabled={isProcessing} className="text-[10px] uppercase font-bold text-white bg-[#111111] hover:bg-[#222222] px-4 py-2 rounded-full disabled:opacity-50 transition-colors shadow-sm">Export Video</button>
                      </div>
                   </div>
                   
                   <div className="w-full overflow-x-auto relative select-none p-6 bg-zinc-100 min-h-[180px] flex items-center">
                      <div ref={trackRef} className="relative h-24 bg-zinc-200 rounded-xl flex min-w-full">
                        {clips.map((clip, i) => (
                          <div 
                            key={clip.id}
                            className={`relative h-full border-y-4 border-r cursor-pointer transition-colors overflow-hidden ${selectedClipId === clip.id ? 'border-[#8B7CFF] border-l-4 z-10 shadow-md' : 'border-zinc-300 border-l hover:border-zinc-400 z-0'}`}
                            style={{ width: `${(clip.duration / displayDuration) * 100}%` }}
                            onPointerDown={() => dispatch({ type: "SELECT", id: clip.id })}
                          >
                             {/* Background Thumbnails Representation */}
                             <div className="absolute inset-0 opacity-40 pointer-events-none bg-black overflow-hidden">
                                <div 
                                   className="absolute top-0 bottom-0 flex"
                                   style={{
                                     width: `${(sourceDuration / (clip.sourceEnd - clip.sourceStart)) * 100}%`,
                                     left: `-${(clip.sourceStart / (clip.sourceEnd - clip.sourceStart)) * 100}%`
                                   }}
                                >
                                  {thumbnails.length > 0 && thumbnails.map((thumb, idx) => (
                                    <img key={idx} src={thumb} alt="" className="h-full object-cover flex-1 min-w-0" />
                                  ))}
                                </div>
                             </div>
                             
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-white drop-shadow-md">Clip {i+1}{clip.speed !== 1 ? ` · ${clip.speed}×` : ""}{clip.muted ? " · Muted" : ""}</span>
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
                        <span className="w-2 h-2 rounded-full bg-[#8B7CFF]"></span>
                        Export Complete
                     </h2>
                     {outputInfo && (
                       <span className="text-[10px] font-mono font-bold text-zinc-500">
                         {outputInfo.width}x{outputInfo.height} · {formatTime(outputInfo.duration)} · {formatSize(outputInfo.size)} · {outputInfo.hasAudio ? "Audio" : "No audio"}
                       </span>
                     )}
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
                       onClick={closeOutput}
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
      {replacementAudioUrl && (
        <audio ref={audioRef} src={replacementAudioUrl} className="hidden" />
      )}
    </ToolLayout>
  );
}