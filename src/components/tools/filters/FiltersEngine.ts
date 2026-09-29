export interface ColorGrade {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  temperature: number;
  tint: number;
  saturation: number;
  vibrance: number;
}

export const DEFAULT_GRADE: ColorGrade = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
  saturation: 0,
  vibrance: 0
};

export type FilterType = 'cinematic_focus' | 'film_grain' | 'halftone' | 'chromatic_aberration' | 'vignette' | 'duotone';

export interface FilterEffect {
  id: string;
  type: FilterType;
  enabled: boolean;
  params: Record<string, number | string>;
}

export const DEFAULT_FILTER_PARAMS: Record<FilterType, Record<string, number | string>> = {
  cinematic_focus: { focusX: 50, focusY: 50, radius: 30, blur: 10 },
  film_grain: { amount: 20, size: 1 },
  halftone: { dotSize: 4, contrast: 20 },
  chromatic_aberration: { amount: 5, angle: 0 },
  vignette: { amount: 50, size: 50, softness: 50 },
  duotone: { shadow: '#111111', highlight: '#e3f0da', mix: 100 }
};

export const applyColorGradeAndFilters = (
  canvas: HTMLCanvasElement, 
  grade: ColorGrade, 
  effects: FilterEffect[]
) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  if (w === 0 || h === 0) return;

  // 1. Structural Effects (Cinematic Focus, Halftone via Context)
  for (const eff of effects) {
    if (!eff.enabled) continue;
    if (eff.type === 'cinematic_focus') {
      const fx = (eff.params.focusX as number) / 100 * w;
      const fy = (eff.params.focusY as number) / 100 * h;
      const radius = (eff.params.radius as number) / 100 * Math.max(w,h);
      const blur = (eff.params.blur as number);
      
      if (blur > 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w; tempCanvas.height = h;
        const tCtx = tempCanvas.getContext('2d');
        if(tCtx) {
          tCtx.filter = `blur(${blur}px)`;
          tCtx.drawImage(canvas, 0, 0);
          ctx.save();
          const grad = ctx.createRadialGradient(fx, fy, radius * 0.2, fx, fy, radius * 1.5);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,1)');
          tCtx.globalCompositeOperation = 'destination-in';
          tCtx.fillStyle = grad;
          tCtx.fillRect(0,0,w,h);
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();
        }
      }
    }
  }

  // 2. Pixel Manipulation (Color Grading + Grain + CA + Vignette)
  let imgData = ctx.getImageData(0, 0, w, h);
  let data = imgData.data;

  // Pre-calculate grading factors
  const exp = Math.pow(2, grade.exposure / 50); // -100 to 100 -> 0.25 to 4
  const cont = (grade.contrast + 100) / 100;
  const sat = (grade.saturation + 100) / 100;
  const temp = grade.temperature; // -100 to 100
  const tint = grade.tint; // -100 to 100
  const hl = grade.highlights / 100; 
  const sh = grade.shadows / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];

    // Exposure
    r *= exp; g *= exp; b *= exp;

    // Contrast
    r = ((r / 255 - 0.5) * cont + 0.5) * 255;
    g = ((g / 255 - 0.5) * cont + 0.5) * 255;
    b = ((b / 255 - 0.5) * cont + 0.5) * 255;

    // Highlights & Shadows
    const luma = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    if (hl !== 0) {
      const hlMask = Math.max(0, luma - 0.5) * 2; // 0 at mid, 1 at white
      r += r * hl * hlMask;
      g += g * hl * hlMask;
      b += b * hl * hlMask;
    }
    if (sh !== 0) {
      const shMask = Math.max(0, 0.5 - luma) * 2; // 1 at black, 0 at mid
      r += r * sh * shMask;
      g += g * sh * shMask;
      b += b * sh * shMask;
    }

    // Temp & Tint
    r += temp * 0.5;
    b -= temp * 0.5;
    g += tint * 0.5;
    r -= tint * 0.25;
    b -= tint * 0.25;

    // Saturation
    const currentLuma = r * 0.299 + g * 0.587 + b * 0.114;
    r = currentLuma + (r - currentLuma) * sat;
    g = currentLuma + (g - currentLuma) * sat;
    b = currentLuma + (b - currentLuma) * sat;

    data[i] = Math.max(0, Math.min(255, r));
    data[i+1] = Math.max(0, Math.min(255, g));
    data[i+2] = Math.max(0, Math.min(255, b));
  }

  // Apply Pixel Filters
  for (const eff of effects) {
    if (!eff.enabled) continue;
    
    if (eff.type === 'film_grain') {
      const amount = (eff.params.amount as number) || 0;
      if (amount <= 0) continue;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * amount * 2.5;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
      }
    }
    
    if (eff.type === 'vignette') {
      const amount = (eff.params.amount as number) / 100;
      const size = (eff.params.size as number) / 100;
      const softness = (eff.params.softness as number) / 100;
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx*cx + cy*cy) * (1.5 - size);
      
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const i = (y * w + x) * 4;
          
          let factor = (dist - maxDist * (1 - softness)) / (maxDist * softness + 0.001);
          factor = Math.max(0, Math.min(1, factor));
          const darken = 1 - (factor * amount);
          
          data[i] *= darken;
          data[i+1] *= darken;
          data[i+2] *= darken;
        }
      }
    }

    if (eff.type === 'chromatic_aberration') {
      const amount = Math.floor(((eff.params.amount as number) / 100) * (w * 0.05));
      if (amount <= 0) continue;
      const newData = new Uint8ClampedArray(data);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const rx = Math.max(0, x - amount);
          const bx = Math.min(w - 1, x + amount);
          const ri = (y * w + rx) * 4;
          const bi = (y * w + bx) * 4;
          newData[i] = data[ri]; 
          newData[i+1] = data[i+1]; 
          newData[i+2] = data[bi+2]; 
          newData[i+3] = data[i+3];
        }
      }
      data = newData;
      imgData.data.set(data);
    }
    
    if (eff.type === 'duotone') {
       const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0,0,0];
       }
       const s = hexToRgb(eff.params.shadow as string);
       const hl = hexToRgb(eff.params.highlight as string);
       const mix = (eff.params.mix as number) / 100;
       
       for (let i = 0; i < data.length; i += 4) {
         const luma = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114) / 255;
         const nr = s[0] + (hl[0] - s[0]) * luma;
         const ng = s[1] + (hl[1] - s[1]) * luma;
         const nb = s[2] + (hl[2] - s[2]) * luma;
         
         data[i] = data[i] * (1 - mix) + nr * mix;
         data[i+1] = data[i+1] * (1 - mix) + ng * mix;
         data[i+2] = data[i+2] * (1 - mix) + nb * mix;
       }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // 3. Post-Pixel Structural Effects (Halftone overrides pixels strongly)
  for (const eff of effects) {
    if (!eff.enabled) continue;
    if (eff.type === 'halftone') {
      const dotSize = Math.max(2, Math.floor(((eff.params.dotSize as number) / 100) * (w * 0.02)));
      if (dotSize < 2) continue;
      
      const origData = ctx.getImageData(0,0,w,h).data;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w; tempCanvas.height = h;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
         tCtx.fillStyle = '#ffffff';
         tCtx.fillRect(0,0,w,h);
         tCtx.fillStyle = '#000000';
         
         for (let y = 0; y < h; y += dotSize) {
           for (let x = 0; x < w; x += dotSize) {
             const i = (y * w + x) * 4;
             const luma = (origData[i] * 0.299 + origData[i+1] * 0.587 + origData[i+2] * 0.114) / 255;
             const radius = (1 - luma) * (dotSize / 1.5);
             if (radius > 0) {
               tCtx.beginPath();
               tCtx.arc(x + dotSize/2, y + dotSize/2, radius, 0, Math.PI*2);
               tCtx.fill();
             }
           }
         }
         ctx.globalCompositeOperation = 'multiply';
         ctx.drawImage(tempCanvas, 0, 0);
         ctx.globalCompositeOperation = 'source-over';
      }
    }
  }
};
