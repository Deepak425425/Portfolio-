const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(`handleUpdateScene(scene.id, data.sourceSide || 'leftImageAssetId', data.assetId);`)) {
    // Check if we are in left slot or right slot based on line number
    if (i < 900) {
      lines[i] = lines[i].replace(`handleUpdateScene(scene.id, data.sourceSide || 'leftImageAssetId', data.assetId);`, `handleUpdateScene(scene.id, 'leftImageAssetId', data.assetId);`);
    } else {
      lines[i] = lines[i].replace(`handleUpdateScene(scene.id, data.sourceSide || 'leftImageAssetId', data.assetId);`, `handleUpdateScene(scene.id, 'rightImageAssetId', data.assetId);`);
    }
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
