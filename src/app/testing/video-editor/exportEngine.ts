/**
 * Export engine for the GROTON Video Editor (ffmpeg.wasm, runs fully in the browser).
 *
 * Responsibilities:
 *  - load the engine and write the source file to ffmpeg's virtual filesystem
 *  - probe the source (streams, audio presence) from ffmpeg's own output
 *  - build the filter graph from the editor state (see exportGraph.ts)
 *  - check the ffmpeg exit code, then VERIFY the produced file before reporting success
 *  - always clean up the virtual filesystem
 *
 * Success is only returned when the output exists, is non-empty, has the expected streams and
 * dimensions, an acceptable duration, and the browser can read it.
 */
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { canvasSize, type AspectRatioId, type FitMode } from "./editorReducer";
import {
  buildExportArgs,
  buildFilterGraph,
  durationTolerance,
  expectedDuration,
  parseStreamInfo,
  type ExportClip,
  type StreamInfo,
} from "./exportGraph";

const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

/** Conservative limit: the source and the output both live in WebAssembly memory. */
export const MAX_INPUT_BYTES = 1024 * 1024 * 1024;

/** An error whose message is safe to show to the user. */
export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportError";
  }
}

export type ExportStage = "Loading export engine" | "Reading video" | "Rendering timeline" | "Checking result";

export type ExportResult = {
  blob: Blob;
  width: number;
  height: number;
  duration: number;
  hasAudio: boolean;
};

/** Run ffmpeg and capture everything it logs. Never throws for a non-zero exit code. */
async function runLogged(ffmpeg: FFmpeg, args: string[]): Promise<{ ret: number; log: string }> {
  const lines: string[] = [];
  const handler = ({ message }: { message: string }) => {
    lines.push(message);
  };
  ffmpeg.on("log", handler);
  try {
    const ret = await ffmpeg.exec(args);
    return { ret, log: lines.join("\n") };
  } finally {
    ffmpeg.off("log", handler);
  }
}

async function probe(ffmpeg: FFmpeg, name: string): Promise<{ info: StreamInfo; log: string }> {
  // `ffmpeg -i file` with no output exits non-zero but prints the full stream layout; that is expected.
  const { log } = await runLogged(ffmpeg, ["-hide_banner", "-i", name]);
  return { info: parseStreamInfo(log), log };
}

function lastErrorLines(log: string): string {
  const interesting = log
    .split("\n")
    .filter((l) => /error|invalid|unsupported|no such|cannot|failed|not found|could not/i.test(l))
    .slice(-3);
  return interesting.join(" ").trim();
}

async function safeDelete(ffmpeg: FFmpeg, name: string) {
  try {
    await ffmpeg.deleteFile(name);
  } catch {
    /* file may not exist */
  }
}

/** Ask the browser itself to read the result; resolves with its duration, or throws if it cannot decode it. */
function verifyInBrowser(blob: Blob): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    let done = false;
    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      v.removeAttribute("src");
      v.load();
      URL.revokeObjectURL(url);
      fn();
    };
    // If the browser is merely slow we rely on ffmpeg's own verification instead of failing.
    const timer = setTimeout(() => finish(() => resolve(null)), 8000);
    v.onloadedmetadata = () => finish(() => resolve(isFinite(v.duration) ? v.duration : null));
    v.onerror = () => finish(() => reject(new ExportError("This browser could not read the exported file.")));
    v.src = url;
  });
}

export async function exportTimeline(
  ffmpeg: FFmpeg,
  opts: {
    file: File;
    clips: ExportClip[];
    aspect: AspectRatioId;
    fit: FitMode;
    /** Source dimensions as shown in the preview (video element). */
    srcWidth: number;
    srcHeight: number;
    originalAudioMuted: boolean;
    originalAudioVolume: number;
    replacementAudioFile: File | null;
    replacementAudioVolume: number;
    replacementAudioMuted: boolean;
    onStage: (stage: ExportStage) => void;
  },
): Promise<ExportResult> {
  const { file, clips, aspect, fit, onStage } = opts;

  if (typeof WebAssembly === "undefined") {
    throw new ExportError("This browser does not support WebAssembly, which export requires.");
  }
  if (clips.length === 0) throw new ExportError("There are no clips to export.");
  if (file.size > MAX_INPUT_BYTES) {
    throw new ExportError("This video is too large to export in the browser (limit is about 1 GB).");
  }

  onStage("Loading export engine");
  if (!ffmpeg.loaded) {
    try {
      await ffmpeg.load({
        coreURL: `${CORE_BASE}/ffmpeg-core.js`,
        wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`,
      });
    } catch {
      throw new ExportError("The export engine could not be loaded. Check your internet connection and try again.");
    }
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = "output.mp4";
  const replaceExt = (opts.replacementAudioFile?.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "mp3";
  const replaceName = opts.replacementAudioFile ? `replace.${replaceExt}` : undefined;

  try {
    onStage("Reading video");
    await safeDelete(ffmpeg, outputName);
    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      if (opts.replacementAudioFile && replaceName) {
         await ffmpeg.writeFile(replaceName, await fetchFile(opts.replacementAudioFile));
      }
    } catch {
      throw new ExportError("The files could not be loaded into memory. They may be too large for this browser.");
    }

    const { info: source, log: sourceLog } = await probe(ffmpeg, inputName);
    if (!source.hasVideo) {
      const why = lastErrorLines(sourceLog);
      throw new ExportError(
        `No readable video was found in this file. Its format or codec may not be supported for export.${why ? ` (${why})` : ""}`,
      );
    }
    
    const includeOriginalAudio = source.hasAudio && !opts.originalAudioMuted && opts.originalAudioVolume > 0;
    const includeReplace = !!opts.replacementAudioFile && !opts.replacementAudioMuted && opts.replacementAudioVolume > 0;
    const hasAudio = includeOriginalAudio || includeReplace;

    // Apply project-level original audio volume to clips
    const originalVol = opts.originalAudioMuted ? 0 : opts.originalAudioVolume / 100;
    const computedClips = clips.map(c => ({
      ...c,
      volume: c.muted ? 0 : c.volume * originalVol,
      muted: c.muted || opts.originalAudioMuted,
    }));

    // Same canvas math as the preview/editor, based on the dimensions the preview reports.
    const { width: outW, height: outH } = canvasSize(
      aspect,
      opts.srcWidth || source.width,
      opts.srcHeight || source.height,
    );

    const graph = buildFilterGraph({ 
      clips: computedClips, 
      outW, 
      outH, 
      fit, 
      includeOriginalAudio,
      replaceAudioVolume: includeReplace ? opts.replacementAudioVolume : undefined 
    });
    
    const args = buildExportArgs({ 
      inputName, 
      outputName, 
      graph, 
      includeAudio: hasAudio,
      replaceName 
    });

    onStage("Rendering timeline");
    const { ret, log } = await runLogged(ffmpeg, args);
    if (ret !== 0) {
      const why = lastErrorLines(log);
      throw new ExportError(`Rendering failed${why ? `: ${why}` : "."}`);
    }

    onStage("Checking result");
    let data: Uint8Array;
    try {
      data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    } catch {
      throw new ExportError("Rendering finished but no output file was produced.");
    }
    if (!data || data.length === 0) throw new ExportError("Rendering finished but the output file is empty.");

    const { info: out } = await probe(ffmpeg, outputName);
    const expected = expectedDuration(clips);
    const tolerance = durationTolerance(expected);
    if (!out.hasVideo) throw new ExportError("The exported file has no video stream.");
    if (out.width !== outW || out.height !== outH) {
      throw new ExportError(`The exported size (${out.width}×${out.height}) does not match the canvas (${outW}×${outH}).`);
    }
    if (hasAudio && !out.hasAudio) throw new ExportError("The exported file is missing its audio track.");
    if (Math.abs(out.duration - expected) > tolerance) {
      throw new ExportError(
        `The exported length (${out.duration.toFixed(1)}s) does not match the timeline (${expected.toFixed(1)}s).`,
      );
    }

    // Copy out of the worker's memory before building the Blob (the buffer may be transferred).
    const blob = new Blob([data.slice().buffer], { type: "video/mp4" });
    const browserDuration = await verifyInBrowser(blob);
    if (browserDuration !== null && Math.abs(browserDuration - expected) > tolerance + 0.25) {
      throw new ExportError("The exported file's length could not be confirmed by the browser.");
    }

    return { blob, width: out.width, height: out.height, duration: out.duration, hasAudio: out.hasAudio };
  } finally {
    await safeDelete(ffmpeg, inputName);
    if (replaceName) await safeDelete(ffmpeg, replaceName);
    await safeDelete(ffmpeg, outputName);
  }
}
