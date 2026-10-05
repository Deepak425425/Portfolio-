"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";

// --- TYPES ---
interface SilenceRegion {
  id: string;
  start: number;
  end: number;
  duration: number;
  keep: boolean;
}

// --- UTILS ---
function generatePeaks(buffer: AudioBuffer, numPoints = 4000): Float32Array {
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / numPoints);
  const result = new Float32Array(numPoints * 2);
  for (let i = 0; i < numPoints; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const idx = i * step + j;
      if (idx < data.length) {
        const val = data[idx];
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
    result[i * 2] = min;
    result[i * 2 + 1] = max;
  }
  return result;
}

function detectSilence(buffer: AudioBuffer, thresholdDb: number, minDurationSec: number): SilenceRegion[] {
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const winSamples = Math.floor(sampleRate * 0.05); // 50ms windows
  const numWindows = Math.floor(buffer.length / winSamples);
  const thresholdLinear = Math.pow(10, thresholdDb / 20);
  const thresholdSq = thresholdLinear * thresholdLinear;

  let isSilent = false;
  let silenceStart = 0;
  const regions: SilenceRegion[] = [];

  for (let w = 0; w < numWindows; w++) {
    const start = w * winSamples;
    const end = start + winSamples;
    let maxEnergy = 0;

    for (let c = 0; c < channels; c++) {
      const data = buffer.getChannelData(c);
      let sumSq = 0;
      for (let i = start; i < end; i++) sumSq += data[i] * data[i];
      const meanSq = sumSq / winSamples;
      if (meanSq > maxEnergy) maxEnergy = meanSq;
    }

    const windowSilent = maxEnergy < thresholdSq;

    if (windowSilent && !isSilent) {
      isSilent = true;
      silenceStart = w * 0.05;
    } else if (!windowSilent && isSilent) {
      isSilent = false;
      const dur = (w * 0.05) - silenceStart;
      if (dur >= minDurationSec) {
        regions.push({ id: crypto.randomUUID(), start: silenceStart, end: w * 0.05, duration: dur, keep: false });
      }
    }
  }

  if (isSilent) {
    const dur = (numWindows * 0.05) - silenceStart;
    if (dur >= minDurationSec) {
      regions.push({ id: crypto.randomUUID(), start: silenceStart, end: numWindows * 0.05, duration: dur, keep: false });
    }
  }

  return regions;
}

function getEffectiveRemoval(r: SilenceRegion, padding: number) {
  const pad = Math.min(padding, r.duration / 2.01);
  return { start: r.start + pad, end: r.end - pad, duration: r.duration - (pad * 2) };
}

function processAudio(buffer: AudioBuffer, regions: SilenceRegion[], padding: number): Float32Array[] {
  const removeList = regions.filter(r => !r.keep).map(r => getEffectiveRemoval(r, padding));
  const keepSegments: { start: number; end: number }[] = [];
  let current = 0;

  for (const r of removeList) {
    if (r.start > current) keepSegments.push({ start: current, end: r.start });
    current = r.end;
  }
  if (current < buffer.duration) keepSegments.push({ start: current, end: buffer.duration });

  let totalSamples = 0;
  const segmentsSamples = keepSegments.map(seg => {
    const startSample = Math.floor(seg.start * buffer.sampleRate);
    const endSample = Math.floor(seg.end * buffer.sampleRate);
    const len = endSample - startSample;
    totalSamples += len;
    return { startSample, endSample, len };
  });

  const outBuffers: Float32Array[] = [];
  const channels = buffer.numberOfChannels;
  const crossfadeSamples = Math.min(Math.floor(0.005 * buffer.sampleRate), 100);

  for (let c = 0; c < channels; c++) {
    const out = new Float32Array(totalSamples);
    const data = buffer.getChannelData(c);
    let offset = 0;

    for (let i = 0; i < segmentsSamples.length; i++) {
      const seg = segmentsSamples[i];
      for (let j = 0; j < seg.len; j++) out[offset + j] = data[seg.startSample + j];
      if (i > 0) {
        for (let k = 0; k < crossfadeSamples && k < seg.len; k++) out[offset + k] *= (k / crossfadeSamples);
      }
      if (i < segmentsSamples.length - 1) {
        for (let k = 0; k < crossfadeSamples && k < seg.len; k++) out[offset + seg.len - 1 - k] *= (k / crossfadeSamples);
      }
      offset += seg.len;
    }
    outBuffers.push(out);
  }
  return outBuffers;
}

function encodeWAV(buffers: Float32Array[], sampleRate: number): Blob {
  const numChannels = buffers.length;
  const length = buffers[0].length;
  const buffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let s = Math.max(-1, Math.min(1, buffers[channel][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.floor((secs % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export default function SilenceRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  const [processedPeaks, setProcessedPeaks] = useState<Float32Array | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  const [threshold, setThreshold] = useState(-40);
  const [minDuration, setMinDuration] = useState(0.5);
  const [padding, setPadding] = useState(0.1);
  
  const [regions, setRegions] = useState<SilenceRegion[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  
  const [previewMode, setPreviewMode] = useState<"original" | "processed">("original");
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const rafRef = useRef<number>(0);

  const currentBuffer = previewMode === "original" ? audioBuffer : processedBuffer;
  const currentDuration = currentBuffer?.duration || 0;
  
  const estimatedDuration = useMemo(() => {
    if (!audioBuffer) return 0;
    const removedDur = regions.filter(r => !r.keep).reduce((acc, r) => acc + getEffectiveRemoval(r, padding).duration, 0);
    return audioBuffer.duration - removedDur;
  }, [audioBuffer, regions, padding]);

  // Clean up
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
  }, []);

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    const uploadedFile = files[0];
    
    if (!uploadedFile.type.startsWith("audio/") && !uploadedFile.type.startsWith("video/")) {
       setError("Sorry, this audio format is not supported by your browser.");
       return;
    }

    handleReset();
    setFile(uploadedFile);
    setIsProcessing(true);
    setProcessingStatus("Decoding audio...");

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      
      setProcessingStatus("Generating waveform...");
      const newPeaks = generatePeaks(decoded);
      setPeaks(newPeaks);
      
      setProcessingStatus("Detecting silence...");
      const detected = detectSilence(decoded, threshold, minDuration);
      setRegions(detected);
    } catch (err) {
      console.error(err);
      setError("Could not read this audio file. Try another MP3 or WAV file.");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    stopPlayback();
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setAudioBuffer(null);
    setPeaks(null);
    setProcessedPeaks(null);
    setRegions([]);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setProcessedBuffer(null);
    setError(null);
    setCurrentTime(0);
    setPreviewMode("original");
  };

  const reanalyze = () => {
    if (!audioBuffer) return;
    const detected = detectSilence(audioBuffer, threshold, minDuration);
    setRegions(detected);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setProcessedBuffer(null);
    if (previewMode === "processed") setPreviewMode("original");
  };

  useEffect(() => {
    if (audioBuffer) reanalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, minDuration]);

  // Keep all / Remove all
  const setAllKeep = (keep: boolean) => setRegions(prev => prev.map(r => ({ ...r, keep })));

  // Playback
  const togglePlay = () => {
    if (!currentBuffer || !audioContextRef.current) return;
    const ctx = audioContextRef.current;

    if (isPlaying) {
      stopPlayback();
      pauseTimeRef.current = currentTime;
    } else {
      if (ctx.state === 'suspended') ctx.resume();
      let startOffset = pauseTimeRef.current;
      if (startOffset >= currentDuration - 0.05) startOffset = 0; // restart
      
      const source = ctx.createBufferSource();
      source.buffer = currentBuffer;
      source.connect(ctx.destination);
      source.start(0, startOffset);
      sourceNodeRef.current = source;
      
      startTimeRef.current = ctx.currentTime - startOffset;
      setIsPlaying(true);

      const tick = () => {
        if (!isPlaying) return;
        let t = ctx.currentTime - startTimeRef.current;
        if (t >= currentDuration) {
          stopPlayback();
          t = currentDuration;
          pauseTimeRef.current = 0;
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
        setCurrentTime(t);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleSeek = (time: number) => {
    const t = Math.max(0, Math.min(time, currentDuration));
    pauseTimeRef.current = t;
    setCurrentTime(t);
    if (isPlaying) {
      stopPlayback();
      setTimeout(togglePlay, 10);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || (active as HTMLElement).isContentEditable)) return;
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); handleSeek(currentTime - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); handleSeek(currentTime + 1); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const activePeaks = previewMode === "original" ? peaks : processedPeaks;
    
    if (!canvas || !activePeaks) {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    // Draw Peaks
    ctx.fillStyle = "#E4E4E7"; // zinc-200
    const amp = height / 2;
    for (let i = 0; i < width; i++) {
       const pIdx = Math.floor((i / width) * (activePeaks.length / 2));
       const min = activePeaks[pIdx * 2];
       const max = activePeaks[pIdx * 2 + 1];
       const y = (1 + min) * amp;
       const h = Math.max(1, (max - min) * amp);
       ctx.fillRect(i, y, 1, h);
    }

    // Draw detected silence regions (only if Original mode)
    if (previewMode === "original" && audioBuffer) {
      regions.forEach(r => {
         const startX = (r.start / audioBuffer.duration) * width;
         const endX = (r.end / audioBuffer.duration) * width;
         
         if (!r.keep) {
           ctx.fillStyle = r.id === selectedRegionId ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.15)";
           ctx.fillRect(startX, 0, endX - startX, height);
           ctx.fillStyle = "#EF4444";
           ctx.fillRect(startX, 0, 1, height);
           ctx.fillRect(endX, 0, 1, height);
         } else {
           ctx.fillStyle = r.id === selectedRegionId ? "rgba(161, 161, 170, 0.4)" : "rgba(161, 161, 170, 0.2)";
           ctx.fillRect(startX, 0, endX - startX, height);
         }
      });
    }

    // Playhead
    const playheadX = (currentTime / currentDuration) * width;
    ctx.fillStyle = "#8B7CFF";
    ctx.fillRect(playheadX - 1, 0, 2, height);

  }, [peaks, processedPeaks, previewMode, regions, currentTime, currentDuration, selectedRegionId, audioBuffer]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    handleSeek(pct * currentDuration);
  };

  const handleProcess = async () => {
    if (!audioBuffer) return;
    setIsProcessing(true);
    setProcessingStatus("Processing audio...");
    
    // Allow UI to paint
    await new Promise(r => setTimeout(r, 50));
    
    try {
      const outBuffers = processAudio(audioBuffer, regions, padding);
      const wavBlob = encodeWAV(outBuffers, audioBuffer.sampleRate);
      
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuf = await wavBlob.arrayBuffer();
      const decodedProc = await ctx.decodeAudioData(arrayBuf);
      
      setProcessingStatus("Finalizing...");
      const pPeaks = generatePeaks(decodedProc);
      
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedBlob(wavBlob);
      setProcessedUrl(URL.createObjectURL(wavBlob));
      setProcessedBuffer(decodedProc);
      setProcessedPeaks(pPeaks);
      setPreviewMode("processed");
      handleSeek(0);
    } catch(err) {
      console.error(err);
      setError("Processing failed. Please try again or use a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !file) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    const lastDotIndex = file.name.lastIndexOf(".");
    const baseName = lastDotIndex === -1 ? file.name : file.name.substring(0, lastDotIndex);
    a.download = getGrotonExportFilename(`${baseName}-silence-removed.wav`);
    a.click();
  };

  return (
    <ToolLayout title="Silence Remover" description="Remove silent gaps from audio automatically.">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 -mt-4">
        
        {!file ? (
          <div className="flex flex-col items-center text-center gap-6 py-16">
             <div className="flex flex-col gap-2 max-w-lg">
                <h2 className="text-2xl font-bold tracking-tight">Silence Remover</h2>
                <p className="text-sm text-zinc-500">
                  Detect long silent sections in an audio recording, review them visually on the waveform, and remove unwanted pauses while keeping speech natural. All processing happens securely in your browser.
                </p>
             </div>
             
             {error && (
               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold w-full max-w-xl">
                  {error}
               </div>
             )}

             <div className="w-full max-w-xl">
               <UploadDropzone 
                 onUpload={handleUpload} 
                 multiple={false} 
                 accept="audio/*,video/*" 
                 title="Drag your audio here or click to upload"
                 formats={["MP3", "WAV", "M4A", "AAC", "OGG"]}
                 className="min-h-[16rem] bg-white border-2 border-dashed border-zinc-200 hover:border-[#8B7CFF] transition-colors"
               />
             </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* LEFT: VISUAL & TIMELINE */}
            <div className="flex-1 flex flex-col gap-4">
              
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6 relative overflow-hidden">
                 
                 {isProcessing && (
                   <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B7CFF]">{processingStatus}</div>
                   </div>
                 )}

                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{file.name}</span>
                       <span className="text-[10px] text-zinc-400 font-mono">{(file.size / (1024*1024)).toFixed(2)} MB · {audioBuffer?.sampleRate || 0} Hz</span>
                    </div>
                    
                    {processedBuffer && (
                       <div className="flex bg-zinc-100 p-1 rounded-lg">
                         <button onClick={() => { setPreviewMode("original"); handleSeek(0); }} className={`px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded transition-colors ${previewMode === "original" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}>Original</button>
                         <button onClick={() => { setPreviewMode("processed"); handleSeek(0); }} className={`px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded transition-colors ${previewMode === "processed" ? "bg-[#8B7CFF] text-white shadow-sm" : "text-zinc-500 hover:text-black"}`}>Processed</button>
                       </div>
                    )}
                 </div>

                 {/* Waveform */}
                 <div className="w-full bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 relative h-40 group cursor-pointer" onClick={handleCanvasClick}>
                    <canvas ref={canvasRef} width={800} height={160} className="w-full h-full block" />
                 </div>

                 {/* Playback Controls */}
                 <div className="flex items-center justify-between">
                    <button onClick={togglePlay} className="w-12 h-12 bg-[#111] hover:bg-[#333] text-white rounded-full flex items-center justify-center transition-colors">
                       {isPlaying ? 
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> : 
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                       }
                    </button>
                    <span className="text-sm font-mono font-bold text-zinc-600">
                      {formatTime(currentTime)} <span className="text-zinc-400">/ {formatTime(currentDuration)}</span>
                    </span>
                 </div>
              </div>

              {/* Detected Silence List */}
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col overflow-hidden max-h-[300px]">
                 <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Detected Silence ({regions.length})</span>
                    <div className="flex gap-2">
                       <button onClick={() => setAllKeep(true)} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-black">Keep All</button>
                       <button onClick={() => setAllKeep(false)} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700">Remove All</button>
                    </div>
                 </div>
                 <div className="overflow-y-auto p-2 flex flex-col gap-1">
                    {regions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-400 uppercase tracking-widest">No silence detected with current settings.</div>
                    ) : (
                      regions.map((r, i) => (
                        <div 
                          key={r.id} 
                          onClick={() => { setSelectedRegionId(r.id); handleSeek(r.start); setPreviewMode("original"); }}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-colors ${selectedRegionId === r.id ? "border-[#8B7CFF] bg-[#8B7CFF]/5" : "border-transparent hover:bg-zinc-50"}`}
                        >
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-zinc-400 w-4">{(i + 1).toString().padStart(2, '0')}</span>
                              <span className="text-xs font-mono font-bold text-zinc-600">{formatTime(r.start)} - {formatTime(r.end)}</span>
                              <span className="text-[10px] uppercase tracking-widest text-zinc-400">{r.duration.toFixed(2)}s</span>
                           </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setRegions(prev => prev.map(x => x.id === r.id ? { ...x, keep: !x.keep } : x)); }}
                             className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg border transition-colors ${!r.keep ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100" : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"}`}
                           >
                             {r.keep ? "Keeping" : "Remove"}
                           </button>
                        </div>
                      ))
                    )}
                 </div>
              </div>

            </div>

            {/* RIGHT: SETTINGS & EXPORT */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl flex flex-col gap-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Settings</h3>
                    <button onClick={handleReset} className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700">Reset</button>
                 </div>

                 <div className="flex flex-col gap-4">
                    
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-700">Silence Threshold</label>
                          <span className="text-[10px] font-mono text-zinc-500">{threshold} dB</span>
                       </div>
                       <input type="range" min="-60" max="-20" step="1" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                       <span className="text-[10px] text-zinc-400">Audio below this level is treated as silence.</span>
                    </div>

                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-700">Minimum Duration</label>
                          <span className="text-[10px] font-mono text-zinc-500">{minDuration}s</span>
                       </div>
                       <input type="range" min="0.1" max="3.0" step="0.1" value={minDuration} onChange={(e) => setMinDuration(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                       <span className="text-[10px] text-zinc-400">Only pauses longer than this are detected.</span>
                    </div>

                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-700">Silence Padding</label>
                          <span className="text-[10px] font-mono text-zinc-500">{padding}s</span>
                       </div>
                       <input type="range" min="0.0" max="1.0" step="0.05" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-[#8B7CFF]" />
                       <span className="text-[10px] text-zinc-400">Keep a small natural pause around speech.</span>
                    </div>

                 </div>
              </div>

              <div className="bg-white border border-zinc-200 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                 <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Summary</h3>
                 
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs border-b border-zinc-100 pb-2">
                      <span className="text-zinc-500">Detected silence:</span>
                      <span className="font-bold">{regions.length} sections</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-zinc-100 pb-2">
                      <span className="text-zinc-500">Total silence:</span>
                      <span className="font-bold">{regions.reduce((a,b) => a + b.duration, 0).toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-zinc-100 pb-2">
                      <span className="text-zinc-500">Original duration:</span>
                      <span className="font-bold">{formatTime(audioBuffer?.duration || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Estimated duration:</span>
                      <span className="font-bold text-[#8B7CFF]">{formatTime(estimatedDuration)}</span>
                    </div>
                 </div>

                 {processedUrl ? (
                   <button onClick={handleDownload} className="w-full py-3 mt-2 bg-[#8B7CFF] hover:bg-[#7a6aeb] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-colors shadow-sm">
                     Download WAV
                   </button>
                 ) : (
                   <button onClick={handleProcess} disabled={isProcessing || regions.length === 0} className="w-full py-3 mt-2 bg-[#111] hover:bg-[#222] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-colors disabled:opacity-50">
                     Remove Silence
                   </button>
                 )}
                 {error && <span className="text-[10px] text-red-500 text-center font-bold">{error}</span>}
              </div>

            </div>

          </div>
        )}

      </div>
    </ToolLayout>
  );
}
