"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import {
  decodeAudioFile,
  processAudioSpeed,
  formatTime,
  formatBytes,
  detectAudioFormat,
  getSpeedChangerExportFilename,
} from "@/utils/audioSpeedChanger";

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const MIN_SPEED = 0.25;
const MAX_SPEED = 3.0;

// Peak generator for waveform canvas
function generatePeaks(buffer: AudioBuffer, numPoints = 600): Float32Array {
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

// Waveform Player Component
interface AudioPlayerCardProps {
  title: string;
  badge: string;
  badgeColor?: string;
  url: string | null;
  buffer: AudioBuffer | null;
  duration: number;
}

function AudioPlayerCard({
  title,
  badge,
  badgeColor = "bg-[#8B7CFF]/10 text-[#8B7CFF] border-[#8B7CFF]/20",
  url,
  buffer,
  duration,
}: AudioPlayerCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const peaks = useMemo(() => {
    if (!buffer) return null;
    return generatePeaks(buffer, 400);
  }, [buffer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [url]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!peaks || peaks.length === 0) {
      // Draw subtle flat line if no peaks
      ctx.strokeStyle = "#CBD5E1";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const amp = height / 2;
    const progressPct = duration > 0 ? currentTime / duration : 0;
    const currentPx = progressPct * width;

    // Draw bars
    const numPoints = peaks.length / 2;
    const barWidth = width / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const min = peaks[i * 2];
      const max = peaks[i * 2 + 1];
      const y = (1 + min) * amp;
      const h = Math.max(2, (max - min) * amp);
      const x = i * barWidth;

      // Color based on playhead
      if (x <= currentPx) {
        ctx.fillStyle = "#8B7CFF";
      } else {
        ctx.fillStyle = "#D4D4D8";
      }
      ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), h);
    }

    // Playhead line
    ctx.fillStyle = "#6366F1";
    ctx.fillRect(Math.max(0, currentPx - 1), 0, 2, height);
  }, [peaks, currentTime, duration]);

  const togglePlay = () => {
    if (!audioRef.current || !url) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = (x / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col gap-4">
      {url && <audio ref={audioRef} src={url} preload="auto" />}

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-lg text-zinc-900 dark:text-zinc-100 font-medium">
            {title}
          </span>
          <span
            className={`text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
        <div className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
          {formatTime(currentTime, true)} / {formatTime(duration, true)}
        </div>
      </div>

      {/* Waveform Canvas with Seek */}
      <div
        className="w-full h-16 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl overflow-hidden cursor-pointer relative border border-zinc-200/60 dark:border-zinc-800/60 transition hover:border-[#8B7CFF]/50"
        onClick={handleSeek}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="w-full h-full block"
        />
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium tracking-wide transition shadow-sm active:scale-95"
        >
          {isPlaying ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              <span>Pause</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span>Play</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
            }
          }}
          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition px-2 py-1 rounded"
        >
          Reset to Start
        </button>
      </div>
    </div>
  );
}

export default function AudioSpeedChangerPage() {
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings state
  const [mode, setMode] = useState<"speed" | "duration">("speed");
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.25);
  const [targetMinutes, setTargetMinutes] = useState<number>(0);
  const [targetSeconds, setTargetSeconds] = useState<number>(0);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const abortRequestedRef = useRef(false);

  // Processed Output state
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedDuration, setProcessedDuration] = useState<number | null>(null);
  const [appliedSpeed, setAppliedSpeed] = useState<number>(1.25);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  // Handle Audio File Upload
  const handleUpload = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;
    const uploadedFile = files[0];

    setErrorMessage(null);
    setIsDecoding(true);
    setProcessedBuffer(null);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setProcessedDuration(null);

    // Validate size (>150MB warning/error)
    if (uploadedFile.size > 150 * 1024 * 1024) {
      setIsDecoding(false);
      setErrorMessage(
        `File is excessively large (${formatBytes(uploadedFile.size)}). Browser memory limit is 150MB. Please use a smaller audio file.`
      );
      return;
    }

    try {
      const buffer = await decodeAudioFile(uploadedFile);
      setFile(uploadedFile);
      setAudioBuffer(buffer);

      if (originalUrl) URL.revokeObjectURL(originalUrl);
      const url = URL.createObjectURL(uploadedFile);
      setOriginalUrl(url);

      // Initialize default target duration to original duration
      const totalSecs = Math.round(buffer.duration);
      setTargetMinutes(Math.floor(totalSecs / 60));
      setTargetSeconds(totalSecs % 60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setFile(null);
      setAudioBuffer(null);
    } finally {
      setIsDecoding(false);
    }
  }, [originalUrl]);

  // Calculate target duration in seconds
  const targetDurationSec = useMemo(() => {
    return Math.max(0, targetMinutes * 60 + targetSeconds);
  }, [targetMinutes, targetSeconds]);

  // Calculate speed in Target Duration mode
  const calculatedDurationSpeed = useMemo(() => {
    if (!audioBuffer || targetDurationSec <= 0) return null;
    return audioBuffer.duration / targetDurationSec;
  }, [audioBuffer, targetDurationSec]);

  // Determine active effective speed based on mode
  const effectiveSpeed = useMemo(() => {
    if (mode === "speed") {
      return speedMultiplier;
    }
    return calculatedDurationSpeed || 1.0;
  }, [mode, speedMultiplier, calculatedDurationSpeed]);

  // Estimated output duration for display
  const estimatedDuration = useMemo(() => {
    if (!audioBuffer) return 0;
    if (mode === "duration") return targetDurationSec;
    return audioBuffer.duration / speedMultiplier;
  }, [audioBuffer, mode, targetDurationSec, speedMultiplier]);

  // Duration validation check
  const durationValidationError = useMemo(() => {
    if (mode !== "duration") return null;
    if (!audioBuffer) return null;
    if (targetDurationSec <= 0) {
      return "Target duration must be greater than 00:00.";
    }
    if (calculatedDurationSpeed === null) return null;

    if (calculatedDurationSpeed < MIN_SPEED) {
      const maxAllowedDuration = audioBuffer.duration / MIN_SPEED;
      return `Target duration of ${formatTime(targetDurationSec)} requires ${calculatedDurationSpeed.toFixed(
        3
      )}× speed (below min limit ${MIN_SPEED}×). Maximum supported duration is ${formatTime(
        maxAllowedDuration
      )}.`;
    }
    if (calculatedDurationSpeed > MAX_SPEED) {
      const minAllowedDuration = audioBuffer.duration / MAX_SPEED;
      return `Target duration of ${formatTime(targetDurationSec)} requires ${calculatedDurationSpeed.toFixed(
        3
      )}× speed (above max limit ${MAX_SPEED}×). Minimum supported duration is ${formatTime(
        minAllowedDuration
      )}.`;
    }
    return null;
  }, [mode, audioBuffer, targetDurationSec, calculatedDurationSpeed]);

  // Speed Mode validation check
  const speedValidationError = useMemo(() => {
    if (mode !== "speed") return null;
    if (isNaN(speedMultiplier) || speedMultiplier < MIN_SPEED || speedMultiplier > MAX_SPEED) {
      return `Speed multiplier must be between ${MIN_SPEED}× and ${MAX_SPEED}×.`;
    }
    return null;
  }, [mode, speedMultiplier]);

  const activeValidationError = mode === "speed" ? speedValidationError : durationValidationError;

  // Process Audio Trigger
  const handleProcess = async () => {
    if (!audioBuffer || isProcessing || activeValidationError) return;

    abortRequestedRef.current = false;
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus("Initializing DSP pitch-preserving processor...");
    setErrorMessage(null);

    // Clean up previous result URL
    if (processedUrl) {
      URL.revokeObjectURL(processedUrl);
      setProcessedUrl(null);
    }

    try {
      setProcessingStatus(`Stretching audio to ${effectiveSpeed.toFixed(3)}× speed...`);

      const result = await processAudioSpeed({
        buffer: audioBuffer,
        speed: effectiveSpeed,
        onProgress: (pct) => {
          setProcessingProgress(pct);
          setProcessingStatus(`Stretching audio (${pct}%)...`);
        },
        shouldAbort: () => abortRequestedRef.current,
      });

      const url = URL.createObjectURL(result.wavBlob);
      setProcessedBuffer(result.outputBuffer);
      setProcessedBlob(result.wavBlob);
      setProcessedUrl(url);
      setProcessedDuration(result.outputDuration);
      setAppliedSpeed(effectiveSpeed);
      setProcessingStatus("Processing complete!");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "PROCESSING_ABORTED") {
        setProcessingStatus("Processing canceled.");
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(`Processing failed: ${msg}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    abortRequestedRef.current = true;
    setProcessingStatus("Canceling...");
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setAudioBuffer(null);
    setOriginalUrl(null);
    setProcessedBuffer(null);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setProcessedDuration(null);
    setErrorMessage(null);
    setProcessingProgress(0);
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const filename = getSpeedChangerExportFilename(file.name);
    const link = document.createElement("a");
    link.href = processedUrl || URL.createObjectURL(processedBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ToolLayout
      title="Audio Speed Changer"
      description="Adjust playback speed or set a target duration without changing pitch using genuine browser-side DSP time stretching."
      category="AUDIO TOOL"
    >
      <div className="w-full flex flex-col gap-8 pb-16">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="w-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-start justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="hover:opacity-70 text-xs uppercase font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: Upload View */}
        {!file && (
          <div className="w-full flex flex-col gap-6">
            <UploadDropzone
              onUpload={handleUpload}
              multiple={false}
              accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.webm"
              title="Drop your audio file here"
              formats={["MP3", "WAV", "M4A", "AAC", "FLAC", "OGG", "WEBM"]}
              className="min-h-[46vh]"
            />

            {isDecoding && (
              <div className="flex items-center justify-center gap-3 p-4 bg-white/60 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="w-4 h-4 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  Decoding audio file locally in browser...
                </span>
              </div>
            )}

            {/* Privacy Feature Callout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">100% In-Browser Privacy</span>
                <p className="text-xs text-zinc-500 font-light">
                  Audio files are decoded and processed in your browser. Nothing is sent to a server.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Pitch Preservation</span>
                <p className="text-xs text-zinc-500 font-light">
                  Uses genuine time-stretching DSP so voices and instruments keep their natural tone.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Exact Target Duration</span>
                <p className="text-xs text-zinc-500 font-light">
                  Set target MM:SS directly to fit video cuts, broadcast slots, or presentation timers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Configure & Process View */}
        {file && audioBuffer && (
          <div className="w-full flex flex-col gap-8">
            {/* Audio File Summary Bar */}
            <div className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/10 text-[#8B7CFF] flex items-center justify-center font-bold text-sm shrink-0">
                  🎵
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs md:max-w-md">
                    {file.name}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    <span>{detectAudioFormat(file)}</span>
                    <span>•</span>
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>{audioBuffer.numberOfChannels === 1 ? "Mono" : "Stereo"}</span>
                    <span>•</span>
                    <span>{audioBuffer.sampleRate} Hz</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Upload Different Audio
                </button>
              </div>
            </div>

            {/* Original Audio Preview Card */}
            <AudioPlayerCard
              title="Original Audio"
              badge={`Original • ${formatTime(audioBuffer.duration, true)}`}
              badgeColor="bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
              url={originalUrl}
              buffer={audioBuffer}
              duration={audioBuffer.duration}
            />

            {/* Adjustment Controls Panel */}
            <div className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-6">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-5">
                <div className="flex flex-col">
                  <h3 className="font-serif text-lg text-zinc-900 dark:text-zinc-100 font-medium">
                    Adjustment Settings
                  </h3>
                  <span className="text-xs text-zinc-500 font-light">
                    Select how you want to adjust your audio
                  </span>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80">
                  <button
                    type="button"
                    onClick={() => setMode("speed")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                      mode === "speed"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    1. Speed Multiplier Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("duration")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                      mode === "duration"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    2. Target Duration Mode
                  </button>
                </div>
              </div>

              {/* MODE 1: SPEED MODE */}
              {mode === "speed" && (
                <div className="flex flex-col gap-6">
                  {/* Preset Buttons */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-mono tracking-wider text-zinc-500 font-medium">
                      Preset Speed Multipliers
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {SPEED_PRESETS.map((preset) => {
                        const isSelected = Math.abs(speedMultiplier - preset) < 0.001;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSpeedMultiplier(preset)}
                            className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium transition ${
                              isSelected
                                ? "bg-[#8B7CFF] border-[#8B7CFF] text-white shadow-sm"
                                : "bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-[#8B7CFF]/50"
                            }`}
                          >
                            {preset}×
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Speed Slider & Direct Numeric Input */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-zinc-50/50 dark:bg-zinc-950/30 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-zinc-500 font-mono">
                        <span>Min {MIN_SPEED}× (Slower)</span>
                        <span className="font-bold text-[#8B7CFF]">{speedMultiplier.toFixed(2)}×</span>
                        <span>Max {MAX_SPEED}× (Faster)</span>
                      </div>
                      <input
                        type="range"
                        min={MIN_SPEED}
                        max={MAX_SPEED}
                        step={0.05}
                        value={speedMultiplier}
                        onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                        className="w-full accent-[#8B7CFF] cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-mono tracking-wider text-zinc-500">
                        Custom Multiplier
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={MIN_SPEED}
                          max={MAX_SPEED}
                          step={0.01}
                          value={speedMultiplier}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) setSpeedMultiplier(val);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none focus:border-[#8B7CFF]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-mono pointer-events-none">
                          ×
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: TARGET DURATION MODE */}
              {mode === "duration" && (
                <div className="flex flex-col gap-6">
                  <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* MM:SS Duration Inputs */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <label className="text-xs uppercase font-mono tracking-wider text-zinc-500 font-medium">
                        Desired Target Duration
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={targetMinutes}
                            onChange={(e) => setTargetMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 px-3 py-2.5 text-center text-lg font-mono font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8B7CFF]"
                          />
                          <span className="text-[10px] text-zinc-400 font-mono uppercase mt-1">Minutes</span>
                        </div>
                        <span className="text-2xl font-mono text-zinc-400 mb-4">:</span>
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={targetSeconds}
                            onChange={(e) =>
                              setTargetSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                            }
                            className="w-20 px-3 py-2.5 text-center text-lg font-mono font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8B7CFF]"
                          />
                          <span className="text-[10px] text-zinc-400 font-mono uppercase mt-1">Seconds</span>
                        </div>
                      </div>
                    </div>

                    {/* Target Duration Mathematical Summary Box */}
                    <div className="w-full md:w-auto flex-1 max-w-md p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
                      <span className="text-[10px] tracking-wider uppercase font-mono text-zinc-400 font-bold">
                        Duration Calculation Breakdown
                      </span>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">Original Duration:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {formatTime(audioBuffer.duration, true)} ({audioBuffer.duration.toFixed(1)}s)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">Target Duration:</span>
                        <span className="font-semibold text-[#8B7CFF]">
                          {formatTime(targetDurationSec)} ({targetDurationSec}s)
                        </span>
                      </div>
                      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">Required Speed:</span>
                        <span className="font-bold text-sm text-[#8B7CFF]">
                          {calculatedDurationSpeed ? `${calculatedDurationSpeed.toFixed(3)}×` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time Summary & Validation Feedback */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#8B7CFF]/5 border border-[#8B7CFF]/20">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                  <div>
                    <span className="text-zinc-400">Target Speed: </span>
                    <span className="font-bold text-[#8B7CFF]">{effectiveSpeed.toFixed(3)}×</span>
                  </div>
                  <span>•</span>
                  <div>
                    <span className="text-zinc-400">Estimated Duration: </span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatTime(estimatedDuration, true)}
                    </span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Pitch Preserved (DSP)</span>
                  </div>
                </div>

                {/* Validation Error Message */}
                {activeValidationError && (
                  <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                    ⚠️ {activeValidationError}
                  </span>
                )}
              </div>

              {/* Progress & Processing Indicator */}
              {isProcessing && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-ping" />
                      {processingStatus}
                    </span>
                    <span className="font-bold text-[#8B7CFF]">{processingProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B7CFF] to-indigo-500 transition-all duration-200 rounded-full"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {isProcessing ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium tracking-wide hover:bg-red-500/10 transition"
                  >
                    Cancel Processing
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={!!activeValidationError}
                    className={`px-8 py-3 rounded-xl text-xs font-medium tracking-wider uppercase transition shadow-md flex items-center gap-2 ${
                      activeValidationError
                        ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white active:scale-95"
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span>Process Audio</span>
                  </button>
                )}
              </div>
            </div>

            {/* STEP 3: Processed Audio & Download Section */}
            {processedBuffer && processedBlob && (
              <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 p-6 shadow-md flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-100 font-medium">
                      Processed Audio Ready
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                    <span>Speed: {appliedSpeed.toFixed(3)}×</span>
                    <span>•</span>
                    <span>Duration: {formatTime(processedDuration || 0, true)}</span>
                    <span>•</span>
                    <span>Size: {formatBytes(processedBlob.size)}</span>
                  </div>
                </div>

                {/* Processed Audio Player */}
                <AudioPlayerCard
                  title="Processed Result"
                  badge={`${appliedSpeed.toFixed(2)}× • Pitch Preserved • ${formatTime(
                    processedDuration || 0,
                    true
                  )}`}
                  badgeColor="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                  url={processedUrl}
                  buffer={processedBuffer}
                  duration={processedDuration || 0}
                />

                {/* Download and Reprocess Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Lossless 16-bit PCM WAV • Pitch Preserved • Original Stereo/Mono Maintained</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2.5 active:scale-95"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download Audio (.wav)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
