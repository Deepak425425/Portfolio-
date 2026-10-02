const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  // Fix 175
  if (lines[i].includes('missingImageOnly') && lines[i].includes('leftAsset')) {
    lines[i] = lines[i].replace(/leftAsset\?\.url \|\| rightAsset\?\.url/g, 'scene.leftImageAssetId || scene.rightImageAssetId');
    // If it was just leftAsset, leftAsset?.url, we just replace the whole line:
    lines[i] = `        if (missingImageOnly && (scene.leftImageAssetId || scene.rightImageAssetId)) return false;`;
  }

  // Fix 443
  if (lines[i].includes('splitTextToSize') && lines[i].includes('sceneAssetLeft')) {
    lines[i] = lines[i].replace(/sceneAssetLeft\.displayName/g, 'sceneAssetLeft?.displayName');
    lines[i] = lines[i].replace(/sceneAssetRight\.displayName/g, 'sceneAssetRight?.displayName');
  }

  // Fix 515, 516
  if (lines[i].includes('renderImageSlot(sceneAssetLeft?.url')) {
    lines[i] = lines[i].replace(/sceneAssetLeft\?\.url/g, 'sceneAssetLeft?.url || null');
  }
  if (lines[i].includes('renderImageSlot(sceneAssetRight?.url')) {
    lines[i] = lines[i].replace(/sceneAssetRight\?\.url/g, 'sceneAssetRight?.url || null');
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
