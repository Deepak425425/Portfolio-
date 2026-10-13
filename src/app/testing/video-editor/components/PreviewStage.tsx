"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  ProjectSettings,
  TimelineClip,
  VideoClip,
  ImageClip,
  TextClip,
  ElementClip,
  MediaAsset,
  ASPECT_RATIOS,
} from "../types";

interface PreviewStageProps {
  settings: ProjectSettings;
  clips: TimelineClip[];
  assets: MediaAsset[];
  selectedClipId: string | null;
  playhead: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSelectClip: (clipId: string | null) => void;
  onTriggerVideoUpload?: () => void;
  onLoadSampleVideo?: () => void;
  isGeneratingSample?: boolean;
  onDropVideo?: (file: File) => void;
}

export function formatTimecode(time: number): string {
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  const cs = Math.floor((time % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

export default function PreviewStage({
  settings,
  clips,
  assets,
  selectedClipId,
  playhead,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onSelectClip,
  onTriggerVideoUpload,
  onLoadSampleVideo,
  isGeneratingSample,
  onDropVideo,
}: PreviewStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Aspect ratio dimensions
  const aspectDef = ASPECT_RATIOS.find((a) => a.id === settings.aspect) || ASPECT_RATIOS[0];

  // Active clips at current playhead
  const activeVideoClip = clips.find(
    (c): c is VideoClip =>
      c.trackType === "video" &&
      playhead >= c.startTime &&
      playhead < c.startTime + c.duration,
  );

  const activeImageClips = clips.filter(
    (c): c is ImageClip =>
      c.trackType === "image" &&
      playhead >= c.startTime &&
      playhead < c.startTime + c.duration,
  );

  const activeTextClips = clips.filter(
    (c): c is TextClip =>
      c.trackType === "text" &&
      playhead >= c.startTime &&
      playhead < c.startTime + c.duration,
  );

  const activeElementClips = clips.filter(
    (c): c is ElementClip =>
      c.trackType === "element" &&
      playhead >= c.startTime &&
      playhead < c.startTime + c.duration,
  );

  // Active video asset URL
  const activeAsset = activeVideoClip
    ? assets.find((a) => a.id === activeVideoClip.assetId)
    : null;

  // Sync video element with playhead safely
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !activeVideoClip) return;

    const relTime = (playhead - activeVideoClip.startTime) * activeVideoClip.speed;
    const targetSourceTime = Math.min(
      activeVideoClip.sourceStart + relTime,
      activeVideoClip.sourceEnd,
    );

    if (isFinite(targetSourceTime) && Math.abs(v.currentTime - targetSourceTime) > 0.15) {
      v.currentTime = Math.max(0, targetSourceTime);
    }
    v.playbackRate = activeVideoClip.speed || 1;
    v.volume = activeVideoClip.muted ? 0 : (activeVideoClip.volume || 100) / 100;

    if (isPlaying && v.paused) {
      v.play().catch(() => {});
    } else if (!isPlaying && !v.paused) {
      v.pause();
    }
  }, [playhead, activeVideoClip, isPlaying]);

  // CSS Filter string for active video
  const filterStyle = activeVideoClip
    ? `contrast(${100 + (activeVideoClip.contrast || 0)}%) saturate(${
        100 + (activeVideoClip.saturation || 0)
      }%) brightness(${100 + (activeVideoClip.brightness || 0)}%) hue-rotate(${
        activeVideoClip.hue || 0
      }deg) blur(${activeVideoClip.blur || 0}px)`
    : "none";

  const toggleFullscreen = () => {
    if (stageRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        stageRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onDropVideo) {
      onDropVideo(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* 1. STAGE VIEWPORT */}
      <div
        ref={stageRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full rounded-2xl overflow-hidden shadow-sm relative flex items-center justify-center p-3 select-none transition-all ${
          isDraggingOver
            ? "ring-4 ring-[#8B7CFF] bg-[#8B7CFF]/10"
            : ""
        }`}
        style={{
          backgroundColor: settings.canvasBgColor || "#000000",
          minHeight: "170px",
          maxHeight: "230px",
          aspectRatio: "16 / 9",
        }}
      >
        {/* COMPOSITION FRAME (Sized to aspect ratio inside stage) */}
        <div
          className={`relative overflow-hidden ring-1 ring-white/10 ${
            selectedClipId && activeVideoClip?.id === selectedClipId
              ? "ring-2 ring-yellow-400"
              : ""
          }`}
          style={{
            aspectRatio: `${aspectDef.w} / ${aspectDef.h}`,
            backgroundColor: settings.canvasBgColor || "#000000",
            maxHeight: "100%",
            maxWidth: "100%",
            height: aspectDef.w <= aspectDef.h ? "100%" : "auto",
            width: aspectDef.w >= aspectDef.h ? "100%" : "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && activeVideoClip) {
              onSelectClip(activeVideoClip.id);
            }
          }}
        >
          {/* VIDEO LAYER */}
          {activeAsset?.url ? (
            <video
              ref={videoRef}
              src={activeAsset.url}
              playsInline
              muted={activeVideoClip?.muted}
              className={`w-full h-full pointer-events-none transition-filter ${
                settings.fit === "cover" ? "object-cover" : "object-contain"
              }`}
              style={{ filter: filterStyle }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-3 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8B7CFF]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <line x1="7" y1="2" x2="7" y2="22" />
                  <line x1="17" y1="2" x2="17" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              <div className="flex flex-col gap-1 max-w-xs">
                <span className="text-sm font-bold text-white">
                  {clips.length > 0 ? "Empty Timeline Gap" : "Drag & Drop Video Here"}
                </span>
                <span className="text-xs text-zinc-400">
                  {clips.length > 0
                    ? "No clip active at current playhead time"
                    : "or choose an action below to begin editing"}
                </span>
              </div>

              {clips.length === 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {onTriggerVideoUpload && (
                    <button
                      onClick={onTriggerVideoUpload}
                      className="px-4 py-2 bg-[#8B7CFF] hover:bg-[#7867ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Upload Video
                    </button>
                  )}
                  {onLoadSampleVideo && (
                    <button
                      onClick={onLoadSampleVideo}
                      disabled={isGeneratingSample}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {isGeneratingSample ? "Loading..." : "Load Sample Clip"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LETTERBOX BARS */}
          {activeElementClips.some((e) => e.elementType === "letterbox") && (
            <>
              <div
                className="absolute top-0 left-0 right-0 bg-black pointer-events-none z-20 transition-all"
                style={{
                  height: `${
                    activeElementClips.find((e) => e.elementType === "letterbox")?.barHeightPct ||
                    10
                  }%`,
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 bg-black pointer-events-none z-20 transition-all"
                style={{
                  height: `${
                    activeElementClips.find((e) => e.elementType === "letterbox")?.barHeightPct ||
                    10
                  }%`,
                }}
              />
            </>
          )}

          {/* LOWER THIRD BANNER */}
          {activeElementClips.map((elem) => {
            if (elem.elementType !== "lowerThird") return null;
            const isSel = selectedClipId === elem.id;
            return (
              <div
                key={elem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(elem.id);
                }}
                className={`absolute bottom-6 left-6 max-w-[65%] p-3.5 rounded-xl cursor-pointer transition-all z-20 ${
                  elem.theme === "purple"
                    ? "bg-[#8B7CFF]/90 text-white"
                    : elem.theme === "dark"
                    ? "bg-zinc-900/90 text-white"
                    : "bg-white/95 text-black"
                } ${isSel ? "ring-2 ring-yellow-400 scale-[1.02]" : "hover:ring-1 hover:ring-white/40"}`}
              >
                <div className="font-bold text-sm leading-tight">{elem.title || "Headline Title"}</div>
                <div className="text-xs opacity-80 mt-0.5">{elem.subtitle || "Subheadline description"}</div>
              </div>
            );
          })}

          {/* PILL TAG BADGE */}
          {activeElementClips.map((elem) => {
            if (elem.elementType !== "pillBadge") return null;
            const isSel = selectedClipId === elem.id;
            const colorClass =
              elem.color === "red"
                ? "bg-red-500"
                : elem.color === "emerald"
                ? "bg-emerald-500"
                : elem.color === "amber"
                ? "bg-amber-500"
                : "bg-[#8B7CFF]";

            return (
              <div
                key={elem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(elem.id);
                }}
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest uppercase cursor-pointer z-20 shadow-md ${colorClass} ${
                  isSel ? "ring-2 ring-yellow-400 scale-105" : "hover:ring-1 hover:ring-white/50"
                }`}
              >
                {elem.title || "NEW"}
              </div>
            );
          })}

          {/* IMAGE OVERLAYS */}
          {activeImageClips.map((imgClip) => {
            const asset = assets.find((a) => a.id === imgClip.assetId);
            if (!asset) return null;
            const isSel = selectedClipId === imgClip.id;

            return (
              <div
                key={imgClip.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(imgClip.id);
                }}
                className={`absolute cursor-pointer transition-all z-20 ${
                  isSel ? "ring-2 ring-yellow-400" : "hover:ring-1 hover:ring-white/40"
                }`}
                style={{
                  left: `${imgClip.xPct}%`,
                  top: `${imgClip.yPct}%`,
                  transform: `translate(-50%, -50%) rotate(${imgClip.rotation || 0}deg) scale(${
                    imgClip.scale || 1
                  })`,
                  opacity: (imgClip.opacity ?? 100) / 100,
                  maxWidth: "35%",
                }}
              >
                <img
                  src={asset.url}
                  alt={imgClip.name}
                  className="w-full h-auto object-contain drop-shadow-md select-none pointer-events-none"
                />
                {isSel && (
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 rounded-full border border-black" />
                )}
              </div>
            );
          })}

          {/* TEXT OVERLAYS */}
          {activeTextClips.map((tClip) => {
            const isSel = selectedClipId === tClip.id;

            return (
              <div
                key={tClip.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(tClip.id);
                }}
                className={`absolute cursor-pointer transition-all z-20 px-3 py-1.5 rounded-lg select-none ${
                  isSel ? "ring-2 ring-yellow-400 scale-[1.02]" : "hover:ring-1 hover:ring-white/30"
                }`}
                style={{
                  left: `${tClip.xPct}%`,
                  top: `${tClip.yPct}%`,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: tClip.bgColor || "transparent",
                  color: tClip.color || "#FFFFFF",
                  fontSize: `${tClip.fontSize || 24}px`,
                  fontWeight: tClip.isBold ? "bold" : "normal",
                  fontStyle: tClip.isItalic ? "italic" : "normal",
                  textAlign: tClip.textAlign || "center",
                }}
              >
                {tClip.text}
                {isSel && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full border border-black" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-black" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full border border-black" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-black" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PLAYBACK CONTROLS BAR (Directly beneath preview) */}
      <div className="flex items-center justify-between bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-1.5 shadow-sm">
        {/* Play / Skip Buttons */}
        <div className="flex items-center gap-2">
          {/* Skip to Start */}
          <button
            onClick={() => onSeek(0)}
            title="Jump to Start"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          {/* Play / Pause Primary */}
          <button
            onClick={onTogglePlay}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            className="p-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-sm"
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Skip to End */}
          <button
            onClick={() => onSeek(totalDuration)}
            title="Jump to End"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Timecode Readout */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-bold text-black dark:text-white">
            {formatTimecode(playhead)}
          </span>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-500">
            {formatTimecode(totalDuration)}
          </span>
        </div>

        {/* Right: Aspect badge & Fullscreen */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            {settings.aspect}
          </span>
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
