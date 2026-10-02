const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  // Fix 175: 'leftAsset' in useMemo
  if (lines[i].includes('missingImageOnly && (leftAsset')) {
    lines[i] = lines[i].replace(/leftAsset\?\.url \|\| rightAsset\?\.url/g, 'scene.leftImageAssetId || scene.rightImageAssetId');
  }

  // Fix 336: handleImageUpload tray auto-add
  if (lines[i].includes('name: file.name')) {
    lines[i] = lines[i].replace(/name: file\.name/g, 'originalFilename: file.name, displayName: "Uploaded Image"');
  }

  // Fix 440: handleExportPDF splitTextToSize
  if (lines[i].includes('leftAsset?.displayName') && lines[i].includes('splitTextToSize')) {
    lines[i] = lines[i].replace(/leftAsset\?/g, 'sceneAssetLeft');
    lines[i] = lines[i].replace(/rightAsset\?/g, 'sceneAssetRight');
  }

  // Fix 512, 513: handleExportPDF renderImageSlot
  if (lines[i].includes('renderImageSlot(leftAsset?.url')) {
    lines[i] = lines[i].replace(/leftAsset\?\.url/g, 'sceneAssetLeft?.url');
  }
  if (lines[i].includes('renderImageSlot(rightAsset?.url')) {
    lines[i] = lines[i].replace(/rightAsset\?\.url/g, 'sceneAssetRight?.url');
  }
}

// Ensure `sceneAssetLeft` is defined in handleExportPDF
let content = lines.join('\n');
content = content.replace(/scenes\.forEach\(\(scene, index\) => \{/g, 
  `scenes.forEach((scene, index) => {\n          const sceneAssetLeft = projectAssets.find(a => a.id === scene.leftImageAssetId);\n          const sceneAssetRight = projectAssets.find(a => a.id === scene.rightImageAssetId);`);

fs.writeFileSync(filePath, content, 'utf8');
