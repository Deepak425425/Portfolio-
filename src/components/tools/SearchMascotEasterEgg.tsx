"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface SearchMascotProps {
  isNightMode: boolean;
  isSearchFocused: boolean;
  hasSearchQuery: boolean;
}

type MascotPhase =
  | "hidden"
  | "cautious_peek" // ear tips and top of head emerging cautiously
  | "full_peek"     // full head, eyes, whiskers, paws resting on search bar rim
  | "alert"         // curious perked reaction when cursor approaches
  | "retreating";   // smoothly sinking back down behind search bar

type GazeMode = "cursor" | "looking_away" | "curious";

// Different positions across search bar width (percentages)
const PEEK_POSITIONS = [24, 40, 56, 72, 80, 20];

export default function SearchMascotEasterEgg({
  isNightMode,
  isSearchFocused,
  hasSearchQuery,
}: SearchMascotProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<MascotPhase>("hidden");
  const [positionPercent, setPositionPercent] = useState<number>(72);
  const [eyeState, setEyeState] = useState<"neutral" | "blink" | "surprised" | "sleepy">("neutral");
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [gazeMode, setGazeMode] = useState<GazeMode>("cursor");
  const [headTilt, setHeadTilt] = useState<number>(0);

  const mascotElRef = useRef<HTMLDivElement | null>(null);
  const phaseRef = useRef<MascotPhase>("hidden");
  phaseRef.current = phase;

  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lookAwayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReducedMotionRef = useRef<boolean>(false);
  const lastPositionRef = useRef<number>(72);
  const startCautiousPeekRef = useRef<() => void>(() => {});

  const clearAllTimers = useCallback(() => {
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    if (lookAwayTimeoutRef.current) clearTimeout(lookAwayTimeoutRef.current);
  }, []);

  // Smooth retreat behind the search box
  const triggerRetreat = useCallback((fast: boolean = false) => {
    if (phaseRef.current === "hidden" || phaseRef.current === "retreating") return;
    clearAllTimers();

    setPhase("retreating");
    setEyeState("neutral");
    setHeadTilt(0);

    const retreatDuration = fast ? 400 : 600;
    sequenceTimeoutRef.current = setTimeout(() => {
      setPhase("hidden");
      setEyeOffset({ x: 0, y: 0 });

      // Reduced hide time (3.5s to 5.5s) so the user frequently gets to see the cat
      const nextDelay = Math.random() * 2000 + 3500;
      sequenceTimeoutRef.current = setTimeout(() => {
        startCautiousPeekRef.current();
      }, nextDelay);
    }, retreatDuration);
  }, [clearAllTimers]);

  // Orchestrate natural cautious peek sequence
  const startCautiousPeek = useCallback(() => {
    if (isReducedMotionRef.current) return;
    if (isSearchFocused || hasSearchQuery) return; // Keep hidden while user is searching

    clearAllTimers();

    // Select a different position along the search bar
    const available = PEEK_POSITIONS.filter(p => p !== lastPositionRef.current);
    const chosenPos = available[Math.floor(Math.random() * available.length)];
    lastPositionRef.current = chosenPos;
    setPositionPercent(chosenPos);

    // Initial slight natural head angle (-1.5deg to +1.5deg)
    const initialTilt = chosenPos > 50 ? -1.0 : 1.0;
    setHeadTilt(initialTilt);
    setEyeState("neutral");
    setEyeOffset({ x: 0, y: 0 });
    setGazeMode("cursor");

    // Phase 1: Cautious peek (just ear tips emerge above top rim)
    setPhase("cautious_peek");

    // Pause cautiously for 700ms - 1000ms as if listening
    const cautiousPause = Math.random() * 300 + 700;
    sequenceTimeoutRef.current = setTimeout(() => {
      if (phaseRef.current !== "cautious_peek") return;

      // Phase 2: Full curious reveal (head, eyes, whiskers, paws on rim)
      setPhase("full_peek");

      // Start natural blinking & periodic gaze shifts
      scheduleBlinks();
      scheduleNaturalGazeChanges();

      // Stay observing for 5.5s to 8.5s before naturally sinking back down
      const observationDuration = Math.random() * 3000 + 5500;
      sequenceTimeoutRef.current = setTimeout(() => {
        triggerRetreat(false);
      }, observationDuration);
    }, cautiousPause);
  }, [clearAllTimers, isSearchFocused, hasSearchQuery, triggerRetreat]);

  // Natural irregular blinking (every 3.6s to 6.8s)
  const scheduleBlinks = useCallback(() => {
    if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);

    const runBlink = () => {
      if (phaseRef.current === "hidden" || phaseRef.current === "retreating") return;

      const nextInterval = Math.random() * 3200 + 3600;
      blinkTimeoutRef.current = setTimeout(() => {
        if (phaseRef.current === "full_peek" || phaseRef.current === "alert") {
          setEyeState("blink");
          setTimeout(() => {
            if (phaseRef.current === "full_peek" || phaseRef.current === "alert") {
              setEyeState("neutral");
              runBlink();
            }
          }, 160);
        } else {
          runBlink();
        }
      }, nextInterval);
    };

    runBlink();
  }, []);

  // Natural gaze changes (cats occasionally look away instead of staring robotically)
  const scheduleNaturalGazeChanges = useCallback(() => {
    if (lookAwayTimeoutRef.current) clearTimeout(lookAwayTimeoutRef.current);

    const runGazeCycle = () => {
      if (phaseRef.current !== "full_peek") return;

      const cycleDuration = Math.random() * 2200 + 2200;
      lookAwayTimeoutRef.current = setTimeout(() => {
        if (phaseRef.current !== "full_peek") return;

        setGazeMode(prev => {
          if (prev === "cursor") {
            // Glance away naturally
            const randomLookX = (Math.random() - 0.5) * 2.8;
            const randomLookY = (Math.random() - 0.5) * 1.6;
            setEyeOffset({ x: randomLookX, y: randomLookY });
            setHeadTilt((Math.random() - 0.5) * 2.2);
            return "looking_away";
          } else {
            // Return gaze toward user
            return "cursor";
          }
        });

        runGazeCycle();
      }, cycleDuration);
    };

    runGazeCycle();
  }, []);

  // Setup listeners, visibility, and initial timer
  useEffect(() => {
    setMounted(true);
    const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotionRef.current = mediaReduced.matches;

    const checkMobile = () => {
      const touch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
      setIsMobile(touch || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Pause / retreat when tab is hidden or page is inactive
    const handleVisibility = () => {
      if (document.hidden) {
        triggerRetreat(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Initial appearance after short delay (2.0s) so user quickly gets to see the mascot
    const initialDelay = 2000;
    sequenceTimeoutRef.current = setTimeout(() => {
      startCautiousPeek();
    }, initialDelay);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearAllTimers();
    };
  }, [clearAllTimers, startCautiousPeek, triggerRetreat]);

  // Keep ref up to date
  startCautiousPeekRef.current = startCautiousPeek;

  // If user focuses search bar or enters a query, immediately retreat and stay hidden
  // When user stops searching, resume peeking after a brief pause
  useEffect(() => {
    if (isSearchFocused || hasSearchQuery) {
      triggerRetreat(true);
    } else if (phaseRef.current === "hidden") {
      clearAllTimers();
      sequenceTimeoutRef.current = setTimeout(() => {
        startCautiousPeek();
      }, 2500);
    }
  }, [isSearchFocused, hasSearchQuery, triggerRetreat, startCautiousPeek, clearAllTimers]);

  // Subtle Mouse Cursor Tracking & Proximity Reaction (Desktop only)
  useEffect(() => {
    if (isMobile || phase === "hidden" || phase === "retreating") return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotElRef.current) return;
      if (phaseRef.current !== "full_peek" && phaseRef.current !== "alert") return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = mascotElRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Cat head approximate center in viewport coordinates
        const headX = rect.left + rect.width * 0.46;
        const headY = rect.top + rect.height * 0.44;

        const dx = e.clientX - headX;
        const dy = e.clientY - headY;
        const dist = Math.hypot(dx, dy);

        // Immediate curious proximity reaction: Cursor gets close (<135px)
        if (dist < 135) {
          if (phaseRef.current === "full_peek") {
            setPhase("alert");
            setEyeState("surprised");
            setGazeMode("curious");
            setHeadTilt(0);

            // Directly track the approaching cursor while alert
            const normX = (dx / dist) * 2.2;
            const normY = (dy / dist) * 1.7;
            setEyeOffset({ x: normX, y: normY });

            // If cursor gets extremely close (<55px), shyly retreat
            if (dist < 55) {
              triggerRetreat(true);
            }
          }
          return;
        }

        // Return from alert if cursor moves back out
        if (phaseRef.current === "alert" && dist >= 145) {
          setPhase("full_peek");
          setEyeState("neutral");
          setGazeMode("cursor");
        }

        // Natural smooth cursor tracking (only active in "cursor" gaze mode)
        if (gazeMode === "cursor") {
          if (dist > 450) {
            // Cursor is far away: gently relax pupils to center
            setEyeOffset(prev => ({
              x: prev.x * 0.86,
              y: prev.y * 0.86,
            }));
          } else {
            // Smooth, subtle movement within safe pupil bounds (±2.3px X, ±1.7px Y)
            const maxOffsetX = 2.3;
            const maxOffsetY = 1.7;
            const factorX = Math.min(maxOffsetX, (dist / 450) * maxOffsetX);
            const factorY = Math.min(maxOffsetY, (dist / 450) * maxOffsetY);

            const targetX = (dx / dist) * factorX;
            const targetY = (dy / dist) * factorY;

            setEyeOffset({ x: targetX, y: targetY });

            // Very subtle inquisitive head tilt (-1.5deg to +1.5deg) towards cursor
            const targetTilt = Math.max(-1.8, Math.min(1.8, (dx / 300) * 1.8));
            setHeadTilt(targetTilt);
          }
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [phase, isMobile, gazeMode, triggerRetreat]);

  if (!mounted || isReducedMotionRef.current) {
    return null;
  }

  // Sizing:
  // In 848x1264, the cat figure starts at 34.4% (48px in 140px) and ends at 69.1% (97px in 140px)
  // By placing container at top: -48px:
  // - When translateY = 0: cat ears start at 0px and bottom is at 49px (inside the 62px search bar). 100% concealed!
  // - When translateY = -18px (cautious): ears emerge 18px above the top rim.
  // - When translateY = -36px (full peek): ears emerge 36px, eyes 14px, paws rest right on the rim.
  // - When translateY = -40px (alert): slight perk over rim.
  const catW = isMobile ? 80 : 94;
  const catH = isMobile ? 120 : 140;
  const containerTop = isMobile ? -41 : -48;

  let translateY = 0; // Hidden: 0px = fully concealed behind search bar
  let scale = 1;

  if (phase === "cautious_peek") {
    translateY = isMobile ? -14 : -18;
  } else if (phase === "full_peek") {
    translateY = isMobile ? -30 : -36;
  } else if (phase === "alert") {
    translateY = isMobile ? -34 : -40;
    scale = 1.03;
  } else if (phase === "retreating") {
    translateY = 0;
  }

  // Eye overlay source
  let eyeOverlaySrc = "/images/mascot/groton-cat-eyes-neutral.png";
  if (eyeState === "blink") {
    eyeOverlaySrc = "/images/mascot/groton-cat-eyes-blink.png";
  } else if (eyeState === "surprised" || phase === "alert") {
    eyeOverlaySrc = "/images/mascot/groton-cat-eyes-surprised.png";
  } else if (eyeState === "sleepy") {
    eyeOverlaySrc = "/images/mascot/groton-cat-eyes-sleepy.png";
  }

  const transitionStyle =
    phase === "cautious_peek"
      ? "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)"
      : phase === "full_peek"
        ? "transform 0.75s cubic-bezier(0.25, 1, 0.5, 1)"
        : phase === "retreating"
          ? "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)"
          : "transform 0.25s ease-out";

  return (
    <div
      ref={mascotElRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-0 select-none overflow-visible"
      style={{
        left: `${positionPercent}%`,
        top: `${containerTop}px`,
        width: `${catW}px`,
        height: `${catH}px`,
        transform: `translateX(-50%) translateY(${translateY}px) rotate(${headTilt}deg) scale(${scale})`,
        transition: transitionStyle,
        filter: isNightMode
          ? "drop-shadow(0 4px 14px rgba(139, 124, 255, 0.12))"
          : "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.10))",
      }}
    >
      {/* Base Eyeless Silhouette */}
      <img
        src="/images/mascot/groton-cat-base-eyeless.png"
        alt=""
        className="w-full h-full object-contain pointer-events-none select-none block"
        draggable={false}
      />

      {/* Modular Layered Eyes */}
      <img
        src={eyeOverlaySrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none block"
        draggable={false}
        style={{
          transform:
            eyeState === "neutral" || eyeState === "surprised"
              ? `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`
              : "none",
          transition:
            eyeState === "neutral"
              ? "transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1)"
              : "none",
        }}
      />
    </div>
  );
}
