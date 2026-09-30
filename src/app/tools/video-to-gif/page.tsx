"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from "gifenc";

export default function VideoToGifPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ duration: number; width: number; height: number; size: number } | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const abortRef = useRef(false);

  // Settings
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(1);
  const [fps, setFps] = useState<number>(10);
  const [outputWidth, setOutputWidth] = useState<string>('480');
  const [quality, setQuality] = useState<'LOW' | 'BALANCED' | 'HIGH'>('BALANCED');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [reverse, setReverse] = useState(false);
  const [cropPreset, setCropPreset] = useState<string>('Original');
  const [loop, setLoop] = useState<string>('Forever');

  // Preview & Results
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState<number>(0);

  // Estimation
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleUpload = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith('video/')) return;
    
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStatus('idle');
    setGifUrl(null);
    setProgress(0);
    setEstimatedSize(null);
  };

  const handleVideoLoad = () => {
    if (videoRef.current && videoFile) {
      const dur = videoRef.current.duration;
      setVideoMeta({
        duration: dur,
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
        size: videoFile.size
      });
      setStartTime(0);
      setEndTime(dur);
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setGifUrl(null);
    setStatus('idle');
    setProgress(0);
    setEstimatedSize(null);
    abortRef.current = true;
  };

  const cancel = () => {
    abortRef.current = true;
    setStatus('idle');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 10).toString(); // just 1 decimal for ui
    return `${m}:${s}.${ms}`;
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getOutDimensions = useCallback(() => {
    if (!videoMeta) return { outW: 0, outH: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 };
    let outW = videoMeta.width;
    let outH = videoMeta.height;
    
    let cropX = 0, cropY = 0, cropW = videoMeta.width, cropH = videoMeta.height;
    if (cropPreset !== 'Original') {
      const [cw, ch] = cropPreset.split(':').map(Number);
      const targetRatio = cw / ch;
      const videoRatio = videoMeta.width / videoMeta.height;
      
      if (videoRatio > targetRatio) {
        cropH = videoMeta.height;
        cropW = cropH * targetRatio;
        cropX = (videoMeta.width - cropW) / 2;
      } else {
        cropW = videoMeta.width;
        cropH = cropW / targetRatio;
        cropY = (videoMeta.height - cropH) / 2;
      }
      outW = cropW;
      outH = cropH;
    }

    if (outputWidth !== 'Original') {
      const targetW = parseInt(outputWidth, 10);
      const ratio = outH / outW;
      outW = targetW;
      outH = targetW * ratio;
    }
    
    return {
      outW: Math.round(outW),
      outH: Math.round(outH),
      cropX, cropY, cropW, cropH
    };
  }, [videoMeta, outputWidth, cropPreset]);

  // Estimation Pass
  useEffect(() => {
    if (!videoUrl || !videoMeta || status !== 'idle') return;
    setIsEstimating(true);

    let isActive = true;
    const timeout = setTimeout(async () => {
      try {
        const durationSelected = endTime - startTime;
        const step = (1 / fps) * playbackSpeed;
        const totalFrames = Math.max(0, Math.floor(durationSelected / step));
        
        if (totalFrames <= 0) {
          if (isActive) { setEstimatedSize(0); setIsEstimating(false); }
          return;
        }

        const sampleCount = Math.min(5, totalFrames);
        const times: number[] = [];
        for (let i = 0; i < sampleCount; i++) {
          times.push(startTime + (i / Math.max(1, sampleCount - 1)) * durationSelected);
        }

        const { outW, outH, cropX, cropY, cropW, cropH } = getOutDimensions();
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) return;

        const hiddenVideo = document.createElement('video');
        hiddenVideo.src = videoUrl;
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
        await new Promise(r => { hiddenVideo.onloadedmetadata = r; });

        const gif = new GIFEncoder();
        const gifFormat = quality === 'HIGH' ? 'rgb444' : 'rgb565';

        for (const t of times) {
          if (!isActive) break;
          await new Promise((resolve) => {
            const handler = () => { hiddenVideo.removeEventListener('seeked', handler); resolve(null); };
            hiddenVideo.addEventListener('seeked', handler);
            hiddenVideo.currentTime = t;
            setTimeout(() => { hiddenVideo.removeEventListener('seeked', handler); resolve(null); }, 300);
          });
          
          if (!isActive) break;
          ctx.drawImage(hiddenVideo, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
          const imgData = ctx.getImageData(0, 0, outW, outH);
          const palette = quantize(imgData.data, 256, { format: gifFormat });
          const index = applyPalette(imgData.data, palette, gifFormat);
          gif.writeFrame(index, outW, outH, { palette, delay: Math.round(1000 / fps) });
        }
        
        hiddenVideo.removeAttribute('src');

        if (isActive) {
          gif.finish();
          const avgFrameBytes = gif.bytes().length / sampleCount;
          const estimatedTotal = avgFrameBytes * totalFrames;
          setEstimatedSize(estimatedTotal);
          setIsEstimating(false);
        }
      } catch (err) {
        console.error("Estimation failed", err);
        if (isActive) setIsEstimating(false);
      }
    }, 600); // Debounce delay

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [startTime, endTime, fps, outputWidth, quality, playbackSpeed, cropPreset, videoUrl, videoMeta, status, getOutDimensions]);

  const generateGif = async () => {
    if (!videoUrl || !videoMeta) return;
    
    // Check large output risk based on estimate
    if (estimatedSize && estimatedSize > 25 * 1024 * 1024) {
      const confirmRun = window.confirm("The estimated GIF is very large. Your browser might freeze during encoding. Proceed?");
      if (!confirmRun) return;
    }

    abortRef.current = false;
    setStatus('generating');
    setProgress(0);
    setProgressText('Extracting frames...');
    
    const hiddenVideo = document.createElement('video');
    hiddenVideo.src = videoUrl;
    hiddenVideo.muted = true;
    hiddenVideo.playsInline = true;
    
    await new Promise(r => { hiddenVideo.onloadedmetadata = r; });

    const step = (1 / fps) * playbackSpeed;
    const times: number[] = [];
    for (let t = startTime; t <= endTime; t += step) {
      times.push(t);
    }
    
    if (reverse) times.reverse();

    const { outW, outH, cropX, cropY, cropW, cropH } = getOutDimensions();
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      setStatus('idle');
      return;
    }

    const gif = new GIFEncoder();
    const gifFormat = quality === 'HIGH' ? 'rgb444' : 'rgb565';
    
    const seekTo = (time: number) => {
      return new Promise((resolve) => {
        const handler = () => { hiddenVideo.removeEventListener('seeked', handler); resolve(null); };
        hiddenVideo.addEventListener('seeked', handler);
        hiddenVideo.currentTime = time;
        setTimeout(() => { hiddenVideo.removeEventListener('seeked', handler); resolve(null); }, 300);
      });
    };

    for (let i = 0; i < times.length; i++) {
      if (abortRef.current) break;
      const t = times[i];
      
      await seekTo(t);
      if (abortRef.current) break;
      
      ctx.drawImage(hiddenVideo, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
      const imgData = ctx.getImageData(0, 0, outW, outH);
      
      setProgressText(`Encoding frame ${i + 1} / ${times.length}`);
      setProgress(Math.round((i / times.length) * 100));
      
      await new Promise(r => setTimeout(r, 0)); // yield
      
      const palette = quantize(imgData.data, 256, { format: gifFormat });
      const index = applyPalette(imgData.data, palette, gifFormat);
      gif.writeFrame(index, outW, outH, { palette, delay: Math.round(1000 / fps) });
    }

    hiddenVideo.removeAttribute('src');

    if (!abortRef.current) {
      setProgressText('Finalizing GIF...');
      await new Promise(r => setTimeout(r, 0));
      
      gif.finish();
      const bytes = gif.bytes();
      const blob = new Blob([bytes], { type: 'image/gif' });
      
      setGifUrl(URL.createObjectURL(blob));
      setGifSize(blob.size);
      setStatus('done');
    }
  };

  const downloadGif = () => {
    if (!gifUrl || !videoFile) return;
    const name = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) || videoFile.name;
    const finalName = getGrotonExportFilename(`${name}.gif`);
    
    const link = document.createElement('a');
    link.href = gifUrl;
    link.download = finalName;
    link.click();
  };

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  const handlePointerDown = (e: React.PointerEvent, type: 'start' | 'end') => {
    e.stopPropagation();
    setDragging(type);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current || !videoMeta) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pct * videoMeta.duration;

    if (dragging === 'start') {
      setStartTime(Math.min(time, endTime - 0.1));
      if (videoRef.current) videoRef.current.currentTime = Math.min(time, endTime - 0.1);
    } else {
      setEndTime(Math.max(time, startTime + 0.1));
      if (videoRef.current) videoRef.current.currentTime = Math.max(time, startTime + 0.1);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const currentTotalFrames = Math.max(0, Math.floor((endTime - startTime) * fps / playbackSpeed));
  const { outW, outH } = getOutDimensions();

  return (
    <ToolLayout 
      title="VIDEO TO GIF" 
      description="Trim a clip, tune the output, and export a lightweight animated GIF directly in your browser."
      category="VIDEO TOOL"
    >
      <div className="w-full flex flex-col gap-8">
        
        {!videoFile ? (
          <UploadDropzone onUpload={handleUpload} multiple={false} accept="video/mp4,video/webm,video/quicktime,video/*" />
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* LEFT COLUMN */}
            <div className="w-full xl:w-2/3 flex flex-col gap-6">
              
              <div className="bg-black relative rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] border border-zinc-200 shadow-sm">
                {status === 'done' && gifUrl ? (
                  <img src={gifUrl} className="max-h-[60vh] w-auto max-w-full object-contain" />
                ) : (
                  <video 
                    ref={videoRef}
                    src={videoUrl!}
                    controls
                    playsInline
                    onLoadedData={handleVideoLoad}
                    className="max-h-[60vh] w-full"
                  />
                )}
                
                {status === 'generating' && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
                    <div className="text-[10px] uppercase tracking-widest font-bold mb-4 text-[#8B7CFF]">
                      Generating GIF
                    </div>
                    <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-[#8B7CFF] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-sm font-mono">{progressText}</div>
                    <button 
                      onClick={cancel}
                      className="mt-8 px-6 py-2 border border-white/20 hover:border-white/50 text-[10px] uppercase font-bold tracking-widest rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {/* Timeline / Trim */}
              {status !== 'generating' && videoMeta && (
                <div className="flex flex-col gap-4 bg-white p-6 border border-zinc-200 shadow-sm">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    <span>Trim Range</span>
                    <div className="flex gap-2 font-mono">
                      <span>{formatTime(startTime)}</span>
                      <span>-</span>
                      <span>{formatTime(endTime)}</span>
                    </div>
                  </div>
                  
                  <div 
                    ref={trackRef}
                    className="w-full h-8 bg-zinc-100 relative rounded overflow-hidden cursor-crosshair border border-zinc-300"
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  >
                    <div 
                      className="absolute top-0 h-full bg-[#DCD7FF]/80 border-y border-[#8B7CFF]"
                      style={{ 
                        left: `${(startTime / videoMeta.duration) * 100}%`,
                        width: `${((endTime - startTime) / videoMeta.duration) * 100}%`
                      }}
                    />
                    <div 
                      onPointerDown={(e) => handlePointerDown(e, 'start')}
                      className="absolute top-0 bottom-0 w-4 bg-[#8B7CFF] cursor-ew-resize flex items-center justify-center -ml-2 z-10 hover:bg-[#7262E2] shadow"
                      style={{ left: `${(startTime / videoMeta.duration) * 100}%` }}
                    >
                      <div className="w-0.5 h-4 bg-white rounded-full"></div>
                    </div>
                    <div 
                      onPointerDown={(e) => handlePointerDown(e, 'end')}
                      className="absolute top-0 bottom-0 w-4 bg-[#8B7CFF] cursor-ew-resize flex items-center justify-center -ml-2 z-10 hover:bg-[#7262E2] shadow"
                      style={{ left: `${(endTime / videoMeta.duration) * 100}%` }}
                    >
                      <div className="w-0.5 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ESTIMATED / FINAL SIZE CARD */}
              {(videoMeta && status !== 'generating') && (
                <div className="flex flex-col gap-0">
                  <div className="bg-[#111111] text-white p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl border border-[#222222]">
                    <div className="flex flex-col gap-1 w-full md:w-auto items-center md:items-start text-center md:text-left">
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B7CFF]">
                        {status === 'done' ? 'FINAL GIF SIZE' : 'ESTIMATED SIZE'}
                      </h3>
                      <div className="text-3xl font-serif">
                        {status === 'done' ? formatSize(gifSize) : isEstimating ? <span className="text-xl text-zinc-400">Calculating...</span> : (estimatedSize ? formatSize(estimatedSize) : '0 MB')}
                      </div>
                      
                      {/* Warnings */}
                      {status !== 'done' && estimatedSize && estimatedSize > 5 * 1024 * 1024 && (
                        <div className={`mt-2 text-[9px] font-bold uppercase tracking-widest px-2 py-1 inline-block ${estimatedSize > 20*1024*1024 ? 'bg-red-500/20 text-red-300' : estimatedSize > 10*1024*1024 ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {estimatedSize > 20*1024*1024 ? 'Very large GIF. Consider shortening clip or reducing size.' : 
                            estimatedSize > 10*1024*1024 ? 'Very large GIF — reducing FPS or width is recommended.' : 
                            'Large GIF — consider reducing FPS or dimensions.'}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:flex md:gap-8 w-full md:w-auto text-left md:text-right">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Duration</span>
                        <span className="font-mono text-sm">{Math.max(0, endTime - startTime).toFixed(1)}s</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Frames</span>
                        <span className="font-mono text-sm">{currentTotalFrames}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Output</span>
                        <span className="font-mono text-sm">{outW}×{outH}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">FPS</span>
                        <span className="font-mono text-sm">{fps}</span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions Panel */}
                  {status !== 'done' && estimatedSize && estimatedSize > 10 * 1024 * 1024 && !isEstimating && (
                    <div className="bg-white border border-zinc-200 border-t-0 p-4 flex flex-col gap-3">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Suggestions to reduce size</div>
                      <div className="flex flex-wrap gap-2">
                        {fps > 10 && <button onClick={() => setFps(10)} className="px-3 py-1.5 border border-zinc-200 hover:border-black text-[9px] uppercase font-bold tracking-widest transition-colors">Reduce FPS to 10</button>}
                        {outputWidth !== '480' && outputWidth !== '320' && <button onClick={() => setOutputWidth('480')} className="px-3 py-1.5 border border-zinc-200 hover:border-black text-[9px] uppercase font-bold tracking-widest transition-colors">Reduce Width to 480px</button>}
                        {quality !== 'LOW' && <button onClick={() => setQuality('LOW')} className="px-3 py-1.5 border border-zinc-200 hover:border-black text-[9px] uppercase font-bold tracking-widest transition-colors">Use Low Quality</button>}
                        {endTime - startTime > 5 && <button onClick={() => setEndTime(startTime + 5)} className="px-3 py-1.5 border border-zinc-200 hover:border-black text-[9px] uppercase font-bold tracking-widest transition-colors">Shorten Clip to 5s</button>}
                      </div>
                    </div>
                  )}

                  {/* Generated Download button */}
                  {status === 'done' && (
                    <div className="bg-white border border-zinc-200 border-t-0 p-6 flex justify-between items-center">
                      <button onClick={() => setStatus('idle')} className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hover:text-[#111111]">
                        Make Adjustments
                      </button>
                      <button 
                        onClick={downloadGif}
                        className="px-8 py-3 bg-[#111111] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#222222] transition-colors flex items-center gap-2 shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download GIF
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full xl:w-1/3 flex flex-col gap-6">
              
              <div className="bg-white p-6 border border-zinc-200 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest truncate">{videoFile.name}</span>
                    {videoMeta && (
                      <div className="flex gap-3 text-xs text-zinc-400 font-mono">
                        <span>{formatTime(videoMeta.duration)}</span>
                        <span>{videoMeta.width}x{videoMeta.height}</span>
                        <span>{formatSize(videoMeta.size)}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={reset} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black shrink-0">Reset</button>
                </div>

                <div className="flex flex-col gap-6">
                  
                  {/* FPS */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">FPS</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[5, 10, 15, 20, 24].map(v => (
                        <button key={v} onClick={() => setFps(v)} className={`py-2 text-[10px] font-bold border ${fps === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Output Width */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Width (px)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['320', '480', '640', '800', 'Original'].map(v => (
                        <button key={v} onClick={() => setOutputWidth(v)} className={`py-2 text-[10px] font-bold border truncate ${outputWidth === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>
                          {v === 'Original' ? 'Orig' : v}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quality */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Quality</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['LOW', 'BALANCED', 'HIGH'] as const).map(v => (
                        <button key={v} onClick={() => setQuality(v)} className={`py-2 text-[10px] font-bold tracking-widest border uppercase ${quality === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Speed */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Speed</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0.5, 1, 1.5, 2].map(v => (
                        <button key={v} onClick={() => setPlaybackSpeed(v)} className={`py-2 text-[10px] font-bold border ${playbackSpeed === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>
                          {v}×
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Crop */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Crop / Ratio</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Original', '1:1', '4:5', '16:9', '9:16', '4:3', '3:4'].map(v => (
                        <button key={v} onClick={() => setCropPreset(v)} className={`py-2 text-[10px] font-bold border ${cropPreset === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>
                          {v === 'Original' ? 'Orig' : v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loop */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Loop</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Forever', '1 time', '3 times', '5 times'].map(v => (
                        <button key={v} onClick={() => setLoop(v)} className={`py-2 text-[9px] font-bold border uppercase ${loop === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-[#111111]'}`}>
                          {v.replace(' times', 'x').replace(' time', 'x')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reverse Toggle */}
                  <label className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-zinc-600 cursor-pointer p-3 border border-zinc-200 hover:border-black transition-colors mt-2">
                    <input 
                      type="checkbox" 
                      checked={reverse}
                      onChange={e => setReverse(e.target.checked)}
                      className="accent-[#8B7CFF] w-4 h-4 cursor-pointer"
                    />
                    Reverse Playback
                  </label>

                  <button 
                    onClick={generateGif}
                    disabled={status === 'generating'}
                    className="w-full mt-2 py-4 bg-[#8B7CFF] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#7262E2] transition-colors shadow-lg disabled:bg-zinc-400"
                  >
                    Generate GIF
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </ToolLayout>
  );
}
