"use client";

import React, { useState } from "react";
import {
  TimelineClip,
  VideoClip,
  ImageClip,
  TextClip,
  AudioClip,
  ElementClip,
  ProjectSettings,
  ASPECT_RATIOS,
  SPEED_PRESETS,
} from "../types";

interface PropertiesPanelProps {
  selectedClip: TimelineClip | null;
  settings: ProjectSettings;
  onUpdateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  onUpdateSettings: (settings: Partial<ProjectSettings>) => void;
  onDeleteClip?: (clipId: string) => void;
  onDuplicateClip?: (clipId: string) => void;
}

export default function PropertiesPanel({
  selectedClip,
  settings,
  onUpdateClip,
  onUpdateSettings,
  onDeleteClip,
  onDuplicateClip,
}: PropertiesPanelProps) {
  // Tabs for video clips: "adjust" | "audio" | "timing" | "transform"
  const [videoTab, setVideoTab] = useState<"adjust" | "audio" | "timing" | "transform">("adjust");

  if (!selectedClip) {
    // Canvas settings when nothing is selected
    return (
      <div className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-[#8B7CFF]">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <h3 className="text-xs uppercase tracking-widest font-bold text-black dark:text-white">
              Canvas Settings
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            Project
          </span>
        </div>

        {/* Aspect Ratio */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Aspect Ratio
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ASPECT_RATIOS.map((r) => {
              const isSel = settings.aspect === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onUpdateSettings({ aspect: r.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSel
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-[#8B7CFF]"
                  }`}
                >
                  <div className="text-xs font-bold">{r.id}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{r.label.split(" ")[1] || ""}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frame Fit Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Default Fit Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateSettings({ fit: "contain" })}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                settings.fit === "contain"
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              Fit (Letterbox)
            </button>
            <button
              onClick={() => onUpdateSettings({ fit: "cover" })}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                settings.fit === "cover"
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              Fill (Crop)
            </button>
          </div>
        </div>

        {/* Canvas Background Color */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Stage Background
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Black", color: "#000000" },
              { label: "Studio", color: "#111111" },
              { label: "Slate", color: "#1e1e24" },
              { label: "White", color: "#ffffff" },
            ].map((bg) => (
              <button
                key={bg.color}
                onClick={() => onUpdateSettings({ canvasBgColor: bg.color })}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                  settings.canvasBgColor === bg.color
                    ? "border-[#8B7CFF] bg-[#8B7CFF]/10 ring-1 ring-[#8B7CFF]"
                    : "border-zinc-200 dark:border-white/10 hover:border-zinc-400"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: bg.color }}
                />
                <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                  {bg.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // VIDEO CLIP PROPERTIES
  if (selectedClip.trackType === "video") {
    const v = selectedClip as VideoClip;

    return (
      <div className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B7CFF]" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-black dark:text-white truncate max-w-[150px]">
              {v.name || "Video Clip"}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {onDuplicateClip && (
              <button
                onClick={() => onDuplicateClip(v.id)}
                title="Duplicate clip"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            )}
            {onDeleteClip && (
              <button
                onClick={() => onDeleteClip(v.id)}
                title="Delete clip"
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* TABS (Adjustments, Audio, Timing, Transform) */}
        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl">
          <button
            onClick={() => setVideoTab("adjust")}
            title="Visual Adjustments"
            className={`flex-1 py-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              videoTab === "adjust"
                ? "bg-white dark:bg-[#202024] text-black dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 0 20Z" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </button>
          <button
            onClick={() => setVideoTab("audio")}
            title="Audio Settings"
            className={`flex-1 py-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              videoTab === "audio"
                ? "bg-white dark:bg-[#202024] text-black dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
          <button
            onClick={() => setVideoTab("timing")}
            title="Speed & Timing"
            className={`flex-1 py-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              videoTab === "timing"
                ? "bg-white dark:bg-[#202024] text-black dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <button
            onClick={() => setVideoTab("transform")}
            title="Crop & Fit"
            className={`flex-1 py-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              videoTab === "transform"
                ? "bg-white dark:bg-[#202024] text-black dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2v14a2 2 0 0 0 2 2h14" />
              <path d="M18 22V8a2 2 0 0 0-2-2H2" />
            </svg>
          </button>
        </div>

        {/* TAB CONTENT */}
        {videoTab === "adjust" && (
          <div className="flex flex-col gap-3.5">
            {/* Contrast */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Contrast</span>
                <span className="font-mono text-[11px] font-bold text-zinc-500">
                  {v.contrast > 0 ? `+${v.contrast}` : v.contrast}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={v.contrast || 0}
                onChange={(e) => onUpdateClip(v.id, { contrast: Number(e.target.value) })}
                className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Saturation</span>
                <span className="font-mono text-[11px] font-bold text-zinc-500">
                  {v.saturation > 0 ? `+${v.saturation}` : v.saturation}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={v.saturation || 0}
                onChange={(e) => onUpdateClip(v.id, { saturation: Number(e.target.value) })}
                className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Hue */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Hue</span>
                <span className="font-mono text-[11px] font-bold text-zinc-500">
                  {v.hue || 0}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={v.hue || 0}
                onChange={(e) => onUpdateClip(v.id, { hue: Number(e.target.value) })}
                className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Brightness</span>
                <span className="font-mono text-[11px] font-bold text-zinc-500">
                  {v.brightness > 0 ? `+${v.brightness}` : v.brightness || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={v.brightness || 0}
                onChange={(e) => onUpdateClip(v.id, { brightness: Number(e.target.value) })}
                className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Blur</span>
                <span className="font-mono text-[11px] font-bold text-zinc-500">
                  {v.blur || 0}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={v.blur || 0}
                onChange={(e) => onUpdateClip(v.id, { blur: Number(e.target.value) })}
                className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Reset All Adjustments */}
            <button
              onClick={() =>
                onUpdateClip(v.id, {
                  contrast: 0,
                  saturation: 0,
                  hue: 0,
                  brightness: 0,
                  blur: 0,
                })
              }
              className="text-[11px] text-zinc-500 hover:text-black dark:hover:text-white underline self-end mt-1"
            >
              Reset Filters
            </button>
          </div>
        )}

        {videoTab === "audio" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Clip Audio
              </span>
              <button
                onClick={() => onUpdateClip(v.id, { muted: !v.muted })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  v.muted
                    ? "bg-red-100 text-red-600 dark:bg-red-950/40"
                    : "bg-[#8B7CFF]/15 text-[#8B7CFF]"
                }`}
              >
                {v.muted ? "Muted" : "Unmuted"}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Volume</span>
                <span className="font-mono font-bold">{v.muted ? 0 : v.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={v.muted}
                value={v.volume}
                onChange={(e) => onUpdateClip(v.id, { volume: Number(e.target.value) })}
                className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer disabled:opacity-40"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[0, 25, 50, 100].map((vol) => (
                <button
                  key={vol}
                  onClick={() => onUpdateClip(v.id, { volume: vol, muted: vol === 0 })}
                  className="py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300"
                >
                  {vol}%
                </button>
              ))}
            </div>
          </div>
        )}

        {videoTab === "timing" && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Playback Speed
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {SPEED_PRESETS.map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onUpdateClip(v.id, { speed: spd })}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      v.speed === spd
                        ? "bg-[#8B7CFF] text-white border-[#8B7CFF]"
                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex flex-col gap-1 text-[11px] text-zinc-500">
              <div className="flex justify-between">
                <span>Timeline Duration:</span>
                <span className="font-bold font-mono text-black dark:text-white">
                  {v.duration.toFixed(2)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Source In-Point:</span>
                <span className="font-bold font-mono text-black dark:text-white">
                  {v.sourceStart.toFixed(2)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Source Out-Point:</span>
                <span className="font-bold font-mono text-black dark:text-white">
                  {v.sourceEnd.toFixed(2)}s
                </span>
              </div>
            </div>
          </div>
        )}

        {videoTab === "transform" && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Crop & Framing
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ fit: "contain" })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  settings.fit === "contain"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Fit (Letterbox)
              </button>
              <button
                onClick={() => onUpdateSettings({ fit: "cover" })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  settings.fit === "cover"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Fill (Crop)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TEXT CLIP PROPERTIES
  if (selectedClip.trackType === "text") {
    const t = selectedClip as TextClip;

    return (
      <div className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[#8B7CFF] font-bold">T</span>
            <h3 className="text-xs uppercase tracking-widest font-bold text-black dark:text-white">
              Text Overlay
            </h3>
          </div>
          {onDeleteClip && (
            <button
              onClick={() => onDeleteClip(t.id)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          )}
        </div>

        {/* Text Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Content
          </label>
          <input
            type="text"
            value={t.text}
            onChange={(e) => onUpdateClip(t.id, { text: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-sm font-bold text-black dark:text-white focus:outline-none focus:border-[#8B7CFF]"
          />
        </div>

        {/* Font Size */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Font Size</span>
            <span className="font-mono">{t.fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="64"
            value={t.fontSize}
            onChange={(e) => onUpdateClip(t.id, { fontSize: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Font Color */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Color
          </label>
          <div className="flex items-center gap-2">
            {["#FFFFFF", "#FDE047", "#8B7CFF", "#EF4444", "#10B981", "#000000"].map((c) => (
              <button
                key={c}
                onClick={() => onUpdateClip(t.id, { color: c })}
                className={`w-6 h-6 rounded-full border transition-transform ${
                  t.color === c ? "scale-115 ring-2 ring-[#8B7CFF]" : "border-black/20"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Background
          </label>
          <div className="flex items-center gap-2">
            {[
              { label: "Transparent", val: "transparent" },
              { label: "Dark", val: "rgba(0,0,0,0.6)" },
              { label: "Purple", val: "rgba(139,124,255,0.85)" },
              { label: "White", val: "rgba(255,255,255,0.85)" },
            ].map((bg) => (
              <button
                key={bg.val}
                onClick={() => onUpdateClip(t.id, { bgColor: bg.val })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  t.bgColor === bg.val
                    ? "bg-[#8B7CFF] text-white border-[#8B7CFF]"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-white/10"
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Position Y (Top / Center / Bottom) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Position
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Top", y: 15 },
              { label: "Center", y: 50 },
              { label: "Bottom", y: 85 },
            ].map((pos) => (
              <button
                key={pos.label}
                onClick={() => onUpdateClip(t.id, { yPct: pos.y })}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  Math.abs(t.yPct - pos.y) < 10
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // IMAGE CLIP PROPERTIES
  if (selectedClip.trackType === "image") {
    const img = selectedClip as ImageClip;

    return (
      <div className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[#8B7CFF] font-bold">🖼</span>
            <h3 className="text-xs uppercase tracking-widest font-bold text-black dark:text-white">
              Image Overlay
            </h3>
          </div>
          {onDeleteClip && (
            <button
              onClick={() => onDeleteClip(img.id)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          )}
        </div>

        {/* Scale */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Size Scale</span>
            <span className="font-mono">{img.scale.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={img.scale}
            onChange={(e) => onUpdateClip(img.id, { scale: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Opacity */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Opacity</span>
            <span className="font-mono">{img.opacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={img.opacity}
            onChange={(e) => onUpdateClip(img.id, { opacity: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Position Presets */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Corner Placement
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Top-Left", x: 15, y: 15 },
              { label: "Top-Right", x: 85, y: 15 },
              { label: "Bottom-Left", x: 15, y: 85 },
              { label: "Bottom-Right", x: 85, y: 85 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => onUpdateClip(img.id, { xPct: p.x, yPct: p.y })}
                className="py-1.5 rounded-lg text-[11px] font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-[#8B7CFF] text-zinc-700 dark:text-zinc-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // AUDIO CLIP PROPERTIES
  if (selectedClip.trackType === "audio") {
    const a = selectedClip as AudioClip;

    return (
      <div className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[#8B7CFF] font-bold">🎵</span>
            <h3 className="text-xs uppercase tracking-widest font-bold text-black dark:text-white truncate max-w-[150px]">
              {a.name || "Audio Track"}
            </h3>
          </div>
          {onDeleteClip && (
            <button
              onClick={() => onDeleteClip(a.id)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          )}
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Track Volume</span>
            <span className="font-mono">{a.muted ? 0 : a.volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            disabled={a.muted}
            value={a.volume}
            onChange={(e) => onUpdateClip(a.id, { volume: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        <button
          onClick={() => onUpdateClip(a.id, { muted: !a.muted })}
          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
            a.muted
              ? "bg-red-100 text-red-600 border-red-200 dark:bg-red-950/40"
              : "bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/30"
          }`}
        >
          {a.muted ? "Track Muted" : "Mute Track"}
        </button>
      </div>
    );
  }

  return null;
}
