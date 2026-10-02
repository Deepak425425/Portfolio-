const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: LeftAsset / RightAsset inside PDF export
// We need to inject them inside `scenes.forEach((scene, index) => {`
// Let's find `scenes.forEach((scene, index) => {`
content = content.replace(
  /scenes\.forEach\(\(scene, index\) => \{/g,
  `scenes.forEach((scene, index) => {\n          const leftAsset = projectAssets.find(a => a.id === scene.leftImageAssetId);\n          const rightAsset = projectAssets.find(a => a.id === scene.rightImageAssetId);`
);

// Fix 2: missingImageOnly logic in `filteredScenes` useMemo
// if (missingImageOnly && (leftAsset || rightAsset))
content = content.replace(
  /if \(missingImageOnly && \(leftAsset\?\.url \|\| rightAsset\?\.url\)\)/g,
  `if (missingImageOnly && (scene.leftImageAssetId || scene.rightImageAssetId))`
);

// Fix 3: Top Navigation indicator
// <span className={(leftAsset?.url || rightAsset?.url) ? "text-[#8B7CFF]" : ""}>
content = content.replace(
  /<span className=\{\(leftAsset\?\.url \|\| rightAsset\?\.url\) \? "text-\[#8B7CFF\]" : ""\}>/g,
  `<span className={(s.leftImageAssetId || s.rightImageAssetId) ? "text-[#8B7CFF]" : ""}>`
);

// Fix 4: Old handleImageUpload tray auto-add
// setProjectAssets(prev => { if (!prev.find(t => t.url === base64)) return [...prev, { id: ... name: file.name }] })
content = content.replace(
  /return \[\.\.\.prev, \{ id: `tray-\$\{Date\.now\(\)\}`, url: base64, name: file\.name \}\];/,
  `return [...prev, { id: \`tray-\${Date.now()}\`, url: base64, originalFilename: file.name, displayName: generateNextDisplayName(prev) }];`
);

// Fix 5: side === 'left' reference error in PROJECT_ASSET drop logic
// In left slot: handleUpdateScene(scene.id, side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId', data.assetId);
// Because `side` is not defined here. It should just be 'leftImageAssetId'.
content = content.replace(
  /handleUpdateScene\(scene\.id, side === 'left' \? 'leftImageAssetId' : 'rightImageAssetId', data\.assetId\);/g,
  `handleUpdateScene(scene.id, data.sourceSide || 'leftImageAssetId', data.assetId);` // wait, I will just do exact replace in a moment.
);

fs.writeFileSync(filePath, content, 'utf8');
