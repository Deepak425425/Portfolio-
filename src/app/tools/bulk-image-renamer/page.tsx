"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import JSZip from "jszip";

interface ImgFile {
  id: string;
  file: File;
  url: string;
  origName: string;
  ext: string;
  size: number;
  customName?: string;
  selected: boolean;
}

export default function BulkImageRenamerPage() {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings
  const [baseName, setBaseName] = useState("");
  const [useNumbering, setUseNumbering] = useState(true);
  const [startNum, setStartNum] = useState(1);
  const [padding, setPadding] = useState(3);
  const [separator, setSeparator] = useState("-");
  
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  
  const [findStr, setFindStr] = useState("");
  const [replaceStr, setReplaceStr] = useState("");
  
  const [addBefore, setAddBefore] = useState("");
  const [addAfter, setAddAfter] = useState("");
  
  const [caseMode, setCaseMode] = useState<"none"|"lower"|"upper">("none");

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleUpload = (files: File[]) => {
    const newImgs = files.map(f => {
      const parts = f.name.split('.');
      const ext = parts.length > 1 ? parts.pop() || 'unknown' : 'unknown';
      return {
        id: Math.random().toString(36).substring(7),
        file: f,
        url: URL.createObjectURL(f),
        origName: parts.join('.'),
        ext,
        size: f.size,
        selected: true
      };
    });
    setImages(prev => [...prev, ...newImgs]);
  };

  const getNewName = (img: ImgFile, index: number, allImages: ImgFile[]) => {
    if (img.customName) {
      let cName = img.customName.replace(/[<>:"/\\|?*]/g, '');
      return `${cName}.${img.ext}`;
    }

    let name = baseName.trim() !== "" ? baseName : img.origName;

    if (findStr) {
      // safe regex
      try {
        name = name.split(findStr).join(replaceStr);
      } catch (e) {}
    }

    if (caseMode === 'lower') name = name.toLowerCase();
    if (caseMode === 'upper') name = name.toUpperCase();

    name = `${addBefore}${name}${addAfter}`;

    let finalBase = name;

    if (useNumbering) {
       // Filter selected items to determine the numbering index
       const selectedIndex = allImages.filter(i => i.selected).findIndex(i => i.id === img.id);
       if (selectedIndex !== -1) {
          const numStr = String(startNum + selectedIndex).padStart(padding, '0');
          finalBase = `${name}${name ? separator : ''}${numStr}`;
       }
    }

    let finalName = `${prefix}${finalBase}${suffix}`;
    
    // Clean up invalid characters
    finalName = finalName.replace(/[<>:"/\\|?*]/g, '');
    
    if (!finalName) finalName = "file";

    return `${finalName}.${img.ext}`;
  };

  // Generate previews and check duplicates
  const previews = images.map((img, i) => {
    if (!img.selected) return { id: img.id, name: img.file.name, isDuplicate: false };
    return { id: img.id, name: getNewName(img, i, images), isDuplicate: false };
  });

  const nameCounts: Record<string, number> = {};
  previews.forEach(p => {
    nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
  });
  
  previews.forEach(p => {
    if (nameCounts[p.name] > 1) p.isDuplicate = true;
  });

  const hasDuplicates = previews.some(p => p.isDuplicate);

  const removeImage = (id: string) => {
    setImages(images.filter(i => i.id !== id));
  };

  const toggleSelect = (id: string) => {
    setImages(images.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  const toggleAll = () => {
    const allSelected = images.every(i => i.selected);
    setImages(images.map(i => ({ ...i, selected: !allSelected })));
  };

  const updateCustomName = (id: string, name: string) => {
    setImages(images.map(i => i.id === id ? { ...i, customName: name || undefined } : i));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Drag Drop
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    // transparent drag image trick
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newImgs = [...images];
    const draggedItem = newImgs[draggedIdx];
    newImgs.splice(draggedIdx, 1);
    newImgs.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setImages(newImgs);
  };

  const onDragEnd = () => {
    setDraggedIdx(null);
  };

  const downloadAll = async () => {
    if (hasDuplicates) {
      alert("Please resolve duplicate filenames before downloading.");
      return;
    }
    setIsProcessing(true);
    const selected = images.filter(i => i.selected);
    
    for (let i = 0; i < selected.length; i++) {
      const img = selected[i];
      const preview = previews.find(p => p.id === img.id);
      if (!preview) continue;
      
      const a = document.createElement("a");
      a.href = img.url;
      // IMPORTANT: DO NOT USE getGrotonExportFilename HERE
      a.download = preview.name; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    if (hasDuplicates) {
      alert("Please resolve duplicate filenames before downloading.");
      return;
    }
    setIsProcessing(true);
    const zip = new JSZip();
    const selected = images.filter(i => i.selected);
    
    for (let i = 0; i < selected.length; i++) {
      const img = selected[i];
      const preview = previews.find(p => p.id === img.id);
      if (!preview) continue;
      
      const blob = await fetch(img.url).then(r => r.blob());
      // IMPORTANT: DO NOT USE getGrotonExportFilename HERE
      zip.file(preview.name, blob);
    }
    
    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    // IMPORTANT: DO NOT USE getGrotonExportFilename HERE
    a.download = `renamed_files.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsProcessing(false);
  };

  return (
    <ToolLayout title="Bulk Image Renamer" description="Rename hundreds of images quickly with powerful batch naming controls.">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {images.length === 0 ? (
            <UploadDropzone onUpload={handleUpload} multiple={true} accept="*" />
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div className="flex justify-between items-center bg-zinc-100 p-4 border border-zinc-200">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" checked={images.length > 0 && images.every(i => i.selected)} onChange={toggleAll} className="accent-black w-4 h-4" />
                   Select All ({images.filter(i => i.selected).length}/{images.length})
                 </label>
                 
                 <label className="w-32 py-2 bg-white text-center text-[10px] uppercase font-bold tracking-widest border border-zinc-200 cursor-pointer hover:border-black">
                    Add Files
                    <input type="file" multiple className="hidden" onChange={e => {if(e.target.files) handleUpload(Array.from(e.target.files))}} />
                 </label>
              </div>

              {hasDuplicates && (
                <div className="bg-red-50 text-red-600 p-4 border border-red-200 text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                  <span>⚠ Duplicate Filenames Detected</span>
                  <span className="text-[10px]">Resolve conflicts to export</span>
                </div>
              )}

              <div className="w-full bg-zinc-200 border border-zinc-200 flex flex-col max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-[auto_auto_1fr_1fr_auto] gap-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 p-4 border-b border-zinc-300 sticky top-0 bg-zinc-200 z-10 items-center">
                  <div className="w-4"></div>
                  <div className="w-8"></div>
                  <span>Original</span>
                  <span>New Name</span>
                  <span></span>
                </div>
                
                {images.map((img, index) => {
                  const preview = previews.find(p => p.id === img.id);
                  const isDup = preview?.isDuplicate;
                  
                  return (
                    <div 
                      key={img.id} 
                      draggable
                      onDragStart={e => onDragStart(e, index)}
                      onDragOver={e => onDragOver(e, index)}
                      onDragEnd={onDragEnd}
                      className={`p-4 grid grid-cols-[auto_auto_1fr_1fr_auto] gap-4 items-center border-b border-zinc-100 transition-colors ${draggedIdx === index ? 'opacity-50 bg-zinc-100' : 'bg-white hover:bg-zinc-50'} ${!img.selected ? 'opacity-40 grayscale' : ''}`}
                    >
                      <input type="checkbox" checked={img.selected} onChange={() => toggleSelect(img.id)} className="accent-black w-4 h-4" />
                      
                      <div className="cursor-move text-zinc-300 hover:text-black">
                        ☰
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-3">
                          <img src={img.url} className="w-10 h-10 object-cover border border-zinc-200 shrink-0 shadow-sm" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-black font-medium truncate" title={img.file.name}>
                              {img.file.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{img.ext} • {formatSize(img.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col min-w-0 pr-4 relative">
                        <input 
                          type="text" 
                          value={img.customName !== undefined ? img.customName : preview?.name.replace(`.${img.ext}`, '') || ''}
                          onChange={e => updateCustomName(img.id, e.target.value)}
                          placeholder="Custom name"
                          className={`text-xs font-bold truncate w-full bg-transparent border-b outline-none py-1 ${isDup ? 'text-red-500 border-red-300 focus:border-red-500' : 'text-[#8B7CFF] border-transparent hover:border-zinc-300 focus:border-black'} ${!img.selected ? 'pointer-events-none' : ''}`}
                          disabled={!img.selected}
                        />
                        <span className="text-[9px] text-zinc-400 absolute right-4 top-2 pointer-events-none">.{img.ext}</span>
                        {img.customName !== undefined && (
                           <button onClick={() => updateCustomName(img.id, "")} className="absolute right-0 top-1 text-[10px] text-zinc-400 hover:text-black">✕</button>
                        )}
                      </div>

                      <button onClick={() => removeImage(img.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 bg-white p-6 border border-zinc-200 lg:max-h-[85vh] overflow-y-auto">
          <div>
            <h2 className="font-serif text-3xl text-black mb-2">Renamer</h2>
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Batch Rules</p>
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-widest text-zinc-500">Base Name (Empty = Original)</label>
              <input type="text" value={baseName} onChange={e => setBaseName(e.target.value)} placeholder="e.g. Product" className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
            </div>
            
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 flex items-center gap-2 cursor-pointer mt-2 bg-zinc-50 p-2 border border-zinc-100">
              <input type="checkbox" checked={useNumbering} onChange={e => setUseNumbering(e.target.checked)} className="accent-black w-4 h-4" />
              Add Sequence Number
            </label>

            {useNumbering && (
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-400">Start At</label>
                  <input type="number" value={startNum} onChange={e => setStartNum(Number(e.target.value))} className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-400">Padding</label>
                  <select value={padding} onChange={e => setPadding(Number(e.target.value))} className="w-full p-2 border border-border-color text-xs outline-none focus:border-black bg-white">
                    <option value={1}>1</option>
                    <option value={2}>01</option>
                    <option value={3}>001</option>
                    <option value={4}>0001</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-400">Separator</label>
                  <select value={separator} onChange={e => setSeparator(e.target.value)} className="w-full p-2 border border-border-color text-xs outline-none focus:border-black bg-white">
                    <option value="-">Dash (-)</option>
                    <option value="_">Under (_)</option>
                    <option value=" ">Space</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
             <label className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Add Text</label>
             <div className="grid grid-cols-2 gap-2">
                <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Prefix" className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
                <input type="text" value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="Suffix" className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
             </div>
             <div className="grid grid-cols-2 gap-2 mt-2">
                <input type="text" value={addBefore} onChange={e => setAddBefore(e.target.value)} placeholder="Insert Before" className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
                <input type="text" value={addAfter} onChange={e => setAddAfter(e.target.value)} placeholder="Insert After" className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
             </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
             <label className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Find & Replace</label>
             <div className="grid grid-cols-2 gap-2">
                <input type="text" value={findStr} onChange={e => setFindStr(e.target.value)} placeholder="Find Text" className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
                <input type="text" value={replaceStr} onChange={e => setReplaceStr(e.target.value)} placeholder="Replace With" className="w-full p-2 border border-border-color text-xs outline-none focus:border-black" />
             </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4 mb-4">
             <label className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Case Formatting</label>
             <select value={caseMode} onChange={e => setCaseMode(e.target.value as any)} className="w-full p-2 border border-border-color text-xs outline-none focus:border-black bg-white">
                <option value="none">Keep Original Case</option>
                <option value="lower">lowercase everything</option>
                <option value="upper">UPPERCASE EVERYTHING</option>
             </select>
          </div>

          <div className="mt-auto flex flex-col gap-3">
             <button disabled={isProcessing || images.length === 0 || hasDuplicates} onClick={downloadAll} className="w-full py-4 bg-white border border-black text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50">
               {isProcessing ? 'Processing...' : 'Rename & Download All'}
             </button>
             <button disabled={isProcessing || images.length === 0 || hasDuplicates} onClick={downloadZip} className="w-full py-4 bg-black border border-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 shadow-md">
               {isProcessing ? 'Processing...' : 'Download ZIP'}
             </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
