"use client";

import React, { useState, useMemo } from "react";
import ToolLayout from "@/components/tools/ToolLayout";

interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  isLight: boolean;
}

interface ValidationResult {
  isValid: boolean;
  values: ColorValues;
  errorMessage?: string;
  isShorthand?: boolean;
}

const PRESET_SWATCHES = [
  { hex: "#7866E6", label: "GROTON Purple" },
  { hex: "#111111", label: "Obsidian" },
  { hex: "#FFFFFF", label: "Crisp White" },
  { hex: "#71717A", label: "Slate Zinc" },
  { hex: "#3B82F6", label: "Cobalt" },
  { hex: "#10B981", label: "Emerald" },
  { hex: "#F59E0B", label: "Amber" },
  { hex: "#EF4444", label: "Crimson" },
];

function parseHex(input: string, fallback: ColorValues): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      values: fallback,
      errorMessage: "HEX input cannot be empty."
    };
  }

  const clean = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    return {
      isValid: false,
      values: fallback,
      errorMessage: "Contains invalid characters. Use hex digits 0-9 and A-F."
    };
  }

  let fullHex = "";
  let isShorthand = false;

  if (clean.length === 3) {
    fullHex = clean.split("").map(c => c + c).join("").toUpperCase();
    isShorthand = true;
  } else if (clean.length === 6) {
    fullHex = clean.toUpperCase();
  } else {
    return {
      isValid: false,
      values: fallback,
      errorMessage: `Expected 3 or 6 hex digits, but received ${clean.length}.`
    };
  }

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return {
      isValid: false,
      values: fallback,
      errorMessage: "Could not parse RGB color components."
    };
  }

  // Calculate HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / delta + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  // Perceived luminance (YIQ standard formula)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const isLight = yiq >= 140;

  const formattedHex = `#${fullHex}`;
  const formattedRgb = `rgb(${r}, ${g}, ${b})`;
  const formattedHsl = `hsl(${h}, ${sPercent}%, ${lPercent}%)`;

  return {
    isValid: true,
    isShorthand,
    values: {
      hex: formattedHex,
      rgb: formattedRgb,
      hsl: formattedHsl,
      r,
      g,
      b,
      h,
      s: sPercent,
      l: lPercent,
      isLight
    }
  };
}

const DEFAULT_COLOR_VALUES: ColorValues = {
  hex: "#7866E6",
  rgb: "rgb(120, 102, 230)",
  hsl: "hsl(248, 73%, 65%)",
  r: 120,
  g: 102,
  b: 230,
  h: 248,
  s: 73,
  l: 65,
  isLight: false
};

export default function HexToColorPage() {
  const [hexInput, setHexInput] = useState<string>("#7866E6");
  const [lastValidValues, setLastValidValues] = useState<ColorValues>(DEFAULT_COLOR_VALUES);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const validation = useMemo(() => {
    return parseHex(hexInput, lastValidValues);
  }, [hexInput, lastValidValues]);

  // Update last valid values when input is valid
  React.useEffect(() => {
    if (validation.isValid) {
      setLastValidValues(validation.values);
    }
  }, [validation]);

  const activeValues = validation.isValid ? validation.values : lastValidValues;

  const copyToClipboard = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey(prev => (prev === key ? null : prev));
      }, 1800);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setHexInput(val);
  };

  return (
    <ToolLayout 
      title="HEX → Color" 
      description="Convert HEX color codes to RGB and HSL values instantly with real-time validation, synchronized color picking, and live preview."
      category="IMAGE TOOLS"
    >
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-16">
        
        {/* LEFT COLUMN: CONTROLS & CONVERTED VALUES */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Input Card */}
          <div className="bg-white border border-zinc-200 p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                HEX Color Input
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">
                Supports 3 & 6 Digits
              </span>
            </div>

            {/* Input Row with Native Color Picker Sync */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {/* Synchronized Color Swatch / Native Picker */}
                <div 
                  className="relative w-14 h-14 rounded-2xl border border-zinc-200/80 shadow-sm shrink-0 overflow-hidden cursor-pointer group transition-transform hover:scale-[1.03]"
                  style={{ backgroundColor: activeValues.hex }}
                  title="Click to open color picker"
                >
                  <input
                    type="color"
                    value={activeValues.hex}
                    onChange={handleColorPickerChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    aria-label="Native color picker"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                    <span className="text-white text-xs">🎨</span>
                  </div>
                </div>

                {/* Text Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-zinc-400 font-mono text-lg font-bold">#</span>
                  </div>
                  <input
                    type="text"
                    spellCheck={false}
                    autoComplete="off"
                    value={hexInput.startsWith("#") ? hexInput.slice(1) : hexInput}
                    onChange={(e) => setHexInput(e.target.value ? `#${e.target.value.replace(/[^0-9a-fA-F]/g, "")}` : "")}
                    placeholder="7866E6 or F00"
                    maxLength={7}
                    className={`w-full pl-9 pr-4 py-3.5 font-mono text-lg font-bold uppercase tracking-wider rounded-xl border bg-zinc-50 transition-all outline-none ${
                      !validation.isValid && hexInput.trim().length > 0
                        ? "border-amber-400/80 focus:border-amber-500 text-amber-900 bg-amber-50/30"
                        : "border-zinc-200 focus:border-[#8B7CFF] text-[#111111]"
                    }`}
                  />
                </div>
              </div>

              {/* Real-time Validation Message */}
              <div className="flex items-center justify-between text-xs px-1 min-h-[22px]">
                {validation.isValid ? (
                  <span className="text-[11px] text-emerald-600 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Valid {validation.isShorthand ? "3-digit shorthand (expanded)" : "6-digit HEX"}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                    {validation.errorMessage || "Enter a valid 3- or 6-digit hex code"}
                  </span>
                )}
                {validation.isShorthand && validation.isValid && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Expanded: {validation.values.hex}
                  </span>
                )}
              </div>
            </div>

            {/* Curated Swatches / Quick Presets */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-100">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_SWATCHES.map((swatch) => {
                  const isActive = activeValues.hex.toUpperCase() === swatch.hex.toUpperCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setHexInput(swatch.hex)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        isActive
                          ? "border-[#8B7CFF] bg-[#8B7CFF]/10 text-[#8B7CFF] font-bold shadow-xs"
                          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700"
                      }`}
                      title={swatch.label}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" 
                        style={{ backgroundColor: swatch.hex }} 
                      />
                      <span>{swatch.hex}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Converted Color Values Section */}
          <div className="bg-white border border-zinc-200 p-6 md:p-8 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                Converted Color Values
              </span>
              {!validation.isValid && (
                <span className="text-[10px] uppercase tracking-wider font-mono text-amber-500">
                  Showing last valid values
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* HEX Value */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl transition-colors">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">HEX</span>
                  <span className="font-mono text-base font-bold text-[#111111] tracking-wide mt-0.5">
                    {activeValues.hex}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("hex", activeValues.hex)}
                  className={`px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg border transition-all ${
                    copiedKey === "hex"
                      ? "border-[#8B7CFF] bg-[#8B7CFF]/15 text-[#8B7CFF]"
                      : "border-zinc-200 bg-white hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700"
                  }`}
                >
                  {copiedKey === "hex" ? "COPIED!" : "COPY"}
                </button>
              </div>

              {/* RGB Value */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl transition-colors">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">RGB</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      (R: {activeValues.r}, G: {activeValues.g}, B: {activeValues.b})
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#111111] tracking-wide mt-0.5">
                    {activeValues.rgb}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("rgb", activeValues.rgb)}
                  className={`px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg border transition-all ${
                    copiedKey === "rgb"
                      ? "border-[#8B7CFF] bg-[#8B7CFF]/15 text-[#8B7CFF]"
                      : "border-zinc-200 bg-white hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700"
                  }`}
                >
                  {copiedKey === "rgb" ? "COPIED!" : "COPY"}
                </button>
              </div>

              {/* HSL Value */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl transition-colors">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">HSL</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      (H: {activeValues.h}°, S: {activeValues.s}%, L: {activeValues.l}%)
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#111111] tracking-wide mt-0.5">
                    {activeValues.hsl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("hsl", activeValues.hsl)}
                  className={`px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg border transition-all ${
                    copiedKey === "hsl"
                      ? "border-[#8B7CFF] bg-[#8B7CFF]/15 text-[#8B7CFF]"
                      : "border-zinc-200 bg-white hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700"
                  }`}
                >
                  {copiedKey === "hsl" ? "COPIED!" : "COPY"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE COLOR PREVIEW & VISUAL SPEC */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-zinc-200 p-6 md:p-8 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                Live Color Preview
              </span>
              <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400">
                {activeValues.hex}
              </span>
            </div>

            {/* Prominent Live Color Preview Box */}
            <div 
              className="w-full aspect-[4/3] min-h-[220px] rounded-2xl border border-black/5 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-200 p-6 shadow-inner"
              style={{ backgroundColor: activeValues.hex }}
            >
              <div 
                className="flex flex-col items-center text-center select-none transition-colors duration-200" 
                style={{ color: activeValues.isLight ? "#111111" : "#FFFFFF" }}
              >
                <span className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-2">Aa</span>
                <span className="font-mono text-lg md:text-xl font-bold tracking-wider">{activeValues.hex}</span>
                <span className="text-[11px] uppercase tracking-widest opacity-80 mt-1 font-medium">
                  {activeValues.isLight ? "Dark text contrast" : "Light text contrast"}
                </span>
              </div>
            </div>

            {/* Breakdown Specification Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex flex-col">
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Channels</span>
                <span className="font-mono text-xs font-semibold text-zinc-800 mt-1">
                  {activeValues.r}, {activeValues.g}, {activeValues.b}
                </span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex flex-col">
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Tone</span>
                <span className="font-mono text-xs font-semibold text-zinc-800 mt-1">
                  {activeValues.h}°, {activeValues.s}%
                </span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex flex-col">
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Luminance</span>
                <span className="font-mono text-xs font-semibold text-zinc-800 mt-1">
                  {activeValues.isLight ? "Light tone" : "Dark tone"}
                </span>
              </div>
            </div>

            {/* Copy CSS declaration helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard("css", `color: ${activeValues.hex};`)}
                className={`w-full py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-xl border transition-all ${
                  copiedKey === "css"
                    ? "border-[#8B7CFF] bg-[#8B7CFF]/15 text-[#8B7CFF]"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                }`}
              >
                {copiedKey === "css" ? "COPIED CSS DECLARATION!" : `COPY CSS: color: ${activeValues.hex};`}
              </button>
            </div>
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}
