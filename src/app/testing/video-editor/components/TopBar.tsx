"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TopBarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  isExporting: boolean;
  exportProgress?: number;
  exportMessage?: string;
  hasClips: boolean;
}

export default function TopBar({
  projectName,
  onUpdateProjectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  isExporting,
  exportProgress,
  exportMessage,
  hasClips,
}: TopBarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (nameInput.trim()) {
      onUpdateProjectName(nameInput.trim());
    } else {
      setNameInput(projectName);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-sm flex items-center justify-between gap-4">
      {/* LEFT: BRANDING & BACK */}
      <div className="flex items-center gap-4">
        <Link
          href="/tools"
          className="flex items-center gap-2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider group"
          title="Back to Tools"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Tools</span>
        </Link>

        <div className="h-4 w-px bg-zinc-200 dark:bg-white/10" />

        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="text-xs uppercase tracking-widest font-black text-black dark:text-white hidden md:inline">
            GROTON STUDIO
          </span>
        </div>
      </div>

      {/* CENTER: EDITABLE PROJECT TITLE */}
      <div className="flex-1 max-w-md mx-2 flex items-center justify-center">
        {isEditingName ? (
          <input
            type="text"
            value={nameInput}
            autoFocus
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
              if (e.key === "Escape") {
                setNameInput(projectName);
                setIsEditingName(false);
              }
            }}
            className="w-full text-center text-sm font-bold bg-zinc-100 dark:bg-zinc-800 border border-[#8B7CFF] rounded-lg px-3 py-1 text-black dark:text-white focus:outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setNameInput(projectName);
              setIsEditingName(true);
            }}
            className="group flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Click to rename project"
          >
            <span className="text-sm font-bold text-black dark:text-white tracking-tight truncate max-w-[260px] sm:max-w-[340px]">
              {projectName || "Untitled Video Project"}
            </span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-400 group-hover:text-[#8B7CFF] transition-colors shrink-0"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        )}
      </div>

      {/* RIGHT: UNDO / REDO & EXPORT */}
      <div className="flex items-center gap-3">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo edit"
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo edit"
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-white/10 hidden sm:block" />

        {/* Export CTA */}
        <button
          id="btn-export-video"
          onClick={onExport}
          disabled={isExporting || !hasClips}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B7CFF] hover:bg-[#7968ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>{exportProgress ? `${exportProgress}%` : "Exporting..."}</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
