"use client";

import React, { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

/**
 * Builds a natural, hand-drawn editorial curve between origin (founder card anchor)
 * and target (card pushpin/clip anchor).
 *
 * Each of the 4 branches has its own individual curvature, sag, departure trajectory,
 * and subtle organic hand-drift to feel authentically drawn with a fine technical pen.
 *
 * All control points ensure a smooth, monotonic downward flow that stays entirely in
 * the open board space above the cards and terminates directly into the card pushpin/clip.
 */
function buildHandDrawnBranch(p0: Point, p3: Point, branchIndex: number): string {
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;

  // Asymmetric hand-drawn parameters per branch:
  // Branch 0: Far Left (sweeping wide arc to the left, gentle graceful sag)
  // Branch 1: Inner Left (steeper descent, gentle leftward curvature)
  // Branch 2: Inner Right (asymmetric rightward descent, distinct curvature)
  // Branch 3: Far Right (sweeping wide arc to the right, distinct tension from branch 0)
  const cfgs = [
    {
      t1: { x: 0.38, y: 0.22 },
      t2: { x: 0.74, y: 0.58 },
      wobble1: { x: -2.0, y: 0.5 },
      wobble2: { x: 1.5, y: -0.5 },
      c1Ratio: { x: 0.40, y: 0.30 },
      c2Ratio: { x: 0.45, y: 0.35 },
      c3Ratio: { x: 0.45, y: 0.40 },
    },
    {
      t1: { x: 0.32, y: 0.30 },
      t2: { x: 0.68, y: 0.68 },
      wobble1: { x: -1.8, y: 0.8 },
      wobble2: { x: 1.2, y: -0.6 },
      c1Ratio: { x: 0.35, y: 0.35 },
      c2Ratio: { x: 0.40, y: 0.38 },
      c3Ratio: { x: 0.42, y: 0.40 },
    },
    {
      t1: { x: 0.36, y: 0.28 },
      t2: { x: 0.70, y: 0.65 },
      wobble1: { x: 1.6, y: -0.6 },
      wobble2: { x: -1.2, y: 0.8 },
      c1Ratio: { x: 0.38, y: 0.32 },
      c2Ratio: { x: 0.42, y: 0.36 },
      c3Ratio: { x: 0.40, y: 0.42 },
    },
    {
      t1: { x: 0.40, y: 0.25 },
      t2: { x: 0.76, y: 0.62 },
      wobble1: { x: 2.2, y: -0.5 },
      wobble2: { x: -1.5, y: 0.6 },
      c1Ratio: { x: 0.42, y: 0.28 },
      c2Ratio: { x: 0.46, y: 0.34 },
      c3Ratio: { x: 0.44, y: 0.38 },
    },
  ];

  const cfg = cfgs[branchIndex] || cfgs[0];

  const p1: Point = {
    x: p0.x + dx * cfg.t1.x + cfg.wobble1.x,
    y: p0.y + dy * cfg.t1.y + cfg.wobble1.y,
  };
  const p2: Point = {
    x: p0.x + dx * cfg.t2.x + cfg.wobble2.x,
    y: p0.y + dy * cfg.t2.y + cfg.wobble2.y,
  };

  // Seg 1: p0 -> p1
  const c1a = {
    x: p0.x + (p1.x - p0.x) * cfg.c1Ratio.x,
    y: p0.y + (p1.y - p0.y) * cfg.c1Ratio.y,
  };
  const c1b = {
    x: p1.x - (p1.x - p0.x) * (1 - cfg.c1Ratio.x) * 0.7,
    y: p1.y - (p1.y - p0.y) * (1 - cfg.c1Ratio.y) * 0.7,
  };

  // Seg 2: p1 -> p2
  const c2a = {
    x: p1.x + (p2.x - p1.x) * cfg.c2Ratio.x,
    y: p1.y + (p2.y - p1.y) * cfg.c2Ratio.y,
  };
  const c2b = {
    x: p2.x - (p2.x - p1.x) * (1 - cfg.c2Ratio.x) * 0.7,
    y: p2.y - (p2.y - p1.y) * (1 - cfg.c2Ratio.y) * 0.7,
  };

  // Seg 3: p2 -> p3 (target pin)
  const c3a = {
    x: p2.x + (p3.x - p2.x) * cfg.c3Ratio.x,
    y: p2.y + (p3.y - p2.y) * cfg.c3Ratio.y,
  };
  const c3b = {
    x: p3.x - (p3.x - p2.x) * (1 - cfg.c3Ratio.x) * 0.6,
    y: p3.y - (p3.y - p2.y) * (1 - cfg.c3Ratio.y) * 0.6,
  };

  const f = (n: number) => Number(n.toFixed(1));

  return [
    `M ${f(p0.x)} ${f(p0.y)}`,
    `C ${f(c1a.x)} ${f(c1a.y)}, ${f(c1b.x)} ${f(c1b.y)}, ${f(p1.x)} ${f(p1.y)}`,
    `C ${f(c2a.x)} ${f(c2a.y)}, ${f(c2b.x)} ${f(c2b.y)}, ${f(p2.x)} ${f(p2.y)}`,
    `C ${f(c3a.x)} ${f(c3a.y)}, ${f(c3b.x)} ${f(c3b.y)}, ${f(p3.x)} ${f(p3.y)}`,
  ].join(" ");
}

// Pre-calculated desktop coordinates for initial SSR render (extended behind cards)
const EXTENSION_Y = 28;
const DEFAULT_ORIGIN: Point = { x: 616.5, y: 420.3 };
const DEFAULT_TARGETS: Point[] = [
  { x: 142.1, y: 531.8 },
  { x: 458.4, y: 526.3 },
  { x: 774.6, y: 531.8 },
  { x: 1090.9, y: 531.8 },
];

export default function TeamConnectorWires() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const updateWires = () => {
      const container = document.getElementById("working-board-container");
      const founderAnchor = document.getElementById("founder-connector-anchor");
      const pin0 = document.getElementById("team-pin-02");
      const pin1 = document.getElementById("team-pin-03");
      const pin2 = document.getElementById("team-pin-04");
      const pin3 = document.getElementById("team-pin-05");

      if (!container || !founderAnchor || !pin0 || !pin1 || !pin2 || !pin3) {
        return;
      }

      const cRect = container.getBoundingClientRect();
      const fRect = founderAnchor.getBoundingClientRect();

      const origin: Point = {
        x: fRect.left + fRect.width / 2 - cRect.left,
        y: fRect.top + fRect.height / 2 - cRect.top,
      };

      const pins = [pin0, pin1, pin2, pin3];
      const targets: Point[] = pins.map((pinEl) => {
        const cardEl = pinEl.parentElement;
        const cardRect = cardEl ? cardEl.getBoundingClientRect() : null;
        const pinRect = pinEl.getBoundingClientRect();

        const centerX = cardRect
          ? cardRect.left + cardRect.width / 2
          : pinRect.left + pinRect.width / 2;
        const topY = cardRect ? cardRect.top : pinRect.bottom;

        return {
          x: centerX - cRect.left,
          y: topY + EXTENSION_Y - cRect.top,
        };
      });

      targets.forEach((target, i) => {
        const pathEl = pathRefs.current[i];
        if (pathEl) {
          const d = buildHandDrawnBranch(origin, target, i);
          pathEl.setAttribute("d", d);
        }
      });
    };

    updateWires();
    const rafId = requestAnimationFrame(updateWires);

    window.addEventListener("resize", updateWires, { passive: true });

    let ro: ResizeObserver | null = null;
    const container = document.getElementById("working-board-container");
    if (container && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateWires();
      });
      ro.observe(container);
    }

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(updateWires).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateWires);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="hidden lg:block pointer-events-none absolute inset-0 w-full h-full z-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        {/* Subtle graphite micro-grain for fine-pen tactile feel */}
        <filter id="hand-drawn-pen-grain" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* 4 Hand-drawn editorial connector lines linking founder card to each team card */}
      {DEFAULT_TARGETS.map((target, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={buildHandDrawnBranch(DEFAULT_ORIGIN, target, i)}
          fill="none"
          stroke="rgba(0, 0, 0, 0.22)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#hand-drawn-pen-grain)"
        />
      ))}
    </svg>
  );
}
