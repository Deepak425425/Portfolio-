"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

export default function ShotCutsPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ duration: number; width: number; height: number; size: number; fps: number } | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'extracting' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  
  const [cuts, setCuts] = useState<number[]>([]);
  const [extractedFrames, setExtractedFrames] = useState<Record<number, string>>({});
  const [selectedCuts, setSelectedCuts] = useState<Record<number, boolean>>({});
  const [activeCut, setActiveCut] = useState<number | null>(null);
  
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
  const [minShotLength, setMinShotLength] = useState<number>(0.5);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const abortAnalysisRef = useRef(false);

  const [sheetColumns, setSheetColumns] = useState<2 | 3 | 4>(3);

  const handleUpload = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith('video/')) return;
    
    if (file.size > 1000 * 1024 * 1024) {
      alert("This video is extremely large. Processing in the browser might be slow or cause out-of-memory errors.");
    }
    
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStatus('idle');
    setCuts([]);
    setExtractedFrames({});
    setSelectedCuts({});
    setActiveCut(null);
    setCurrentTime(0);
    setProgress(0);
  };

  const handleVideoLoad = () => {
    if (videoRef.current && videoFile) {
      setVideoMeta({
        duration: videoRef.current.duration,
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
        size: videoFile.size,
        fps: 30 // Fallback FPS for precise stepping if native isn't available
      });
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    Object.values(extractedFrames).forEach(url => URL.revokeObjectURL(url));
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setStatus('idle');
    setCuts([]);
    setExtractedFrames({});
    setSelectedCuts({});
    setActiveCut(null);
    setProgress(0);
    abortAnalysisRef.current = true;
  };

  const cancelAnalysis = () => {
    abortAnalysisRef.current = true;
    setStatus('idle');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${m}:${s}.${ms}`;
  };

  const analyzeVideo = async () => {
    if (!videoUrl || !videoMeta) return;
    abortAnalysisRef.current = false;
    setStatus('analyzing');
    setProgress(0);
    setProgressText("Initializing analyzer...");
    
    setCuts([]);
    setExtractedFrames({});
    setSelectedCuts({});
    setActiveCut(null);

    const hiddenVideo = document.createElement('video');
    hiddenVideo.src = videoUrl;
    hiddenVideo.muted = true;
    hiddenVideo.playsInline = true;
    
    await new Promise(r => { hiddenVideo.onloadedmetadata = r; });

    const STEP = 0.1; 
    const SENSITIVITY_MAP = { low: 0.25, medium: 0.15, high: 0.08 };
    const threshold = SENSITIVITY_MAP[sensitivity];

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setStatus('idle');
      return;
    }

    let t = 0;
    let prevData: Uint8ClampedArray | null = null;
    let lastCutTime = -minShotLength; 
    const detectedCuts: number[] = [0];

    const seekTo = (time: number) => {
      return new Promise((resolve) => {
        const handler = () => {
          hiddenVideo.removeEventListener('seeked', handler);
          resolve(null);
        };
        hiddenVideo.addEventListener('seeked', handler);
        hiddenVideo.currentTime = time;
        setTimeout(() => {
          hiddenVideo.removeEventListener('seeked', handler);
          resolve(null);
        }, 300);
      });
    };

    while (t <= hiddenVideo.duration) {
      if (abortAnalysisRef.current) break;
      
      await seekTo(t);
      if (abortAnalysisRef.current) break;
      
      ctx.drawImage(hiddenVideo, 0, 0, 64, 64);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      
      if (prevData && (t - lastCutTime) >= minShotLength) {
        let diff = 0;
        for (let i = 0; i < data.length; i += 4) {
          diff += Math.abs(data[i] - prevData[i]) + 
                  Math.abs(data[i+1] - prevData[i+1]) + 
                  Math.abs(data[i+2] - prevData[i+2]);
        }
        const avgDiff = diff / (data.length / 4 * 3 * 255);
        if (avgDiff > threshold) {
          detectedCuts.push(t);
          lastCutTime = t;
        }
      }
      
      prevData = new Uint8ClampedArray(data);
      
      const pct = Math.round((t / hiddenVideo.duration) * 100);
      setProgress(pct);
      setProgressText(`Scanning... ${pct}%`);
      
      t += STEP;
      if (t > hiddenVideo.duration && t < hiddenVideo.duration + STEP) {
        t = hiddenVideo.duration; 
      }
    }

    if (abortAnalysisRef.current) {
      hiddenVideo.removeAttribute('src');
      return;
    }

    setStatus('extracting');
    setProgressText("Extracting high-res frames...");
    
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = hiddenVideo.videoWidth;
    fullCanvas.height = hiddenVideo.videoHeight;
    const fullCtx = fullCanvas.getContext('2d');
    
    const frames: Record<number, string> = {};
    const selCuts: Record<number, boolean> = {};

    for (let i = 0; i < detectedCuts.length; i++) {
      if (abortAnalysisRef.current) break;
      const cutTime = detectedCuts[i];
      setProgressText(`Extracting frame ${i + 1} / ${detectedCuts.length}`);
      setProgress(Math.round((i / detectedCuts.length) * 100));
      
      await seekTo(cutTime);
      if (abortAnalysisRef.current) break;
      
      if (fullCtx) {
        fullCtx.drawImage(hiddenVideo, 0, 0, fullCanvas.width, fullCanvas.height);
        const blob = await new Promise<Blob | null>(res => fullCanvas.toBlob(res, 'image/jpeg', 0.95));
        if (blob) {
          frames[cutTime] = URL.createObjectURL(blob);
          selCuts[cutTime] = true;
        }
      }
    }

    hiddenVideo.removeAttribute('src');
    
    if (!abortAnalysisRef.current) {
      setCuts(detectedCuts);
      setExtractedFrames(frames);
      setSelectedCuts(selCuts);
      setStatus('done');
      if (detectedCuts.length === 0) {
        alert("No hard cuts detected in this video.");
      }
    }
  };

  const extractSingleFrame = async (t: number) => {
    if (!videoRef.current) return null;
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = videoRef.current.videoWidth;
    fullCanvas.height = videoRef.current.videoHeight;
    const fullCtx = fullCanvas.getContext('2d');
    
    if (fullCtx) {
      fullCtx.drawImage(videoRef.current, 0, 0, fullCanvas.width, fullCanvas.height);
      const blob = await new Promise<Blob | null>(res => fullCanvas.toBlob(res, 'image/jpeg', 0.95));
      if (blob) {
        return URL.createObjectURL(blob);
      }
    }
    return null;
  };

  const addManualCut = async () => {
    if (!videoRef.current || !videoUrl) return;
    const t = videoRef.current.currentTime;
    
    if (cuts.some(c => Math.abs(c - t) < 0.05)) return;

    const url = await extractSingleFrame(t);
    if (url) {
      setExtractedFrames(prev => ({ ...prev, [t]: url }));
      setSelectedCuts(prev => ({ ...prev, [t]: true }));
      setCuts(prev => [...prev, t].sort((a, b) => a - b));
      setActiveCut(t);
    }
  };

  const setCutHere = async () => {
    if (activeCut === null || !videoRef.current) return;
    const t = videoRef.current.currentTime;
    
    const url = await extractSingleFrame(t);
    if (url) {
      // Remove old cut, add new cut
      if (extractedFrames[activeCut]) URL.revokeObjectURL(extractedFrames[activeCut]);
      
      setExtractedFrames(prev => {
        const copy = { ...prev };
        delete copy[activeCut];
        copy[t] = url;
        return copy;
      });
      
      setSelectedCuts(prev => {
        const copy = { ...prev };
        const wasSelected = copy[activeCut];
        delete copy[activeCut];
        copy[t] = wasSelected !== undefined ? wasSelected : true;
        return copy;
      });
      
      setCuts(prev => {
        const filtered = prev.filter(c => c !== activeCut);
        return [...filtered, t].sort((a, b) => a - b);
      });
      
      setActiveCut(t);
    }
  };

  const removeCut = (time: number) => {
    setCuts(prev => prev.filter(c => c !== time));
    setSelectedCuts(prev => {
      const copy = { ...prev };
      delete copy[time];
      return copy;
    });
    if (extractedFrames[time]) {
      URL.revokeObjectURL(extractedFrames[time]);
      setExtractedFrames(prev => {
        const copy = { ...prev };
        delete copy[time];
        return copy;
      });
    }
    if (activeCut === time) setActiveCut(null);
  };

  const toggleSelect = (time: number) => {
    setSelectedCuts(prev => ({ ...prev, [time]: !prev[time] }));
  };

  const seekMainVideo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setActiveCut(time);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoMeta) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(1, pct)) * videoMeta.duration;
    seekMainVideo(time);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoMeta) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setHoverTime(Math.max(0, Math.min(1, pct)) * videoMeta.duration);
  };

  const stepFrame = (dir: 1 | -1) => {
    if (videoRef.current && videoMeta) {
      videoRef.current.pause();
      const step = 1 / videoMeta.fps;
      videoRef.current.currentTime = Math.max(0, Math.min(videoMeta.duration, videoRef.current.currentTime + step * dir));
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoFile) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      
      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepFrame(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepFrame(1);
          break;
        case 'Home':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = 0;
          break;
        case 'End':
          e.preventDefault();
          if (videoRef.current && videoMeta) videoRef.current.currentTime = videoMeta.duration;
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [videoFile, videoMeta]);

  const downloadFrame = async (time: number, index: number, format: 'png' | 'jpeg' | 'webp') => {
    const url = extractedFrames[time];
    if (!url) return;
    
    const img = new Image();
    img.src = url;
    await new Promise(r => img.onload = r);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
    
    const ext = format === 'jpeg' ? 'jpg' : format;
    const mime = `image/${format}`;
    const filename = `hard-cut-${(index + 1).toString().padStart(2, '0')}`;
    const finalName = getGrotonExportFilename(`${filename}.${ext}`);
    
    const link = document.createElement('a');
    link.download = finalName;
    link.href = canvas.toDataURL(mime, 0.95);
    link.click();
  };

  const downloadZip = async () => {
    const selectedTimes = cuts.filter(c => selectedCuts[c]);
    if (selectedTimes.length === 0) return;
    
    const zip = new JSZip();
    
    for (let i = 0; i < cuts.length; i++) {
      const time = cuts[i];
      if (!selectedCuts[time]) continue;
      
      const url = extractedFrames[time];
      if (!url) continue;
      
      const response = await fetch(url);
      const blob = await response.blob();
      
      const filename = `hard-cut-${(i + 1).toString().padStart(2, '0')}.jpg`;
      zip.file(filename, blob);
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = getGrotonExportFilename("hard-cuts.zip");
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const generateContactSheet = async (format: 'jpg' | 'png' | 'pdf') => {
    const selectedTimes = cuts.filter(c => selectedCuts[c]);
    if (selectedTimes.length === 0) return;

    const cols = sheetColumns;
    const rows = Math.ceil(selectedTimes.length / cols);
    const cellWidth = 600;
    const cellHeight = (cellWidth / (videoMeta?.width || 1920)) * (videoMeta?.height || 1080);
    
    const margin = 40;
    const padding = 20;
    const textHeight = 40;
    
    const canvasWidth = margin * 2 + (cellWidth * cols) + (padding * (cols - 1));
    const canvasHeight = margin * 2 + (rows * (cellHeight + textHeight)) + (padding * (rows - 1));
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    for (let i = 0; i < selectedTimes.length; i++) {
      const time = selectedTimes[i];
      const origIndex = cuts.indexOf(time);
      
      const r = Math.floor(i / cols);
      const c = i % cols;
      
      const x = margin + c * (cellWidth + padding);
      const y = margin + r * (cellHeight + textHeight + padding);
      
      const img = new Image();
      img.src = extractedFrames[time];
      await new Promise(res => img.onload = res);
      
      ctx.drawImage(img, x, y, cellWidth, cellHeight);
      
      ctx.fillStyle = "#111111";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`SHOT ${(origIndex + 1).toString().padStart(2, '0')}`, x, y + cellHeight + 24);
      
      ctx.fillStyle = "#666666";
      ctx.font = "14px monospace";
      ctx.fillText(formatTime(time), x, y + cellHeight + 42);
    }

    if (format === 'pdf') {
      const doc = new jsPDF({
        orientation: canvasWidth > canvasHeight ? 'l' : 'p',
        unit: 'px',
        format: [canvasWidth, canvasHeight]
      });
      doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvasWidth, canvasHeight);
      doc.save(getGrotonExportFilename("contact-sheet.pdf"));
    } else {
      const link = document.createElement('a');
      link.download = getGrotonExportFilename(`contact-sheet.${format}`);
      link.href = canvas.toDataURL(`image/${format}`, 0.95);
      link.click();
    }
  };

  const selectedCount = cuts.filter(c => selectedCuts[c]).length;

  return (
    <ToolLayout 
      title="HARD CUTS" 
      description="Detect hard cuts, inspect every frame, and extract the first frame of every shot."
      category="VIDEO TOOL"
    >
      <div className="w-full flex flex-col gap-8">
        
        {!videoFile ? (
          <UploadDropzone onUpload={handleUpload} multiple={false} accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/*" />
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* Left Column: Video & Timeline */}
            <div className="w-full xl:w-2/3 flex flex-col gap-6">
              
              <div className="flex flex-col gap-3">
                <div className="bg-black relative rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] border border-zinc-200 shadow-sm">
                  <video 
                    ref={videoRef}
                    src={videoUrl!}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    onLoadedData={handleVideoLoad}
                    className="max-h-[60vh] w-full"
                  />
                  
                  {status === 'analyzing' || status === 'extracting' ? (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
                      <div className="text-[10px] uppercase tracking-widest font-bold mb-4 text-[#8B7CFF]">
                        {status === 'analyzing' ? 'Analyzing Video' : 'Extracting Frames'}
                      </div>
                      <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-[#8B7CFF] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="text-sm font-mono">{progressText}</div>
                      
                      <button 
                        onClick={cancelAnalysis}
                        className="mt-8 px-6 py-2 border border-white/20 hover:border-white/50 text-[10px] uppercase font-bold tracking-widest rounded transition-colors"
                      >
                        Cancel Analysis
                      </button>
                    </div>
                  ) : null}
                </div>
                
                {/* Frame Controls & Info */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 border border-zinc-200 shadow-sm">
                  <div className="flex gap-2">
                    <button onClick={() => stepFrame(-1)} className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
                      <span>←</span> Prev
                    </button>
                    <button onClick={togglePlay} className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white text-[10px] font-bold uppercase tracking-widest transition-colors w-20 flex justify-center">
                      {isPlaying ? '❚❚' : '▶'}
                    </button>
                    <button onClick={() => stepFrame(1)} className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
                      Next <span>→</span>
                    </button>
                  </div>
                  
                  <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">
                    <div className="flex gap-2"><span className="text-zinc-400">FRAME</span> <span>{Math.floor(currentTime * (videoMeta?.fps || 30))}</span></div>
                    <div className="flex gap-2"><span className="text-zinc-400">TIME</span> <span>{formatTime(currentTime)}</span></div>
                    <div className="flex gap-2"><span className="text-zinc-400">FPS</span> <span>{videoMeta?.fps || 30}</span></div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {videoMeta && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    <span>Timeline</span>
                    <div className="flex gap-4">
                      <span className="font-mono">{formatTime(currentTime)}</span>
                      <span>/</span>
                      <span className="font-mono">{formatTime(videoMeta.duration)}</span>
                    </div>
                  </div>
                  
                  <div 
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                    onMouseMove={handleTimelineMouseMove}
                    onMouseLeave={() => setHoverTime(null)}
                    className="w-full h-12 bg-zinc-200 relative cursor-pointer group border border-zinc-300 overflow-hidden"
                  >
                    {/* Played Progress */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#DCD7FF]/50 pointer-events-none"
                      style={{ width: `${(currentTime / videoMeta.duration) * 100}%` }}
                    />
                    
                    {/* Hover Time */}
                    {hoverTime !== null && (
                      <div 
                        className="absolute top-0 w-px h-full bg-zinc-400 pointer-events-none z-10"
                        style={{ left: `${(hoverTime / videoMeta.duration) * 100}%` }}
                      />
                    )}
                    
                    {/* Playhead */}
                    <div 
                      className="absolute top-0 w-0.5 h-full bg-[#8B7CFF] pointer-events-none z-20 shadow-[0_0_8px_#8B7CFF]"
                      style={{ left: `${(currentTime / videoMeta.duration) * 100}%` }}
                    />
                    
                    {/* Cut Markers */}
                    {cuts.map(c => (
                      <div 
                        key={c}
                        className={`absolute top-0 w-0.5 h-full z-10 transition-transform group-hover:scale-x-150 ${activeCut === c ? 'bg-red-500 scale-x-150' : 'bg-[#111111]'}`}
                        style={{ left: `${(c / videoMeta.duration) * 100}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <button 
                      onClick={addManualCut}
                      className="text-[10px] uppercase font-bold tracking-widest text-[#8B7CFF] hover:text-[#111111] transition-colors flex items-center gap-2 bg-white px-3 py-1.5 border border-zinc-200 shadow-sm"
                    >
                      + Add Cut Here
                    </button>
                    
                    {activeCut !== null && Math.abs(currentTime - activeCut) > 0.05 && (
                      <button 
                        onClick={setCutHere}
                        className="text-[10px] uppercase font-bold tracking-widest text-white bg-[#111111] hover:bg-[#222222] transition-colors flex items-center gap-2 px-3 py-1.5 shadow-sm"
                      >
                        Set Cut Here
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Controls & Results */}
            <div className="w-full xl:w-1/3 flex flex-col gap-6">
              
              <div className="bg-white p-6 border border-zinc-200 shadow-sm flex flex-col gap-6">
                
                <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest truncate">{videoFile.name}</span>
                    {videoMeta && (
                      <div className="flex gap-3 text-xs text-zinc-400 font-mono">
                        <span>{Math.round(videoMeta.duration)}s</span>
                        <span>{videoMeta.width}x{videoMeta.height}</span>
                        <span>{(videoMeta.size / (1024*1024)).toFixed(1)}MB</span>
                      </div>
                    )}
                  </div>
                  <button onClick={reset} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black shrink-0">Reset</button>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Sensitivity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map(s => (
                        <button 
                          key={s}
                          onClick={() => setSensitivity(s)}
                          className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${sensitivity === s ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111] hover:text-black'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 flex justify-between">
                      <span>Min Shot Length</span>
                      <span className="text-[#8B7CFF]">{minShotLength}s</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0.2, 0.5, 1, 2].map(l => (
                        <button 
                          key={l}
                          onClick={() => setMinShotLength(l)}
                          className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${minShotLength === l ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111] hover:text-black'}`}
                        >
                          {l}s
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={analyzeVideo}
                    className="w-full mt-2 py-4 bg-[#8B7CFF] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#7262E2] transition-colors shadow-lg"
                  >
                    {status === 'done' ? 'Re-Analyze Video' : 'Analyze Video'}
                  </button>
                </div>

                {status === 'done' && (
                  <div className="flex flex-col gap-6 mt-2 pt-6 border-t border-zinc-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-serif text-[#111111]">{cuts.length} SHOTS DETECTED</h3>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Export Options ({selectedCount} selected)</div>
                      
                      <button 
                        onClick={downloadZip}
                        disabled={selectedCount === 0}
                        className="w-full py-3 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:bg-zinc-300 flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Selected (ZIP)
                      </button>
                      
                      <div className="bg-zinc-50 p-4 border border-zinc-200 flex flex-col gap-4 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Contact Sheet</span>
                          <div className="flex gap-1">
                            {[2, 3, 4].map(c => (
                              <button 
                                key={c}
                                onClick={() => setSheetColumns(c as 2|3|4)}
                                className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border ${sheetColumns === c ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-500 border-zinc-300 hover:border-zinc-500'}`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => generateContactSheet('png')} disabled={selectedCount === 0} className="py-2 bg-white border border-zinc-300 text-[9px] uppercase font-bold tracking-widest hover:border-black disabled:opacity-50">PNG</button>
                          <button onClick={() => generateContactSheet('jpg')} disabled={selectedCount === 0} className="py-2 bg-white border border-zinc-300 text-[9px] uppercase font-bold tracking-widest hover:border-black disabled:opacity-50">JPG</button>
                          <button onClick={() => generateContactSheet('pdf')} disabled={selectedCount === 0} className="py-2 bg-white border border-zinc-300 text-[9px] uppercase font-bold tracking-widest hover:border-black disabled:opacity-50">PDF</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>

            </div>
          </div>
        )}

        {/* Results Grid - Below everything */}
        {status === 'done' && cuts.length > 0 && (
          <div className="w-full flex flex-col gap-6 mt-4">
            <div className="flex justify-between items-end border-b border-zinc-200 pb-4">
              <h2 className="text-2xl font-serif text-[#111111]">Detected Shots</h2>
              <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                <button onClick={() => cuts.forEach(c => !selectedCuts[c] && toggleSelect(c))} className="hover:text-black">Select All</button>
                <button onClick={() => cuts.forEach(c => selectedCuts[c] && toggleSelect(c))} className="hover:text-black">Deselect All</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {cuts.map((c, i) => (
                <div 
                  key={c}
                  className={`bg-white border flex flex-col transition-colors group ${selectedCuts[c] ? 'border-[#8B7CFF] ring-1 ring-[#8B7CFF]' : 'border-zinc-200 hover:border-zinc-400'} ${activeCut === c ? 'shadow-[0_0_0_2px_#111111]' : ''}`}
                >
                  <div 
                    className="relative aspect-video w-full bg-black cursor-pointer overflow-hidden"
                    onClick={() => seekMainVideo(c)}
                  >
                    {extractedFrames[c] && (
                      <img src={extractedFrames[c]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded">
                        Go To Cut
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${activeCut === c ? 'text-[#8B7CFF]' : 'text-[#111111]'}`}>SHOT {(i + 1).toString().padStart(2, '0')}</span>
                        <span className="font-mono text-xs text-zinc-500">{formatTime(c)}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={!!selectedCuts[c]}
                        onChange={() => toggleSelect(c)}
                        className="w-4 h-4 accent-[#8B7CFF] cursor-pointer mt-0.5"
                      />
                    </div>
                    
                    <div className="flex gap-2 text-[9px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => downloadFrame(c, i, 'png')} className="flex-1 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700">PNG</button>
                      <button onClick={() => downloadFrame(c, i, 'jpeg')} className="flex-1 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700">JPG</button>
                      <button onClick={() => downloadFrame(c, i, 'webp')} className="flex-1 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700">WEBP</button>
                    </div>
                    
                    <button 
                      onClick={() => removeCut(c)}
                      className="text-[9px] uppercase font-bold tracking-widest text-red-400 hover:text-red-600 text-left mt-1"
                    >
                      Remove Cut
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
