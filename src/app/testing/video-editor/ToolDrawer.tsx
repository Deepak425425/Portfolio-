"use client";

import React from "react";
import { ToolId, TOOLS } from "./VerticalToolbar";
import {
  ProjectState,
  ProjectSettings,
  TimelineClip,
  VideoClip,
  ImageClip,
  TextClip,
  AudioClip,
  ElementClip,
  MediaAsset,
  ASPECT_RATIOS,
  SPEED_PRESETS,
} from "./types";

interface ToolDrawerProps {
  activeTool: ToolId;
  onClose: () => void;
  onSelectTool: (id: ToolId) => void;

  project: ProjectState;
  onAddAsset: (asset: MediaAsset) => void;
  onRemoveAsset: (assetId: string) => void;
  onAddClip: (clip: TimelineClip) => void;
  onUpdateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  onDeleteClip: (clipId: string) => void;
  onSelectClip: (clipId: string | null) => void;
  onUpdateSettings: (settings: Partial<ProjectSettings>) => void;

  onTriggerVideoUpload: () => void;
  onTriggerAudioUpload: () => void;
  onTriggerImageUpload: () => void;
  onLoadSampleVideo: () => void;
  isGeneratingSample: boolean;

  // Recording
  isRecording: boolean;
  recordingSource: "screen" | "camera";
  setRecordingSource: (source: "screen" | "camera") => void;
  recordDuration: number;
  recordError: string | null;
  onStartRecord: (source: "screen" | "camera") => void;
  onStopRecord: () => void;

  // TTS
  ttsText: string;
  setTtsText: (text: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  setSelectedVoiceName: (voiceName: string) => void;
  ttsRate: number;
  setTtsRate: (rate: number) => void;
  ttsPitch: number;
  setTtsPitch: (pitch: number) => void;
  isSpeaking: boolean;
  onSpeakTTS: () => void;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function ToolDrawer(props: ToolDrawerProps) {
  const {
    activeTool,
    onClose,
    onSelectTool,
    project,
    onAddAsset,
    onRemoveAsset,
    onAddClip,
    onUpdateClip,
    onDeleteClip,
    onSelectClip,
    onUpdateSettings,
    onTriggerVideoUpload,
    onTriggerAudioUpload,
    onTriggerImageUpload,
    onLoadSampleVideo,
    isGeneratingSample,
    isRecording,
    recordingSource,
    setRecordingSource,
    recordDuration,
    recordError,
    onStartRecord,
    onStopRecord,
    ttsText,
    setTtsText,
    availableVoices,
    selectedVoiceName,
    setSelectedVoiceName,
    ttsRate,
    setTtsRate,
    ttsPitch,
    setTtsPitch,
    isSpeaking,
    onSpeakTTS,
  } = props;

  const currentToolDef = TOOLS.find((t) => t.id === activeTool);
  const playhead = project.playhead;

  // Preset Text Adder
  const addTextPreset = (type: "headline" | "subtitle" | "badge" | "cta") => {
    const id = crypto.randomUUID();
    let text = "HEADLINE TITLE";
    let fontSize = 32;
    let color = "#FFFFFF";
    let bgColor = "rgba(0,0,0,0.6)";
    let yPct = 20;

    if (type === "subtitle") {
      text = "Descriptive caption text";
      fontSize = 20;
      color = "#FFFFFF";
      bgColor = "rgba(0,0,0,0.5)";
      yPct = 80;
    } else if (type === "badge") {
      text = "FEATURED";
      fontSize = 14;
      color = "#FFFFFF";
      bgColor = "rgba(139,124,255,0.9)";
      yPct = 15;
    } else if (type === "cta") {
      text = "TAP TO LEARN MORE";
      fontSize = 22;
      color = "#FDE047";
      bgColor = "rgba(0,0,0,0.85)";
      yPct = 50;
    }

    const newClip: TextClip = {
      id,
      trackId: "track-text",
      trackType: "text",
      name: text,
      startTime: playhead,
      duration: 4.0,
      text,
      fontSize,
      fontFamily: "Inter",
      color,
      bgColor,
      xPct: 50,
      yPct,
      isBold: true,
      isItalic: false,
      textAlign: "center",
    };

    onAddClip(newClip);
    onSelectClip(id);
  };

  // Add Element Preset
  const addElementPreset = (type: "lowerThird" | "pillBadge" | "letterbox") => {
    const id = crypto.randomUUID();
    let name = "Lower-Third Banner";
    let title = "Presenter Name";
    let subtitle = "Creator & Videographer";
    let theme: "purple" | "dark" | "minimal" = "purple";
    let color = "#8B7CFF";
    let barHeightPct = 10;

    if (type === "pillBadge") {
      name = "Pill Tag Badge";
      title = "EXCLUSIVE";
    } else if (type === "letterbox") {
      name = "Cinematic Letterbox";
    }

    const newClip: ElementClip = {
      id,
      trackId: "track-elements",
      trackType: "element",
      name,
      startTime: playhead,
      duration: 5.0,
      elementType: type,
      title,
      subtitle,
      theme,
      color,
      barHeightPct,
    };

    onAddClip(newClip);
    onSelectClip(id);
  };

  // Add SVG GROTON Logo watermark preset
  const addGrotonWatermarkPreset = () => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60"><rect width="240" height="60" rx="12" fill="#121216" fill-opacity="0.9"/><polygon points="20,18 36,30 20,42" fill="#8B7CFF"/><text x="46" y="37" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF" letter-spacing="2">GROTON AI</text></svg>`;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const assetId = crypto.randomUUID();

    const asset: MediaAsset = {
      id: assetId,
      name: "groton-watermark.svg",
      type: "image",
      url,
      size: 512,
      width: 240,
      height: 60,
    };
    onAddAsset(asset);

    const clipId = crypto.randomUUID();
    const clip: ImageClip = {
      id: clipId,
      trackId: "track-images",
      trackType: "image",
      name: "GROTON Watermark",
      startTime: playhead,
      duration: 10.0,
      assetId,
      xPct: 85,
      yPct: 15,
      scale: 1,
      opacity: 90,
      rotation: 0,
    };
    onAddClip(clip);
    onSelectClip(clipId);
  };

  return (
    <aside
      id={`panel-${activeTool}`}
      role="tabpanel"
      aria-labelledby={`tool-btn-${activeTool}`}
      className="w-full md:w-80 shrink-0 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4 animate-in fade-in duration-150 max-h-[820px] overflow-y-auto md:sticky md:top-20 z-20"
    >
      {/* DRAWER HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[#8B7CFF]">{currentToolDef?.icon}</span>
          <h3 className="text-xs uppercase tracking-widest font-bold text-black dark:text-white">
            {currentToolDef?.drawerTitle || currentToolDef?.label}
          </h3>
        </div>
        <button
          id="btn-close-tool-drawer"
          onClick={onClose}
          aria-label="Close panel"
          title="Close panel"
          className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 1. ADD (+) TOOL */}
      {activeTool === "add" && (
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Quickly import media, record new video, add audio, or insert text and element overlays into your project.
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={onTriggerVideoUpload}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black dark:text-white group-hover:text-[#8B7CFF] transition-colors">Upload Video File</span>
                <span className="text-[10px] text-zinc-500">MP4, WEBM, MOV supported</span>
              </div>
            </button>

            <button
              onClick={onLoadSampleVideo}
              disabled={isGeneratingSample}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors group disabled:opacity-60"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black dark:text-white group-hover:text-emerald-500 transition-colors">
                  {isGeneratingSample ? "Generating Sample..." : "Load Sample Video Clip"}
                </span>
                <span className="text-[10px] text-zinc-500">1-click test clip for quick edits</span>
              </div>
            </button>

            <button
              onClick={onTriggerAudioUpload}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black dark:text-white group-hover:text-amber-500 transition-colors">Add Audio Track</span>
                <span className="text-[10px] text-zinc-500">MP3, WAV, AAC music or voiceover</span>
              </div>
            </button>

            <button
              onClick={() => {
                addTextPreset("headline");
                onSelectTool("text");
              }}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black dark:text-white group-hover:text-indigo-500 transition-colors">Add Text Overlay</span>
                <span className="text-[10px] text-zinc-500">Titles, subtitles, or captions</span>
              </div>
            </button>

            <button
              onClick={onTriggerImageUpload}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black dark:text-white group-hover:text-purple-500 transition-colors">Add Logo / Watermark</span>
                <span className="text-[10px] text-zinc-500">PNG, SVG, or JPG branding image</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTool("record")}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black dark:text-white group-hover:text-red-500 transition-colors">Record Screen / Camera</span>
                <span className="text-[10px] text-zinc-500">Direct capture into timeline</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. MEDIA LIBRARY TOOL */}
      {activeTool === "media" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Project Assets</span>
            <span className="text-[10px] font-mono font-bold text-[#8B7CFF]">{project.assets.length} items</span>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onTriggerVideoUpload}
              className="py-2 px-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              + Upload Video
            </button>
            <button
              onClick={onLoadSampleVideo}
              disabled={isGeneratingSample}
              className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              + Sample Clip
            </button>
          </div>

          {/* Assets List */}
          <div className="flex flex-col gap-2">
            {project.assets.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 text-center flex flex-col items-center gap-2">
                <span className="text-xs text-zinc-400">Media Library is empty</span>
                <span className="text-[10px] text-zinc-500">Import files to reuse across timeline tracks</span>
              </div>
            ) : (
              project.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs">
                        {asset.type === "video" ? "🎬" : asset.type === "audio" ? "🎵" : "🖼"}
                      </span>
                      <span className="text-xs font-bold text-black dark:text-white truncate max-w-[140px]" title={asset.name}>
                        {asset.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveAsset(asset.id)}
                      className="text-zinc-400 hover:text-red-500 text-xs p-1"
                      title="Remove asset"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{formatBytes(asset.size)}</span>
                    {asset.duration && <span>{asset.duration.toFixed(1)}s</span>}
                  </div>

                  <button
                    onClick={() => {
                      // Add as clip to timeline at playhead
                      const clipId = crypto.randomUUID();
                      if (asset.type === "video") {
                        const dur = asset.duration || 5.0;
                        const vClip: VideoClip = {
                          id: clipId,
                          trackId: "track-video",
                          trackType: "video",
                          name: asset.name,
                          startTime: playhead,
                          duration: dur,
                          assetId: asset.id,
                          sourceStart: 0,
                          sourceEnd: dur,
                          speed: 1,
                          volume: 100,
                          muted: false,
                          contrast: 0,
                          saturation: 0,
                          hue: 0,
                          brightness: 0,
                          blur: 0,
                        };
                        onAddClip(vClip);
                      } else if (asset.type === "image") {
                        const imgClip: ImageClip = {
                          id: clipId,
                          trackId: "track-images",
                          trackType: "image",
                          name: asset.name,
                          startTime: playhead,
                          duration: 4.0,
                          assetId: asset.id,
                          xPct: 50,
                          yPct: 50,
                          scale: 1,
                          opacity: 100,
                          rotation: 0,
                        };
                        onAddClip(imgClip);
                      } else if (asset.type === "audio") {
                        const dur = asset.duration || 10.0;
                        const aClip: AudioClip = {
                          id: clipId,
                          trackId: "track-audio",
                          trackType: "audio",
                          name: asset.name,
                          startTime: playhead,
                          duration: dur,
                          assetId: asset.id,
                          sourceStart: 0,
                          sourceEnd: dur,
                          volume: 100,
                          muted: false,
                        };
                        onAddClip(aClip);
                      }
                      onSelectClip(clipId);
                    }}
                    className="w-full py-1.5 bg-white dark:bg-zinc-800 hover:bg-[#8B7CFF]/15 hover:text-[#8B7CFF] border border-zinc-200 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    + Add to Timeline
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. CANVAS TOOL */}
      {activeTool === "canvas" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Aspect Ratio</span>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onUpdateSettings({ aspect: r.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    project.settings.aspect === r.id
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                      : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="text-xs font-bold">{r.id}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{r.label.split(" ")[1] || ""}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Framing Fit Mode</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ fit: "contain" })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  project.settings.fit === "contain"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Fit (Letterbox)
              </button>
              <button
                onClick={() => onUpdateSettings({ fit: "cover" })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  project.settings.fit === "cover"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Fill (Crop)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Stage Background</span>
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
                    project.settings.canvasBgColor === bg.color
                      ? "border-[#8B7CFF] bg-[#8B7CFF]/10 ring-1 ring-[#8B7CFF]"
                      : "border-zinc-200 dark:border-white/10 hover:border-zinc-400"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: bg.color }} />
                  <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">{bg.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TEXT TOOL */}
      {activeTool === "text" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Add typography overlays onto the text track at the current playhead time ({playhead.toFixed(1)}s).
          </p>

          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "headline", label: "Headline Title", desc: "Bold display font, 32px" },
              { id: "subtitle", label: "Descriptive Subtitle", desc: "Clean caption, 20px" },
              { id: "badge", label: "Pill Tag Badge", desc: "Accent purple badge" },
              { id: "cta", label: "Call to Action", desc: "High contrast highlight, yellow" },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => addTextPreset(preset.id as any)}
                className="p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors flex justify-between items-center group"
              >
                <div>
                  <div className="text-xs font-bold text-black dark:text-white group-hover:text-[#8B7CFF] transition-colors">{preset.label}</div>
                  <div className="text-[10px] text-zinc-500">{preset.desc}</div>
                </div>
                <span className="text-xs font-bold text-[#8B7CFF]">+ Add</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. AUDIO TOOL */}
      {activeTool === "audio" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Import and mix background music, voiceover tracks, and sound effects.
          </p>

          <button
            onClick={onTriggerAudioUpload}
            className="w-full py-3 bg-[#8B7CFF] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#7968ff] transition-colors flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Upload Audio Track</span>
          </button>

          {/* List Audio Clips */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Timeline Audio Clips</span>
            {project.clips.filter((c) => c.trackType === "audio").length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 text-center text-xs text-zinc-400">
                No audio tracks on timeline yet
              </div>
            ) : (
              project.clips
                .filter((c): c is AudioClip => c.trackType === "audio")
                .map((aClip) => (
                  <div
                    key={aClip.id}
                    onClick={() => onSelectClip(aClip.id)}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 cursor-pointer hover:border-[#8B7CFF] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-black dark:text-white">
                      <span className="truncate max-w-[160px]">{aClip.name}</span>
                      <span className="font-mono text-[10px] text-zinc-500">{aClip.duration.toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Volume: {aClip.muted ? 0 : aClip.volume}%</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClip(aClip.id);
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 6. VIDEOS TOOL */}
      {activeTool === "videos" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Video Clips on Timeline</span>
            <span className="text-[10px] font-mono font-bold text-[#8B7CFF]">
              {project.clips.filter((c) => c.trackType === "video").length} clips
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {project.clips.filter((c) => c.trackType === "video").length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 text-center flex flex-col items-center gap-2">
                <span className="text-xs text-zinc-400">No video clips on timeline</span>
                <button
                  onClick={onTriggerVideoUpload}
                  className="py-1.5 px-3 bg-[#8B7CFF] text-white rounded-lg text-xs font-bold"
                >
                  Upload Video
                </button>
              </div>
            ) : (
              project.clips
                .filter((c): c is VideoClip => c.trackType === "video")
                .map((vClip) => (
                  <div
                    key={vClip.id}
                    onClick={() => onSelectClip(vClip.id)}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 cursor-pointer hover:border-[#8B7CFF] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-black dark:text-white">
                      <span className="truncate max-w-[150px]">{vClip.name}</span>
                      <span className="font-mono text-[10px] text-amber-500 font-bold">{vClip.duration.toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Speed: {vClip.speed}×</span>
                      <span>Vol: {vClip.muted ? "Muted" : `${vClip.volume}%`}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 7. IMAGES TOOL */}
      {activeTool === "images" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Overlay branding logos, watermarks, and graphics onto your video timeline.
          </p>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onTriggerImageUpload}
              className="py-3 px-4 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Upload Image File</span>
            </button>

            <button
              onClick={addGrotonWatermarkPreset}
              className="py-2.5 px-4 bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#8B7CFF]/25 transition-colors"
            >
              + GROTON Watermark Preset
            </button>
          </div>
        </div>
      )}

      {/* 8. ELEMENTS TOOL */}
      {activeTool === "elements" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Add motion graphics, lower-third title bars, and cinematic letterbox elements.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "lowerThird", label: "Lower-Third Banner", desc: "Title & subtitle banner at bottom" },
              { id: "pillBadge", label: "Pill Tag Badge", desc: "Status tag badge at top corner" },
              { id: "letterbox", label: "Cinematic Letterbox", desc: "2.39:1 widescreen black bars" },
            ].map((elem) => (
              <button
                key={elem.id}
                onClick={() => addElementPreset(elem.id as any)}
                className="p-3 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-left transition-colors flex justify-between items-center group"
              >
                <div>
                  <div className="text-xs font-bold text-black dark:text-white group-hover:text-[#8B7CFF] transition-colors">{elem.label}</div>
                  <div className="text-[10px] text-zinc-500">{elem.desc}</div>
                </div>
                <span className="text-xs font-bold text-[#8B7CFF]">+ Add</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 9. RECORD TOOL */}
      {activeTool === "record" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Record your display screen or webcam directly into the video editor timeline.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRecordingSource("screen")}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                recordingSource === "screen"
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Screen
            </button>
            <button
              onClick={() => setRecordingSource("camera")}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                recordingSource === "camera"
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Camera
            </button>
          </div>

          {recordError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
              {recordError}
            </div>
          )}

          {isRecording ? (
            <div className="flex flex-col items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-center">
              <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>Recording: {recordDuration}s</span>
              </div>
              <button
                onClick={onStopRecord}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Stop & Add to Timeline
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartRecord(recordingSource)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span>Start Recording</span>
            </button>
          )}
        </div>
      )}

      {/* 10. TTS TOOL */}
      {activeTool === "tts" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Preview synthesized speech using your browser Web Speech API.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Text to Speak</label>
            <textarea
              rows={3}
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Voice</label>
            <select
              value={selectedVoiceName}
              onChange={(e) => setSelectedVoiceName(e.target.value)}
              className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none"
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSpeakTTS}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                isSpeaking
                  ? "bg-red-600 text-white"
                  : "bg-[#8B7CFF] text-white hover:bg-[#7968ff]"
              }`}
            >
              {isSpeaking ? "Stop Speaking" : "Preview Voice"}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-[10px] text-zinc-500 leading-relaxed border border-zinc-200 dark:border-white/10">
            Note: Speech synthesis runs through your operating system speech synthesizer. To include voice in timeline export, import an MP3/WAV audio track.
          </div>
        </div>
      )}
    </aside>
  );
}
