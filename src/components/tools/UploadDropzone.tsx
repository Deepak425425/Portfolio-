"use client";

import React, { useRef, useCallback } from "react";

export interface UploadDropzoneProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  subLabel?: string;
}

export default function UploadDropzone({
  onUpload,
  multiple = true,
  accept = "image/*",
  label = "Click or drag image to upload",
  subLabel = "JPG, PNG, WEBP supported."
}: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onUpload(multiple ? files : [files[0]]);
    }
  }, [onUpload, multiple]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onUpload(multiple ? files : [files[0]]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="w-full aspect-[4/3] md:aspect-[16/9] border-2 border-dashed border-zinc-300 hover:border-black transition-colors flex flex-col items-center justify-center bg-white cursor-pointer group p-8 text-center"
    >
      <svg className="w-10 h-10 text-zinc-300 group-hover:text-black transition-colors mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <p className="font-bold tracking-[0.1em] uppercase text-sm mb-2 text-zinc-700 group-hover:text-black transition-colors">
        {label}
      </p>
      <p className="text-zinc-400 font-light text-xs">
        {subLabel}
      </p>
      <input 
        ref={fileInputRef} 
        type="file" 
        className="hidden" 
        accept={accept} 
        multiple={multiple}
        onChange={handleChange} 
      />
    </div>
  );
}
