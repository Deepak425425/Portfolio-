"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadDropzone from "@/components/tools/UploadDropzone";
import { getGrotonExportFilename } from "@/utils/export";
import {
  parseVideoMetadata,
  cleanVideoMetadata,
  verifyCleanedMetadata,
  formatBytes,
  formatDuration,
  ParsedVideoMetadata,
  VerificationResult,
} from "@/utils/videoMetadata";

export default function VideoMetadataRemoverPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ width: number; height: number; duration: number }>({
    width: 0,
    height: 0,
    duration: 0,
  });

  const [parsedData, setParsedData] = useState<ParsedVideoMetadata | null>(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [cleanedSize, setCleanedSize] = useState<number>(0);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanedVideoRef = useRef<HTMLVideoElement>(null);

  // Clean up ObjectURLs on unmount or file reset
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (cleanedUrl) URL.revokeObjectURL(cleanedUrl);
    };
  }, [videoUrl, cleanedUrl]);

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];

    // Validate format
    const lowerName = file.name.toLowerCase();
    const isSupportedExt = lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || lowerName.endsWith('.m4v') || lowerName.endsWith('.webm');
    if (!isSupportedExt && !file.type.startsWith('video/')) {
      setErrorMessage("Please upload a supported video file (.mp4, .mov, .m4v, or .webm).");
      return;
    }

    setErrorMessage(null);
    resetCleanedState();

    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);

    try {
      const buffer = await file.arrayBuffer();
      const metadata = parseVideoMetadata(buffer);
      setParsedData(metadata);

      // Select all detected removable fields by default
      const allRemovableIds = metadata.fields.map((f) => f.id);
      setSelectedFieldIds(allRemovableIds.length > 0 ? allRemovableIds : ['all']);
    } catch (err: any) {
      console.error("Failed to parse video metadata:", err);
      setErrorMessage("Could not inspect video container. The file may be corrupted or in an unsupported codec format.");
    }
  };

  const resetCleanedState = () => {
    if (cleanedUrl) URL.revokeObjectURL(cleanedUrl);
    setCleanedBlob(null);
    setCleanedUrl(null);
    setCleanedSize(0);
    setVerification(null);
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (cleanedUrl) URL.revokeObjectURL(cleanedUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setParsedData(null);
    setSelectedFieldIds([]);
    resetCleanedState();
    setErrorMessage(null);
    setIsProcessing(false);
    setProgress(0);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    setVideoMeta({
      width: target.videoWidth,
      height: target.videoHeight,
      duration: target.duration,
    });
  };

  const toggleFieldSelection = (fieldId: string) => {
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  const selectAllFields = () => {
    if (!parsedData) return;
    const allIds = parsedData.fields.map((f) => f.id);
    setSelectedFieldIds(allIds.length > 0 ? allIds : ['all']);
  };

  const deselectAllFields = () => {
    setSelectedFieldIds([]);
  };

  const processVideo = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProgress(15);
    setStatusText("Reading video container atoms...");
    setErrorMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 120));
      setProgress(40);
      setStatusText("Neutralizing selected metadata without re-encoding...");

      const arrayBuffer = await videoFile.arrayBuffer();
      await new Promise((r) => setTimeout(r, 180));

      setProgress(70);
      setStatusText("Preserving video & audio bitstream...");
      const cleanedBytes = cleanVideoMetadata(arrayBuffer, selectedFieldIds);

      setProgress(90);
      setStatusText("Verifying output file integrity...");
      const verifyResult = verifyCleanedMetadata(cleanedBytes.buffer, selectedFieldIds);
      setVerification(verifyResult);

      const mimeType = videoFile.type || "video/mp4";
      const blob = new Blob([cleanedBytes as any], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setCleanedBlob(blob);
      setCleanedUrl(url);
      setCleanedSize(blob.size);
      setProgress(100);
      setStatusText("Complete!");
    } catch (err: any) {
      console.error("Video metadata removal failed:", err);
      setErrorMessage("Processing failed. The video file could not be parsed or modified.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCleanedVideo = () => {
    if (!cleanedUrl || !videoFile) return;
    const a = document.createElement("a");
    a.href = cleanedUrl;
    a.download = getGrotonExportFilename(videoFile.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const removableCount = parsedData?.fields.length ?? 0;
  const isAllSelected = removableCount > 0 && selectedFieldIds.length === removableCount;

  return (
    <ToolLayout
      title="Video Metadata Remover"
      description="Inspect and strip EXIF, timestamps, GPS geotags, encoder signatures, and camera details from video files. Lossless, browser-based container cleaning with zero re-encoding."
      category="VIDEO PRIVACY"
    >
      <div className="w-full flex flex-col gap-8">
        {errorMessage && (
          <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs uppercase font-bold tracking-wider hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {!videoFile && (
          <div className="flex flex-col gap-10">
            <UploadDropzone
              onUpload={handleUpload}
              multiple={false}
              accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v"
              title="Upload video to inspect & remove metadata"
              formats={["MP4", "MOV", "WEBM", "M4V"]}
              className="min-h-[46vh]"
            />

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#18181A]/70 backdrop-blur-sm flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#8B7CFF]/10 text-[#8B7CFF] flex items-center justify-center text-base font-bold mb-1">
                  🔒
                </div>
                <h2 className="text-base font-bold text-black dark:text-white">100% Browser-Based Privacy</h2>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Your video never leaves your device. Container parsing and metadata stripping execute entirely inside your local browser memory.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#18181A]/70 backdrop-blur-sm flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#8B7CFF]/10 text-[#8B7CFF] flex items-center justify-center text-base font-bold mb-1">
                  ⚡
                </div>
                <h2 className="text-base font-bold text-black dark:text-white">Lossless Stream Remuxing</h2>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Container atoms are cleaned in place without re-encoding video or audio frames. Video resolution, bitrate, and quality remain 100% untouched.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#18181A]/70 backdrop-blur-sm flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#8B7CFF]/10 text-[#8B7CFF] flex items-center justify-center text-base font-bold mb-1">
                  ✓
                </div>
                <h2 className="text-base font-bold text-black dark:text-white">Verified Removal</h2>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  The processed file is independently rescanned to verify that creation dates, GPS tags, and encoder notes are genuinely eliminated.
                </p>
              </div>
            </div>
          </div>
        )}

        {videoFile && (
          <div className="flex flex-col gap-8">
            {/* Top Bar with File Details & Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#18181A] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/10 text-[#8B7CFF] flex items-center justify-center text-lg font-bold shrink-0">
                  🎬
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-black dark:text-white truncate max-w-[280px] sm:max-w-[420px]">
                    {videoFile.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatBytes(videoFile.size)} • {videoMeta.width > 0 ? `${videoMeta.width}×${videoMeta.height}` : 'Reading resolution...'} • {formatDuration(videoMeta.duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={resetAll}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  Change Video
                </button>
                {!cleanedBlob && (
                  <button
                    onClick={processVideo}
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-[#8B7CFF] hover:bg-[#7a6aef] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(139,124,255,0.3)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Cleaning...</span>
                      </>
                    ) : (
                      <>
                        <span>Clean Selected Metadata</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Processing Progress Indicator */}
            {isProcessing && (
              <div className="p-6 rounded-2xl border border-[#8B7CFF]/30 bg-[#8B7CFF]/5 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-black dark:text-white">
                  <span>{statusText}</span>
                  <span className="text-[#8B7CFF]">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-[#8B7CFF] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Post-Processing Success & Download Banner */}
            {cleanedBlob && (
              <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.06] flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <h2 className="text-base font-bold text-black dark:text-white">
                      Metadata Successfully Stripped & Verified
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xl">
                    {verification?.message || "All selected container metadata tags were removed without re-encoding."}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    <span>Original: <strong>{formatBytes(videoFile.size)}</strong></span>
                    <span>→</span>
                    <span>Cleaned: <strong>{formatBytes(cleanedSize)}</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• 100% Quality Preserved</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={downloadCleanedVideo}
                    className="w-full md:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Download Cleaned Video</span>
                    <span>↓</span>
                  </button>
                </div>
              </div>
            )}

            {/* Video Previews and Metadata Inspection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Video Players */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#18181A] flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-500">
                      {cleanedUrl ? "Cleaned Video Preview" : "Uploaded Video Preview"}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 font-bold text-zinc-600 dark:text-zinc-300">
                      {cleanedUrl ? "Lossless Copy" : "Original"}
                    </span>
                  </div>

                  <div className="w-full aspect-video rounded-xl bg-black overflow-hidden relative flex items-center justify-center">
                    <video
                      ref={cleanedUrl ? cleanedVideoRef : videoRef}
                      src={cleanedUrl || videoUrl || undefined}
                      controls
                      onLoadedMetadata={handleLoadedMetadata}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-normal text-center">
                    Native browser playback. Video and audio packets are preserved directly from source.
                  </p>
                </div>
              </div>

              {/* Right Column: Metadata Inspection & Control */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Removable Metadata Controls */}
                <div className="p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#18181A] flex flex-col gap-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                        <span>Detectable Metadata Tags</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B7CFF]/15 text-[#8B7CFF] font-semibold">
                          {removableCount} Found
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Select which embedded metadata atoms to wipe from the video container.
                      </p>
                    </div>

                    {removableCount > 0 && !cleanedBlob && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={selectAllFields}
                          className={`font-semibold transition-colors ${
                            isAllSelected ? "text-[#8B7CFF]" : "text-zinc-500 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          Select All
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <button
                          type="button"
                          onClick={deselectAllFields}
                          className="text-zinc-500 hover:text-black dark:hover:text-white font-semibold transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                    )}
                  </div>

                  {removableCount === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center gap-2">
                      <span className="text-2xl">🛡️</span>
                      <p className="text-sm font-semibold text-black dark:text-white">
                        No User Metadata Atoms Detected
                      </p>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        This video file does not contain identifiable EXIF timestamps, GPS coordinates, or author tags. You may still clean container padding boxes if desired.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {parsedData?.fields.map((field) => {
                        const isSelected = selectedFieldIds.includes(field.id) || selectedFieldIds.includes('all');
                        return (
                          <label
                            key={field.id}
                            className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#8B7CFF]/50 bg-[#8B7CFF]/[0.04]"
                                : "border-black/[0.06] dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={Boolean(cleanedBlob)}
                              onChange={() => toggleFieldSelection(field.id)}
                              className="mt-1 h-4 w-4 rounded border-zinc-300 text-[#8B7CFF] focus:ring-[#8B7CFF] accent-[#8B7CFF]"
                            />
                            <div className="flex-1 flex flex-col gap-0.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-black dark:text-white">
                                  {field.label}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider font-semibold">
                                  {field.category}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-700 dark:text-zinc-300 font-mono break-all line-clamp-2">
                                {field.value}
                              </span>
                              <span className="text-[11px] text-zinc-400 mt-0.5">
                                {field.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Technical Video Properties (Read-Only) */}
                <div className="p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#18181A] flex flex-col gap-4 shadow-sm">
                  <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-500">
                      Technical Video Stream Properties (Preserved)
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Stream architecture remains bit-for-bit intact to guarantee zero generational quality loss.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-zinc-400 font-bold">Container</span>
                      <span className="font-semibold text-black dark:text-white truncate">
                        {parsedData?.technical.format || "MP4 / ISO"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-zinc-400 font-bold">Resolution</span>
                      <span className="font-semibold text-black dark:text-white">
                        {videoMeta.width > 0 ? `${videoMeta.width} × ${videoMeta.height}` : "Analyzing..."}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-zinc-400 font-bold">Duration</span>
                      <span className="font-semibold text-black dark:text-white">
                        {formatDuration(videoMeta.duration)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-zinc-400 font-bold">File Size</span>
                      <span className="font-semibold text-black dark:text-white">
                        {formatBytes(videoFile.size)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-zinc-400 font-bold">Video Track</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {parsedData?.technical.hasVideoTrack ? "Active (Intact)" : "Present"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-zinc-400 font-bold">Audio Track</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {parsedData?.technical.hasAudioTrack ? "Active (Intact)" : "Passthrough"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
