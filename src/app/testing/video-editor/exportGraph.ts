/**
 * Pure helpers for building the export (ffmpeg) command from the editor state.
 * No imports from the editor module are used at runtime so this file can be unit-tested in isolation.
 */

export type ExportClip = {
  sourceStart: number;
  sourceEnd: number;
  /** Timeline duration = (sourceEnd - sourceStart) / speed */
  duration: number;
  speed: number;
  /** 0–100 */
  volume: number;
  muted: boolean;
};

export type StreamInfo = {
  hasVideo: boolean;
  hasAudio: boolean;
  width: number;
  height: number;
  fps: number;
  /** Container duration in seconds, 0 if unknown. */
  duration: number;
};

/** Parse the text ffmpeg prints for `ffmpeg -i file` (stream layout and duration). */
export function parseStreamInfo(log: string): StreamInfo {
  const video = log.match(/Stream #\d+:\d+[^\n]*?: Video: [^\n]*?(\d{2,5})x(\d{2,5})/);
  const fpsMatch = log.match(/Stream #\d+:\d+[^\n]*?: Video:[^\n]*?(\d+(?:\.\d+)?) fps/);
  const dur = log.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  return {
    hasVideo: !!video,
    hasAudio: /Stream #\d+:\d+[^\n]*?: Audio:/.test(log),
    width: video ? parseInt(video[1], 10) : 0,
    height: video ? parseInt(video[2], 10) : 0,
    fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
    duration: dur ? parseInt(dur[1], 10) * 3600 + parseInt(dur[2], 10) * 60 + parseFloat(dur[3]) : 0,
  };
}

const num = (n: number) => {
  // Fixed notation: avoids "1e-7" style output and float noise in filter strings.
  const s = n.toFixed(6);
  return s.replace(/\.?0+$/, "") || "0";
};

/** Throws if the clip list cannot produce a valid export. */
export function validateClips(clips: ExportClip[]): void {
  if (clips.length === 0) throw new Error("There are no clips to export.");
  clips.forEach((c, i) => {
    const ok =
      isFinite(c.sourceStart) &&
      isFinite(c.sourceEnd) &&
      c.sourceStart >= 0 &&
      c.sourceEnd > c.sourceStart &&
      [0.5, 1, 1.5, 2].includes(c.speed) &&
      c.duration > 0;
    if (!ok) throw new Error(`Clip ${i + 1} has an invalid range or speed.`);
  });
}

/**
 * Build the filter_complex string. Every clip becomes one video segment (and one audio segment when the
 * source has audio), all normalised to the same size / pixel format / audio format so `concat`
 * is safe, then joined in timeline order.
 *
 * NOTE: do not add an `fps` filter after `trim` (or after `concat`). A trimmed branch only sees EOF when the
 * whole source ends, and `fps` then duplicates frames up to that point (verified: a reordered 6s timeline
 * came out ~12s long). The mp4 muxer already produces constant-frame-rate output.
 *
 * Preview parity:
 *  - fit "contain": scale to fit inside the canvas, black bars (preview canvas is black)
 *  - fit "cover":   scale to fill the canvas and center-crop (preview uses object-cover)
 *  - speed: video PTS divided by speed, audio via atempo (0.5–2.0 only; presets are within range)
 *  - mute/volume: `volume` filter (muted → 0, so segment length is preserved)
 */
export function buildFilterGraph(opts: {
  clips: ExportClip[];
  outW: number;
  outH: number;
  fit: "contain" | "cover";
  includeOriginalAudio: boolean;
  replaceAudioVolume?: number;
}): string {
  const { clips, outW, outH, fit, includeOriginalAudio, replaceAudioVolume } = opts;
  validateClips(clips);
  
  const includeReplace = replaceAudioVolume !== undefined;
  const includeOriginal = includeOriginalAudio;

  const fitFilter =
    fit === "cover"
      ? `scale=${outW}:${outH}:force_original_aspect_ratio=increase,crop=${outW}:${outH}`
      : `scale=${outW}:${outH}:force_original_aspect_ratio=decrease,pad=${outW}:${outH}:(ow-iw)/2:(oh-ih)/2:color=black`;

  const parts: string[] = [];
  let concatInputs = "";

  clips.forEach((c, i) => {
    const setpts = c.speed !== 1 ? `setpts=(PTS-STARTPTS)/${num(c.speed)}` : "setpts=PTS-STARTPTS";
    parts.push(
      `[0:v]trim=start=${num(c.sourceStart)}:end=${num(c.sourceEnd)},${setpts},${fitFilter},setsar=1,format=yuv420p[v${i}]`,
    );
    concatInputs += `[v${i}]`;
    if (includeOriginal) {
      const tempo = c.speed !== 1 ? `,atempo=${num(c.speed)}` : "";
      const gain = c.muted ? 0 : Math.max(0, Math.min(100, c.volume)) / 100;
      const dur = num(c.duration);
      // apad + atrim pin every audio segment to exactly the clip's timeline duration so audio can
      // never drift against video across concatenated segments.
      parts.push(
        `[0:a]atrim=start=${num(c.sourceStart)}:end=${num(c.sourceEnd)},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo${tempo},volume=${num(gain)},apad=whole_dur=${dur},atrim=end=${dur},asetpts=PTS-STARTPTS[a${i}]`,
      );
    }
  });

  if (includeOriginal) {
    // Interleave [v0][a0][v1][a1]... as required by concat with v=1:a=1
    let interleaved = "";
    clips.forEach((_, i) => {
      interleaved += `[v${i}][a${i}]`;
    });
    parts.push(`${interleaved}concat=n=${clips.length}:v=1:a=1[outv][outa_orig]`);
  } else {
    parts.push(`${concatInputs}concat=n=${clips.length}:v=1:a=0[outv]`);
  }

  const totalDur = num(expectedDuration(clips));

  if (includeReplace) {
    const gainReplace = Math.max(0, Math.min(100, replaceAudioVolume)) / 100;
    // Format, resample, apply volume, pad to exact duration, then trim to exact duration
    parts.push(`[1:a]volume=${num(gainReplace)},aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad=whole_dur=${totalDur},atrim=end=${totalDur},asetpts=PTS-STARTPTS[outa_repl]`);
  }

  if (includeOriginal && includeReplace) {
    parts.push(`[outa_orig][outa_repl]amix=inputs=2:duration=first:normalize=0[outa]`);
  } else if (includeOriginal) {
    parts.push(`[outa_orig]anull[outa]`); // just alias
  } else if (includeReplace) {
    parts.push(`[outa_repl]anull[outa]`); // just alias
  }

  return parts.join(";");
}

export function buildExportArgs(opts: {
  inputName: string;
  outputName: string;
  graph: string;
  includeAudio: boolean;
  replaceName?: string;
}): string[] {
  const args = ["-hide_banner", "-i", opts.inputName];
  if (opts.replaceName) {
    args.push("-i", opts.replaceName);
  }
  args.push("-filter_complex", opts.graph, "-map", "[outv]");
  if (opts.includeAudio) args.push("-map", "[outa]");
  args.push("-c:v", "libx264", "-preset", "ultrafast", "-crf", "24", "-pix_fmt", "yuv420p");
  if (opts.includeAudio) args.push("-c:a", "aac", "-b:a", "128k");
  args.push("-movflags", "+faststart", "-max_muxing_queue_size", "1024", "-y", opts.outputName);
  return args;
}

/** Expected output duration: the sum of the timeline durations. */
export function expectedDuration(clips: ExportClip[]): number {
  return clips.reduce((acc, c) => acc + c.duration, 0);
}

/** Allowed difference between expected and actual output duration (frame rounding, encoder priming). */
export function durationTolerance(expected: number): number {
  return Math.max(0.35, expected * 0.03);
}
