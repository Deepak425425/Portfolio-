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
      className={`w-full min-h-[50vh] border border-dashed flex flex-col items-center justify-center p-8 transition-all duration-300 rounded-3xl relative overflow-hidden ${
        isDrag ? 'border-[#8B7CFF] bg-[#F7F6F2]' : 'border-zinc-300 hover:border-[#8B7CFF] bg-white'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Subtle Ambient Glow for the dropzone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#DCD7FF] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md relative z-10">
        
        {/* Subtle visual artwork */}
        <div className="w-16 h-16 mb-2 relative flex items-center justify-center">
           <div className={`absolute inset-0 border border-zinc-200 rounded-2xl transform rotate-6 transition-transform duration-500 bg-white ${isDrag ? 'rotate-12 border-[#8B7CFF]' : ''}`}></div>
           <div className={`absolute inset-0 border border-zinc-200 rounded-2xl transform -rotate-3 transition-transform duration-500 bg-white ${isDrag ? '-rotate-12 border-[#8B7CFF]' : ''}`}></div>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`relative z-10 text-zinc-400 transition-colors duration-500 ${isDrag ? 'text-[#8B7CFF]' : ''}`}>
             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
             <polyline points="17 8 12 3 7 8"></polyline>
             <line x1="12" y1="3" x2="12" y2="15"></line>
           </svg>
        </div>

        <div className="flex flex-col gap-2 items-center pointer-events-none">
          <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Your Workspace is Empty</span>
          <h3 className="text-2xl font-serif text-[#111111]">
            Drop your {multiple ? 'images' : 'image'} here
          </h3>
          <p className="text-sm text-zinc-500 font-light">
             or <span className="text-[#8B7CFF] cursor-pointer hover:underline pointer-events-auto relative font-medium">
                  choose from device
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
        
        <div className="mt-4 flex gap-3 text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold pointer-events-none">
           <span className="px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm">JPG</span>
           <span className="px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm">PNG</span>
           <span className="px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm">WEBP</span>
        </div>
      </div>
    </div>
  );
}
