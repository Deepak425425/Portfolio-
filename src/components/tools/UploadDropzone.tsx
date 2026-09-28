import React, { useCallback, useState } from 'react';

interface UploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
}

export default function UploadDropzone({ onUpload, multiple = true, accept = "image/*" }: UploadProps) {
  const [isDrag, setIsDrag] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onUpload(multiple ? files : [files[0]]);
    }
  }, [onUpload, multiple]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onUpload(multiple ? files : [files[0]]);
    }
  };

  return (
    <div 
      className={`w-full min-h-[60vh] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-300 ${
        isDrag ? 'border-accent bg-accent-soft shadow-inner' : 'border-border-color hover:border-foreground bg-white shadow-sm hover:shadow-md'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md pointer-events-none">
        
        {/* Subtle visual artwork */}
        <div className="w-24 h-24 mb-2 relative flex items-center justify-center">
           <div className={`absolute inset-0 border border-border-color rounded-xl transform rotate-3 transition-transform duration-500 ${isDrag ? 'rotate-12 border-accent' : ''}`}></div>
           <div className={`absolute inset-0 border border-border-color rounded-xl transform -rotate-3 transition-transform duration-500 bg-background ${isDrag ? '-rotate-12 border-accent' : ''}`}></div>
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`relative z-10 text-sec-text transition-colors duration-500 ${isDrag ? 'text-accent' : ''}`}>
             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
             <polyline points="17 8 12 3 7 8"></polyline>
             <line x1="12" y1="3" x2="12" y2="15"></line>
           </svg>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-sec-text">Your Workspace is Empty</span>
          <h3 className="text-2xl font-serif text-foreground">
            Drop your images here
          </h3>
          <p className="text-sm text-sec-text font-light">
             or <span className="text-accent cursor-pointer hover:underline pointer-events-auto relative">
                  choose files from your device
                  <input 
                    type="file" 
                    multiple={multiple} 
                    accept={accept} 
                    onChange={onChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </span>
          </p>
        </div>
        
        <div className="mt-4 flex gap-4 text-[9px] uppercase tracking-widest text-sec-text font-bold">
           <span className="px-3 py-1 bg-background border border-border-color rounded">JPG</span>
           <span className="px-3 py-1 bg-background border border-border-color rounded">PNG</span>
           <span className="px-3 py-1 bg-background border border-border-color rounded">WEBP</span>
        </div>
      </div>
    </div>
  );
}
