/**
 * Centralized state for the GROTON Video Editor.
 *
 * Source range vs. timeline position:
 *  - A Clip only stores its SOURCE range (sourceStart / sourceEnd in the original file).
 *  - Timeline position is never stored; it is derived from the clip ORDER and the
 *    durations of the clips before it (see clipStartTime / locateClip).
 *
 * History: every committed edit pushes the previous clip list on `past`.
 * Snapshots are immutable arrays, so they are never stale and never need cloning.
 */

export type Clip = {
  id: string;
  sourceStart: number;
  sourceEnd: number;
  duration: number;
};

export type EditorState = {
  clips: Clip[];
  selectedClipId: string | null;
  sourceDuration: number;
  past: Clip[][];
  future: Clip[][];
  /** Snapshot taken when a trim drag begins; committed to history when it ends. */
  trimBase: Clip[] | null;
};

export type EditorAction =
  | { type: "CLEAR" }
  | { type: "INIT"; duration: number; id: string }
  | { type: "SELECT"; id: string | null }
  | { type: "SPLIT"; time: number; leftId: string; rightId: string }
  | { type: "DELETE" }
  | { type: "DUPLICATE"; id: string }
  | { type: "MOVE"; dir: -1 | 1 }
  | { type: "BEGIN_TRIM" }
  | { type: "TRIM"; id: string; edge: "start" | "end"; value: number }
  | { type: "END_TRIM" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; id: string };

export const MIN_CLIP_DURATION = 0.1;
const SPLIT_MARGIN = 0.05;
const HISTORY_LIMIT = 100;

export const initialEditorState: EditorState = {
  clips: [],
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
 * timeline resolves to the last clip (at its end).
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

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function commit(state: EditorState, clips: Clip[], selectedClipId: string | null = state.selectedClipId): EditorState {
  return {
    ...state,
    clips,
    selectedClipId,
    past: [...state.past, state.clips].slice(-HISTORY_LIMIT),
    future: [],
  };
}

function makeClip(id: string, start: number, end: number): Clip {
  return { id, sourceStart: start, sourceEnd: end, duration: end - start };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "CLEAR":
      return initialEditorState;

    case "INIT": {
      if (state.clips.length > 0 || !isFinite(action.duration) || action.duration <= 0) return state;
      return {
        ...initialEditorState,
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
      const splitPoint = c.sourceStart + loc.offset;
      const left = makeClip(action.leftId, c.sourceStart, splitPoint);
      const right = makeClip(action.rightId, splitPoint, c.sourceEnd);
      const next = [...state.clips];
      next.splice(loc.index, 1, left, right);
      return commit(state, next, right.id);
    }

    case "DELETE": {
      if (!state.selectedClipId || state.clips.length <= 1) return state;
      const next = state.clips.filter((c) => c.id !== state.selectedClipId);
      if (next.length === state.clips.length) return state;
      return commit(state, next, null);
    }

    case "DUPLICATE": {
      if (!state.selectedClipId) return state;
      const idx = state.clips.findIndex((c) => c.id === state.selectedClipId);
      if (idx === -1) return state;
      const next = [...state.clips];
      next.splice(idx + 1, 0, { ...state.clips[idx], id: action.id });
      return commit(state, next);
    }

    case "MOVE": {
      if (!state.selectedClipId) return state;
      const idx = state.clips.findIndex((c) => c.id === state.selectedClipId);
      const target = idx + action.dir;
      if (idx === -1 || target < 0 || target >= state.clips.length) return state;
      const next = [...state.clips];
      [next[idx], next[target]] = [next[target], next[idx]];
      return commit(state, next);
    }

    case "BEGIN_TRIM":
      return state.trimBase ? state : { ...state, trimBase: state.clips };

    case "TRIM": {
      const idx = state.clips.findIndex((c) => c.id === action.id);
      if (idx === -1) return state;
      const c = state.clips[idx];
      let start = c.sourceStart;
      let end = c.sourceEnd;
      if (action.edge === "start") {
        start = clamp(action.value, 0, c.sourceEnd - MIN_CLIP_DURATION);
      } else {
        end = clamp(action.value, c.sourceStart + MIN_CLIP_DURATION, state.sourceDuration);
      }
      if (start === c.sourceStart && end === c.sourceEnd) return state;
      const next = [...state.clips];
      next[idx] = makeClip(c.id, start, end);
      // Live update only; history is committed once on END_TRIM.
      return { ...state, clips: next };
    }

    case "END_TRIM": {
      if (!state.trimBase) return state;
      const base = state.trimBase;
      const changed =
        base.length !== state.clips.length ||
        base.some((c, i) => c.sourceStart !== state.clips[i].sourceStart || c.sourceEnd !== state.clips[i].sourceEnd);
      if (!changed) return { ...state, trimBase: null };
      return {
        ...state,
        trimBase: null,
        past: [...state.past, base].slice(-HISTORY_LIMIT),
        future: [],
      };
    }

    case "UNDO": {
      if (state.trimBase || state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state,
        clips: prev,
        past: state.past.slice(0, -1),
        future: [state.clips, ...state.future],
        selectedClipId: prev.some((c) => c.id === state.selectedClipId) ? state.selectedClipId : null,
      };
    }

    case "REDO": {
      if (state.trimBase || state.future.length === 0) return state;
      const [nextClips, ...rest] = state.future;
      return {
        ...state,
        clips: nextClips,
        past: [...state.past, state.clips],
        future: rest,
        selectedClipId: nextClips.some((c) => c.id === state.selectedClipId) ? state.selectedClipId : null,
      };
    }

    case "RESET": {
      if (state.sourceDuration <= 0) return state;
      return commit(state, [makeClip(action.id, 0, state.sourceDuration)], null);
    }

    default:
      return state;
  }
}
