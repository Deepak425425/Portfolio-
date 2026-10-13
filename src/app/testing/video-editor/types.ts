/**
 * GROTON AI Studio Video Editor - Unified Project Data Model
 */

export type AspectRatioId = "16:9" | "9:16" | "1:1" | "4:5";
export type FitMode = "contain" | "cover";

export const ASPECT_RATIOS: { id: AspectRatioId; label: string; w: number; h: number }[] = [
  { id: "16:9", label: "16:9 (Widescreen)", w: 16, h: 9 },
  { id: "9:16", label: "9:16 (Vertical)", w: 9, h: 16 },
  { id: "1:1", label: "1:1 (Square)", w: 1, h: 1 },
  { id: "4:5", label: "4:5 (Portrait)", w: 4, h: 5 },
];

export const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export type MediaAssetType = "video" | "image" | "audio";

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaAssetType;
  file?: File;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  size: number;
}

export type TrackType = "text" | "image" | "video" | "audio" | "element";

export interface BaseClip {
  id: string;
  trackId: string;
  trackType: TrackType;
  name: string;
  startTime: number; // in seconds on timeline
  duration: number; // in seconds on timeline
}

export interface VideoClip extends BaseClip {
  trackType: "video";
  assetId: string;
  sourceStart: number; // trim in-point in source seconds
  sourceEnd: number; // trim out-point in source seconds
  speed: number; // default 1
  volume: number; // 0-100
  muted: boolean;
  // Visual adjustments (-100 to 100 or 0 to 100)
  contrast: number; // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
  hue: number; // -180 to 180, default 0
  brightness: number; // -100 to 100, default 0
  blur: number; // 0 to 20, default 0
}

export interface ImageClip extends BaseClip {
  trackType: "image";
  assetId: string;
  xPct: number; // 0 to 100%
  yPct: number; // 0 to 100%
  scale: number; // 0.1 to 3, default 1
  opacity: number; // 0 to 100, default 100
  rotation: number; // -180 to 180, default 0
}

export interface TextClip extends BaseClip {
  trackType: "text";
  text: string;
  fontSize: number; // 12 to 72
  fontFamily: string;
  color: string;
  bgColor: string;
  xPct: number; // 0 to 100%
  yPct: number; // 0 to 100%
  isBold: boolean;
  isItalic: boolean;
  textAlign: "left" | "center" | "right";
}

export interface AudioClip extends BaseClip {
  trackType: "audio";
  assetId: string;
  sourceStart: number;
  sourceEnd: number;
  volume: number; // 0 to 100, default 100
  muted: boolean;
}

export interface ElementClip extends BaseClip {
  trackType: "element";
  elementType: "lowerThird" | "pillBadge" | "letterbox";
  title?: string;
  subtitle?: string;
  theme?: "purple" | "dark" | "minimal";
  color?: string;
  barHeightPct?: number;
}

export type TimelineClip = VideoClip | ImageClip | TextClip | AudioClip | ElementClip;

export interface TimelineTrack {
  id: string;
  type: TrackType;
  label: string;
  locked: boolean;
  muted: boolean;
  hidden: boolean;
}

export interface ProjectSettings {
  name: string;
  aspect: AspectRatioId;
  fit: FitMode;
  canvasBgColor: string;
  fps: number;
  width: number;
  height: number;
}

export interface ProjectState {
  settings: ProjectSettings;
  assets: MediaAsset[];
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  selectedClipId: string | null;
  selectedTrackId: string | null;
  playhead: number; // current time in seconds
  zoom: number; // pixels per second on timeline (e.g. 50 px/s)
  isPlaying: boolean;
}

export interface HistoryState {
  past: {
    settings: ProjectSettings;
    tracks: TimelineTrack[];
    clips: TimelineClip[];
  }[];
  future: {
    settings: ProjectSettings;
    tracks: TimelineTrack[];
    clips: TimelineClip[];
  }[];
}

export const DEFAULT_TRACKS: TimelineTrack[] = [
  { id: "track-text", type: "text", label: "Text", locked: false, muted: false, hidden: false },
  { id: "track-elements", type: "element", label: "Elements", locked: false, muted: false, hidden: false },
  { id: "track-images", type: "image", label: "Overlays", locked: false, muted: false, hidden: false },
  { id: "track-video", type: "video", label: "Video", locked: false, muted: false, hidden: false },
  { id: "track-audio", type: "audio", label: "Audio", locked: false, muted: false, hidden: false },
];

export const INITIAL_PROJECT_SETTINGS: ProjectSettings = {
  name: "Summer Surf Gear Guide",
  aspect: "16:9",
  fit: "contain",
  canvasBgColor: "#000000",
  fps: 30,
  width: 1920,
  height: 1080,
};
