"use client";

import React, { useState, useRef, useEffect, useReducer, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import VerticalToolbar, { ToolId } from "./VerticalToolbar";
import ToolDrawer from "./ToolDrawer";
import TopBar from "./components/TopBar";
import PropertiesPanel from "./components/PropertiesPanel";
import PreviewStage from "./components/PreviewStage";
import MultiTrackTimeline from "./components/MultiTrackTimeline";
import {
  projectReducer,
  initialProjectState,
  calculateTotalDuration,
} from "./projectReducer";
import {
  ProjectState,
  TimelineClip,
  VideoClip,
  ImageClip,
  TextClip,
  AudioClip,
  ElementClip,
  MediaAsset,
  ProjectSettings,
} from "./types";
import { renderTimelineComposition, ExportProgress, ExportOutput } from "./exportPipeline";

export default function VideoEditorPage() {
  const [stateWithHistory, dispatch] = useReducer(projectReducer, initialProjectState);
  const { present: project, past, future } = stateWithHistory;
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Selected Clip
  const selectedClip = useMemo(() => {
    return project.clips.find((c) => c.id === project.selectedClipId) ?? null;
  }, [project.clips, project.selectedClipId]);

  // Total Duration
  const totalDuration = useMemo(() => {
    return calculateTotalDuration(project.clips);
  }, [project.clips]);

  // Toolbar & Drawer State
  const [activeTool, setActiveTool] = useState<ToolId>("add");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Hidden File Inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sample Generator State
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  // Recording State (Screen / Camera)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSource, setRecordingSource] = useState<"screen" | "camera">("screen");
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordError, setRecordError] = useState<string | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordTimerRef = useRef<any>(null);

  // Text-To-Speech (TTS) State
  const [ttsText, setTtsText] = useState("Welcome to GROTON AI Studio video editor.");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsPitch, setTtsPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");
  const [exportResult, setExportResult] = useState<ExportOutput | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Sync TTS Voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setAvailableVoices(v);
      if (v.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(v[0].name);
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceName]);

  // Tool Selection & Drawer Toggle
  const handleToolClick = (toolId: ToolId) => {
    if (activeTool === toolId && isDrawerOpen) {
      setIsDrawerOpen(false);
    } else {
      setActiveTool(toolId);
      setIsDrawerOpen(true);
    }
  };

  // Playback Loop
  const playheadRef = useRef(project.playhead);
  playheadRef.current = project.playhead;
  const isPlayingRef = useRef(project.isPlaying);
  isPlayingRef.current = project.isPlaying;
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (!isPlayingRef.current) {
        lastTimeRef.current = null;
        return;
      }

      if (lastTimeRef.current !== null) {
        const delta = (now - lastTimeRef.current) / 1000;
        const newPlayhead = playheadRef.current + delta;

        if (totalDuration > 0 && newPlayhead >= totalDuration) {
          dispatch({ type: "SET_PLAYHEAD", time: 0 });
          dispatch({ type: "SET_IS_PLAYING", isPlaying: false });
          lastTimeRef.current = null;
          return;
        } else {
          dispatch({ type: "SET_PLAYHEAD", time: newPlayhead });
        }
      }

      lastTimeRef.current = now;
      animId = requestAnimationFrame(tick);
    };

    if (project.isPlaying) {
      lastTimeRef.current = performance.now();
      animId = requestAnimationFrame(tick);
    } else {
      lastTimeRef.current = null;
    }

    return () => cancelAnimationFrame(animId);
  }, [project.isPlaying, totalDuration]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "SET_IS_PLAYING", isPlaying: !project.isPlaying });
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (project.selectedClipId) {
          dispatch({
            type: "SPLIT_CLIP",
            clipId: project.selectedClipId,
            splitTime: project.playhead,
          });
        }
      } else if (e.key === "Backspace" || e.key === "Delete") {
        if (project.selectedClipId) {
          e.preventDefault();
          dispatch({ type: "DELETE_CLIP", clipId: project.selectedClipId });
        }
      } else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: "REDO" });
        } else {
          dispatch({ type: "UNDO" });
        }
      } else if (e.key.toLowerCase() === "y" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        dispatch({
          type: "SET_PLAYHEAD",
          time: Math.max(0, project.playhead - 0.1),
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        dispatch({
          type: "SET_PLAYHEAD",
          time: Math.min(totalDuration, project.playhead + 0.1),
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project.isPlaying, project.selectedClipId, project.playhead, totalDuration]);

  // File Upload Handlers & Errors
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleVideoFile = async (file: File) => {
    setLoadError(null);
    if (!file.type.startsWith("video/")) {
      setLoadError("Please upload a valid video file (MP4, WEBM, MOV).");
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const assetId = crypto.randomUUID();

      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.playsInline = true;
      v.src = url;

      const loaded = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 8000);
        v.onloadedmetadata = () => {
          clearTimeout(timer);
          resolve(true);
        };
        v.onerror = () => {
          clearTimeout(timer);
          resolve(false);
        };
      });

      if (!loaded) {
        URL.revokeObjectURL(url);
        setLoadError("The video file could not be read properly or format is unsupported by your browser.");
        return;
      }

      // Handle WebM stream where Chrome reports Infinity
      let duration = v.duration;
      if (!isFinite(duration) || duration <= 0) {
        await new Promise<void>((res) => {
          const onSeeked = () => {
            v.removeEventListener("seeked", onSeeked);
            res();
          };
          v.addEventListener("seeked", onSeeked);
          v.currentTime = 1e9;
          setTimeout(res, 500);
        });
        duration = v.duration;
        v.currentTime = 0;
      }

      // Safe fallback
      if (!isFinite(duration) || duration <= 0 || isNaN(duration)) {
        duration = 10.0;
      }

      const asset: MediaAsset = {
        id: assetId,
        name: file.name,
        type: "video",
        file,
        url,
        duration,
        width: v.videoWidth || 1920,
        height: v.videoHeight || 1080,
        size: file.size,
      };

      dispatch({ type: "ADD_ASSET", asset });

      const clipId = crypto.randomUUID();
      const clip: VideoClip = {
        id: clipId,
        trackId: "track-video",
        trackType: "video",
        name: file.name,
        startTime: project.playhead,
        duration,
        assetId,
        sourceStart: 0,
        sourceEnd: duration,
        speed: 1,
        volume: 100,
        muted: false,
        contrast: 0,
        saturation: 0,
        hue: 0,
        brightness: 0,
        blur: 0,
      };

      dispatch({ type: "ADD_CLIP", clip });
      dispatch({ type: "SELECT_CLIP", clipId });
    } catch (err: any) {
      console.error("Video load error:", err);
      setLoadError("Failed to import video file: " + (err.message || "Unknown error"));
    }
  };

  const handleAudioFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const assetId = crypto.randomUUID();

    const a = new Audio(url);
    a.onloadedmetadata = () => {
      const duration = isFinite(a.duration) && a.duration > 0 ? a.duration : 15;
      const asset: MediaAsset = {
        id: assetId,
        name: file.name,
        type: "audio",
        file,
        url,
        duration,
        size: file.size,
      };

      dispatch({ type: "ADD_ASSET", asset });

      const clipId = crypto.randomUUID();
      const clip: AudioClip = {
        id: clipId,
        trackId: "track-audio",
        trackType: "audio",
        name: file.name,
        startTime: project.playhead,
        duration,
        assetId,
        sourceStart: 0,
        sourceEnd: duration,
        volume: 100,
        muted: false,
      };

      dispatch({ type: "ADD_CLIP", clip });
    };
  };

  const handleImageFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const assetId = crypto.randomUUID();

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const asset: MediaAsset = {
        id: assetId,
        name: file.name,
        type: "image",
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
      };

      dispatch({ type: "ADD_ASSET", asset });

      const clipId = crypto.randomUUID();
      const clip: ImageClip = {
        id: clipId,
        trackId: "track-images",
        trackType: "image",
        name: file.name,
        startTime: project.playhead,
        duration: 5.0,
        assetId,
        xPct: 50,
        yPct: 50,
        scale: 1,
        opacity: 100,
        rotation: 0,
      };

      dispatch({ type: "ADD_CLIP", clip });
    };
  };

  // Sample Clip Generator
  const handleLoadSampleVideo = async () => {
    setIsGeneratingSample(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context not available");

      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const generatePromise = new Promise<File>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const file = new File([blob], "groton-sample-clip.webm", {
            type: "video/webm",
          });
          resolve(file);
        };
      });

      recorder.start();

      let frame = 0;
      const totalFrames = 90; // 3 seconds at 30 fps
      const interval = setInterval(() => {
        frame++;
        const t = frame / 30;

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 1280, 720);
        grad.addColorStop(0, "#111118");
        grad.addColorStop(0.5, "#252147");
        grad.addColorStop(1, "#0d0d12");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1280, 720);

        // Animated Orb
        const orbX = 640 + Math.cos(t * 2) * 200;
        const orbY = 360 + Math.sin(t * 3) * 80;
        const orbGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 180);
        orbGrad.addColorStop(0, "rgba(139, 124, 255, 0.85)");
        orbGrad.addColorStop(0.6, "rgba(99, 102, 241, 0.3)");
        orbGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 180, 0, Math.PI * 2);
        ctx.fill();

        // Badge Pill
        ctx.fillStyle = "rgba(139, 124, 255, 0.9)";
        ctx.beginPath();
        ctx.roundRect(520, 240, 240, 48, 24);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GROTON AI STUDIO", 640, 264);

        // Headline
        ctx.font = "bold 44px Inter, sans-serif";
        ctx.fillText("Demo Video Clip", 640, 340);

        // Subtitle
        ctx.fillStyle = "#A1A1AA";
        ctx.font = "20px Inter, sans-serif";
        ctx.fillText("Multi-track timeline ready for trimming & export", 640, 395);

        // Progress bar
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.roundRect(440, 450, 400, 8, 4);
        ctx.fill();
        ctx.fillStyle = "#8B7CFF";
        ctx.roundRect(440, 450, 400 * (frame / totalFrames), 8, 4);
        ctx.fill();

        if (frame >= totalFrames) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 33);

      const generatedFile = await generatePromise;
      handleVideoFile(generatedFile);
    } catch (err) {
      console.error("Sample video generation failed:", err);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  // Screen & Camera Recording
  const startRecording = async (source: "screen" | "camera") => {
    setRecordError(null);
    try {
      let stream: MediaStream;
      if (source === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
      }

      recorderStreamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const name = `${source}-capture-${Date.now()}.webm`;
        const file = new File([blob], name, { type: "video/webm" });
        handleVideoFile(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Recording error:", err);
      setRecordError(err.message || "Failed to start recording");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    }
  };

  // Text-To-Speech
  const speakTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(ttsText);
    const voice = availableVoices.find((v) => v.name === selectedVoiceName);
    if (voice) utter.voice = voice;
    utter.rate = ttsRate;
    utter.pitch = ttsPitch;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  // Export Composition
  const handleExport = async () => {
    if (project.clips.length === 0 || isExporting) return;
    setIsExporting(true);
    setExportError(null);
    setExportProgress(5);
    setExportMessage("Starting composition rendering...");

    try {
      const output = await renderTimelineComposition(project, (p: ExportProgress) => {
        setExportProgress(p.progressPct);
        setExportMessage(p.message);
      });
      setExportResult(output);
    } catch (err: any) {
      console.error("Export failed:", err);
      setExportError(err.message || "Failed to render video composition.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ToolLayout
      title="Video Editor"
      description="Trim, split, reorder and export video clips in your browser."
      compactHeader
    >
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-2.5">
        {/* Hidden File Inputs */}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleVideoFile(e.target.files[0]);
              e.target.value = "";
            }
          }}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleAudioFile(e.target.files[0]);
              e.target.value = "";
            }
          }}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleImageFile(e.target.files[0]);
              e.target.value = "";
            }
          }}
        />

        {/* 1. TOP BAR */}
        <TopBar
          projectName={project.settings.name}
          onUpdateProjectName={(name) => dispatch({ type: "SET_PROJECT_NAME", name })}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={() => dispatch({ type: "UNDO" })}
          onRedo={() => dispatch({ type: "REDO" })}
          onExport={handleExport}
          isExporting={isExporting}
          exportProgress={exportProgress}
          exportMessage={exportMessage}
          hasClips={project.clips.length > 0}
        />

        {/* Load Error Alert */}
        {loadError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{loadError}</span>
            <button
              onClick={() => setLoadError(null)}
              className="text-red-500 font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. MAIN WORKSPACE ROW (Toolbar + Side Panel + Preview) */}
        <div className="flex flex-col md:flex-row gap-3 items-start w-full">
          {/* Left Vertical Toolbar */}
          <VerticalToolbar
            activeTool={activeTool}
            isDrawerOpen={isDrawerOpen}
            onSelectTool={handleToolClick}
          />

          {/* Dynamic Side Panel (Tool Drawer OR Properties Panel) */}
          <div className="w-full md:w-80 shrink-0 max-h-[300px] overflow-y-auto scrollbar-thin rounded-2xl">
            {isDrawerOpen ? (
              <ToolDrawer
                activeTool={activeTool}
                onClose={() => setIsDrawerOpen(false)}
                onSelectTool={handleToolClick}
                project={project}
                onAddAsset={(asset) => dispatch({ type: "ADD_ASSET", asset })}
                onRemoveAsset={(assetId) => dispatch({ type: "REMOVE_ASSET", assetId })}
                onAddClip={(clip) => dispatch({ type: "ADD_CLIP", clip })}
                onUpdateClip={(clipId, updates) =>
                  dispatch({ type: "UPDATE_CLIP", clipId, updates })
                }
                onDeleteClip={(clipId) => dispatch({ type: "DELETE_CLIP", clipId })}
                onSelectClip={(clipId) => dispatch({ type: "SELECT_CLIP", clipId })}
                onUpdateSettings={(settings) =>
                  dispatch({ type: "SET_SETTINGS", settings })
                }
                onTriggerVideoUpload={() => videoInputRef.current?.click()}
                onTriggerAudioUpload={() => audioInputRef.current?.click()}
                onTriggerImageUpload={() => imageInputRef.current?.click()}
                onLoadSampleVideo={handleLoadSampleVideo}
                isGeneratingSample={isGeneratingSample}
                isRecording={isRecording}
                recordingSource={recordingSource}
                setRecordingSource={setRecordingSource}
                recordDuration={recordDuration}
                recordError={recordError}
                onStartRecord={startRecording}
                onStopRecord={stopRecording}
                ttsText={ttsText}
                setTtsText={setTtsText}
                availableVoices={availableVoices}
                selectedVoiceName={selectedVoiceName}
                setSelectedVoiceName={setSelectedVoiceName}
                ttsRate={ttsRate}
                setTtsRate={setTtsRate}
                ttsPitch={ttsPitch}
                setTtsPitch={setTtsPitch}
                isSpeaking={isSpeaking}
                onSpeakTTS={speakTTS}
              />
            ) : (
              <PropertiesPanel
                selectedClip={selectedClip}
                settings={project.settings}
                onUpdateClip={(clipId, updates) =>
                  dispatch({ type: "UPDATE_CLIP", clipId, updates })
                }
                onUpdateSettings={(settings) =>
                  dispatch({ type: "SET_SETTINGS", settings })
                }
                onDeleteClip={(clipId) => dispatch({ type: "DELETE_CLIP", clipId })}
                onDuplicateClip={(clipId) =>
                  dispatch({ type: "DUPLICATE_CLIP", clipId })
                }
              />
            )}
          </div>

          {/* Center-Right: Preview Stage */}
          <div className="flex-1 min-w-0 w-full">
            <PreviewStage
              settings={project.settings}
              clips={project.clips}
              assets={project.assets}
              selectedClipId={project.selectedClipId}
              playhead={project.playhead}
              totalDuration={totalDuration}
              isPlaying={project.isPlaying}
              onTogglePlay={() =>
                dispatch({ type: "SET_IS_PLAYING", isPlaying: !project.isPlaying })
              }
              onSeek={(time) => dispatch({ type: "SET_PLAYHEAD", time })}
              onSelectClip={(clipId) => {
                dispatch({ type: "SELECT_CLIP", clipId });
                if (clipId) setIsDrawerOpen(false); // reveal properties panel for selected clip
              }}
              onTriggerVideoUpload={() => videoInputRef.current?.click()}
              onLoadSampleVideo={handleLoadSampleVideo}
              isGeneratingSample={isGeneratingSample}
              onDropVideo={handleVideoFile}
            />
          </div>
        </div>

        {/* 3. MULTI-TRACK TIMELINE */}
        <div className="w-full">
          <MultiTrackTimeline
            tracks={project.tracks}
            clips={project.clips}
            assets={project.assets}
            selectedClipId={project.selectedClipId}
            playhead={project.playhead}
            totalDuration={totalDuration}
            zoom={project.zoom}
            onSelectClip={(clipId) => {
              dispatch({ type: "SELECT_CLIP", clipId });
              if (clipId) setIsDrawerOpen(false);
            }}
            onMoveClip={(clipId, newStartTime) =>
              dispatch({ type: "MOVE_CLIP", clipId, newStartTime })
            }
            onTrimClip={(clipId, edge, deltaSeconds) =>
              dispatch({ type: "TRIM_CLIP", clipId, edge, deltaSeconds })
            }
            onSplitClip={(clipId, splitTime) =>
              dispatch({ type: "SPLIT_CLIP", clipId, splitTime })
            }
            onDeleteClip={(clipId) => dispatch({ type: "DELETE_CLIP", clipId })}
            onDuplicateClip={(clipId) =>
              dispatch({ type: "DUPLICATE_CLIP", clipId })
            }
            onSeek={(time) => dispatch({ type: "SET_PLAYHEAD", time })}
            onSetZoom={(zoom) => dispatch({ type: "SET_ZOOM", zoom })}
          />
        </div>

        {/* EXPORT MODAL / STATUS */}
        {exportResult && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                    Export Ready
                  </h3>
                </div>
                <button
                  onClick={() => setExportResult(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              {/* Video Preview */}
              <div className="w-full rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  src={exportResult.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-white/10">
                <span>
                  {exportResult.width}×{exportResult.height}
                </span>
                <span>{exportResult.duration.toFixed(1)}s</span>
                <span className="uppercase text-[#8B7CFF] font-bold">{exportResult.format}</span>
                <span>{(exportResult.blob.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              {/* Download CTA */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={exportResult.url}
                  download={exportResult.filename}
                  className="flex-1 py-3 bg-[#8B7CFF] hover:bg-[#7968ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center shadow-sm transition-colors"
                >
                  Download Video (.{exportResult.format})
                </a>
                <button
                  onClick={() => setExportResult(null)}
                  className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {exportError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>Export Error: {exportError}</span>
            <button
              onClick={() => setExportError(null)}
              className="text-red-500 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}