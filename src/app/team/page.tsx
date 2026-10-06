import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Team — GROTON AI STUDIO",
  description: "The creative directors, visual engineers, and artists behind GROTON AI Studio.",
};

// GROTON Contact Configuration
const WHATSAPP_NUMBER = "916378083205";
const WHATSAPP_TEAM_MESSAGE = `Hi GROTON AI,

I’m interested in joining your team.

Name:
Role / Specialization:
Experience:
Portfolio:

I’d love to discuss potential opportunities with the team.

Thank you.`;

const WHATSAPP_TEAM_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEAM_MESSAGE)}`;

/* ─────────────────────────────────────────────────────────────
   1. COLORFUL TACTILE 3D PUSH-PIN BEADS
   Physical, translucent 3D push-pins attached to paper cards
   Colors: orange, purple, pink, blue, dark
───────────────────────────────────────────────────────────── */

type PinColor = "orange" | "purple" | "pink" | "blue" | "dark";

function TactilePushpin({
  color = "orange",
  className = "",
}: {
  color?: PinColor;
  className?: string;
}) {
  const configs: Record<
    PinColor,
    {
      ring: string;
      dome: string;
      specular: string;
      tintGlow: string;
    }
  > = {
    orange: {
      ring: "from-[#FFA06E] via-[#FF5C26] to-[#C93B02]",
      dome: "radial-gradient(circle at 35% 28%, #FFC19E 0%, #FF5C26 50%, #9E2600 100%)",
      specular: "rgba(255, 255, 255, 0.98)",
      tintGlow: "rgba(255, 92, 38, 0.45)",
    },
    purple: {
      ring: "from-[#B8A4FF] via-[#7C5CFC] to-[#4B27CE]",
      dome: "radial-gradient(circle at 35% 28%, #DDD2FF 0%, #7C5CFC 50%, #3B1B94 100%)",
      specular: "rgba(255, 255, 255, 0.98)",
      tintGlow: "rgba(124, 92, 252, 0.45)",
    },
    pink: {
      ring: "from-[#FDA4AF] via-[#F43F5E] to-[#9F1239]",
      dome: "radial-gradient(circle at 35% 28%, #FFE4E6 0%, #F43F5E 50%, #881337 100%)",
      specular: "rgba(255, 255, 255, 0.98)",
      tintGlow: "rgba(244, 63, 94, 0.45)",
    },
    blue: {
      ring: "from-[#93C5FD] via-[#2563EB] to-[#1E3A8A]",
      dome: "radial-gradient(circle at 35% 28%, #DBEAFE 0%, #2563EB 50%, #172554 100%)",
      specular: "rgba(255, 255, 255, 0.98)",
      tintGlow: "rgba(37, 99, 235, 0.45)",
    },
    dark: {
      ring: "from-zinc-500 via-zinc-800 to-black",
      dome: "radial-gradient(circle at 35% 28%, #B4B4B8 0%, #27272A 50%, #09090B 100%)",
      specular: "rgba(255, 255, 255, 0.85)",
      tintGlow: "rgba(0, 0, 0, 0.25)",
    },
  };

  const cfg = configs[color];

  return (
    <div className={`relative z-30 flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* Directional drop shadow cast on paper */}
      <div className="absolute w-6 h-2.5 bg-black/30 rounded-full blur-[2px] translate-y-3 translate-x-1.5" />

      {/* Translucent ambient colored glow onto paper */}
      <div
        className="absolute w-5 h-5 rounded-full blur-[4px] translate-y-1"
        style={{ backgroundColor: cfg.tintGlow }}
      />

      {/* 3D Pin Collar */}
      <div
        className={`relative w-[23px] h-[23px] rounded-full bg-gradient-to-br ${cfg.ring} border border-white/60 shadow-[0_3px_7px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex items-center justify-center`}
      >
        {/* Glossy Translucent Dome Bead */}
        <div
          className="w-[14px] h-[14px] rounded-full shadow-[inset_0_-1px_2.5px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.25)] relative overflow-hidden"
          style={{ background: cfg.dome }}
        >
          {/* Specular Glint Highlight */}
          <div
            className="w-[4px] h-[4px] rounded-full blur-[0.1px] absolute top-[2px] left-[2.5px]"
            style={{ backgroundColor: cfg.specular }}
          />
          {/* Rim light accent */}
          <div className="w-[9px] h-[1px] bg-white/50 rounded-full absolute top-[1px] left-[2.5px] blur-[0.25px]" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. HIGHLIGHTER MARKS
   Translucent, slightly imperfect hand-drawn marker strokes
───────────────────────────────────────────────────────────── */

function HighlighterMark({
  children,
  color = "yellow",
  className = "",
}: {
  children: React.ReactNode;
  color?: "yellow" | "pink" | "lavender" | "orange";
  className?: string;
}) {
  const bgColors = {
    yellow: "bg-[#FEF08A]/75",
    pink: "bg-[#FBCFE8]/70",
    lavender: "bg-[#DDD6FE]/70",
    orange: "bg-[#FED7AA]/75",
  };

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Translucent highlighter background stroke */}
      <span
        aria-hidden="true"
        className={`absolute -inset-x-1.5 inset-y-0.5 rounded-[3px] -rotate-[0.5deg] pointer-events-none ${bgColors[color]}`}
        style={{
          boxShadow: "0 0 1px rgba(0,0,0,0.03)",
        }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. HAND-DRAWN UNDERLINES
   Natural pen-style irregular underlines beneath important words
───────────────────────────────────────────────────────────── */

function HandDrawnUnderline({
  color = "#FF5C26",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      className={`overflow-visible pointer-events-none select-none ${className}`}
      preserveAspectRatio="none"
    >
      <path
        d="M 2 7 C 45 3, 95 9, 145 4.5 C 172 2.5, 188 6.5, 198 5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HandDrawnDoubleUnderline({
  color = "rgba(0,0,0,0.25)",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 10"
      fill="none"
      className={`overflow-visible pointer-events-none select-none ${className}`}
      preserveAspectRatio="none"
    >
      <path
        d="M 2 3 C 35 1.5, 80 4, 138 2.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 6 7.5 C 45 6, 90 8.5, 132 7"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. HAND-DRAWN CIRCLES
   Rough marker loops around selected words and badges
───────────────────────────────────────────────────────────── */

function HandDrawnCircle({
  children,
  color = "#FF5C26",
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="relative z-10">{children}</div>
      <svg
        viewBox="0 0 120 50"
        fill="none"
        className="absolute pointer-events-none select-none overflow-visible z-0"
        style={{ top: "-6px", bottom: "-6px", left: "-8px", right: "-8px", width: "calc(100% + 16px)", height: "calc(100% + 12px)" }}
        preserveAspectRatio="none"
      >
        <path
          d="M 14 25 C 12 12, 36 5, 60 5 C 88 5, 112 11, 110 25 C 108 38, 82 45, 58 45 C 30 45, 8 39, 9 26 C 10 15, 30 8, 56 6 C 76 5, 96 7, 105 11"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. HAND-DRAWN ARROWS / CONNECTOR MARKS
   Editorial marker arrows linking cards and notes
───────────────────────────────────────────────────────────── */

function HandDrawnLoopArrow({
  color = "#FF5C26",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 90 70"
      fill="none"
      className={`pointer-events-none select-none overflow-visible ${className}`}
    >
      <path
        d="M 12 10 C 24 16, 36 28, 42 22 C 48 15, 38 7, 34 16 C 30 26, 38 42, 58 56"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 46 54 L 60 58 L 57 44"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HandDrawnCurveArrow({
  color = "rgba(0,0,0,0.45)",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 60 36"
      fill="none"
      className={`pointer-events-none select-none overflow-visible ${className}`}
    >
      <path
        d="M 4 8 C 22 6, 42 14, 52 30"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="3 3.5"
      />
      <path
        d="M 44 28 L 53 31 L 52 22"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDITORIAL CONTACT SHEET / IMAGE PLACEHOLDER
───────────────────────────────────────────────────────────── */

function EditorialPlaceholder({
  label = "IMAGE PLACEHOLDER",
  caption = "ASSET PENDING",
  aspect = "aspect-[3/4]",
  subtext,
  tag,
}: {
  label?: string;
  caption?: string;
  aspect?: string;
  subtext?: string;
  tag?: string;
}) {
  return (
    <div
      className={`w-full ${aspect} relative bg-[#F4F1EA] border border-black/[0.08] rounded-[14px] overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 select-none group transition-all duration-300 hover:border-black/20`}
    >
      {/* Contact sheet fine grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: "18px 18px",
        }}
      />

      {/* Editorial crop marks */}
      <span aria-hidden="true" className="absolute top-2 left-2 text-[8px] font-mono text-zinc-400 select-none">┌</span>
      <span aria-hidden="true" className="absolute top-2 right-2 text-[8px] font-mono text-zinc-400 select-none">┐</span>
      <span aria-hidden="true" className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-400 select-none">└</span>
      <span aria-hidden="true" className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-400 select-none">┘</span>

      {/* Top technical header */}
      <div className="relative z-10 flex justify-between items-center text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
        <span>{tag || "[ REF // STUDIO ]"}</span>
        <span>{caption}</span>
      </div>

      {/* Center crosshair viewfinder */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
        <div className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center bg-black/[0.02] text-zinc-400 mb-1.5 relative group-hover:scale-105 transition-transform duration-300">
          <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}>
            <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
            <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="1 2" />
            <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="1 2" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase font-bold text-zinc-600 text-center">
          {label}
        </span>
        {subtext && (
          <span className="font-mono text-[7px] tracking-[0.12em] text-zinc-400 mt-0.5 uppercase text-center">
            {subtext}
          </span>
        )}
      </div>

      {/* Bottom technical specs */}
      <div className="relative z-10 flex justify-between items-center text-[7px] font-mono text-zinc-400 pt-1.5 border-t border-black/[0.05]">
        <span>PROOF PENDING</span>
        <span>5600K</span>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-black selection:bg-black selection:text-white relative overflow-x-hidden">
      
      {/* Background paper workspace lines (subtle ruled paper) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: "64px 32px",
        }}
      />

      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full relative z-10">

        {/* ─────────────────────────────────────────────────────────────
            1. TEAM INTRO
            Minimal start of the creative working board with editorial accents
        ───────────────────────────────────────────────────────────── */}
        <section
          style={{ paddingTop: "150px" }}
          className="pb-10 md:pb-14 px-5 sm:px-8 md:px-12 lg:px-24 relative"
        >
          <div className="max-w-[1240px] mx-auto">
            
            {/* Board category marker with hand-drawn orange loop */}
            <div className="mb-6">
              <HandDrawnCircle color="#FF5C26">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C26]" />
                  <span className="font-mono text-[9px] tracking-[0.25em] font-bold text-zinc-700 uppercase">
                    THE COLLECTIVE
                  </span>
                </div>
              </HandDrawnCircle>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/[0.07]">
              <div>
                <h1 className="font-sans font-bold tracking-[-0.05em] text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.05] text-black max-w-2xl break-words relative">
                  The people behind the{" "}
                  <span className="relative inline-block">
                    <HighlighterMark color="yellow">visual system.</HighlighterMark>
                    <HandDrawnUnderline color="#FF5C26" className="w-[102%] -bottom-2 -left-0.5 absolute h-3" />
                  </span>
                </h1>
              </div>

              <div className="relative flex flex-col md:items-end">
                <p className="font-sans text-sm sm:text-base text-zinc-500 font-light leading-relaxed max-w-md">
                  A lean visual production board bridging editorial art direction with proprietary AI synthesis.
                </p>

                {/* Hand-drawn editorial arrow pointing down towards Founder Card */}
                <div className="hidden lg:flex items-center gap-2 mt-4 text-[#FF5C26] pointer-events-none select-none">
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400 rotate-[-4deg]">
                    [ 01 // DIRECTION ]
                  </span>
                  <HandDrawnLoopArrow color="#FF5C26" className="w-11 h-9 -rotate-12 translate-y-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            2. CREATIVE WORKING BOARD: FOUNDER + TEAM PLACEHOLDERS
            Tactile floating cards with 3D colorful pins, soft shadows, and subtle connector lines
        ───────────────────────────────────────────────────────────── */}
        <section className="py-6 md:py-10 px-5 sm:px-8 md:px-12 lg:px-24">
          <div className="max-w-[1240px] mx-auto">

            {/* 2A. PRIMARY FEATURE: FOUNDER CARD (Deepak Kumawat) */}
            <div className="max-w-[980px] mx-auto relative z-10 mb-6 md:mb-8 pt-4">
              
              {/* 3D Translucent Orange Pushpin holding Founder Card */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30">
                <TactilePushpin color="orange" />
              </div>

              {/* Founder Pinned Board Card */}
              <div className="relative bg-white rounded-[24px] sm:rounded-[28px] border border-black/[0.08] shadow-[0_20px_45px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.02)] p-5 sm:p-8 md:p-10 rotate-0 sm:rotate-[-0.6deg] hover:rotate-0 transition-transform duration-500 ease-out">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
                  
                  {/* Left: Founder Portrait Placeholder */}
                  <div className="md:col-span-5 w-full max-w-[280px] sm:max-w-[320px] mx-auto md:mx-0 relative">
                    {/* Small blue pushpin pinning the photo sheet */}
                    <div className="absolute -top-2.5 left-6 z-20 scale-90">
                      <TactilePushpin color="blue" />
                    </div>

                    <EditorialPlaceholder
                      label="IMAGE PLACEHOLDER"
                      caption="PORTRAIT / DK"
                      subtext="FOUNDER & CREATIVE DIRECTOR"
                      aspect="aspect-[3/4]"
                      tag="[ REF: DK-01 ]"
                    />
                  </div>

                  {/* Right: Founder Profile Details */}
                  <div className="md:col-span-7 flex flex-col justify-center">
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold text-zinc-500">
                        [ 01 // FOUNDER & CREATIVE DIRECTOR ]
                      </span>
                      <span className="font-mono text-[7.5px] sm:text-[8px] tracking-[0.18em] uppercase font-bold text-zinc-600 bg-[#F7F4EE] px-2.5 py-0.5 rounded border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rotate-[1.5deg] select-none">
                        ✦ SELECTED DIRECTION
                      </span>
                    </div>

                    <h2 className="font-sans font-bold tracking-[-0.04em] text-3xl sm:text-4xl text-black mb-4">
                      Deepak Kumawat
                    </h2>

                    <p className="font-sans text-sm sm:text-base text-zinc-600 font-light leading-relaxed mb-6">
                      Deepak spearheads the creative vision and visual architecture across GROTON AI Studio and Grafly Studio. Bridging{" "}
                      <HighlighterMark color="pink">editorial art direction</HighlighterMark>{" "}
                      with proprietary AI synthesis pipelines, he orchestrates the lighting systems, photographic realism, and brand aesthetics that elevate modern visual production.
                    </p>

                    {/* Directorial Disciplines */}
                    <div className="border-t border-black/[0.06] pt-4 mb-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="relative inline-block font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">
                          Directorial Focus
                          <HandDrawnDoubleUnderline className="absolute -bottom-1 left-0 w-24 h-1.5" />
                        </span>
                        <span className="font-mono text-[8px] tracking-wider text-zinc-400 italic">
                          ✎ core pipeline
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Creative Direction",
                          "Visual Synthesis",
                          "Lighting Logic",
                          "Pipelines",
                        ].map((focus) => (
                          <span
                            key={focus}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-[#F5F2EB] text-zinc-800 border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Direct Contact */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-black/[0.06] text-xs">
                      <a
                        href="mailto:deepak@graflystudio.com"
                        className="inline-flex items-center gap-2 font-medium text-zinc-700 hover:text-black transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        deepak@graflystudio.com
                      </a>
                      <span className="text-zinc-300">•</span>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        Grafly Studio / GROTON AI
                      </span>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* 2B. SUBTLE EDITORIAL CONNECTOR TRACE */}
            {/* Graceful dotted connector line linking founder card down to collective benches */}
            <div className="hidden lg:flex justify-center my-6 relative z-0 pointer-events-none" aria-hidden="true">
              <svg width="860" height="60" viewBox="0 0 860 60" fill="none" className="overflow-visible w-full max-w-[860px]">
                <path
                  d="M430 0 C 430 35, 110 15, 110 60 M430 20 C 430 40, 325 25, 325 60 M430 20 C 430 40, 535 25, 535 60 M430 0 C 430 35, 750 15, 750 60"
                  stroke="rgba(0,0,0,0.13)"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />
                <circle cx="430" cy="0" r="2.5" fill="rgba(0,0,0,0.25)" />
                <circle cx="110" cy="60" r="2" fill="rgba(0,0,0,0.2)" />
                <circle cx="325" cy="60" r="2" fill="rgba(0,0,0,0.2)" />
                <circle cx="535" cy="60" r="2" fill="rgba(0,0,0,0.2)" />
                <circle cx="750" cy="60" r="2" fill="rgba(0,0,0,0.2)" />
              </svg>
            </div>

            {/* 2C. 4 FLOATING TEAM PLACEHOLDER CARDS */}
            {/* Clean pinned notes with colorful pushpins & subtle working notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-4">
              {[
                {
                  id: "02",
                  role: "Generative Art & AI",
                  ref: "BENCH // 01",
                  hasPin: true,
                  pinColor: "purple" as PinColor,
                  tag: "IN PROGRESS",
                  bg: "#F5F2FF",
                  textColor: "#6D28D9",
                  borderColor: "#DDD6FE",
                  rotationClass: "rotate-0 sm:rotate-[1.2deg] lg:translate-y-2 hover:rotate-0 hover:translate-y-0",
                  note: "✎ diffusion models",
                },
                {
                  id: "03",
                  role: "Creative & Art Direction",
                  ref: "BENCH // 02",
                  hasPin: false,
                  pinColor: "dark" as PinColor,
                  tag: "DIRECTION",
                  bg: "#F4F1EA",
                  textColor: "#4B4842",
                  borderColor: "#DDD7CD",
                  rotationClass: "rotate-0 sm:rotate-[-1.5deg] lg:translate-y-6 hover:rotate-0 hover:translate-y-0",
                  note: "✎ styling & mood",
                },
                {
                  id: "04",
                  role: "Visual Research & 3D",
                  ref: "BENCH // 03",
                  hasPin: true,
                  pinColor: "blue" as PinColor,
                  tag: "EXPLORE",
                  bg: "#EFF6FF",
                  textColor: "#1D4ED8",
                  borderColor: "#BFDBFE",
                  rotationClass: "rotate-0 sm:rotate-[1.0deg] lg:translate-y-1 hover:rotate-0 hover:translate-y-0",
                  note: "✎ 3D lighting SOP",
                },
                {
                  id: "05",
                  role: "Retouching & Finishing",
                  ref: "BENCH // 04",
                  hasPin: true,
                  pinColor: "pink" as PinColor,
                  tag: "FINISHING",
                  bg: "#FFF1F2",
                  textColor: "#BE123C",
                  borderColor: "#FECDD3",
                  rotationClass: "rotate-0 sm:rotate-[-1.3deg] lg:translate-y-5 hover:rotate-0 hover:translate-y-0",
                  note: "✎ quality control",
                },
              ].map((bench) => (
                <div
                  key={bench.id}
                  className={`relative bg-white rounded-[20px] border border-black/[0.07] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.05),0_3px_10px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 ease-out group hover:-translate-y-1.5 ${bench.rotationClass}`}
                >
                  {/* Pushpin at top center (used selectively) */}
                  {bench.hasPin ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                      <TactilePushpin color={bench.pinColor} />
                    </div>
                  ) : (
                    /* Subtle paper tape clip for Bench 03 */
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 w-8 h-3 bg-[#F0EAD6]/90 border border-[#DCD3BE] rounded-[2px] -rotate-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)]" />
                  )}

                  {/* Image Placeholder */}
                  <div className="mb-4 mt-1">
                    <EditorialPlaceholder
                      label="IMAGE PLACEHOLDER"
                      caption={bench.ref}
                      subtext="STUDIO POSITION"
                      aspect="aspect-[4/5]"
                      tag={`[ POS ${bench.id} ]`}
                    />
                  </div>

                  {/* Minimal metadata: Name & Role with editorial note tag and pencil note */}
                  <div className="flex flex-col mt-auto pt-2.5 border-t border-black/[0.04]">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-[8px] tracking-[0.16em] font-bold text-zinc-400 uppercase whitespace-nowrap">
                        [ {bench.id} // BENCH ]
                      </span>
                      <span
                        className="font-mono text-[7px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded border select-none whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                        style={{
                          backgroundColor: bench.bg,
                          color: bench.textColor,
                          borderColor: bench.borderColor,
                        }}
                      >
                        {bench.tag}
                      </span>
                    </div>

                    <h3 className="font-sans font-bold text-lg text-black mb-0.5">
                      Anonymous
                    </h3>

                    <p className="font-mono text-xs text-zinc-500 mb-1">
                      {bench.role === "Creative & Art Direction" ? (
                        <HighlighterMark color="lavender">
                          Creative & Art Direction
                        </HighlighterMark>
                      ) : (
                        bench.role
                      )}
                    </p>

                    <span className="font-mono text-[7.5px] text-zinc-400 italic">
                      {bench.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle transition annotation towards Join Our Team */}
            <div className="flex justify-center items-center gap-2 mt-8 md:mt-12 pointer-events-none select-none text-zinc-400">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.25em] uppercase">
                [ OPEN TALENT COHORT ]
              </span>
              <HandDrawnCurveArrow color="rgba(0,0,0,0.3)" className="w-8 h-5 translate-y-0.5" />
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. JOIN OUR TEAM (Only at bottom of page)
            Strong, compact carbon black recruitment area with WhatsApp CTA
        ───────────────────────────────────────────────────────────── */}
        <section className="px-5 sm:px-8 md:px-12 lg:px-24 py-16 md:py-24">
          <div
            className="max-w-[1240px] mx-auto text-white rounded-[28px] md:rounded-[34px] p-6 sm:p-12 md:p-16 relative overflow-hidden text-center shadow-2xl border border-white/10"
            style={{ backgroundColor: '#0D0D0D' }}
          >
            {/* Fine editorial corner crosshairs */}
            <span aria-hidden="true" className="absolute top-4 left-4 text-[9px] font-mono text-white/30 select-none">┌</span>
            <span aria-hidden="true" className="absolute top-4 right-4 text-[9px] font-mono text-white/30 select-none">┐</span>
            <span aria-hidden="true" className="absolute bottom-4 left-4 text-[9px] font-mono text-white/30 select-none">└</span>
            <span aria-hidden="true" className="absolute bottom-4 right-4 text-[9px] font-mono text-white/30 select-none">┘</span>

            {/* Subtle atmospheric violet glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[500px] h-[280px] bg-[#8B7CFF]/15 rounded-full blur-[100px]"
            />

            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="font-mono text-[9px] tracking-[0.25em] font-bold text-zinc-300 uppercase">
                  CAREERS & COLLABORATIONS
                </span>
              </div>

              <h2 className="font-sans font-bold tracking-[-0.04em] text-4xl sm:text-5xl text-white mb-4 leading-tight">
                Join Our Team
              </h2>

              <p className="font-sans text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-8 max-w-lg">
                We’re building a small, ambitious team shaping the future of visual production. If you think visually, experiment relentlessly, and care about the details, we’d like to hear from you.
              </p>

              {/* WhatsApp CTA Button */}
              <a
                href={WHATSAPP_TEAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="join-our-team-cta"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white text-black text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#8B7CFF] hover:text-black transition-all duration-300 rounded-full shadow-lg group hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span>Join Our Team</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>

              <div className="mt-4 text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
                Direct Inquiry via WhatsApp
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
