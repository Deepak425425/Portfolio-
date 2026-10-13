"use client";

import React from "react";

export type ToolId =
  | "add"
  | "media"
  | "canvas"
  | "text"
  | "audio"
  | "videos"
  | "images"
  | "elements"
  | "record"
  | "tts";

export interface ToolDef {
  id: ToolId;
  label: string;
  drawerTitle: string;
  icon: React.ReactNode;
}

export const TOOLS: ToolDef[] = [
  {
    id: "add",
    label: "Add",
    drawerTitle: "Add Content",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: "media",
    label: "Media",
    drawerTitle: "Project Media",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: "canvas",
    label: "Canvas",
    drawerTitle: "Canvas & Aspect",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="3" y1="9" x2="21" y2="9" />
      </svg>
    ),
  },
  {
    id: "text",
    label: "Text",
    drawerTitle: "Text Overlays",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    id: "audio",
    label: "Audio",
    drawerTitle: "Audio Controls",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "videos",
    label: "Videos",
    drawerTitle: "Video Clips",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    id: "images",
    label: "Images",
    drawerTitle: "Image Overlays",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    id: "elements",
    label: "Elements",
    drawerTitle: "Visual Elements",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.29 3.86-7.4 12.82A1.9 1.9 0 0 0 4.54 19.5h14.92a1.9 1.9 0 0 0 1.65-2.82l-7.4-12.82a1.9 1.9 0 0 0-3.42 0Z" />
        <circle cx="17.5" cy="8.5" r="3.5" />
      </svg>
    ),
  },
  {
    id: "record",
    label: "Record",
    drawerTitle: "Screen & Camera",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "tts",
    label: "TTS",
    drawerTitle: "Text-to-Speech",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5v14M7 5v14M2 9v6M22 9v6" />
      </svg>
    ),
  },
];

interface VerticalToolbarProps {
  activeTool: ToolId | null;
  isDrawerOpen: boolean;
  onSelectTool: (id: ToolId) => void;
}

export default function VerticalToolbar({
  activeTool,
  isDrawerOpen,
  onSelectTool,
}: VerticalToolbarProps) {
  return (
    <nav
      id="video-editor-toolbar"
      aria-label="Video Editor Left Toolbar"
      role="tablist"
      aria-orientation="vertical"
      className="w-full md:w-[62px] shrink-0 bg-white border border-zinc-200 rounded-2xl p-1 shadow-sm flex flex-row md:flex-col items-center justify-between md:justify-start gap-0.5 overflow-x-auto md:overflow-x-visible select-none z-30"
    >
      {TOOLS.map((t) => {
        const isActive = activeTool === t.id && isDrawerOpen;
        const isAdd = t.id === "add";

        return (
          <button
            key={t.id}
            id={`tool-btn-${t.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${t.id}`}
            tabIndex={0}
            onClick={() => onSelectTool(t.id)}
            title={`${t.label} Tool`}
            className={`flex flex-col items-center justify-center px-0.5 rounded-lg transition-all duration-150 w-full min-w-[44px] h-[28px] min-h-[28px] focus-visible:ring-2 focus-visible:ring-[#8B7CFF] focus:outline-none ${
              isActive
                ? "bg-[#8B7CFF]/15 text-[#8B7CFF] font-black border border-[#8B7CFF]/30 shadow-xs"
                : isAdd
                ? "text-[#8B7CFF] hover:bg-[#8B7CFF]/10 font-bold border border-transparent"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100 border border-transparent font-medium"
            }`}
          >
            <div
              className={`w-3 h-3 flex items-center justify-center transition-transform ${
                isActive ? "scale-105" : ""
              }`}
            >
              {t.icon}
            </div>
            <span className="text-[7.5px] font-semibold tracking-tight mt-0.5 leading-none text-center">
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
