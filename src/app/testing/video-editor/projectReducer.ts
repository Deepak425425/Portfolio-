/**
 * GROTON Video Editor - Project State Reducer with History (Undo/Redo)
 */

import {
  ProjectState,
  ProjectSettings,
  TimelineTrack,
  TimelineClip,
  VideoClip,
  ImageClip,
  TextClip,
  AudioClip,
  ElementClip,
  MediaAsset,
  DEFAULT_TRACKS,
  INITIAL_PROJECT_SETTINGS,
} from "./types";

export interface Snapshot {
  settings: ProjectSettings;
  tracks: TimelineTrack[];
  clips: TimelineClip[];
}

export interface StateWithHistory {
  present: ProjectState;
  past: Snapshot[];
  future: Snapshot[];
}

export type Action =
  | { type: "INIT_PROJECT"; settings?: Partial<ProjectSettings> }
  | { type: "SET_PROJECT_NAME"; name: string }
  | { type: "SET_SETTINGS"; settings: Partial<ProjectSettings> }
  | { type: "ADD_ASSET"; asset: MediaAsset }
  | { type: "REMOVE_ASSET"; assetId: string }
  | { type: "ADD_CLIP"; clip: TimelineClip }
  | { type: "MOVE_CLIP"; clipId: string; newStartTime: number; newTrackId?: string }
  | {
      type: "TRIM_CLIP";
      clipId: string;
      edge: "start" | "end";
      deltaSeconds: number;
    }
  | { type: "SPLIT_CLIP"; clipId: string; splitTime: number }
  | { type: "DELETE_CLIP"; clipId: string }
  | { type: "DUPLICATE_CLIP"; clipId: string }
  | { type: "UPDATE_CLIP"; clipId: string; updates: Partial<TimelineClip> }
  | { type: "SELECT_CLIP"; clipId: string | null }
  | { type: "SET_PLAYHEAD"; time: number }
  | { type: "SET_IS_PLAYING"; isPlaying: boolean }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "TOGGLE_TRACK_MUTE"; trackId: string }
  | { type: "TOGGLE_TRACK_LOCK"; trackId: string }
  | { type: "TOGGLE_TRACK_HIDDEN"; trackId: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_PROJECT" };

const MAX_HISTORY = 50;

function createSnapshot(state: ProjectState): Snapshot {
  return {
    settings: { ...state.settings },
    tracks: state.tracks.map((t) => ({ ...t })),
    clips: state.clips.map((c) => ({ ...c })),
  };
}

export function calculateTotalDuration(clips: TimelineClip[]): number {
  if (clips.length === 0) return 0;
  return Math.max(...clips.map((c) => c.startTime + c.duration), 0);
}

export const initialProjectState: StateWithHistory = {
  present: {
    settings: { ...INITIAL_PROJECT_SETTINGS },
    assets: [],
    tracks: [...DEFAULT_TRACKS],
    clips: [],
    selectedClipId: null,
    selectedTrackId: null,
    playhead: 0,
    zoom: 60, // 60 pixels per second
    isPlaying: false,
  },
  past: [],
  future: [],
};

export function projectReducer(state: StateWithHistory, action: Action): StateWithHistory {
  const { present, past, future } = state;

  // Helper to commit an undoable change
  const commit = (newPresent: ProjectState): StateWithHistory => {
    return {
      present: newPresent,
      past: [...past.slice(-MAX_HISTORY), createSnapshot(present)],
      future: [],
    };
  };

  switch (action.type) {
    case "INIT_PROJECT": {
      return {
        present: {
          ...present,
          settings: { ...present.settings, ...action.settings },
        },
        past: [],
        future: [],
      };
    }

    case "SET_PROJECT_NAME": {
      return commit({
        ...present,
        settings: { ...present.settings, name: action.name },
      });
    }

    case "SET_SETTINGS": {
      return commit({
        ...present,
        settings: { ...present.settings, ...action.settings },
      });
    }

    case "ADD_ASSET": {
      // Check if already exists
      const existing = present.assets.find((a) => a.id === action.asset.id);
      if (existing) return state;
      return {
        ...state,
        present: {
          ...present,
          assets: [...present.assets, action.asset],
        },
      };
    }

    case "REMOVE_ASSET": {
      // Remove asset and all clips referencing it
      const remainingClips = present.clips.filter((c) => {
        if ("assetId" in c) {
          return (c as VideoClip | ImageClip | AudioClip).assetId !== action.assetId;
        }
        return true;
      });
      return commit({
        ...present,
        assets: present.assets.filter((a) => a.id !== action.assetId),
        clips: remainingClips,
        selectedClipId:
          present.selectedClipId && !remainingClips.some((c) => c.id === present.selectedClipId)
            ? null
            : present.selectedClipId,
      });
    }

    case "ADD_CLIP": {
      return commit({
        ...present,
        clips: [...present.clips, action.clip],
        selectedClipId: action.clip.id,
      });
    }

    case "MOVE_CLIP": {
      const clipIndex = present.clips.findIndex((c) => c.id === action.clipId);
      if (clipIndex === -1) return state;

      const clip = present.clips[clipIndex];
      const newStartTime = Math.max(0, action.newStartTime);
      const updatedClips = [...present.clips];
      updatedClips[clipIndex] = {
        ...clip,
        startTime: newStartTime,
        trackId: action.newTrackId || clip.trackId,
      };

      return commit({
        ...present,
        clips: updatedClips,
      });
    }

    case "TRIM_CLIP": {
      const clipIndex = present.clips.findIndex((c) => c.id === action.clipId);
      if (clipIndex === -1) return state;

      const clip = present.clips[clipIndex];
      const updatedClips = [...present.clips];

      if (clip.trackType === "video") {
        const vClip = clip as VideoClip;
        if (action.edge === "start") {
          // Trimming start edge forward: sourceStart increases, startTime increases, duration decreases
          const maxDelta = vClip.duration - 0.2;
          const delta = Math.max(-vClip.sourceStart, Math.min(action.deltaSeconds, maxDelta));
          const newSourceStart = vClip.sourceStart + delta;
          const newDuration = (vClip.sourceEnd - newSourceStart) / vClip.speed;
          const newStartTime = vClip.startTime + delta / vClip.speed;
          updatedClips[clipIndex] = {
            ...vClip,
            sourceStart: newSourceStart,
            startTime: Math.max(0, newStartTime),
            duration: Math.max(0.1, newDuration),
          };
        } else {
          // Trimming end edge
          const maxDelta = 3600; // bounded by source end
          const delta = Math.max(-(vClip.duration - 0.2), action.deltaSeconds);
          const newSourceEnd = vClip.sourceEnd + delta;
          const newDuration = (newSourceEnd - vClip.sourceStart) / vClip.speed;
          updatedClips[clipIndex] = {
            ...vClip,
            sourceEnd: newSourceEnd,
            duration: Math.max(0.1, newDuration),
          };
        }
      } else if (clip.trackType === "audio") {
        const aClip = clip as AudioClip;
        if (action.edge === "start") {
          const delta = Math.max(-aClip.sourceStart, Math.min(action.deltaSeconds, aClip.duration - 0.2));
          updatedClips[clipIndex] = {
            ...aClip,
            sourceStart: aClip.sourceStart + delta,
            startTime: Math.max(0, aClip.startTime + delta),
            duration: Math.max(0.1, aClip.duration - delta),
          };
        } else {
          const delta = Math.max(-(aClip.duration - 0.2), action.deltaSeconds);
          updatedClips[clipIndex] = {
            ...aClip,
            sourceEnd: aClip.sourceEnd + delta,
            duration: Math.max(0.1, aClip.duration + delta),
          };
        }
      } else {
        // Text / Image / Element
        if (action.edge === "start") {
          const delta = Math.min(action.deltaSeconds, clip.duration - 0.2);
          updatedClips[clipIndex] = {
            ...clip,
            startTime: Math.max(0, clip.startTime + delta),
            duration: Math.max(0.1, clip.duration - delta),
          };
        } else {
          const delta = Math.max(-(clip.duration - 0.2), action.deltaSeconds);
          updatedClips[clipIndex] = {
            ...clip,
            duration: Math.max(0.1, clip.duration + delta),
          };
        }
      }

      return commit({
        ...present,
        clips: updatedClips,
      });
    }

    case "SPLIT_CLIP": {
      const clip = present.clips.find((c) => c.id === action.clipId);
      if (!clip) return state;

      const splitTime = action.splitTime;
      const relTime = splitTime - clip.startTime;
      if (relTime <= 0.1 || relTime >= clip.duration - 0.1) return state;

      const firstDuration = relTime;
      const secondDuration = clip.duration - relTime;
      const newId = crypto.randomUUID();

      let leftClip: TimelineClip;
      let rightClip: TimelineClip;

      if (clip.trackType === "video") {
        const v = clip as VideoClip;
        const sourceSplit = v.sourceStart + relTime * v.speed;
        leftClip = {
          ...v,
          duration: firstDuration,
          sourceEnd: sourceSplit,
        };
        rightClip = {
          ...v,
          id: newId,
          name: `${v.name} (Part 2)`,
          startTime: splitTime,
          duration: secondDuration,
          sourceStart: sourceSplit,
        };
      } else if (clip.trackType === "audio") {
        const a = clip as AudioClip;
        const sourceSplit = a.sourceStart + relTime;
        leftClip = {
          ...a,
          duration: firstDuration,
          sourceEnd: sourceSplit,
        };
        rightClip = {
          ...a,
          id: newId,
          name: `${a.name} (Part 2)`,
          startTime: splitTime,
          duration: secondDuration,
          sourceStart: sourceSplit,
        };
      } else {
        leftClip = {
          ...clip,
          duration: firstDuration,
        };
        rightClip = {
          ...clip,
          id: newId,
          name: `${clip.name} (Part 2)`,
          startTime: splitTime,
          duration: secondDuration,
        };
      }

      const updatedClips = present.clips.map((c) => (c.id === clip.id ? leftClip : c));
      updatedClips.push(rightClip);

      return commit({
        ...present,
        clips: updatedClips,
        selectedClipId: rightClip.id,
      });
    }

    case "DELETE_CLIP": {
      const remaining = present.clips.filter((c) => c.id !== action.clipId);
      return commit({
        ...present,
        clips: remaining,
        selectedClipId: present.selectedClipId === action.clipId ? null : present.selectedClipId,
      });
    }

    case "DUPLICATE_CLIP": {
      const clip = present.clips.find((c) => c.id === action.clipId);
      if (!clip) return state;

      const newId = crypto.randomUUID();
      const duplicated: TimelineClip = {
        ...clip,
        id: newId,
        name: `${clip.name} (Copy)`,
        startTime: clip.startTime + clip.duration + 0.1,
      };

      return commit({
        ...present,
        clips: [...present.clips, duplicated],
        selectedClipId: newId,
      });
    }

    case "UPDATE_CLIP": {
      const clipIndex = present.clips.findIndex((c) => c.id === action.clipId);
      if (clipIndex === -1) return state;

      const updatedClips = [...present.clips];
      const merged = { ...updatedClips[clipIndex], ...action.updates } as TimelineClip;

      // Recalculate duration if speed changed on video clip
      if (merged.trackType === "video" && "speed" in action.updates && (action.updates as Partial<VideoClip>).speed) {
        const v = merged as VideoClip;
        v.duration = (v.sourceEnd - v.sourceStart) / v.speed;
      }

      updatedClips[clipIndex] = merged;

      return commit({
        ...present,
        clips: updatedClips,
      });
    }

    case "SELECT_CLIP": {
      return {
        ...state,
        present: {
          ...present,
          selectedClipId: action.clipId,
        },
      };
    }

    case "SET_PLAYHEAD": {
      return {
        ...state,
        present: {
          ...present,
          playhead: Math.max(0, action.time),
        },
      };
    }

    case "SET_IS_PLAYING": {
      return {
        ...state,
        present: {
          ...present,
          isPlaying: action.isPlaying,
        },
      };
    }

    case "SET_ZOOM": {
      return {
        ...state,
        present: {
          ...present,
          zoom: Math.min(200, Math.max(20, action.zoom)),
        },
      };
    }

    case "TOGGLE_TRACK_MUTE": {
      return {
        ...state,
        present: {
          ...present,
          tracks: present.tracks.map((t) =>
            t.id === action.trackId ? { ...t, muted: !t.muted } : t,
          ),
        },
      };
    }

    case "TOGGLE_TRACK_LOCK": {
      return {
        ...state,
        present: {
          ...present,
          tracks: present.tracks.map((t) =>
            t.id === action.trackId ? { ...t, locked: !t.locked } : t,
          ),
        },
      };
    }

    case "TOGGLE_TRACK_HIDDEN": {
      return {
        ...state,
        present: {
          ...present,
          tracks: present.tracks.map((t) =>
            t.id === action.trackId ? { ...t, hidden: !t.hidden } : t,
          ),
        },
      };
    }

    case "UNDO": {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        present: {
          ...present,
          settings: previous.settings,
          tracks: previous.tracks,
          clips: previous.clips,
        },
        past: newPast,
        future: [createSnapshot(present), ...future],
      };
    }

    case "REDO": {
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        present: {
          ...present,
          settings: next.settings,
          tracks: next.tracks,
          clips: next.clips,
        },
        past: [...past, createSnapshot(present)],
        future: newFuture,
      };
    }

    case "CLEAR_PROJECT": {
      return {
        present: {
          ...initialProjectState.present,
          settings: { ...present.settings },
        },
        past: [...past, createSnapshot(present)],
        future: [],
      };
    }

    default:
      return state;
  }
}
