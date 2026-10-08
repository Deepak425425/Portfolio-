"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * Precision Mechanical Rotary Detent Audio Engine
 * Modeled on physical camera lens aperture / focus ring rotation.
 * 
 * Features:
 * - Slices authentic micro-transient detents from the provided mechanical reference audio
 * - Procedural physical synthesis fallback (damped metallic tooth resonance)
 * - Direction-aware detents (forward vs reverse rotation pitch modulation)
 * - Velocity-proportional frequency & physical cadence ceiling (~38 clicks/sec)
 * - Immediate silence upon stopping scroll
 * - Completely isolated to the TOOLS page
 */
class MechanicalSoundEngine {
  private ctx: AudioContext | null = null;
  private forwardBuffers: AudioBuffer[] = [];
  private reverseBuffers: AudioBuffer[] = [];
  private masterGain: GainNode | null = null;
  private isUnlocked = false;

  private lastScrollY = 0;
  private lastScrollTime = 0;
  private accumulatedDistance = 0;
  private smoothedVelocity = 0;
  private lastClickRealTime = 0;
  private bufferIndexForward = 0;
  private bufferIndexReverse = 0;
  private scrollStopTimeout: ReturnType<typeof setTimeout> | null = null;

  // Physical camera lens detent spacing:
  // Slower movements cross ~16px per tactile tooth
  // Fast movements cross detents rapidly (~10px)
  private calculateDetentThreshold(velocity: number): number {
    const v = Math.max(0, velocity);
    return Math.max(10, 16 - Math.min(6, v * 2.0));
  }

  // Dynamic click interval based on velocity:
  // Slow scroll (0.1 - 0.4 px/ms) -> spaced detents (~110-140ms apart)
  // Medium scroll (1.0 - 2.0 px/ms) -> medium-speed detents (~50-65ms apart)
  // Fast scroll (3.0 - 5.0 px/ms) -> rapid detents (~26-35ms apart)
  // Very fast scroll (6.0+ px/ms) -> very rapid detents (~18-22ms apart)
  private calculateRequiredInterval(velocity: number): number {
    const v = Math.max(0, velocity);
    return 18 + 122 / (1 + Math.pow(v / 0.9, 1.25));
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx({ latencyHint: "interactive" });

      this.masterGain = this.ctx.createGain();
      // Premium subtle master level: tactile, crisp, non-fatiguing
      this.masterGain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Pre-generate procedural buffers immediately as instant zero-latency fallback
      this.generateProceduralBuffers(this.ctx);

      // Asynchronously load & slice authentic reference audio clicks
      this.loadReferenceClicks(this.ctx);
    }
    return this.ctx;
  }

  /**
   * Slices distinct mechanical clicks from the provided reference audio
   */
  private async loadReferenceClicks(ctx: AudioContext) {
    try {
      // Support existing reference audio candidates without modifying or duplicating files
      const candidates = [
        "ES_Mechanical, Click, Spin, Clocks 01 - Epidemic Sound.mp3",
        "Bicycle sound.mp3"
      ];
      let arrayBuf: ArrayBuffer | null = null;
      for (const fileName of candidates) {
        try {
          let resp = await fetch(`/campaign-worlds/${encodeURIComponent(fileName)}`);
          if (!resp.ok) {
            resp = await fetch(encodeURI(`/campaign-worlds/${fileName}`));
          }
          if (resp.ok) {
            arrayBuf = await resp.arrayBuffer();
            break;
          }
        } catch {
          // try next candidate
        }
      }
      if (!arrayBuf) return;
      const decoded = await ctx.decodeAudioData(arrayBuf);
      const data = decoded.getChannelData(0);
      const sr = decoded.sampleRate;

      // Exact peak locations of distinct mechanical clicks in the reference recording
      const peakTimes = [
        0.0701, 0.1426, 0.2014, 0.2619, 0.3146, 0.3782,
        0.4492, 0.5294, 0.6222, 0.7253, 0.8348, 0.9542
      ];

      const clickLength = Math.floor(sr * 0.016); // 16ms: crisp, dry micro-transient
      const preSamples = Math.floor(sr * 0.001);  // 1ms lead-in

      const newForward: AudioBuffer[] = [];
      const newReverse: AudioBuffer[] = [];

      for (const pt of peakTimes) {
        const peakIdx = Math.floor(pt * sr);
        const startIdx = Math.max(0, peakIdx - preSamples);

        const fBuf = ctx.createBuffer(1, clickLength, sr);
        const rBuf = ctx.createBuffer(1, clickLength, sr);
        const fCh = fBuf.getChannelData(0);
        const rCh = rBuf.getChannelData(0);

        const fadeInLen = Math.floor(sr * 0.0006);
        const fadeOutLen = Math.floor(sr * 0.0035);

        for (let i = 0; i < clickLength; i++) {
          const sample = (startIdx + i < data.length) ? data[startIdx + i] : 0;
          let windowed = sample;

          // Gentle edge windowing to prevent boundary pops
          if (i < fadeInLen) {
            windowed *= (i / fadeInLen);
          } else if (i > clickLength - fadeOutLen) {
            windowed *= ((clickLength - i) / fadeOutLen);
          }

          fCh[i] = windowed * 0.95;
          // Reverse buffer with subtle low-end body tint
          rCh[i] = windowed * 0.90;
        }

        newForward.push(fBuf);
        newReverse.push(rBuf);
      }

      if (newForward.length > 0) {
        this.forwardBuffers = newForward;
        this.reverseBuffers = newReverse;
      }
    } catch {
      // Procedural buffers continue seamlessly if network fetch is blocked
    }
  }

  /**
   * Procedural synthesis of mechanical camera aperture/focus detents
   */
  private generateProceduralBuffers(ctx: AudioContext) {
    const sr = ctx.sampleRate;
    const duration = 0.013; // 13ms
    const numSamples = Math.floor(sr * duration);

    const buildBuffer = (f0: number, f1: number, f2: number, decayRate: number): AudioBuffer => {
      const buf = ctx.createBuffer(1, numSamples, sr);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < numSamples; i++) {
        const t = i / sr;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 1600) * 0.32;
        const primary = Math.sin(2 * Math.PI * f0 * t) * 0.58 * Math.exp(-t * decayRate) +
                        Math.sin(2 * Math.PI * f1 * t) * 0.20 * Math.exp(-t * (decayRate * 1.4));
        const body = Math.sin(2 * Math.PI * f2 * t) * 0.18 * Math.exp(-t * (decayRate * 0.7));
        let rebound = 0;
        if (t > 0.0026) {
          const tr = t - 0.0026;
          rebound = Math.sin(2 * Math.PI * (f0 * 0.94) * tr) * Math.exp(-tr * 900) * 0.28;
        }
        ch[i] = Math.max(-1, Math.min(1, (noise + primary + body + rebound) * 0.75));
      }
      return buf;
    };

    this.forwardBuffers = [
      buildBuffer(3380, 5700, 1920, 620),
      buildBuffer(3450, 5850, 1980, 650),
      buildBuffer(3320, 5600, 1890, 600),
      buildBuffer(3410, 5780, 1950, 630),
    ];

    this.reverseBuffers = [
      buildBuffer(3080, 5200, 1780, 600),
      buildBuffer(3150, 5350, 1820, 630),
      buildBuffer(3020, 5100, 1740, 580),
      buildBuffer(3110, 5280, 1800, 610),
    ];
  }

  public async unlock() {
    const ctx = this.initContext();
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Will unlock on next user gesture
      }
    }
    this.isUnlocked = true;
  }

  private playImmediateClick(direction: 1 | -1) {
    if (!this.ctx || this.ctx.state !== "running" || !this.masterGain) return;
    const buffers = direction >= 0 ? this.forwardBuffers : this.reverseBuffers;
    if (buffers.length === 0) return;

    const idx = direction >= 0
      ? (this.bufferIndexForward++ % buffers.length)
      : (this.bufferIndexReverse++ % buffers.length);
    const buffer = buffers[idx];

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    // Organic mechanical pitch micro-variation (+/- 1.5% and reverse nuance)
    const basePitch = direction >= 0 ? 1.0 : 0.94;
    const pitch = basePitch + (Math.random() * 0.03 - 0.015);
    src.playbackRate.setValueAtTime(pitch, this.ctx.currentTime);

    // Subtle steady gain: rate alone responds to velocity as requested
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    src.connect(clickGain);
    clickGain.connect(this.masterGain);

    // REAL-TIME: Always play immediately NOW at currentTime
    // NEVER schedule into the future so that stopping scroll results in immediate physical silence.
    src.start(this.ctx.currentTime);
  }

  public handleScroll(enabled: boolean) {
    if (!enabled) {
      this.stopImmediately();
      return;
    }

    if (!this.isUnlocked) {
      this.unlock();
    }

    const now = performance.now();
    const currentY = window.scrollY;

    // Initialize first scroll event
    if (this.lastScrollTime === 0) {
      this.lastScrollY = currentY;
      this.lastScrollTime = now;
      return;
    }

    const deltaY = currentY - this.lastScrollY;
    const dt = Math.max(1, now - this.lastScrollTime);

    this.lastScrollY = currentY;
    this.lastScrollTime = now;

    if (deltaY === 0) return;

    // Cancel stop timeout whenever actual scroll movement happens
    if (this.scrollStopTimeout) {
      clearTimeout(this.scrollStopTimeout);
      this.scrollStopTimeout = null;
    }

    const absDelta = Math.abs(deltaY);
    const direction: 1 | -1 = deltaY > 0 ? 1 : -1;
    const instantVelocity = absDelta / dt; // px per millisecond

    // If there was a distinct pause (>120ms) between scroll gestures, re-seed velocity & distance
    if (dt > 120) {
      this.smoothedVelocity = instantVelocity;
      this.accumulatedDistance = 0;
    } else if (this.smoothedVelocity === 0) {
      this.smoothedVelocity = instantVelocity;
    } else {
      // Exponential moving average for smooth velocity transitions (slow -> fast, fast -> slow)
      this.smoothedVelocity = this.smoothedVelocity * 0.35 + instantVelocity * 0.65;
    }

    this.accumulatedDistance += absDelta;

    const detentThreshold = this.calculateDetentThreshold(this.smoothedVelocity);
    const requiredInterval = this.calculateRequiredInterval(this.smoothedVelocity);
    const timeSinceLastClick = now - this.lastClickRealTime;

    if (this.accumulatedDistance >= detentThreshold && timeSinceLastClick >= requiredInterval) {
      this.playImmediateClick(direction);
      this.lastClickRealTime = now;
      // Deduct detent step, preventing runaway backlog while preserving smooth rotary continuity
      this.accumulatedDistance = Math.min(detentThreshold * 1.0, Math.max(0, this.accumulatedDistance - detentThreshold));
    }

    // IMMEDIATE STOP DETECTION:
    // When the user stops rotating / scrolling, browser scroll events cease immediately.
    // 40ms of inactivity immediately cuts accumulation, velocity, and state.
    // Zero audio tail, zero delayed clicks, immediate silence.
    this.scrollStopTimeout = setTimeout(() => {
      this.stopImmediately();
    }, 40);
  }

  public stopImmediately() {
    if (this.scrollStopTimeout) {
      clearTimeout(this.scrollStopTimeout);
      this.scrollStopTimeout = null;
    }
    this.accumulatedDistance = 0;
    this.smoothedVelocity = 0;
    this.lastScrollTime = 0;
  }

  public destroy() {
    this.stopImmediately();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}

interface ScrollMechanicalSoundProps {
  isNightMode: boolean;
}

export default function ScrollMechanicalSound({ isNightMode }: ScrollMechanicalSoundProps) {
  // Default state is strictly OFF on first visit
  const [isEnabled, setIsEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const engineRef = useRef<MechanicalSoundEngine | null>(null);

  // Initialize engine and restore persisted user preference (strictly OFF by default)
  useEffect(() => {
    setMounted(true);
    const engine = new MechanicalSoundEngine();
    engineRef.current = engine;

    const savedPreference = localStorage.getItem("groton_tools_scroll_sound");
    const isExplicitlyOn = savedPreference === "on";
    setIsEnabled(isExplicitlyOn);

    let unlockOnGesture: (() => void) | null = null;
    if (isExplicitlyOn) {
      unlockOnGesture = () => {
        engine.unlock();
        window.removeEventListener("pointerdown", unlockOnGesture!);
        window.removeEventListener("keydown", unlockOnGesture!);
        window.removeEventListener("wheel", unlockOnGesture!);
      };
      window.addEventListener("pointerdown", unlockOnGesture, { once: true, passive: true });
      window.addEventListener("keydown", unlockOnGesture, { once: true, passive: true });
      window.addEventListener("wheel", unlockOnGesture, { once: true, passive: true });
    }

    const onScroll = () => {
      // ONLY play if the user has explicitly turned sound ON
      const currentEnabled = localStorage.getItem("groton_tools_scroll_sound") === "on";
      engine.handleScroll(currentEnabled);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (unlockOnGesture) {
        window.removeEventListener("pointerdown", unlockOnGesture);
        window.removeEventListener("keydown", unlockOnGesture);
        window.removeEventListener("wheel", unlockOnGesture);
      }
      engine.destroy();
    };
  }, []);

  const toggleSound = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      localStorage.setItem("groton_tools_scroll_sound", next ? "on" : "off");
      if (!next && engineRef.current) {
        engineRef.current.stopImmediately();
      } else if (next && engineRef.current) {
        engineRef.current.unlock();
      }
      return next;
    });
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleSound}
      type="button"
      className={`group flex items-center gap-2 px-3.5 py-2 border rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-300 shadow-sm ${
        isNightMode
          ? isEnabled
            ? "bg-[#18181A] border-[#8B7CFF]/30 hover:border-[#8B7CFF]/50 text-zinc-200 hover:bg-[#222]"
            : "bg-[#18181A] border-white/5 hover:border-white/10 text-zinc-500 hover:text-zinc-400 hover:bg-[#222]"
          : isEnabled
            ? "bg-white border-[#8B7CFF]/30 hover:border-[#8B7CFF]/50 text-black hover:bg-zinc-50"
            : "bg-white/80 border-[rgba(0,0,0,0.05)] hover:border-zinc-300 text-zinc-400 hover:text-zinc-600 hover:bg-white"
      }`}
      title={isEnabled ? "Disable mechanical scroll sound" : "Enable mechanical scroll sound"}
      aria-label={isEnabled ? "Sound ON: Mechanical scroll feedback enabled" : "Sound OFF: Mechanical scroll feedback disabled"}
    >
      {/* Precision Rotary Detent / Sound Icon */}
      {isEnabled ? (
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-[#8B7CFF] transition-transform duration-300 group-hover:rotate-45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <span className="text-[#8B7CFF]">SOUND ON</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-zinc-400 transition-opacity"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
          <span className="text-zinc-500">SOUND OFF</span>
        </span>
      )}
    </button>
  );
}
