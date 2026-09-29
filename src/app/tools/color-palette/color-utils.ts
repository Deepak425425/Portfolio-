export interface ColorResult {
  id: string;
  hex: string;
  rgb: string;
  hsl: string;
  r: number; g: number; b: number;
  h: number; s: number; l: number;
  percentage: number;
  name: string;
  isLocked: boolean;
}

export type PaletteMode = 'BALANCED' | 'VIBRANT' | 'MUTED' | 'LIGHT' | 'DARK';

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; 
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('').toUpperCase();
}

export function getColorName(h: number, s: number, l: number): string {
  if (l < 12) return "Deep Charcoal";
  if (l > 94) return "Warm Off-White";
  if (s < 12) return "Neutral Gray";
  
  let hueName = "";
  if (h < 15 || h >= 345) hueName = "Red";
  else if (h < 45) hueName = "Orange";
  else if (h < 75) hueName = "Yellow";
  else if (h < 165) hueName = "Green";
  else if (h < 210) hueName = "Cyan";
  else if (h < 270) hueName = "Blue";
  else if (h < 315) hueName = "Purple";
  else hueName = "Pink";

  if (s > 75) return "Vibrant " + hueName;
  if (s < 35) return "Muted " + hueName;
  if (l < 35) return "Dark " + hueName;
  if (l > 75) return "Light " + hueName;
  return hueName;
}

function dist(c1: {r:number,g:number,b:number}, c2: {r:number,g:number,b:number}) {
  return (c1.r - c2.r)**2 + (c1.g - c2.g)**2 + (c1.b - c2.b)**2;
}

export function generatePaletteColors(
  pixels: Uint8ClampedArray, 
  k: number, 
  mode: PaletteMode,
  lockedColors: ColorResult[]
): ColorResult[] {
  const colors: {r:number,g:number,b:number}[] = [];
  
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i+3] < 128) continue; 
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const { s, l } = rgbToHsl(r, g, b);
    
    let keep = true;
    if (mode === 'VIBRANT' && s < 45) keep = false;
    if (mode === 'MUTED' && s > 35) keep = false;
    if (mode === 'LIGHT' && l < 65) keep = false;
    if (mode === 'DARK' && l > 35) keep = false;
    
    // Add some random subsampling to speed up and allow regeneration
    if (keep && Math.random() > 0.5) colors.push({r, g, b});
  }

  if (colors.length < k * 5) {
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i+3] >= 128 && Math.random() > 0.8) {
        colors.push({r: pixels[i], g: pixels[i+1], b: pixels[i+2]});
      }
    }
  }

  let centroids: {r:number,g:number,b:number}[] = [];
  
  // Use locked colors as initial centroids
  for (const lc of lockedColors) {
    centroids.push({r: lc.r, g: lc.g, b: lc.b});
  }
  
  // Fill the rest randomly
  while (centroids.length < k) {
    centroids.push(colors[Math.floor(Math.random() * colors.length)] || {r: 0, g: 0, b: 0});
  }

  let clusters: number[] = new Array(colors.length);
  
  for (let iter = 0; iter < 10; iter++) {
    for (let i = 0; i < colors.length; i++) {
      let minDist = Infinity;
      let closest = 0;
      for (let j = 0; j < k; j++) {
        const d = dist(colors[i], centroids[j]);
        if (d < minDist) { minDist = d; closest = j; }
      }
      clusters[i] = closest;
    }
    
    let sums = Array.from({length: k}, () => ({r:0, g:0, b:0, count:0}));
    for (let i = 0; i < colors.length; i++) {
      const c = clusters[i];
      sums[c].r += colors[i].r;
      sums[c].g += colors[i].g;
      sums[c].b += colors[i].b;
      sums[c].count++;
    }
    
    let moved = false;
    for (let j = 0; j < k; j++) {
      if (j < lockedColors.length) continue; // Do not move locked centroids
      
      if (sums[j].count > 0) {
        const nr = Math.round(sums[j].r / sums[j].count);
        const ng = Math.round(sums[j].g / sums[j].count);
        const nb = Math.round(sums[j].b / sums[j].count);
        if (nr !== centroids[j].r || ng !== centroids[j].g || nb !== centroids[j].b) moved = true;
        centroids[j] = {r: nr, g: ng, b: nb};
      } else {
        centroids[j] = colors[Math.floor(Math.random() * colors.length)];
        moved = true;
      }
    }
    if (!moved) break;
  }
  
  const total = colors.length;
  const counts = Array(k).fill(0);
  for(let i=0; i<colors.length; i++) counts[clusters[i]]++;
  
  const results = centroids.map((c, i) => {
    const {h, s, l} = rgbToHsl(c.r, c.g, c.b);
    return {
      r: c.r, g: c.g, b: c.b,
      h, s, l,
      percentage: Math.max(1, Math.round((counts[i] / total) * 100)) || 1
    };
  });
  
  // Sort unlocked ones by percentage
  const lockedRes = results.slice(0, lockedColors.length);
  const unlockedRes = results.slice(lockedColors.length).sort((a, b) => b.percentage - a.percentage);
  
  return [...lockedRes, ...unlockedRes].map(c => ({
    id: Math.random().toString(36).substring(7),
    hex: rgbToHex(c.r, c.g, c.b),
    rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
    hsl: `hsl(${Math.round(c.h)}, ${Math.round(c.s)}%, ${Math.round(c.l)}%)`,
    r: c.r, g: c.g, b: c.b,
    h: c.h, s: c.s, l: c.l,
    percentage: c.percentage,
    name: getColorName(c.h, c.s, c.l),
    isLocked: false
  }));
}

export function getHarmony(base: ColorResult, type: string, count: number): ColorResult[] {
  const harmonies: ColorResult[] = [];
  const add = (hOffset: number, sMod: number = 1, lMod: number = 1) => {
    const nh = (base.h + hOffset + 360) % 360;
    const ns = Math.min(100, Math.max(0, base.s * sMod));
    const nl = Math.min(100, Math.max(0, base.l * lMod));
    const {r, g, b} = hslToRgb(nh, ns, nl);
    harmonies.push({
      id: Math.random().toString(36).substring(7),
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round(nh)}, ${Math.round(ns)}%, ${Math.round(nl)}%)`,
      r, g, b, h: nh, s: ns, l: nl,
      percentage: 0,
      name: getColorName(nh, ns, nl),
      isLocked: false
    });
  };

  if (type === 'COMPLEMENTARY') {
    add(180);
    if (count > 2) { add(180, 0.8, 1.2); add(180, 0.8, 0.8); }
  } else if (type === 'ANALOGOUS') {
    add(30); add(-30); add(60); add(-60);
  } else if (type === 'TRIADIC') {
    add(120); add(240);
    if (count > 3) { add(120, 0.8, 1.2); add(240, 0.8, 1.2); }
  } else if (type === 'SPLIT COMPLEMENTARY') {
    add(150); add(210);
    if (count > 3) { add(150, 0.8, 1.2); add(210, 0.8, 1.2); }
  }
  
  return harmonies.slice(0, count - 1);
}
