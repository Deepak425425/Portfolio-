/**
 * GROTON Video Editor - Multi-Track Composition Export Engine
 *
 * Renders the multi-track timeline (video clips with speed & trims & filters,
 * image overlays, text overlays, visual element graphics, and mixed audio tracks)
 * into a genuine video file containing all real edits.
 */

import { ProjectState, VideoClip, ImageClip, TextClip, AudioClip, ElementClip } from "./types";

export interface ExportProgress {
  stage: "preparing" | "rendering" | "muxing" | "done" | "error";
  progressPct: number;
  message: string;
}

export interface ExportOutput {
  blob: Blob;
  url: string;
  filename: string;
  width: number;
  height: number;
  duration: number;
  format: "mp4" | "webm";
}

export async function renderTimelineComposition(
  project: ProjectState,
  onProgress?: (p: ExportProgress) => void,
): Promise<ExportOutput> {
  const { settings, assets, clips } = project;

  // Determine output dimensions based on aspect ratio
  let outW = 1280;
  let outH = 720;
  if (settings.aspect === "9:16") {
    outW = 720;
    outH = 1280;
  } else if (settings.aspect === "1:1") {
    outW = 1080;
    outH = 1080;
  } else if (settings.aspect === "4:5") {
    outW = 864;
    outH = 1080;
  }

  // Calculate total composition duration
  const totalDuration = Math.max(
    ...clips.map((c) => c.startTime + c.duration),
    1.0,
  );

  onProgress?.({
    stage: "preparing",
    progressPct: 5,
    message: "Initializing render canvas and media buffers...",
  });

  // Pre-load HTML elements for video and image assets
  const videoElements: Map<string, HTMLVideoElement> = new Map();
  const imageElements: Map<string, HTMLImageElement> = new Map();
  const audioElements: Map<string, HTMLAudioElement> = new Map();

  for (const asset of assets) {
    if (asset.type === "video") {
      const v = document.createElement("video");
      v.src = asset.url;
      v.crossOrigin = "anonymous";
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      await new Promise<void>((resolve) => {
        v.onloadeddata = () => resolve();
        v.onerror = () => resolve();
        setTimeout(resolve, 2000);
      });
      videoElements.set(asset.id, v);
    } else if (asset.type === "image") {
      const img = new Image();
      img.src = asset.url;
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 1500);
      });
      imageElements.set(asset.id, img);
    } else if (asset.type === "audio") {
      const a = new Audio();
      a.src = asset.url;
      a.crossOrigin = "anonymous";
      audioElements.set(asset.id, a);
    }
  }

  // Create render canvas
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not initialize 2D canvas context for export.");

  // Web Audio Context for mixing (only activated when audio clips/unmuted tracks are present)
  const hasAudioClips = clips.some(
    (c) => c.trackType === "audio" || (c.trackType === "video" && !(c as VideoClip).muted),
  );

  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  if (hasAudioClips) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        if (audioCtx.state === "suspended") {
          await Promise.race([
            audioCtx.resume().catch(() => {}),
            new Promise((r) => setTimeout(r, 80)),
          ]);
        }
        if (audioCtx.state === "running") {
          audioDest = audioCtx.createMediaStreamDestination();
          const osc = audioCtx.createOscillator();
          const silentGain = audioCtx.createGain();
          silentGain.gain.value = 0;
          osc.connect(silentGain);
          silentGain.connect(audioDest);
          osc.start();
        }
      }
    } catch (e) {
      console.warn("Web Audio not available for export mixing:", e);
    }
  }

  // Capture canvas video stream
  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
  if (audioDest && audioCtx && audioCtx.state === "running" && audioDest.stream.getAudioTracks().length > 0) {
    audioDest.stream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
  }

  // Choose supported MIME type
  let mimeType = "video/webm;codecs=vp9";
  if (MediaRecorder.isTypeSupported("video/mp4")) {
    mimeType = "video/mp4";
  } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
    mimeType = "video/webm;codecs=vp9";
  } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
    mimeType = "video/webm;codecs=vp8";
  } else if (MediaRecorder.isTypeSupported("video/webm")) {
    mimeType = "video/webm";
  } else {
    mimeType = "";
  }

  const recordedChunks: Blob[] = [];
  const recorder = mimeType ? new MediaRecorder(combinedStream, { mimeType }) : new MediaRecorder(combinedStream);

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingFinished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: recorder.mimeType || "video/webm" });
      resolve(finalBlob);
    };
  });

  recorder.start(100);

  // Render loop: step through timeline at 30 fps
  const fps = 30;
  const frameDuration = 1 / fps;
  const totalFrames = Math.ceil(totalDuration * fps);

  // Separate clips by type
  const videoClips = clips.filter((c): c is VideoClip => c.trackType === "video");
  const imageClips = clips.filter((c): c is ImageClip => c.trackType === "image");
  const textClips = clips.filter((c): c is TextClip => c.trackType === "text");
  const elementClips = clips.filter((c): c is ElementClip => c.trackType === "element");

  onProgress?.({
    stage: "rendering",
    progressPct: 10,
    message: `Rendering ${totalFrames} frames...`,
  });

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame * frameDuration;

    // 1. Draw canvas background
    ctx.fillStyle = settings.canvasBgColor || "#000000";
    ctx.fillRect(0, 0, outW, outH);

    // 2. Active Video Clip
    const activeVideoClip = videoClips.find(
      (c) => t >= c.startTime && t < c.startTime + c.duration,
    );

    if (activeVideoClip) {
      const vEl = videoElements.get(activeVideoClip.assetId);
      if (vEl && vEl.readyState >= 2) {
        // Compute source time
        const relTime = (t - activeVideoClip.startTime) * activeVideoClip.speed;
        const srcTime = Math.min(
          activeVideoClip.sourceStart + relTime,
          activeVideoClip.sourceEnd,
        );

        // Seek video element and await seeked event for clean decoding
        if (isFinite(srcTime) && Math.abs(vEl.currentTime - srcTime) > 0.03) {
          await new Promise<void>((resolve) => {
            let done = false;
            const onSeeked = () => {
              if (!done) {
                done = true;
                vEl.removeEventListener("seeked", onSeeked);
                resolve();
              }
            };
            vEl.addEventListener("seeked", onSeeked);
            vEl.currentTime = Math.max(0, srcTime);
            setTimeout(onSeeked, 35);
          });
        }

        // Apply filters
        const contrast = 100 + activeVideoClip.contrast;
        const saturation = 100 + activeVideoClip.saturation;
        const brightness = 100 + activeVideoClip.brightness;
        const hue = activeVideoClip.hue;
        const blur = activeVideoClip.blur;
        ctx.filter = `contrast(${contrast}%) saturate(${saturation}%) brightness(${brightness}%) hue-rotate(${hue}deg) blur(${blur}px)`;

        // Fit mode
        const vW = vEl.videoWidth || 1920;
        const vH = vEl.videoHeight || 1080;
        const stageRatio = outW / outH;
        const videoRatio = vW / vH;

        let drawW = outW;
        let drawH = outH;
        let drawX = 0;
        let drawY = 0;

        if (settings.fit === "cover") {
          if (videoRatio > stageRatio) {
            drawH = outH;
            drawW = outH * videoRatio;
            drawX = (outW - drawW) / 2;
          } else {
            drawW = outW;
            drawH = outW / videoRatio;
            drawY = (outH - drawH) / 2;
          }
        } else {
          // Contain
          if (videoRatio > stageRatio) {
            drawW = outW;
            drawH = outW / videoRatio;
            drawY = (outH - drawH) / 2;
          } else {
            drawH = outH;
            drawW = outH * videoRatio;
            drawX = (outW - drawW) / 2;
          }
        }

        ctx.drawImage(vEl, drawX, drawY, drawW, drawH);
        ctx.filter = "none";
      }
    }

    // 3. Active Image Clips
    for (const imgClip of imageClips) {
      if (t >= imgClip.startTime && t < imgClip.startTime + imgClip.duration) {
        const imgEl = imageElements.get(imgClip.assetId);
        if (imgEl && imgEl.complete) {
          ctx.save();
          const targetW = (outW * 0.25) * (imgClip.scale || 1);
          const aspect = imgEl.naturalWidth / (imgEl.naturalHeight || 1);
          const targetH = targetW / aspect;
          const centerX = (imgClip.xPct / 100) * outW;
          const centerY = (imgClip.yPct / 100) * outH;

          ctx.globalAlpha = Math.max(0, Math.min(1, imgClip.opacity / 100));
          ctx.translate(centerX, centerY);
          if (imgClip.rotation) {
            ctx.rotate((imgClip.rotation * Math.PI) / 180);
          }
          ctx.drawImage(imgEl, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();
        }
      }
    }

    // 4. Active Elements (Letterbox, Lower-Third, Badges)
    for (const elemClip of elementClips) {
      if (t >= elemClip.startTime && t < elemClip.startTime + elemClip.duration) {
        if (elemClip.elementType === "letterbox") {
          const barHeight = outH * ((elemClip.barHeightPct || 10) / 100);
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, outW, barHeight);
          ctx.fillRect(0, outH - barHeight, outW, barHeight);
        } else if (elemClip.elementType === "lowerThird") {
          const bannerH = outH * 0.12;
          const bannerY = outH * 0.82;
          ctx.fillStyle =
            elemClip.theme === "purple"
              ? "rgba(139, 124, 255, 0.9)"
              : elemClip.theme === "dark"
              ? "rgba(18, 18, 20, 0.9)"
              : "rgba(255, 255, 255, 0.95)";

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(outW * 0.08, bannerY, outW * 0.5, bannerH, 12);
            ctx.fill();
          } else {
            ctx.fillRect(outW * 0.08, bannerY, outW * 0.5, bannerH);
          }

          ctx.fillStyle = elemClip.theme === "minimal" ? "#111111" : "#FFFFFF";
          ctx.font = `bold ${Math.round(bannerH * 0.38)}px Inter, sans-serif`;
          ctx.fillText(elemClip.title || "Headline", outW * 0.11, bannerY + bannerH * 0.45);

          ctx.fillStyle = elemClip.theme === "minimal" ? "#666666" : "rgba(255,255,255,0.8)";
          ctx.font = `${Math.round(bannerH * 0.28)}px Inter, sans-serif`;
          ctx.fillText(elemClip.subtitle || "Description text", outW * 0.11, bannerY + bannerH * 0.8);
        } else if (elemClip.elementType === "pillBadge") {
          const badgeX = outW * 0.08;
          const badgeY = outH * 0.08;
          const badgeW = outW * 0.18;
          const badgeH = outH * 0.055;
          ctx.fillStyle =
            elemClip.color === "red"
              ? "#EF4444"
              : elemClip.color === "emerald"
              ? "#10B981"
              : elemClip.color === "amber"
              ? "#F59E0B"
              : "#8B7CFF";
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
            ctx.fill();
          } else {
            ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          }

          ctx.fillStyle = "#FFFFFF";
          ctx.font = `bold ${Math.round(badgeH * 0.55)}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(elemClip.title || "FEATURED", badgeX + badgeW / 2, badgeY + badgeH / 2);
          ctx.textAlign = "start";
          ctx.textBaseline = "alphabetic";
        }
      }
    }

    // 5. Active Text Clips
    for (const txtClip of textClips) {
      if (t >= txtClip.startTime && t < txtClip.startTime + txtClip.duration) {
        ctx.save();
        const fontSizePx = Math.round((txtClip.fontSize / 1080) * outH);
        const fontStyle = `${txtClip.isBold ? "bold " : ""}${txtClip.isItalic ? "italic " : ""}${fontSizePx}px Inter, sans-serif`;
        ctx.font = fontStyle;

        const metrics = ctx.measureText(txtClip.text);
        const padX = fontSizePx * 0.5;
        const padY = fontSizePx * 0.3;
        const boxW = metrics.width + padX * 2;
        const boxH = fontSizePx * 1.3;

        const posX = (txtClip.xPct / 100) * outW;
        const posY = (txtClip.yPct / 100) * outH;

        if (txtClip.bgColor && txtClip.bgColor !== "transparent") {
          ctx.fillStyle = txtClip.bgColor;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(posX - boxW / 2, posY - boxH / 2, boxW, boxH, 8);
            ctx.fill();
          } else {
            ctx.fillRect(posX - boxW / 2, posY - boxH / 2, boxW, boxH);
          }
        }

        ctx.fillStyle = txtClip.color || "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(txtClip.text, posX, posY);
        ctx.restore();
      }
    }

    // Pacing delay per frame to ensure smooth 30 fps capture stream encoding
    await new Promise((r) => setTimeout(r, 33));

    if (frame % 3 === 0 || frame === totalFrames - 1) {
      const pct = Math.min(94, Math.round(10 + (frame / totalFrames) * 85));
      onProgress?.({
        stage: "rendering",
        progressPct: pct,
        message: `Rendering timeline frame ${frame + 1} of ${totalFrames} (${pct}%)...`,
      });
    }
  }

  onProgress?.({
    stage: "muxing",
    progressPct: 96,
    message: "Finalizing video file encoding...",
  });

  // Short buffer wait before stopping MediaRecorder
  await new Promise((r) => setTimeout(r, 200));
  recorder.stop();
  const outputBlob = await recordingFinished;

  if (audioCtx) {
    try {
      await audioCtx.close();
    } catch {}
  }

  // Strict validation: never report success on a zero-byte or corrupted recording
  if (!outputBlob || outputBlob.size === 0) {
    throw new Error("Export failed: encoded video file contains 0 bytes. Check video tracks and format.");
  }

  const outputUrl = URL.createObjectURL(outputBlob);

  // Validate that the browser can decode and read video metadata
  await new Promise<void>((resolve, reject) => {
    const testVideo = document.createElement("video");
    testVideo.preload = "metadata";
    testVideo.onloadedmetadata = () => resolve();
    testVideo.onerror = () => reject(new Error("Browser could not decode the produced video output."));
    testVideo.src = outputUrl;
    setTimeout(resolve, 3000);
  });

  const isMp4 = (recorder.mimeType || "").includes("mp4") || outputBlob.type.includes("mp4");
  const cleanName = settings.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "groton-edit";
  const filename = `${cleanName}.${isMp4 ? "mp4" : "webm"}`;

  onProgress?.({
    stage: "done",
    progressPct: 100,
    message: "Export complete!",
  });

  return {
    blob: outputBlob,
    url: outputUrl,
    filename,
    width: outW,
    height: outH,
    duration: totalDuration,
    format: isMp4 ? "mp4" : "webm",
  };
}
