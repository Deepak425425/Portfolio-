export interface InpaintingOptions {
  patchRadius?: number; // default 4 (9x9 patch)
  searchRadius?: number; // how far to search for a source patch, default 200
  onProgress?: (p: number) => void;
}

export async function processExemplarInpainting(
  imgData: ImageData,
  maskData: ImageData, // 255 alpha means masked/unknown
  options: InpaintingOptions = {}
) {
  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;
  const mask = maskData.data;

  const patchRadius = options.patchRadius || 4;
  const searchRadius = options.searchRadius || 200;
  const patchSize = patchRadius * 2 + 1;

  // 1. Identify mask bounding box
  let minX = w, minY = h, maxX = 0, maxY = 0;
  let unknownCount = 0;
  
  const confidence = new Float32Array(w * h);
  const isMasked = new Uint8Array(w * h);
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Assume anything > 128 in mask's alpha or RGB is masked
      // We'll check the mask alpha channel (idx*4 + 3)
      if (mask[idx * 4 + 3] > 128) {
        isMasked[idx] = 1;
        confidence[idx] = 0;
        unknownCount++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      } else {
        isMasked[idx] = 0;
        confidence[idx] = 1;
      }
    }
  }

  if (unknownCount === 0) return imgData;

  const totalUnknown = unknownCount;
  
  // To avoid infinite loops in edge cases
  let iterations = 0;
  const maxIterations = unknownCount * 2;
  
  // Boundary array
  let boundary: {x: number, y: number}[] = [];

  const getBoundary = () => {
    boundary = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (isMasked[y * w + x]) {
          // Check neighbors
          let isBoundary = false;
          if (x > 0 && !isMasked[y * w + (x - 1)]) isBoundary = true;
          else if (x < w - 1 && !isMasked[y * w + (x + 1)]) isBoundary = true;
          else if (y > 0 && !isMasked[(y - 1) * w + x]) isBoundary = true;
          else if (y < h - 1 && !isMasked[(y + 1) * w + x]) isBoundary = true;
          
          if (isBoundary) boundary.push({ x, y });
        }
      }
    }
  };

  while (unknownCount > 0 && iterations < maxIterations) {
    iterations++;
    
    // Yield to browser occasionally
    if (iterations % 5 === 0) {
      if (options.onProgress) {
        options.onProgress(Math.max(0, Math.min(100, Math.round((1 - unknownCount / totalUnknown) * 100))));
      }
      await new Promise(r => setTimeout(r, 0));
    }

    getBoundary();
    if (boundary.length === 0) break;

    // 2. Find highest priority boundary pixel
    let maxPriority = -1;
    let targetP = boundary[0];
    
    for (const p of boundary) {
      let confSum = 0;
      let count = 0;
      for (let dy = -patchRadius; dy <= patchRadius; dy++) {
        for (let dx = -patchRadius; dx <= patchRadius; dx++) {
          const nx = p.x + dx;
          const ny = p.y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            confSum += confidence[ny * w + nx];
            count++;
          }
        }
      }
      const C = confSum / count;
      // In a real exemplar algorithm we multiply by Data term. For speed, C is enough for most cases.
      const priority = C; 
      
      if (priority > maxPriority) {
        maxPriority = priority;
        targetP = p;
      }
    }

    // 3. Find best matching patch for targetP
    // Search within searchRadius of targetP
    let sMinX = Math.max(patchRadius, targetP.x - searchRadius);
    let sMaxX = Math.min(w - 1 - patchRadius, targetP.x + searchRadius);
    let sMinY = Math.max(patchRadius, targetP.y - searchRadius);
    let sMaxY = Math.min(h - 1 - patchRadius, targetP.y + searchRadius);
    
    let minError = Infinity;
    let bestQ = { x: targetP.x, y: targetP.y }; // Fallback

    // Optimization: stride for search to speed up
    const stride = searchRadius > 100 ? 2 : 1;

    for (let sy = sMinY; sy <= sMaxY; sy += stride) {
      for (let sx = sMinX; sx <= sMaxX; sx += stride) {
        // Skip if center is masked
        if (isMasked[sy * w + sx]) continue;
        
        // Skip if this patch overlaps with the mask too much (we only want pure source patches ideally, 
        // but checking all pixels is slow. We check center and corners).
        if (
          isMasked[(sy - patchRadius) * w + (sx - patchRadius)] ||
          isMasked[(sy + patchRadius) * w + (sx + patchRadius)] ||
          isMasked[(sy - patchRadius) * w + (sx + patchRadius)] ||
          isMasked[(sy + patchRadius) * w + (sx - patchRadius)]
        ) {
          continue;
        }

        let error = 0;
        let validPixels = 0;
        
        for (let dy = -patchRadius; dy <= patchRadius; dy++) {
          for (let dx = -patchRadius; dx <= patchRadius; dx++) {
            const tx = targetP.x + dx;
            const ty = targetP.y + dy;
            
            if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
              if (!isMasked[ty * w + tx]) {
                const qx = sx + dx;
                const qy = sy + dy;
                
                const tidx = (ty * w + tx) * 4;
                const qidx = (qy * w + qx) * 4;
                
                const dr = data[tidx] - data[qidx];
                const dg = data[tidx+1] - data[qidx+1];
                const db = data[tidx+2] - data[qidx+2];
                
                error += (dr*dr + dg*dg + db*db);
                validPixels++;
              }
            }
          }
        }
        
        if (validPixels > 0) {
          const meanError = error / validPixels;
          if (meanError < minError) {
            minError = meanError;
            bestQ = { x: sx, y: sy };
          }
        }
      }
    }

    // 4. Copy patch
    let newC = maxPriority; // The confidence to assign to newly filled pixels
    
    for (let dy = -patchRadius; dy <= patchRadius; dy++) {
      for (let dx = -patchRadius; dx <= patchRadius; dx++) {
        const tx = targetP.x + dx;
        const ty = targetP.y + dy;
        
        if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
          if (isMasked[ty * w + tx]) {
            const qx = bestQ.x + dx;
            const qy = bestQ.y + dy;
            
            if (qx >= 0 && qx < w && qy >= 0 && qy < h) {
              const tidx = (ty * w + tx) * 4;
              const qidx = (qy * w + qx) * 4;
              
              data[tidx] = data[qidx];
              data[tidx+1] = data[qidx+1];
              data[tidx+2] = data[qidx+2];
              data[tidx+3] = 255;
              
              isMasked[ty * w + tx] = 0;
              confidence[ty * w + tx] = newC;
              unknownCount--;
            }
          }
        }
      }
    }
  }

  if (options.onProgress) options.onProgress(100);
  return imgData;
}
