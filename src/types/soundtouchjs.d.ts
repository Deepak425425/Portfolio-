declare module 'soundtouchjs' {
  export class SoundTouch {
    tempo: number;
    pitch: number;
    rate: number;
    clear(): void;
  }

  export class SimpleFilter {
    constructor(source: any, pipe: SoundTouch);
    extract(target: Float32Array, numFrames: number): number;
  }

  export class WebAudioBufferSource {
    constructor(buffer: AudioBuffer);
    extract(target: Float32Array, numFrames: number, position: number): number;
  }

  export class PitchShifter {
    constructor(context: AudioContext, buffer: AudioBuffer, bufferSize?: number);
    tempo: number;
    pitch: number;
    connect(node: AudioNode): void;
    disconnect(): void;
    on(event: string, callback: (detail: any) => void): void;
    off(event?: string): void;
  }
}
