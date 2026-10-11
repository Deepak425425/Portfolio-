import { SoundTouch, SimpleFilter } from "soundtouchjs";

/**
 * Custom audio buffer source for SoundTouch that feeds interleaved stereo samples
 * and appends padding silence frames to allow SoundTouch's internal FIFO to flush completely.
 */
class SoundTouchAudioSource {
  private left: Float32Array;
  private right: Float32Array;
  private origLength: number;
  private totalFrames: number;

  constructor(left: Float32Array, right: Float32Array, padFrames: number = 0) {
    this.left = left;
    this.right = right;
    this.origLength = left.length;
    this.totalFrames = left.length + Math.max(0, padFrames);
  }

  extract(target: Float32Array, numFrames: number = 0, position: number = 0): number {
    if (position >= this.totalFrames) {
      return 0;
    }
    const framesToFetch = Math.min(numFrames, this.totalFrames - position);
    for (let i = 0; i < framesToFetch; i++) {
      const idx = position + i;
      if (idx < this.origLength) {
        target[i * 2] = this.left[idx];
        target[i * 2 + 1] = this.right[idx];
      } else {
        target[i * 2] = 0;
        target[i * 2 + 1] = 0;
      }
    }
    return framesToFetch;
  }
}

/**
 * Format seconds to MM:SS or MM:SS.SS
 */
export function formatTime(seconds: number, includeFraction = false): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frac = Math.floor((seconds % 1) * 10);
  const base = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return includeFraction ? `${base}.${frac}` : base;
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Detect audio format from file extension or MIME type
 */
export function detectAudioFormat(file: File): string {
  const ext = file.name.split(".").pop()?.toUpperCase();
  if (ext && ["MP3", "WAV", "M4A", "AAC", "FLAC", "OGG", "WEBM"].includes(ext)) {
    return ext;
  }
  if (file.type.includes("mpeg") || file.type.includes("mp3")) return "MP3";
  if (file.type.includes("wav")) return "WAV";
  if (file.type.includes("ogg")) return "OGG";
  if (file.type.includes("flac")) return "FLAC";
  if (file.type.includes("aac")) return "AAC";
  if (file.type.includes("m4a") || file.type.includes("mp4")) return "M4A";
  if (file.type.includes("webm")) return "WebM Audio";
  return ext || "AUDIO";
}

/**
 * Decode audio file in browser using AudioContext
 */
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new Error("The uploaded audio file is empty (0 bytes).");
  }

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("Web Audio API is not supported in this browser.");
  }

  const audioCtx = new AudioCtx();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Unable to decode audio file. It may be corrupted or an unsupported codec: ${msg}`);
  } finally {
    if (audioCtx.state !== "closed") {
      await audioCtx.close().catch(() => {});
    }
  }
}

/**
 * Lossless 16-bit PCM WAV Encoder
 */
export function encodeWAV(channels: Float32Array[], sampleRate: number): Blob {
  const numChannels = channels.length;
  const numFrames = channels[0].length;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Chunk
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // fmt Subchunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // data Subchunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Write interleaved PCM samples
  let offset = 44;
  for (let frame = 0; frame < numFrames; frame++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][frame];
      // Clamp between -1.0 and 1.0
      if (sample < -1) sample = -1;
      else if (sample > 1) sample = 1;
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export interface SpeedProcessOptions {
  buffer: AudioBuffer;
  speed: number;
  onProgress?: (percentage: number) => void;
  shouldAbort?: () => boolean;
}

export interface SpeedProcessResult {
  outputBuffer: AudioBuffer;
  wavBlob: Blob;
  outputDuration: number;
}

/**
 * Process audio speed while strictly preserving pitch using SoundTouch.
 * Supports async yielding so UI remains responsive and cancellation is immediate.
 */
export async function processAudioSpeed(options: SpeedProcessOptions): Promise<SpeedProcessResult> {
  const { buffer, speed, onProgress, shouldAbort } = options;
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const originalFrames = buffer.length;

  if (speed <= 0 || !isFinite(speed)) {
    throw new Error("Invalid speed multiplier. Must be a positive finite number.");
  }

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();

  try {
    // Exact 1.0x bypass: faithfully preserve original audio without any DSP alteration
    if (Math.abs(speed - 1.0) < 0.0001) {
      if (onProgress) onProgress(50);
      const outputChannels: Float32Array[] = [];
      for (let ch = 0; ch < numChannels; ch++) {
        const chanData = buffer.getChannelData(ch);
        outputChannels.push(new Float32Array(chanData));
      }
      if (onProgress) onProgress(100);

      const wavBlob = encodeWAV(outputChannels, sampleRate);
      const outAudioBuffer = audioCtx.createBuffer(numChannels, originalFrames, sampleRate);
      for (let ch = 0; ch < numChannels; ch++) {
        outAudioBuffer.getChannelData(ch).set(outputChannels[ch]);
      }

      return {
        outputBuffer: outAudioBuffer,
        wavBlob,
        outputDuration: buffer.duration,
      };
    }

    // Time-stretch with SoundTouch
    const expectedFrames = Math.max(1, Math.round(originalFrames / speed));
    const padFrames = Math.round(sampleRate * 2.0); // 2 seconds of silence padding to flush filter FIFO

    const leftData = buffer.getChannelData(0);
    const rightData = numChannels > 1 ? buffer.getChannelData(1) : leftData;

    const source = new SoundTouchAudioSource(leftData, rightData, padFrames);
    const soundTouch = new SoundTouch();
    soundTouch.tempo = speed;
    soundTouch.pitch = 1.0;
    soundTouch.rate = 1.0;

    const filter = new SimpleFilter(source, soundTouch);

    const outLeft = new Float32Array(expectedFrames);
    const outRight = numChannels > 1 ? new Float32Array(expectedFrames) : null;

    const chunkSize = 4096;
    const chunkInterleaved = new Float32Array(chunkSize * 2);

    let framesWritten = 0;
    let consecutiveZeros = 0;

    const yieldInterval = 16384; // yield UI event loop roughly every ~0.37s of audio
    let framesSinceYield = 0;

    while (framesWritten < expectedFrames) {
      if (shouldAbort && shouldAbort()) {
        throw new Error("PROCESSING_ABORTED");
      }

      const framesToFetch = Math.min(chunkSize, expectedFrames - framesWritten);
      const extracted = filter.extract(chunkInterleaved, framesToFetch);

      if (extracted === 0) {
        consecutiveZeros++;
        if (consecutiveZeros > 30) {
          // If the filter has run out of samples even after padding, break
          break;
        }
        // Yield to allow filter internal state
        await new Promise((resolve) => setTimeout(resolve, 0));
        continue;
      }
      consecutiveZeros = 0;

      for (let i = 0; i < extracted; i++) {
        const destIdx = framesWritten + i;
        if (destIdx < expectedFrames) {
          outLeft[destIdx] = chunkInterleaved[i * 2];
          if (outRight) {
            outRight[destIdx] = chunkInterleaved[i * 2 + 1];
          }
        }
      }

      framesWritten += extracted;
      framesSinceYield += extracted;

      if (framesSinceYield >= yieldInterval) {
        framesSinceYield = 0;
        const progressPct = Math.min(95, Math.round((framesWritten / expectedFrames) * 95));
        if (onProgress) onProgress(progressPct);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    if (shouldAbort && shouldAbort()) {
      throw new Error("PROCESSING_ABORTED");
    }

    if (onProgress) onProgress(98);

    const actualChannels: Float32Array[] = [outLeft];
    if (outRight) {
      actualChannels.push(outRight);
    }

    const wavBlob = encodeWAV(actualChannels, sampleRate);

    const outAudioBuffer = audioCtx.createBuffer(actualChannels.length, expectedFrames, sampleRate);
    for (let ch = 0; ch < actualChannels.length; ch++) {
      outAudioBuffer.getChannelData(ch).set(actualChannels[ch]);
    }

    if (onProgress) onProgress(100);

    return {
      outputBuffer: outAudioBuffer,
      wavBlob,
      outputDuration: expectedFrames / sampleRate,
    };
  } finally {
    if (audioCtx.state !== "closed") {
      await audioCtx.close().catch(() => {});
    }
  }
}

/**
 * Generate output filename following groton convention
 */
export function getSpeedChangerExportFilename(originalName: string): string {
  if (!originalName) return "audio-speed-changed.wav";
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
  return `${baseName}-speed-changed.wav`;
}
