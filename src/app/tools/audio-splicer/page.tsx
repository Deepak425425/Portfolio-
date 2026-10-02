"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

type AudioSegment = {
  id: string;
  file: File;
  name: string;
  originalDuration: number;
  startTime: number;
  endTime: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
};

export default function AudioSplicerPage() {
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [crossfade, setCrossfade] = useState<number>(0);
  
  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  
  // Output
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    const loadFfmpeg = async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => setProgress(Math.max(0, Math.min(100, Math.round(progress * 100)))));
      ffmpegRef.current = ffmpeg;
    };
    loadFfmpeg();
  }, []);

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        resolve(0);
        URL.revokeObjectURL(url);
      };
    });
  };

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    
    const newSegments: AudioSegment[] = [];
    for (const file of files) {
      const duration = await getAudioDuration(file);
      if (duration > 0) {
        newSegments.push({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          originalDuration: duration,
          startTime: 0,
          endTime: duration,
          volume: 100,
          fadeIn: 0,
          fadeOut: 0
        });
      }
    }
    
    setSegments(prev => [...prev, ...newSegments]);
    if (newSegments.length > 0 && !selectedId) {
       setSelectedId(newSegments[0].id);
    }
    resetOutput();
  };

  const resetOutput = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setOutputBlob(null);
  };

  const updateSegment = (id: string, updates: Partial<AudioSegment>) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    resetOutput();
  };

  const deleteSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
    resetOutput();
  };

  const duplicateSegment = (id: string) => {
    setSegments(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy = { ...original, id: Math.random().toString(36).substring(7) };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    resetOutput();
  };

  const splitSegment = (id: string) => {
    setSegments(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const midPoint = original.startTime + (original.endTime - original.startTime) / 2;
      
      const part1 = { ...original, endTime: midPoint };
      const part2 = { ...original, id: Math.random().toString(36).substring(7), startTime: midPoint };
      
      const next = [...prev];
      next.splice(idx, 1, part1, part2);
      return next;
    });
    resetOutput();
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;
    
    setSegments(prev => {
      const newSegs = [...prev];
      const [moved] = newSegs.splice(sourceIndex, 1);
      newSegs.splice(targetIndex, 0, moved);
      return newSegs;
    });
    resetOutput();
  };

  const totalDuration = useMemo(() => {
    let t = 0;
    segments.forEach(s => {
      t += Math.max(0, s.endTime - s.startTime);
    });
    // Subtract crossfades
    if (segments.length > 1 && crossfade > 0) {
      t -= crossfade * (segments.length - 1);
    }
    return Math.max(0, t);
  }, [segments, crossfade]);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const activeSegment = segments.find(s => s.id === selectedId);

  const previewSegment = () => {
    if (!activeSegment || !previewAudioRef.current) return;
    
    // Quick local preview using original file
    const url = URL.createObjectURL(activeSegment.file);
    previewAudioRef.current.src = url;
    previewAudioRef.current.currentTime = activeSegment.startTime;
    previewAudioRef.current.volume = activeSegment.volume / 100;
    previewAudioRef.current.play().catch(e => console.error(e));
    setIsPreviewing(true);

    const checkTime = () => {
      if (previewAudioRef.current && previewAudioRef.current.currentTime >= activeSegment.endTime) {
         previewAudioRef.current.pause();
         setIsPreviewing(false);
         URL.revokeObjectURL(url);
      } else if (isPreviewing) {
         requestAnimationFrame(checkTime);
      }
    };
    requestAnimationFrame(checkTime);
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewing(false);
    }
  };

  const processAudio = async () => {
    if (segments.length === 0 || !ffmpegRef.current) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText("Initializing FFmpeg...");

    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        await ffmpeg.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        });
      }

      setStatusText("Reading Files...");
      
      const inputArgs: string[] = [];
      let complexFilter = "";
      const filterOutputs: string[] = [];

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const filename = `input_${i}.tmp`;
        await ffmpeg.writeFile(filename, await fetchFile(seg.file));
        inputArgs.push("-i", filename);

        let filter = `[${i}:a]atrim=start=${seg.startTime}:end=${seg.endTime},asetpts=PTS-STARTPTS,volume=${seg.volume/100}`;
        let currentLabel = `a${i}_trim`;
        filter += `[${currentLabel}];`;

        if (seg.fadeIn > 0) {
           filter += `[${currentLabel}]afade=t=in:st=0:d=${seg.fadeIn}[a${i}_fadein];`;
           currentLabel = `a${i}_fadein`;
        }
        
        const dur = seg.endTime - seg.startTime;
        if (seg.fadeOut > 0 && dur > seg.fadeOut) {
           filter += `[${currentLabel}]afade=t=out:st=${dur - seg.fadeOut}:d=${seg.fadeOut}[a${i}_fadeout];`;
           currentLabel = `a${i}_fadeout`;
        }

        complexFilter += filter;
        filterOutputs.push(`[${currentLabel}]`);
      }

      setStatusText("Building Sequence...");

      if (crossfade > 0 && segments.length > 1) {
        let lastOutput = filterOutputs[0];
        for (let i = 1; i < segments.length; i++) {
           const nextInput = filterOutputs[i];
           const outLabel = i === segments.length - 1 ? "[out]" : `[x${i}]`;
           complexFilter += `${lastOutput}${nextInput}acrossfade=d=${crossfade}${outLabel};`;
           lastOutput = outLabel;
        }
      } else {
        complexFilter += `${filterOutputs.join("")}concat=n=${segments.length}:v=0:a=1[out]`;
      }

      const args = [
        ...inputArgs,
        "-filter_complex", complexFilter,
        "-map", "[out]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        "-y",
        "output.mp3"
      ];

      setStatusText("Encoding Final Audio...");
      await ffmpeg.exec(args);

      setStatusText("Finalizing...");
      const data = await ffmpeg.readFile("output.mp3");
      const blob = new Blob([data as any], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);

      setOutputBlob(blob);
      setOutputUrl(url);

    } catch (error) {
      console.error(error);
      alert("Export failed. The browser might have run out of memory or encountered an unsupported format.");
    } finally {
      setIsProcessing(false);
      setStatusText("");
    }
  };

  const downloadExport = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = getGrotonExportFilename(`audio-spliced.mp3`);
    a.click();
  };

  return (
    <ToolLayout title="Audio Splicer" description="Upload, edit, arrange, and mix multiple audio files natively in your browser.">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 -mt-4 mb-20">
        <audio ref={previewAudioRef} className="hidden" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: TIMELINE & TRACKS */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black border-b border-zinc-200 pb-2">Timeline Tracks</h2>
            
            <div className="flex flex-col gap-3">
              {segments.map((seg, i) => (
                <div 
                  key={seg.id}
                  draggable
                  onDragStart={e => handleDragStart(e, i)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, i)}
                  onClick={() => setSelectedId(seg.id)}
                  className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all shadow-sm ${selectedId === seg.id ? 'bg-zinc-50 border-[#8B7CFF] ring-1 ring-[#8B7CFF]' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                       <span className="text-xs font-bold text-zinc-400 cursor-grab active:cursor-grabbing">≡</span>
                       <span className="text-xs font-bold truncate max-w-full text-black">{i+1}. {seg.name}</span>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 font-bold shrink-0">{formatTime(seg.endTime - seg.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                    <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">Vol: {seg.volume}%</span>
                    {(seg.fadeIn > 0 || seg.fadeOut > 0) && (
                       <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">Fades</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-2">
                 <UploadDropzone onUpload={handleUpload} multiple={true} accept="audio/*" />
              </div>
            </div>
          </div>

          {/* RIGHT: EDITOR */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black border-b border-zinc-200 pb-2">Segment Editor</h2>
             
             {activeSegment ? (
               <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 flex flex-col gap-8">
                  
                  {/* Header & Preview */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#8B7CFF] truncate max-w-md">{activeSegment.name}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Original: {formatTime(activeSegment.originalDuration)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={isPreviewing ? stopPreview : previewSegment} className="flex items-center gap-2 px-4 py-2 bg-[#111] text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-[#8B7CFF] transition-colors">
                           {isPreviewing ? 'Stop Preview' : 'Play Segment'}
                        </button>
                     </div>
                  </div>

                  {/* Abstract Timeline Viewer */}
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400">
                        <span>0:00</span>
                        <span>{formatTime(activeSegment.originalDuration)}</span>
                     </div>
                     <div className="w-full h-12 bg-zinc-100 rounded-lg relative overflow-hidden border border-zinc-200">
                        <div 
                          className="absolute top-0 bottom-0 bg-[#8B7CFF]/20 border-x-2 border-[#8B7CFF]"
                          style={{
                             left: `${(activeSegment.startTime / activeSegment.originalDuration) * 100}%`,
                             width: `${((activeSegment.endTime - activeSegment.startTime) / activeSegment.originalDuration) * 100}%`
                          }}
                        >
                           <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                        </div>
                     </div>
                  </div>

                  {/* Time Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                           <span>Start Time (s)</span>
                           <span>{activeSegment.startTime.toFixed(1)}s</span>
                        </label>
                        <input 
                          type="range" min="0" max={activeSegment.originalDuration} step="0.1" 
                          value={activeSegment.startTime} 
                          onChange={e => {
                             const v = Number(e.target.value);
                             updateSegment(activeSegment.id, { startTime: Math.min(v, activeSegment.endTime - 0.1) });
                          }} 
                          className="w-full accent-black"
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                           <span>End Time (s)</span>
                           <span>{activeSegment.endTime.toFixed(1)}s</span>
                        </label>
                        <input 
                          type="range" min="0" max={activeSegment.originalDuration} step="0.1" 
                          value={activeSegment.endTime} 
                          onChange={e => {
                             const v = Number(e.target.value);
                             updateSegment(activeSegment.id, { endTime: Math.max(v, activeSegment.startTime + 0.1) });
                          }} 
                          className="w-full accent-black"
                        />
                     </div>
                  </div>

                  {/* Mixing Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                           <span>Volume</span>
                           <span>{activeSegment.volume}%</span>
                        </label>
                        <input 
                          type="range" min="0" max="200" step="1" 
                          value={activeSegment.volume} 
                          onChange={e => updateSegment(activeSegment.id, { volume: Number(e.target.value) })} 
                          className="w-full accent-[#8B7CFF]"
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                           <span>Fade In</span>
                           <span>{activeSegment.fadeIn.toFixed(1)}s</span>
                        </label>
                        <input 
                          type="range" min="0" max={5} step="0.1" 
                          value={activeSegment.fadeIn} 
                          onChange={e => updateSegment(activeSegment.id, { fadeIn: Number(e.target.value) })} 
                          className="w-full accent-[#8B7CFF]"
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
                           <span>Fade Out</span>
                           <span>{activeSegment.fadeOut.toFixed(1)}s</span>
                        </label>
                        <input 
                          type="range" min="0" max={5} step="0.1" 
                          value={activeSegment.fadeOut} 
                          onChange={e => updateSegment(activeSegment.id, { fadeOut: Number(e.target.value) })} 
                          className="w-full accent-[#8B7CFF]"
                        />
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-zinc-100">
                     <button onClick={() => splitSegment(activeSegment.id)} className="px-4 py-2 bg-zinc-100 text-black text-[10px] uppercase tracking-widest font-bold rounded hover:bg-zinc-200 transition-colors">Split Half</button>
                     <button onClick={() => duplicateSegment(activeSegment.id)} className="px-4 py-2 bg-zinc-100 text-black text-[10px] uppercase tracking-widest font-bold rounded hover:bg-zinc-200 transition-colors">Duplicate</button>
                     <button onClick={() => updateSegment(activeSegment.id, { startTime: 0, endTime: activeSegment.originalDuration, volume: 100, fadeIn: 0, fadeOut: 0 })} className="px-4 py-2 bg-zinc-100 text-black text-[10px] uppercase tracking-widest font-bold rounded hover:bg-zinc-200 transition-colors">Reset</button>
                     <div className="flex-1"></div>
                     <button onClick={() => deleteSegment(activeSegment.id)} className="px-4 py-2 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold rounded hover:bg-red-100 transition-colors">Delete</button>
                  </div>

               </div>
             ) : (
               <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-2 text-zinc-400">
                 <span className="text-2xl">✂️</span>
                 <span className="text-xs font-bold uppercase tracking-widest">Select a segment to edit</span>
               </div>
             )}
             
             {/* GLOBAL EXPORT SECTION */}
             {segments.length > 0 && !outputUrl && (
               <div className="bg-white border border-black rounded-2xl shadow-sm p-6 flex flex-col gap-6 mt-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                     <div className="flex flex-col">
                       <span className="text-xs font-bold text-black uppercase tracking-widest">Final Compilation</span>
                       <span className="text-[10px] text-zinc-500">{segments.length} segment(s)</span>
                     </div>
                     <span className="text-2xl font-mono font-bold text-[#8B7CFF]">{formatTime(totalDuration)}</span>
                  </div>

                  <div className="flex items-center gap-4">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 w-32 shrink-0">Crossfade (s)</label>
                     <input 
                        type="range" min="0" max="5" step="0.1" 
                        value={crossfade} 
                        onChange={e => setCrossfade(Number(e.target.value))} 
                        disabled={segments.length < 2}
                        className="w-full accent-black disabled:opacity-30"
                     />
                     <span className="text-xs font-mono font-bold text-black w-8 shrink-0">{crossfade}s</span>
                  </div>

                  <button 
                     onClick={processAudio} 
                     disabled={isProcessing}
                     className="w-full py-4 bg-[#111111] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-[#222222] shadow-sm transition-colors disabled:opacity-50 relative overflow-hidden mt-2"
                   >
                     <span>{isProcessing ? 'Processing Compilation...' : 'Export Audio'}</span>
                     {isProcessing && (
                        <div className="absolute inset-0 bg-white/20" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
                     )}
                   </button>
                   {isProcessing && (
                      <div className="text-center text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                        {statusText} {progress > 0 && `(${progress}%)`}
                      </div>
                   )}
               </div>
             )}

             {/* OUTPUT SECTION */}
             {outputUrl && (
               <div className="bg-white p-6 md:p-8 border border-[#8B7CFF] rounded-2xl shadow-sm flex flex-col gap-6 mt-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B7CFF] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-pulse"></span>
                        Export Complete
                     </h2>
                  </div>

                  <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 flex flex-col items-center justify-center gap-4">
                     <audio src={outputUrl} controls className="w-full max-w-md" />
                     <span className="text-[10px] font-mono tracking-widest font-bold text-zinc-500">
                       Size: {(outputBlob!.size / 1024 / 1024).toFixed(2)} MB
                     </span>
                  </div>

                  <div className="flex gap-4">
                     <button 
                        onClick={downloadExport} 
                        className="flex-1 py-4 bg-[#8B7CFF] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-[#7264ed] shadow-sm transition-colors"
                      >
                        Download MP3
                      </button>
                      <button 
                        onClick={resetOutput}
                        className="py-4 px-8 bg-white text-black border border-zinc-200 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-50 transition-colors"
                      >
                        Edit Again
                      </button>
                  </div>
               </div>
             )}

          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
