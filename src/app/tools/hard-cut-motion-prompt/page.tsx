"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import JSZip from "jszip";

type ShotFrame = {
  time: number;
  dataUrl: string;
};

type Shot = {
  id: string;
  index: number;
  start: number;
  end: number;
  duration: number;
  frames?: ShotFrame[];
  contactSheetUrl?: string;
  status: 'idle' | 'generating' | 'done' | 'error';
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${m}:${s}.${ms}`;
};

const MOTION_MASTER_PROMPT = `You are an expert Motion Director and Image-to-Video Prompt Engineer.

Analyze the uploaded storyboard/contact sheet as a SEQUENTIAL MOTION REFERENCE.

Treat all frames as consecutive moments of ONE continuous shot. Your task is NOT to describe the frames. Your task is to reconstruct the natural physical motion that connects them.

FIRST, internally compare every consecutive transition:
Frame 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09.

Infer only the movement supported by the visual differences between frames.

Analyze internally:
- Body position, posture, and weight shifts
- Head and eye direction
- Hand and arm movement
- Leg movement, stepping, and foot placement
- Sitting, standing, turning, bending, or walking transitions
- Subject position and direction of travel
- Clothing, footwear, backpack, jewelry, or other key product movement
- Changes in framing that indicate camera movement
- Camera position, tracking direction, pan, tilt, or static hold
- Natural timing, acceleration, deceleration, balance, and continuity

CRITICAL MOTION LOGIC:
Do not describe each frame separately.
Do not describe only the final frame.
Do not list multiple disconnected actions.
Do not invent actions unsupported by the frames.
Do not create sudden jumps between poses.
Every described movement must logically connect the previous frame to the next.

Think of the frames as keyframes of a single video. Reconstruct the missing motion between those keyframes.

If several actions occur, combine them into ONE continuous sequence in chronological order.

CAMERA INFERENCE:
Only mention camera movement when the frame sequence provides evidence for it.
If framing remains consistent, use "camera static."
If the subject shifts consistently within the frame, determine whether it is subject movement or camera tracking before mentioning camera movement.
Never invent a camera move simply to make the prompt sound cinematic.

PRODUCT / CLOTHING:
Mention only visually important products, clothing, footwear, or accessories whose movement or visibility matters to the shot.
Keep them consistent throughout the sequence.

MOTION STYLE:
Natural, physically realistic human movement with believable weight transfer, balance, momentum, foot placement, and timing.

PROMPT WRITING:
Write ONE concise image-to-video prompt in natural professional motion-director language.
Prioritize:
SUBJECT ACTION → CONTINUOUS MOTION → CAMERA BEHAVIOR → KEY PRODUCT/ELEMENT

The prompt must describe the ACTION FLOW, not the storyboard frames.

OUTPUT RULES:
Return ONLY ONE final motion prompt.
Maximum 30 words.
No analysis.
No frame numbers.
No headings.
No bullet points.
No quotation marks.

Do not mention lighting, color, background, VFX, rendering, resolution, cinematic effects, or visual style unless essential to the physical motion.`;

const MiniShotPlayer = ({ shot, videoUrl, isSelected, onSelect }: { shot: Shot; videoUrl: string; isSelected: boolean; onSelect: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = shot.start;
    }
  }, [shot.start]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime >= shot.end) {
      videoRef.current.pause();
      videoRef.current.currentTime = shot.start;
      setIsPlaying(false);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.currentTime = shot.start;
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <button 
      onClick={onSelect}
      className={`text-left p-3 rounded-xl border flex flex-col gap-3 transition-all group w-full h-full ${isSelected ? 'bg-[#111111] border-[#111111] text-white shadow-md control-active' : 'bg-white border-zinc-200 hover:border-zinc-400 text-black'}`}
    >
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
        <video 
          ref={videoRef} 
          src={videoUrl} 
          muted 
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        />
        <div 
          onClick={togglePlay}
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}
        >
           <span className="bg-white text-black text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest hover:scale-105 transition-transform">Play</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 w-full flex-1">
        <div className="flex justify-between items-start w-full">
          <span className="text-xs uppercase font-bold tracking-widest opacity-90 truncate">SHOT {(shot.index).toString().padStart(2, '0')}</span>
          <div className="flex items-center shrink-0">
            {shot.status === 'done' && <span className="text-[9px] uppercase tracking-widest text-[#8B7CFF] font-bold px-1">Ready</span>}
            {shot.status === 'generating' && <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold px-1 animate-pulse">Processing</span>}
          </div>
        </div>
        <span className={`font-mono text-[10px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'} truncate`}>
          {formatTime(shot.start)} → {formatTime(shot.end)}
        </span>
        <span className={`font-mono text-[10px] opacity-50`}>{shot.duration.toFixed(3)}s</span>
      </div>
      
      <div className="w-full shrink-0 mt-auto pt-1">
        {(!isSelected && shot.status !== 'generating') && (
          <div className="w-full py-2 text-[9px] uppercase tracking-widest font-bold rounded flex items-center justify-center gap-1.5 transition-colors border bg-white text-black hover:border-zinc-400 border-zinc-200 shadow-sm">
            Select
          </div>
        )}
        {isSelected && (
          <div className="w-full py-2 text-[9px] uppercase tracking-widest font-bold rounded flex items-center justify-center gap-1.5 transition-colors border bg-[#222] border-[#333] text-white control-active-inner">
            Selected
          </div>
        )}
      </div>
    </button>
  );
};

export default function HardCutMotionPromptPage() { 
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ duration: number; width: number; height: number; size: number; fps: number } | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'detecting' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
  const [minShotLength, setMinShotLength] = useState<number>(1.0);
  
  const [shots, setShots] = useState<Shot[]>([]);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');
  const [currentFrameTime, setCurrentFrameTime] = useState(0);
  const [currentFrameData, setCurrentFrameData] = useState<string | null>(null);
  const [currentFrameNum, setCurrentFrameNum] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const shotVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const abortAnalysisRef = useRef(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState<'start' | 'end' | null>(null);

  const handleUpload = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith('video/')) return;
    
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStatus('idle');
    setShots([]);
    setSelectedShotId(null);
    setProgress(0);
  };

  const handleVideoLoad = () => {
    if (videoRef.current && videoFile && !videoMeta) {
      setVideoMeta({
        duration: videoRef.current.duration,
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
        size: videoFile.size,
        fps: 30
      });
    }
  };

  const handleShotVideoLoad = () => {
    if (shotVideoRef.current && selectedShotId) {
      const shot = shots.find(s => s.id === selectedShotId);
      if (shot && shotVideoRef.current.currentTime < shot.start) {
        shotVideoRef.current.currentTime = shot.start;
      }
    }
  };

  const captureFrame = (time: number) => {
    if (!videoUrl || !videoMeta) return;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const cvs = canvasRef.current;
    
    if (shotVideoRef.current && shotVideoRef.current.readyState >= 2) {
      cvs.width = shotVideoRef.current.videoWidth || 640;
      cvs.height = shotVideoRef.current.videoHeight || 360;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.drawImage(shotVideoRef.current, 0, 0, cvs.width, cvs.height);
        setCurrentFrameData(cvs.toDataURL('image/jpeg', 0.8));
      }
    }
    setCurrentFrameTime(time);
    setCurrentFrameNum(Math.round(time * (videoMeta.fps || 30)));
  };

  const handleShotTimeUpdate = () => {
    if (!shotVideoRef.current || !selectedShotId) return;
    const shot = shots.find(s => s.id === selectedShotId);
    if (!shot) return;
    
    captureFrame(shotVideoRef.current.currentTime);
    
    if (!shotVideoRef.current.paused) {
      if (shotVideoRef.current.currentTime >= shot.end) {
        shotVideoRef.current.pause();
        shotVideoRef.current.currentTime = shot.start;
      }
    }
  };

  const stepFrames = (frames: number) => {
    if (!shotVideoRef.current || !videoMeta || !selectedShotId) return;
    const shot = shots.find(s => s.id === selectedShotId);
    if (!shot) return;
    
    const fps = videoMeta.fps || 30;
    const frameDuration = 1 / fps;
    
    let baseTime = activeField === 'start' ? shot.start : shot.end;
    let newTime = baseTime + (frames * frameDuration);
    
    if (newTime < 0) newTime = 0;
    if (newTime > videoMeta.duration) newTime = videoMeta.duration;
    
    if (activeField === 'start' && newTime >= shot.end) {
      newTime = shot.end - frameDuration;
    } else if (activeField === 'end' && newTime <= shot.start) {
      newTime = shot.start + frameDuration;
    }
    
    updateShotBound(shot.id, activeField, newTime);
    
    shotVideoRef.current.pause();
    shotVideoRef.current.currentTime = newTime;
    
    const onSeeked = () => {
      if (shotVideoRef.current) {
        captureFrame(shotVideoRef.current.currentTime);
        shotVideoRef.current.removeEventListener('seeked', onSeeked);
      }
    };
    shotVideoRef.current.addEventListener('seeked', onSeeked);
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    shots.forEach(s => {
      if (s.contactSheetUrl) URL.revokeObjectURL(s.contactSheetUrl);
    });
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setStatus('idle');
    setShots([]);
    setSelectedShotId(null);
    setProgress(0);
    abortAnalysisRef.current = true;
  };

  const cancelAnalysis = () => {
    abortAnalysisRef.current = true;
    setStatus('idle');
  };

  const analyzeVideo = async () => {
    if (!videoUrl || !videoMeta) return;
    abortAnalysisRef.current = false;
    setStatus('detecting');
    setProgress(0);
    setProgressText("Scanning for hard cuts...");
    setShots([]);
    setSelectedShotId(null);

    const hiddenVideo = document.createElement('video');
    hiddenVideo.src = videoUrl;
    hiddenVideo.muted = true;
    hiddenVideo.playsInline = true;
    
    await new Promise(r => { hiddenVideo.onloadedmetadata = r; });

    const STEP = 0.15; 
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
    const detectedCuts: number[] = [0];
    let lastCutTime = 0;

    const seekTo = (time: number) => {
      return new Promise((resolve) => {
        const handler = () => {
          hiddenVideo.removeEventListener('seeked', handler);
          if ('requestVideoFrameCallback' in hiddenVideo) {
             (hiddenVideo as any).requestVideoFrameCallback(() => resolve(null));
          } else {
             setTimeout(() => resolve(null), 50);
          }
        };
        hiddenVideo.addEventListener('seeked', handler);
        hiddenVideo.currentTime = time;
        setTimeout(() => {
          hiddenVideo.removeEventListener('seeked', handler);
          resolve(null);
        }, 500);
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
          // Refine exact cut boundary by searching between t-STEP and t
          let exactCutTime = t;
          let left = Math.max(lastCutTime, t - STEP);
          let subT = left + 0.033; // ~30fps step
          let subPrevData = prevData;

          while (subT <= t) {
            await seekTo(subT);
            ctx.drawImage(hiddenVideo, 0, 0, 64, 64);
            const subData = ctx.getImageData(0, 0, 64, 64).data;
            
            let subDiff = 0;
            for (let i = 0; i < subData.length; i += 4) {
              subDiff += Math.abs(subData[i] - subPrevData[i]) + 
                         Math.abs(subData[i+1] - subPrevData[i+1]) + 
                         Math.abs(subData[i+2] - subPrevData[i+2]);
            }
            const avgSubDiff = subDiff / (subData.length / 4 * 3 * 255);
            
            if (avgSubDiff > threshold * 0.7) {
              exactCutTime = subT;
              break;
            }
            subPrevData = new Uint8ClampedArray(subData);
            subT += 0.033;
          }

          detectedCuts.push(exactCutTime);
          lastCutTime = exactCutTime;
          
          await seekTo(t);
          ctx.drawImage(hiddenVideo, 0, 0, 64, 64);
        }
      }
      
      prevData = new Uint8ClampedArray(ctx.getImageData(0, 0, 64, 64).data);
      
      const pct = Math.round((t / hiddenVideo.duration) * 100);
      setProgress(pct);
      setProgressText(`Scanning video... ${pct}%`);
      
      t += STEP;
      if (t > hiddenVideo.duration && t < hiddenVideo.duration + STEP) {
        t = hiddenVideo.duration; 
      }
    }

    hiddenVideo.removeAttribute('src');
    
    if (abortAnalysisRef.current) return;

    if (detectedCuts.length === 0) {
      detectedCuts.push(0);
    }
    
    const newShots: Shot[] = [];
    for (let i = 0; i < detectedCuts.length; i++) {
      const start = detectedCuts[i];
      let end = i < detectedCuts.length - 1 ? detectedCuts[i+1] : videoMeta.duration;
      
      if (end <= start) end = start + 0.1;
      if (end > videoMeta.duration) end = videoMeta.duration;
      
      newShots.push({
        id: crypto.randomUUID(),
        index: i + 1,
        start,
        end,
        duration: end - start,
        status: 'idle'
      });
    }

    setShots(newShots);
    setStatus('done');
    
    if (newShots.length > 0) {
      setSelectedShotId(newShots[0].id);
      setActiveField('start');
    }
    
    if (newShots.length === 1 && newShots[0].start === 0) {
      alert("No distinct hard cuts were detected. Try increasing sensitivity or adjusting the minimum shot duration. Treating the entire video as one shot.");
    }
  };

  const generateContactSheetWorkflow = async (shotId: string) => {
    if (!videoUrl || !videoMeta) return;
    
    const shotIndex = shots.findIndex(s => s.id === shotId);
    if (shotIndex === -1) return;
    const shot = shots[shotIndex];
    if (shot.status === 'generating') return;

    setShots(prev => {
      const copy = [...prev];
      copy[shotIndex] = { ...copy[shotIndex], status: 'generating' };
      return copy;
    });

    try {
      if (!shotVideoRef.current) throw new Error("Video reference not found");
      
      const originalTime = shotVideoRef.current.currentTime;
      shotVideoRef.current.pause();

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = shotVideoRef.current.videoWidth || 1920;
      fullCanvas.height = shotVideoRef.current.videoHeight || 1080;
      const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });
      if (!fullCtx) throw new Error("Could not get 2d context for frame extraction.");
      
      const frames: ShotFrame[] = [];
      
      const safeSeek = (time: number): Promise<void> => {
        return new Promise((resolve) => {
          if (!shotVideoRef.current) return resolve();
          
          const handler = () => {
            if (shotVideoRef.current) shotVideoRef.current.removeEventListener('seeked', handler);
            if (shotVideoRef.current && 'requestVideoFrameCallback' in shotVideoRef.current) {
               (shotVideoRef.current as any).requestVideoFrameCallback(() => resolve());
            } else {
               setTimeout(() => resolve(), 50);
            }
          };
          shotVideoRef.current.addEventListener('seeked', handler);
          shotVideoRef.current.currentTime = time;
          
          setTimeout(() => {
            if (shotVideoRef.current) shotVideoRef.current.removeEventListener('seeked', handler);
            resolve();
          }, 800); 
        });
      };
      const fps = videoMeta.fps || 30;
      const safeEnd = Math.min(shot.end - (1 / fps), videoMeta.duration - (1 / fps));
      for (let i = 0; i < 9; i++) {
        const t = shot.start + (safeEnd - shot.start) * (i / 8);
        
        let isValidFrame = false;
        let attempts = 0;
        
        while (!isValidFrame && attempts < 3) {
          await safeSeek(t);
          console.log(`[CONTACT SHEET EXTRACTION] Frame 0${i+1}: requested timestamp: ${t}, actual video timestamp: ${shotVideoRef.current.currentTime}`);

          fullCtx.drawImage(shotVideoRef.current, 0, 0, fullCanvas.width, fullCanvas.height);
          
          const dataUrl = fullCanvas.toDataURL('image/jpeg', 0.92);
          if (dataUrl && dataUrl.length > 100) {
            frames.push({
              time: t,
              dataUrl: dataUrl
            });
            isValidFrame = true;
            console.log(`[CONTACT SHEET EXTRACTION] Frame 0${i+1} success: true`);
          } else {
            attempts++;
            console.log(`[CONTACT SHEET EXTRACTION] Frame 0${i+1} success: false (dataUrl empty)`);
          }
        }
        
        if (!isValidFrame) {
          throw new Error(`Failed to extract frame ${i + 1}. Max retry attempt limit reached or image conversion failed.`);
        }
      }
      
      // Restore video position
      if (shotVideoRef.current) {
        shotVideoRef.current.currentTime = originalTime;
      }
      
      if (frames.length !== 9) {
        throw new Error(`Contact sheet pipeline expected exactly 9 frames, but produced ${frames.length}.`);
      }

      // Contact sheet drawing
      let sheetUrl = "";
      const canvasWidth = 1920;
      const margin = 40;
      const padding = 20;
      const textHeaderHeight = 120;
      const cellTextHeight = 60;
      const contentWidth = canvasWidth - margin * 2;
      const cellWidth = (contentWidth - padding * 2) / 3;
      const cellHeight = cellWidth * (videoMeta.height / videoMeta.width);
      const canvasHeight = margin * 2 + textHeaderHeight + (cellHeight + cellTextHeight) * 3 + padding * 2;
      
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = canvasWidth;
      sheetCanvas.height = canvasHeight;
      const ctx = sheetCanvas.getContext('2d');
      if (!ctx) throw new Error("Could not get 2d context for contact sheet canvas.");
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.fillStyle = "#111111";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`SHOT ${(shot.index).toString().padStart(2, '0')}`, margin, margin + 40);
      
      ctx.fillStyle = "#666666";
      ctx.font = "24px monospace";
      ctx.fillText(`${formatTime(shot.start)} — ${formatTime(shot.end)} (Duration: ${shot.duration.toFixed(3)}s)`, margin, margin + 80);
      
      for (let i = 0; i < 9; i++) {
        const frame = frames[i];
        if (!frame || !frame.dataUrl) {
           throw new Error(`Validation failed: Frame ${i + 1} does not contain valid dataUrl.`);
        }

        const row = Math.floor(i / 3);
        const col = i % 3;
        
        const x = margin + col * (cellWidth + padding);
        const y = margin + textHeaderHeight + row * (cellHeight + cellTextHeight + padding);
        
        const img = new Image();
        img.src = frame.dataUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(null);
          img.onerror = () => reject(new Error(`Failed to load image element for frame ${i + 1}`));
        });
        
        ctx.drawImage(img, x, y, cellWidth, cellHeight);
        
        ctx.strokeStyle = "#e4e4e7";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        
        ctx.fillStyle = "#111111";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`FRAME ${(i + 1).toString().padStart(2, '0')}`, x, y + cellHeight + 30);
        
        ctx.fillStyle = "#666666";
        ctx.font = "16px monospace";
        ctx.fillText(formatTime(frame.time), x, y + cellHeight + 52);
      }
      
      ctx.fillStyle = "#999999";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("GROTON.in", canvasWidth - margin, canvasHeight - margin + 8);
      
      const blob = await new Promise<Blob | null>(res => sheetCanvas.toBlob(res, 'image/png'));
      if (!blob) throw new Error("Failed to convert contact sheet canvas to Blob.");
      
      sheetUrl = URL.createObjectURL(blob);

      setShots(prev => {
        const copy = [...prev];
        copy[shotIndex] = { ...copy[shotIndex], status: 'done', frames, contactSheetUrl: sheetUrl };
        return copy;
      });

    } catch (error) {
      console.error("[generateContactSheetWorkflow] Error:", error);
      setShots(prev => {
        const copy = [...prev];
        copy[shotIndex] = { ...copy[shotIndex], status: 'error' };
        return copy;
      });
    }
  };

  const downloadContactSheet = (shot: Shot) => {
    if (!shot.contactSheetUrl) return;
    const filename = getGrotonExportFilename(`hard-cut-motion-shot-${shot.index.toString().padStart(2, '0')}.png`);
    
    // Save metadata for Face Blur tool
    if (videoMeta) {
      const canvasWidth = 1920;
      const margin = 40;
      const padding = 20;
      const textHeaderHeight = 120;
      const cellTextHeight = 60;
      const contentWidth = canvasWidth - margin * 2;
      const cellWidth = (contentWidth - padding * 2) / 3;
      const cellHeight = cellWidth * (videoMeta.height / videoMeta.width);
      
      const framesMeta = [];
      for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        framesMeta.push({
          x: margin + col * (cellWidth + padding),
          y: margin + textHeaderHeight + row * (cellHeight + cellTextHeight + padding),
          width: cellWidth,
          height: cellHeight
        });
      }
      
      localStorage.setItem(`groton_cs_meta_${filename}`, JSON.stringify({
        isContactSheet: true,
        columns: 3,
        rows: 3,
        cells: framesMeta
      }));
    }
    
    const link = document.createElement('a');
    link.href = shot.contactSheetUrl;
    link.download = filename;
    link.click();
  };

  const downloadMasterPrompt = () => {
    const blob = new Blob([MOTION_MASTER_PROMPT], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "GROTON_Motion_Analysis_Master_Prompt.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateShotBound = (id: string, field: 'start' | 'end', val: number) => {
    setShots(prev => prev.map(s => {
      if (s.id !== id) return s;
      let newStart = field === 'start' ? val : s.start;
      let newEnd = field === 'end' ? val : s.end;
      
      if (newStart < 0) newStart = 0;
      if (videoMeta && newEnd > videoMeta.duration) newEnd = videoMeta.duration;
      if (newStart >= newEnd) {
        if (field === 'start') newStart = newEnd - 0.1;
        else newEnd = newStart + 0.1;
      }
      
      if (s.contactSheetUrl) URL.revokeObjectURL(s.contactSheetUrl);
      
      const newShot = { 
        ...s, 
        start: newStart, 
        end: newEnd, 
        duration: newEnd - newStart,
        status: 'idle' as const,
        frames: undefined,
        contactSheetUrl: undefined
      };
      
      return newShot;
    }));
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingTimeline || !timelineRef.current || !videoMeta || !selectedShotId) return;
      const shot = shots.find(s => s.id === selectedShotId);
      if (!shot) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      
      const rawTime = percent * videoMeta.duration;
      const fps = videoMeta.fps || 30;
      let frameTime = Math.round(rawTime * fps) / fps;
      
      if (isDraggingTimeline === 'start') {
        frameTime = Math.min(frameTime, shot.end - 0.05);
        updateShotBound(shot.id, 'start', frameTime);
        setActiveField('start');
      } else {
        frameTime = Math.max(frameTime, shot.start + 0.05);
        updateShotBound(shot.id, 'end', frameTime);
        setActiveField('end');
      }
      
      if (shotVideoRef.current) {
        shotVideoRef.current.currentTime = frameTime;
      }
    };
    
    const handlePointerUp = () => {
      setIsDraggingTimeline(null);
    };

    if (isDraggingTimeline) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingTimeline, shots, selectedShotId, videoMeta]);

  const selectedShot = shots.find(s => s.id === selectedShotId);

  return (
    <ToolLayout 
      title="HARD CUT MOTION PROMPT" 
      description="Analyze a video into individual shots, preview each shot, and create a 6-frame motion reference sheet for any selected shot."
      category="VIDEO TOOL"
    >
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 -mt-4">
        
        {!videoFile ? (
          <UploadDropzone 
            onUpload={handleUpload} 
            multiple={false} 
            accept="video/*" 
            title="Drag your video here"
            formats={["MP4", "WEBM", "MOV"]}
            className="min-h-[16rem]"
          />
        ) : (
          <div className="flex flex-col gap-8">
            
            {shots.length === 0 ? (
              /* Before Analysis: Single Centered Column */
              <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
                <div className="bg-white p-6 border border-zinc-200 rounded-2xl shadow-sm flex flex-col gap-6">
                   <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                     <div className="flex flex-col gap-1 overflow-hidden pr-4">
                       <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest truncate">Original Video</span>
                       <span className="text-xs font-mono truncate">{videoFile.name}</span>
                     </div>
                     <button onClick={resetAll} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black shrink-0">Reset</button>
                   </div>
                   
                   <div className="bg-[#111] relative rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                     <video 
                       ref={videoRef}
                       src={videoUrl!}
                       playsInline
                       controls
                       onLoadedData={handleVideoLoad}
                       className="w-full h-full object-contain"
                     />
                     
                     {status === 'detecting' && (
                       <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
                         <div className="text-[10px] uppercase tracking-widest font-bold mb-4 text-[#8B7CFF]">
                           Analyzing Video
                         </div>
                         <div className="w-48 h-1 bg-zinc-800 overflow-hidden mb-4 rounded-full">
                           <div className="h-full bg-[#8B7CFF] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                         </div>
                         <div className="text-xs font-mono">{progressText}</div>
                         <button onClick={cancelAnalysis} className="mt-6 px-4 py-1.5 border border-white/20 hover:border-white/50 text-[9px] uppercase font-bold tracking-widest rounded transition-colors">
                           Cancel
                         </button>
                       </div>
                     )}
                   </div>
                   
                   <div className="flex flex-col gap-4">
                     <div className="flex flex-col gap-2">
                       <label className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Sensitivity</label>
                       <div className="grid grid-cols-3 gap-2">
                         {(['low', 'medium', 'high'] as const).map(s => (
                           <button 
                             key={s}
                             onClick={() => setSensitivity(s)}
                             className={`py-2.5 text-[10px] font-bold tracking-widest border rounded-lg uppercase transition-colors ${sensitivity === s ? 'bg-[#111111] text-white border-[#111111] control-active' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-black'}`}
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
                             className={`py-2.5 text-[10px] font-bold tracking-widest border rounded-lg uppercase transition-colors ${minShotLength === l ? 'bg-[#111111] text-white border-[#111111] control-active' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-black'}`}
                           >
                             {l}s
                           </button>
                         ))}
                       </div>
                     </div>
                     
                     <button 
                       onClick={analyzeVideo}
                       disabled={status === 'detecting'}
                       className="w-full mt-2 py-4 bg-[#8B7CFF] text-white text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-[#7264ed] transition-colors shadow-md disabled:opacity-50"
                     >
                       Analyze Video
                     </button>
                   </div>
                </div>
              </div>
            ) : (
              /* After Analysis: Main Workspace */
              <div className="flex flex-col xl:flex-row gap-8 items-start">
                
                {/* Left Column: Detected Shots List */}
                <div className="w-full xl:w-1/2 flex flex-col gap-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">DETECTED SHOTS ({shots.length})</span>
                    <button onClick={resetAll} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-black">Start Over</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {shots.map(shot => (
                      <MiniShotPlayer 
                        key={shot.id} 
                        shot={shot} 
                        videoUrl={videoUrl!} 
                        isSelected={selectedShotId === shot.id} 
                        onSelect={() => {
                          setSelectedShotId(shot.id);
                          setActiveField('start');
                        }} 
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column: Selected Shot View */}
                <div className="w-full xl:w-1/2 flex flex-col gap-6 xl:sticky xl:top-8">
                  {selectedShot ? (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                      
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">Selected Shot</span>
                        <h2 className="text-2xl font-serif text-[#111111]">SHOT {selectedShot.index.toString().padStart(2, '0')}</h2>
                        <span className="font-mono text-xs text-zinc-500 mt-1">{formatTime(selectedShot.start)} → {formatTime(selectedShot.end)} <span className="opacity-50 mx-2">·</span> {selectedShot.duration.toFixed(3)}s</span>
                      </div>

                      {/* Large Preview */}
                      <div className="bg-[#111] relative rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                        <video 
                          ref={shotVideoRef}
                          src={videoUrl!}
                          playsInline
                          controls
                          onLoadedData={handleShotVideoLoad}
                          onTimeUpdate={handleShotTimeUpdate}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Editable Boundaries */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                          <label className={`text-[10px] uppercase font-bold tracking-widest ${activeField === 'start' ? 'text-[#8B7CFF]' : 'text-zinc-400'}`}>Start Time</label>
                          <div 
                            className={`flex gap-2 items-center rounded-xl p-1 border-2 transition-colors cursor-pointer h-full ${activeField === 'start' ? 'border-[#8B7CFF] control-active-field' : 'border-transparent hover:border-zinc-200'}`}
                            onClick={() => setActiveField('start')}
                          >
                            <input 
                              type="number" 
                              step="0.05" 
                              value={parseFloat(selectedShot.start.toFixed(3))} 
                              onChange={(e) => {
                                updateShotBound(selectedShot.id, 'start', parseFloat(e.target.value));
                                if (shotVideoRef.current) shotVideoRef.current.currentTime = parseFloat(e.target.value);
                              }}
                              className="flex-1 border border-zinc-200 rounded-lg px-4 py-2.5 font-mono text-sm bg-zinc-50 focus:outline-none min-w-0"
                            />
                            <div className="flex flex-col gap-1 shrink-0 px-1">
                              <button onClick={(e) => { e.stopPropagation(); updateShotBound(selectedShot.id, 'start', selectedShot.start + 0.05); if (shotVideoRef.current) shotVideoRef.current.currentTime = selectedShot.start + 0.05; }} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-[9px] hover:bg-zinc-200 rounded">▲</button>
                              <button onClick={(e) => { e.stopPropagation(); updateShotBound(selectedShot.id, 'start', selectedShot.start - 0.05); if (shotVideoRef.current) shotVideoRef.current.currentTime = selectedShot.start - 0.05; }} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-[9px] hover:bg-zinc-200 rounded">▼</button>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                          <label className={`text-[10px] uppercase font-bold tracking-widest ${activeField === 'end' ? 'text-[#8B7CFF]' : 'text-zinc-400'}`}>End Time</label>
                          <div 
                            className={`flex gap-2 items-center rounded-xl p-1 border-2 transition-colors cursor-pointer h-full ${activeField === 'end' ? 'border-[#8B7CFF] control-active-field' : 'border-transparent hover:border-zinc-200'}`}
                            onClick={() => setActiveField('end')}
                          >
                            <input 
                              type="number" 
                              step="0.05" 
                              value={parseFloat(selectedShot.end.toFixed(3))} 
                              onChange={(e) => {
                                updateShotBound(selectedShot.id, 'end', parseFloat(e.target.value));
                                if (shotVideoRef.current) shotVideoRef.current.currentTime = parseFloat(e.target.value);
                              }}
                              className="flex-1 border border-zinc-200 rounded-lg px-4 py-2.5 font-mono text-sm bg-zinc-50 focus:outline-none min-w-0"
                            />
                            <div className="flex flex-col gap-1 shrink-0 px-1">
                              <button onClick={(e) => { e.stopPropagation(); updateShotBound(selectedShot.id, 'end', selectedShot.end + 0.05); if (shotVideoRef.current) shotVideoRef.current.currentTime = selectedShot.end + 0.05; }} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-[9px] hover:bg-zinc-200 rounded">▲</button>
                              <button onClick={(e) => { e.stopPropagation(); updateShotBound(selectedShot.id, 'end', selectedShot.end - 0.05); if (shotVideoRef.current) shotVideoRef.current.currentTime = selectedShot.end - 0.05; }} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-[9px] hover:bg-zinc-200 rounded">▼</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Timeline */}
                      {videoMeta && (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                            <span>0s</span>
                            <span className="text-zinc-500">Timeline</span>
                            <span>{Math.floor(videoMeta.duration)}s</span>
                          </div>
                          
                          <div 
                            ref={timelineRef}
                            className="relative w-full h-8 flex items-center group cursor-pointer"
                            onPointerDown={(e) => {
                               // Optional: clicking track snaps closest handle
                               if (e.target !== timelineRef.current) return;
                               const rect = timelineRef.current.getBoundingClientRect();
                               const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                               const rawTime = percent * videoMeta.duration;
                               const fps = videoMeta.fps || 30;
                               let frameTime = Math.round(rawTime * fps) / fps;
                               const distStart = Math.abs(selectedShot.start - frameTime);
                               const distEnd = Math.abs(selectedShot.end - frameTime);
                               
                               if (distStart < distEnd) {
                                 frameTime = Math.min(frameTime, selectedShot.end);
                                 updateShotBound(selectedShot.id, 'start', frameTime);
                                 setActiveField('start');
                                 setIsDraggingTimeline('start');
                               } else {
                                 frameTime = Math.max(frameTime, selectedShot.start);
                                 updateShotBound(selectedShot.id, 'end', frameTime);
                                 setActiveField('end');
                                 setIsDraggingTimeline('end');
                               }
                               if (shotVideoRef.current) shotVideoRef.current.currentTime = frameTime;
                            }}
                          >
                            {/* Track Base */}
                            <div className="absolute left-0 right-0 h-1.5 bg-zinc-100 rounded-full pointer-events-none"></div>
                            
                            {/* Selected Range Highlight */}
                            <div 
                              className="absolute h-1.5 bg-[#8B7CFF]/30 rounded-full pointer-events-none"
                              style={{ 
                                left: `${(selectedShot.start / videoMeta.duration) * 100}%`, 
                                width: `${((selectedShot.end - selectedShot.start) / videoMeta.duration) * 100}%` 
                              }}
                            >
                               <div className="absolute inset-y-0 left-0 right-0 border-y border-[#8B7CFF]/50"></div>
                            </div>

                            {/* Start Handle */}
                            <div 
                              className="absolute top-1/2 -mt-3 -ml-3 w-6 h-6 flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-transform z-10 touch-none"
                              style={{ left: `${(selectedShot.start / videoMeta.duration) * 100}%` }}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDraggingTimeline('start');
                                setActiveField('start');
                              }}
                            >
                              <div className={`w-3 h-3 rounded-full shadow-sm border-2 transition-colors ${activeField === 'start' ? 'bg-[#8B7CFF] border-white ring-2 ring-[#8B7CFF]/30 control-active-handle' : 'bg-white border-zinc-400'}`}></div>
                              <div className="absolute -bottom-5 text-[8px] font-bold text-zinc-500 whitespace-nowrap bg-white/80 px-1 rounded pointer-events-none">START</div>
                            </div>

                            {/* End Handle */}
                            <div 
                              className="absolute top-1/2 -mt-3 -ml-3 w-6 h-6 flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-transform z-10 touch-none"
                              style={{ left: `${(selectedShot.end / videoMeta.duration) * 100}%` }}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDraggingTimeline('end');
                                setActiveField('end');
                              }}
                            >
                              <div className={`w-3 h-3 rounded-full shadow-sm border-2 transition-colors ${activeField === 'end' ? 'bg-[#8B7CFF] border-white ring-2 ring-[#8B7CFF]/30 control-active-handle' : 'bg-white border-zinc-400'}`}></div>
                              <div className="absolute -bottom-5 text-[8px] font-bold text-zinc-500 whitespace-nowrap bg-white/80 px-1 rounded pointer-events-none">END</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Frame Controls */}
                      <div className="flex flex-col gap-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                        <div className="flex flex-col items-center justify-center mb-2">
                           <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Frame-Accurate Fine Tune</span>
                           <span className="text-[11px] font-bold mt-1 text-[#8B7CFF]">Editing: {activeField === 'start' ? 'START' : 'END'}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => stepFrames(-10)} className="w-16 h-12 flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
                              <span className="text-sm">⏮</span>
                              <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-400 mt-1">-10</span>
                            </button>
                            <button onClick={() => stepFrames(-1)} className="w-16 h-12 flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
                              <span className="text-sm">◀</span>
                              <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-400 mt-1">-1</span>
                            </button>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center gap-2 max-w-[200px]">
                             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-sm border border-zinc-200 flex items-center justify-center">
                               {currentFrameData ? (
                                 <img src={currentFrameData} alt="Current Frame" className="w-full h-full object-contain" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-mono">No Frame</div>
                               )}
                               <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded">Frame {currentFrameNum}</div>
                             </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => stepFrames(1)} className="w-16 h-12 flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
                              <span className="text-sm">▶</span>
                              <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-400 mt-1">+1</span>
                            </button>
                            <button onClick={() => stepFrames(10)} className="w-16 h-12 flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
                              <span className="text-sm">⏭</span>
                              <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-400 mt-1">+10</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {selectedShot.status === 'idle' && (
                        <button 
                          onClick={() => generateContactSheetWorkflow(selectedShot.id)}
                          className="w-full py-5 bg-[#111111] text-white rounded-xl uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          Generate 9-Frame Contact Sheet
                        </button>
                      )}

                      {selectedShot.status === 'generating' && (
                        <div className="w-full py-5 bg-zinc-50 text-[#8B7CFF] rounded-xl uppercase tracking-widest font-bold border border-zinc-200 shadow-inner flex items-center justify-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-[#8B7CFF] animate-pulse"></span>
                          Generating 9-Frame Contact Sheet...
                        </div>
                      )}

                      {selectedShot.status === 'error' && (
                        <div className="flex flex-col items-center p-6 bg-red-50 border border-red-200 rounded-2xl gap-4">
                          <span className="text-red-600 text-[11px] font-bold text-center uppercase tracking-widest max-w-[250px] leading-relaxed">
                            Unable to generate the contact sheet. One or more frames could not be extracted.
                          </span>
                          <button 
                            onClick={() => generateContactSheetWorkflow(selectedShot.id)} 
                            className="px-6 py-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      {selectedShot.status === 'done' && selectedShot.contactSheetUrl && (
                        <div className="flex flex-col gap-6 border-t border-zinc-100 pt-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Contact Sheet Preview</h3>
                            <button onClick={() => generateContactSheetWorkflow(selectedShot.id)} className="text-[9px] uppercase font-bold text-[#8B7CFF] hover:text-[#7264ed] transition-colors">Regenerate</button>
                          </div>
                          
                          <div className="bg-zinc-50 border border-zinc-200 p-2 rounded-xl relative overflow-hidden flex items-center justify-center">
                            <img src={selectedShot.contactSheetUrl} alt={`Contact Sheet`} className="w-full h-auto object-contain rounded-lg shadow-sm" />
                          </div>

                          <div className="flex flex-col gap-6 w-full mt-2">
                            <button 
                              onClick={() => downloadContactSheet(selectedShot)}
                              className="w-full py-4 bg-[#8B7CFF] text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-[#7264ed] shadow-sm transition-colors text-center"
                            >
                              Download Contact Sheet
                            </button>

                            <button 
                              onClick={downloadMasterPrompt}
                              className="w-full py-4 bg-white border border-zinc-200 text-black text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-50 shadow-sm transition-colors text-center"
                            >
                              Download Master Prompt
                            </button>

                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="w-full h-full min-h-[400px] border border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center text-center p-12 bg-zinc-50/50">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mb-6 border border-zinc-200 shadow-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" ry="2"/></svg>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Review & Select</h3>
                      <p className="text-xs text-zinc-400 font-light max-w-sm">Review the detected clips on the left and select one to generate its motion reference sheet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
