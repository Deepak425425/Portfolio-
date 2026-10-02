const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix left image drag start
const oldLeftPayload = `e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'left', url: leftAsset?.url, name: leftAsset?.originalFilename, displayName: leftAsset?.displayName }));`;
const newLeftPayload = `e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'left', assetId: leftAsset?.id, url: leftAsset?.url, name: leftAsset?.originalFilename, displayName: leftAsset?.displayName }));`;
content = content.replace(oldLeftPayload, newLeftPayload);

// Fix right image drag start
const oldRightPayload = `e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'right', url: rightAsset?.url, name: rightAsset?.originalFilename, displayName: rightAsset?.displayName }));`;
const newRightPayload = `e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'right', assetId: rightAsset?.id, url: rightAsset?.url, name: rightAsset?.originalFilename, displayName: rightAsset?.displayName }));`;
content = content.replace(oldRightPayload, newRightPayload);

fs.writeFileSync(filePath, content, 'utf8');
