"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  TimelineClip,
  TimelineTrack,
  VideoClip,
  ImageClip,
  TextClip,
  AudioClip,
  ElementClip,
  MediaAsset,
} from "../types";
import { formatTimecode } from "./PreviewStage";

interface MultiTrackTimelineProps {
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  assets: MediaAsset[];
  selectedClipId: string | null;
  playhead: number;
  totalDuration: number;
  zoom: number; // pixels per second
  onSelectClip: (clipId: string | null) => void;
  onMoveClip: (clipId: string, newStartTime: number) => void;
  onTrimClip: (clipId: string, edge: "start" | "end", deltaSeconds: number) => void;
  onSplitClip: (clipId: string, splitTime: number) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onSeek: (time: number) => void;
  onSetZoom: (zoom: number) => void;
}

export default function MultiTrackTimeline({
  tracks,
  clips,
  assets,
  selectedClipId,
  playhead,
  totalDuration,
  zoom,
  onSelectClip,
  onMoveClip,
  onTrimClip,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onSeek,
  onSetZoom,
}: MultiTrackTimelineProps) {
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [clipInitialStart, setClipInitialStart] = useState<number>(0);

  const [trimmingClipId, setTrimmingClipId] = useState<string | null>(null);
  const [trimEdge, setTrimEdge] = useState<"start" | "end" | null>(null);
  const [trimStartX, setTrimStartX] = useState<number>(0);

  // Timeline width based on duration & zoom
  const effectiveDuration = Math.max(totalDuration, 30);
  const timelineWidthPx = Math.max(effectiveDuration * zoom, 1200);

  // Time ruler marker intervals
  let markerInterval = 2; // seconds
  if (zoom < 40) markerInterval = 5;
  else if (zoom > 100) markerInterval = 1;

  const markers: number[] = [];
  for (let t = 0; t <= effectiveDuration + 5; t += markerInterval) {
    markers.push(t);
  }

  // Handle Scrubbing on Ruler / Timeline
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updatePlayheadFromEvent(e);
  };

  const updatePlayheadFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!timelineScrollRef.current) return;
    const rect = timelineScrollRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current.scrollLeft;
    const clientX = e.clientX;
    const offsetX = clientX - rect.left + scrollLeft - 90; // 90px is compact track label width
    const newTime = Math.max(0, offsetX / zoom);
    onSeek(newTime);
  };

  // Global mouse handlers for Dragging / Trimming / Scrubbing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updatePlayheadFromEvent(e);
      } else if (draggingClipId) {
        const deltaPx = e.clientX - dragStartX;
        const deltaSec = deltaPx / zoom;
        const newStartTime = Math.max(0, clipInitialStart + deltaSec);
        onMoveClip(draggingClipId, newStartTime);
      } else if (trimmingClipId && trimEdge) {
        const deltaPx = e.clientX - trimStartX;
        const deltaSec = deltaPx / zoom;
        onTrimClip(trimmingClipId, trimEdge, deltaSec);
        setTrimStartX(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClipId(null);
      setTrimmingClipId(null);
      setTrimEdge(null);
    };

    if (isScrubbing || draggingClipId || trimmingClipId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isScrubbing, draggingClipId, clipInitialStart, dragStartX, trimmingClipId, trimEdge, trimStartX, zoom]);

  // Selected Clip
  const selectedClip = clips.find((c) => c.id === selectedClipId);

  // Can split at playhead
  const canSplitCurrent =
    selectedClip &&
    playhead > selectedClip.startTime + 0.1 &&
    playhead < selectedClip.startTime + selectedClip.duration - 0.1;

  return (
    <div className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col select-none">
      {/* 1. TIMELINE TOOLBAR */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40">
        {/* Left: Tools (Split, Duplicate, Delete) */}
        <div className="flex items-center gap-2">
          {/* Split at Playhead */}
          <button
            id="btn-split-clip"
            onClick={() => {
              if (selectedClip && canSplitCurrent) {
                onSplitClip(selectedClip.id, playhead);
              }
            }}
            disabled={!canSplitCurrent}
            title="Split Clip at Playhead (S)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 hover:border-[#8B7CFF] text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <path d="M8.12 8.12 12 12" />
              <path d="M20 4 8.12 15.88" />
              <circle cx="6" cy="18" r="3" />
              <path d="M14.8 14.8 20 20" />
            </svg>
            <span>Split</span>
          </button>

          {/* Duplicate Clip */}
          <button
            id="btn-duplicate-clip"
            onClick={() => {
              if (selectedClip) onDuplicateClip(selectedClip.id);
            }}
            disabled={!selectedClip}
            title="Duplicate Clip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 hover:border-[#8B7CFF] text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Duplicate</span>
          </button>

          {/* Delete Clip */}
          <button
            id="btn-delete-clip"
            onClick={() => {
              if (selectedClip) onDeleteClip(selectedClip.id);
            }}
            disabled={!selectedClip}
            title="Delete Selected Clip (Del)"
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        {/* Center: Timecode Counter */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-black dark:text-white">
          <span className="text-[#8B7CFF]">{formatTimecode(playhead)}</span>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-500">{formatTimecode(totalDuration)}</span>
        </div>

        {/* Right: Zoom Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetZoom(Math.max(20, zoom - 15))}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <input
            type="range"
            min="20"
            max="150"
            value={zoom}
            onChange={(e) => onSetZoom(Number(e.target.value))}
            className="w-20 accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
          <button
            onClick={() => onSetZoom(Math.min(150, zoom + 15))}
            title="Zoom In"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. MULTI-TRACK SCROLL AREA */}
      <div
        ref={timelineScrollRef}
        className="w-full overflow-x-auto overflow-y-hidden max-h-[165px] relative scrollbar-thin"
        style={{ scrollBehavior: isScrubbing ? "auto" : "smooth" }}
      >
        <div
          className="relative min-w-full pb-2"
          style={{ width: `${timelineWidthPx + 110}px` }}
        >
          {/* TIME RULER */}
          <div
            onMouseDown={handleRulerMouseDown}
            className="h-6 border-b border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/60 sticky top-0 z-20 flex items-center cursor-pointer"
          >
            {/* Header Spacer for track titles */}
            <div className="w-[90px] shrink-0 border-r border-zinc-200 dark:border-white/10 h-full flex items-center px-2.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 sticky left-0 z-30">
              Tracks
            </div>

            {/* Time Markers */}
            <div className="relative flex-1 h-full">
              {markers.map((sec) => (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 flex flex-col justify-end"
                  style={{ left: `${sec * zoom}px` }}
                >
                  <span className="text-[9px] font-mono font-semibold text-zinc-400 pl-1 pb-0.5">
                    {Math.floor(sec / 60)}:{Math.floor(sec % 60).toString().padStart(2, "0")}
                  </span>
                  <div className="h-1.5 w-px bg-zinc-300 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          </div>

          {/* PLAYHEAD NEEDLE */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none transition-all"
            style={{
              left: `${90 + playhead * zoom}px`,
              transitionDuration: isScrubbing ? "0ms" : "50ms",
            }}
          >
            {/* Playhead Scrubber Handle */}
            <div className="w-3 h-3 bg-red-500 rounded-xs -translate-x-1/2 rotate-45 shadow-md flex items-center justify-center cursor-ew-resize pointer-events-auto" />
            {/* Vertical Line */}
            <div className="w-0.5 h-full bg-red-500 -translate-x-1/2 opacity-90 shadow-xs" />
          </div>

          {/* TRACKS CONTAINER */}
          <div className="flex flex-col gap-1 p-1.5">
            {tracks.map((track) => {
              const trackClips = clips.filter((c) => c.trackType === track.type);

              return (
                <div
                  key={track.id}
                  className="flex items-center min-h-[32px] h-[32px] relative rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-white/5"
                >
                  {/* Track Label Rail (sticky left) */}
                  <div className="w-[90px] shrink-0 h-full px-2.5 flex items-center gap-1.5 border-r border-zinc-200 dark:border-white/10 bg-zinc-100/90 dark:bg-zinc-800/80 rounded-l-xl sticky left-0 z-10">
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider truncate">
                      {track.label}
                    </span>
                  </div>

                  {/* Track Timeline Area */}
                  <div className="relative flex-1 h-full">
                    {trackClips.map((clip) => {
                      const isSel = selectedClipId === clip.id;
                      const clipLeftPx = clip.startTime * zoom;
                      const clipWidthPx = Math.max(clip.duration * zoom, 24);

                      // Color themes based on track type
                      let bgTheme =
                        "bg-[#8B7CFF]/20 border-[#8B7CFF] text-[#8B7CFF]";
                      if (clip.trackType === "video") {
                        bgTheme =
                          "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300";
                      } else if (clip.trackType === "audio") {
                        bgTheme =
                          "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300";
                      } else if (clip.trackType === "image") {
                        bgTheme =
                          "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300";
                      } else if (clip.trackType === "element") {
                        bgTheme =
                          "bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-300";
                      }

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClip(clip.id);
                          }}
                          onMouseDown={(e) => {
                            // Don't drag if clicking trim handles
                            if ((e.target as HTMLElement).dataset.trim) return;
                            onSelectClip(clip.id);
                            setDraggingClipId(clip.id);
                            setDragStartX(e.clientX);
                            setClipInitialStart(clip.startTime);
                          }}
                          className={`absolute top-1 bottom-1 rounded-lg border-2 flex items-center justify-between px-2 overflow-hidden cursor-grab active:cursor-grabbing transition-shadow ${bgTheme} ${
                            isSel
                              ? "ring-2 ring-yellow-400 z-10 shadow-md font-bold"
                              : "hover:brightness-105"
                          }`}
                          style={{
                            left: `${clipLeftPx}px`,
                            width: `${clipWidthPx}px`,
                          }}
                        >
                          {/* Left Trim Handle */}
                          <div
                            data-trim="start"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              onSelectClip(clip.id);
                              setTrimmingClipId(clip.id);
                              setTrimEdge("start");
                              setTrimStartX(e.clientX);
                            }}
                            title="Drag to trim start"
                            className="w-2.5 -ml-2 h-full bg-black/20 hover:bg-yellow-400 cursor-ew-resize flex items-center justify-center shrink-0 z-20"
                          >
                            <div className="w-0.5 h-3 bg-white/70" />
                          </div>

                          {/* Clip Title & Info */}
                          <div className="flex-1 px-1.5 flex items-center gap-1.5 truncate text-[11px] font-bold pointer-events-none">
                            <span className="truncate">
                              {clip.trackType === "text"
                                ? (clip as TextClip).text || "Text"
                                : clip.name}
                            </span>
                            <span className="text-[9px] opacity-75 font-mono">
                              {clip.duration.toFixed(1)}s
                            </span>
                          </div>

                          {/* Right Trim Handle */}
                          <div
                            data-trim="end"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              onSelectClip(clip.id);
                              setTrimmingClipId(clip.id);
                              setTrimEdge("end");
                              setTrimStartX(e.clientX);
                            }}
                            title="Drag to trim end"
                            className="w-2.5 -mr-2 h-full bg-black/20 hover:bg-yellow-400 cursor-ew-resize flex items-center justify-center shrink-0 z-20"
                          >
                            <div className="w-0.5 h-3 bg-white/70" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
