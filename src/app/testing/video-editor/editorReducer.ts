/**
 * Centralized state for the GROTON Video Editor.
 *
 * Source range vs. timeline position:
 *  - A Clip stores its SOURCE range (sourceStart / sourceEnd in the original file) plus
 *    per-clip settings (speed, volume, muted).
 *  - Clip `duration` is its TIMELINE duration: (sourceEnd - sourceStart) / speed.
 *  - Timeline position is never stored; it is derived from the clip ORDER and the
 *    durations of the clips before it (see clipStartTime / locateClip).
 *  - Timeline offsets inside a clip convert to source offsets by multiplying by `speed`.
 *
 * History: every committed edit pushes the previous Snapshot (clips + aspect + fit) on `past`.
 * Snapshots are immutable, so they are never stale and never need cloning.
 */

export const SPEED_PRESETS = [0.5, 1, 1.5, 2] as const;
export type SpeedPreset = (typeof SPEED_PRESETS)[number];

export type AspectRatioId = "16:9" | "9:16" | "1:1" | "4:5";
export type FitMode = "contain" | "cover";

export const ASPECT_RATIOS: { id: AspectRatioId; w: number; h: number }[] = [
  { id: "16:9", w: 16, h: 9 },
  { id: "9:16", w: 9, h: 16 },
  { id: "1:1", w: 1, h: 1 },
  { id: "4:5", w: 4, h: 5 },
];

export type Clip = {
  id: string;
  sourceStart: number;
  sourceEnd: number;
  /** Timeline duration = (sourceEnd - sourceStart) / speed. */
  duration: number;
  speed: number;
  /** 0–100 */
  volume: number;
  muted: boolean;
};

export type Snapshot = {
  clips: Clip[];
  aspect: AspectRatioId;
  fit: FitMode;
  originalAudioMuted: boolean;
  originalAudioVolume: number;
  replacementAudioFile: File | null;
  replacementAudioVolume: number;
  replacementAudioMuted: boolean;
};

export type EditorState = {
  clips: Clip[];
  aspect: AspectRatioId;
  fit: FitMode;
  originalAudioMuted: boolean;
  originalAudioVolume: number;
  replacementAudioFile: File | null;
  replacementAudioVolume: number;
  replacementAudioMuted: boolean;
  /** Aspect chosen automatically for the uploaded video; Reset returns to it. */
  defaultAspect: AspectRatioId;
  selectedClipId: string | null;
  sourceDuration: number;
  past: Snapshot[];
  future: Snapshot[];
  /** Snapshot taken when a drag (trim / volume) begins; committed to history when it ends. */
  trimBase: Snapshot | null;
};

export type EditorAction =
  | { type: "CLEAR" }
  | { type: "INIT"; duration: number; id: string; width?: number; height?: number }
  | { type: "SELECT"; id: string | null }
  | { type: "SPLIT"; time: number; leftId: string; rightId: string }
  | { type: "DELETE" }
  | { type: "DUPLICATE"; id: string }
  | { type: "MOVE"; dir: -1 | 1 }
  | { type: "BEGIN_TRIM" }
  | { type: "TRIM"; id: string; edge: "start" | "end"; value: number }
  | { type: "END_TRIM" }
  | { type: "SET_SPEED"; speed: number }
  | { type: "SET_VOLUME"; value: number }
  | { type: "SET_MUTED"; muted: boolean }
  | { type: "SET_ASPECT"; aspect: AspectRatioId }
  | { type: "SET_FIT"; fit: FitMode }
  | { type: "SET_ORIGINAL_AUDIO_MUTED"; muted: boolean }
  | { type: "SET_ORIGINAL_AUDIO_VOLUME"; volume: number }
  | { type: "SET_REPLACEMENT_AUDIO_FILE"; file: File | null }
  | { type: "SET_REPLACEMENT_AUDIO_VOLUME"; volume: number }
  | { type: "SET_REPLACEMENT_AUDIO_MUTED"; muted: boolean }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; id: string };

export const MIN_CLIP_DURATION = 0.1;
const SPLIT_MARGIN = 0.05;
const HISTORY_LIMIT = 100;

export const initialEditorState: EditorState = {
  clips: [],
  aspect: "16:9",
  fit: "contain",
  originalAudioMuted: false,
  originalAudioVolume: 100,
  replacementAudioFile: null,
  replacementAudioVolume: 100,
  replacementAudioMuted: false,
  defaultAspect: "16:9",
  selectedClipId: null,
  sourceDuration: 0,
  past: [],
  future: [],
  trimBase: null,
};

export function totalDurationOf(clips: Clip[]): number {
  return clips.reduce((acc, c) => acc + c.duration, 0);
}

/** Timeline start time of the clip at `index`. */
export function clipStartTime(clips: Clip[], index: number): number {
  let acc = 0;
  for (let i = 0; i < index && i < clips.length; i++) acc += clips[i].duration;
  return acc;
}

/**
 * Resolve a timeline time to a clip. Clip ranges are half-open [start, end), so a time
 * exactly on a boundary always belongs to the NEXT clip. Only the very end of the
 * timeline resolves to the last clip (at its end). `offset` is in TIMELINE seconds.
 */
export function locateClip(clips: Clip[], time: number): { index: number; offset: number } | null {
  if (clips.length === 0) return null;
  const t = Math.max(0, time);
  let acc = 0;
  for (let i = 0; i < clips.length; i++) {
    if (t < acc + clips[i].duration) return { index: i, offset: Math.max(0, t - acc) };
    acc += clips[i].duration;
  }
  const last = clips.length - 1;
  return { index: last, offset: clips[last].duration };
}

export function canSplitAt(clips: Clip[], time: number): boolean {
  const loc = locateClip(clips, time);
  if (!loc) return false;
  const c = clips[loc.index];
  return loc.offset > SPLIT_MARGIN && c.duration - loc.offset > SPLIT_MARGIN;
}

/** Pick the preset aspect closest to the source video (so the default export matches the source). */
export function closestAspect(width: number, height: number): AspectRatioId {
  if (!width || !height) return "16:9";
  const r = Math.log(width / height);
  let best = ASPECT_RATIOS[0];
  let bestDist = Infinity;
  for (const a of ASPECT_RATIOS) {
    const d = Math.abs(Math.log(a.w / a.h) - r);
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best.id;
}

/** Output canvas size in pixels. Shorter side follows the source (max 1080), dimensions are even. */
export function canvasSize(aspect: AspectRatioId, srcW: number, srcH: number): { width: number; height: number } {
  const a = ASPECT_RATIOS.find((x) => x.id === aspect) ?? ASPECT_RATIOS[0];
  const ratio = a.w / a.h;
  const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  const short = even(Math.min(1080, Math.min(srcW || 1080, srcH || 1080)));
  return ratio >= 1
    ? { width: even(short * ratio), height: short }
    : { width: short, height: even(short / ratio) };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const snapshotOf = (s: EditorState): Snapshot => ({ 
  clips: s.clips, 
  aspect: s.aspect, 
  fit: s.fit,
  originalAudioMuted: s.originalAudioMuted,
  originalAudioVolume: s.originalAudioVolume,
  replacementAudioFile: s.replacementAudioFile,
  replacementAudioVolume: s.replacementAudioVolume,
  replacementAudioMuted: s.replacementAudioMuted
});

function commit(
  state: EditorState,
  patch: Partial<Snapshot>,
  selectedClipId: string | null = state.selectedClipId,
): EditorState {
  return {
    ...state,
    ...patch,
    selectedClipId,
    past: [...state.past, snapshotOf(state)].slice(-HISTORY_LIMIT),
    future: [],
  };
}

function makeClip(
  id: string,
  start: number,
  end: number,
  props: Partial<Pick<Clip, "speed" | "volume" | "muted">> = {},
): Clip {
  const speed = props.speed ?? 1;
  return {
    id,
    sourceStart: start,
    sourceEnd: end,
    duration: (end - start) / speed,
    speed,
    volume: props.volume ?? 100,
    muted: props.muted ?? false,
  };
}

function sameClips(a: Clip[], b: Clip[]): boolean {
  return (
    a.length === b.length &&
    a.every((c, i) => {
      const o = b[i];
      return (
        c.id === o.id &&
        c.sourceStart === o.sourceStart &&
        c.sourceEnd === o.sourceEnd &&
        c.speed === o.speed &&
        c.volume === o.volume &&
        c.muted === o.muted
      );
    })
  );
}

function updateSelected(state: EditorState, fn: (c: Clip) => Clip): Clip[] | null {
  if (!state.selectedClipId) return null;
  const idx = state.clips.findIndex((c) => c.id === state.selectedClipId);
  if (idx === -1) return null;
  const next = [...state.clips];
  next[idx] = fn(state.clips[idx]);
  return next;
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "CLEAR":
      return initialEditorState;

    case "INIT": {
      if (state.clips.length > 0 || !isFinite(action.duration) || action.duration <= 0) return state;
      const aspect = closestAspect(action.width ?? 0, action.height ?? 0);
      return {
        ...initialEditorState,
        aspect,
        defaultAspect: aspect,
        sourceDuration: action.duration,
        clips: [makeClip(action.id, 0, action.duration)],
      };
    }

    case "SELECT":
      return state.selectedClipId === action.id ? state : { ...state, selectedClipId: action.id };

    case "SPLIT": {
      if (!canSplitAt(state.clips, action.time)) return state;
      const loc = locateClip(state.clips, action.time)!;
      const c = state.clips[loc.index];
      // Timeline offset -> source offset
      const splitPoint = c.sourceStart + loc.offset * c.speed;
      const props = { speed: c.speed, volume: c.volume, muted: c.muted };
      const left = makeClip(action.leftId, c.sourceStart, splitPoint, props);
      const right = makeClip(action.rightId, splitPoint, c.sourceEnd, props);
      const next = [...state.clips];
      next.splice(loc.index, 1, left, right);
      return commit(state, { clips: next }, right.id);
    }

    case "DELETE": {
      if (!state.selectedClipId || state.clips.length <= 1) return state;
      const next = state.clips.filter((c) => c.id !== state.selectedClipId);
      if (next.length === state.clips.length) return state;
      return commit(state, { clips: next }, null);
    }

    case "DUPLICATE": {
      if (!state.selectedClipId) return state;
      const idx = state.clips.findIndex((c) => c.id === state.selectedClipId);
      if (idx === -1) return state;
      const next = [...state.clips];
      next.splice(idx + 1, 0, { ...state.clips[idx], id: action.id });
      return commit(state, { clips: next });
    }

    case "MOVE": {
      if (!state.selectedClipId) return state;
      const idx = state.clips.findIndex((c) => c.id === state.selectedClipId);
      const target = idx + action.dir;
      if (idx === -1 || target < 0 || target >= state.clips.length) return state;
      const next = [...state.clips];
      [next[idx], next[target]] = [next[target], next[idx]];
      return commit(state, { clips: next });
    }

    case "BEGIN_TRIM":
      return state.trimBase ? state : { ...state, trimBase: snapshotOf(state) };

    case "TRIM": {
      const idx = state.clips.findIndex((c) => c.id === action.id);
      if (idx === -1) return state;
      const c = state.clips[idx];
      // Minimum clip length is expressed on the timeline, so scale it to source seconds.
      const minSource = MIN_CLIP_DURATION * c.speed;
      let start = c.sourceStart;
      let end = c.sourceEnd;
      if (action.edge === "start") {
        start = clamp(action.value, 0, c.sourceEnd - minSource);
      } else {
        end = clamp(action.value, c.sourceStart + minSource, state.sourceDuration);
      }
      if (start === c.sourceStart && end === c.sourceEnd) return state;
      const next = [...state.clips];
      next[idx] = makeClip(c.id, start, end, c);
      // Live update only; history is committed once on END_TRIM.
      return { ...state, clips: next };
    }

    case "END_TRIM": {
      if (!state.trimBase) return state;
      const base = state.trimBase;
      if (sameClips(base.clips, state.clips)) return { ...state, trimBase: null };
      return {
        ...state,
        trimBase: null,
        past: [...state.past, base].slice(-HISTORY_LIMIT),
        future: [],
      };
    }

    case "SET_SPEED": {
      if (!(SPEED_PRESETS as readonly number[]).includes(action.speed)) return state;
      const target = state.clips.find((c) => c.id === state.selectedClipId);
      if (!target || target.speed === action.speed) return state;
      const next = updateSelected(state, (c) => makeClip(c.id, c.sourceStart, c.sourceEnd, { ...c, speed: action.speed }));
      return next ? commit(state, { clips: next }) : state;
    }

    case "SET_VOLUME": {
      const value = Math.round(clamp(action.value, 0, 100));
      const target = state.clips.find((c) => c.id === state.selectedClipId);
      if (!target || target.volume === value) return state;
      const next = updateSelected(state, (c) => ({ ...c, volume: value }));
      if (!next) return state;
      // During a slider drag (trimBase set) update live; history is committed on END_TRIM.
      return state.trimBase ? { ...state, clips: next } : commit(state, { clips: next });
    }

    case "SET_MUTED": {
      const target = state.clips.find((c) => c.id === state.selectedClipId);
      if (!target || target.muted === action.muted) return state;
      const next = updateSelected(state, (c) => ({ ...c, muted: action.muted }));
      return next ? commit(state, { clips: next }) : state;
    }

    case "SET_ASPECT":
      return state.aspect === action.aspect ? state : commit(state, { aspect: action.aspect });

    case "SET_FIT":
      return state.fit === action.fit ? state : commit(state, { fit: action.fit });

    case "SET_ORIGINAL_AUDIO_MUTED":
      return state.originalAudioMuted === action.muted ? state : commit(state, { originalAudioMuted: action.muted });

    case "SET_ORIGINAL_AUDIO_VOLUME": {
      const volume = Math.round(clamp(action.volume, 0, 100));
      if (state.originalAudioVolume === volume) return state;
      return state.trimBase ? { ...state, originalAudioVolume: volume } : commit(state, { originalAudioVolume: volume });
    }

    case "SET_REPLACEMENT_AUDIO_FILE":
      return state.replacementAudioFile === action.file ? state : commit(state, { replacementAudioFile: action.file });

    case "SET_REPLACEMENT_AUDIO_VOLUME": {
      const volume = Math.round(clamp(action.volume, 0, 100));
      if (state.replacementAudioVolume === volume) return state;
      return state.trimBase ? { ...state, replacementAudioVolume: volume } : commit(state, { replacementAudioVolume: volume });
    }

    case "SET_REPLACEMENT_AUDIO_MUTED":
      return state.replacementAudioMuted === action.muted ? state : commit(state, { replacementAudioMuted: action.muted });

    case "UNDO": {
      if (state.trimBase || state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state,
        clips: prev.clips,
        aspect: prev.aspect,
        fit: prev.fit,
        originalAudioMuted: prev.originalAudioMuted,
        originalAudioVolume: prev.originalAudioVolume,
        replacementAudioFile: prev.replacementAudioFile,
        replacementAudioVolume: prev.replacementAudioVolume,
        replacementAudioMuted: prev.replacementAudioMuted,
        past: state.past.slice(0, -1),
        future: [snapshotOf(state), ...state.future],
        selectedClipId: prev.clips.some((c) => c.id === state.selectedClipId) ? state.selectedClipId : null,
      };
    }

    case "REDO": {
      if (state.trimBase || state.future.length === 0) return state;
      const [nextSnap, ...rest] = state.future;
      return {
        ...state,
        clips: nextSnap.clips,
        aspect: nextSnap.aspect,
        fit: nextSnap.fit,
        originalAudioMuted: nextSnap.originalAudioMuted,
        originalAudioVolume: nextSnap.originalAudioVolume,
        replacementAudioFile: nextSnap.replacementAudioFile,
        replacementAudioVolume: nextSnap.replacementAudioVolume,
        replacementAudioMuted: nextSnap.replacementAudioMuted,
        past: [...state.past, snapshotOf(state)],
        future: rest,
        selectedClipId: nextSnap.clips.some((c) => c.id === state.selectedClipId) ? state.selectedClipId : null,
      };
    }

    case "RESET": {
      if (state.sourceDuration <= 0) return state;
      return commit(
        state,
        { 
          clips: [makeClip(action.id, 0, state.sourceDuration)], 
          aspect: state.defaultAspect, 
          fit: "contain",
          originalAudioMuted: false,
          originalAudioVolume: 100,
          replacementAudioFile: null,
          replacementAudioVolume: 100,
          replacementAudioMuted: false,
        },
        null,
      );
    }

    default:
      return state;
  }
}
