const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the handler definition
const oldHandler = `  const handleRemoveImage = (id: string, side: 'left' | 'right') => {
    setScenes(scenes.map(s => s.id === id ? {
      ...s,
      [side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId']: null
    } : s));
  };`;

const newHandler = `  const handleRemoveImage = (id: string, side: 'left' | 'right') => {
    setScenes(prev => prev.map(s => s.id === id ? {
      ...s,
      [side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId']: null
    } : s));
  };`;

content = content.replace(oldHandler, newHandler);

// 2. Fix the onClick instances
content = content.replace(
  /onClick=\{\(\) => handleRemoveImage\(scene\.id, 'left'\)\}/g,
  `onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemoveImage(scene.id, 'left'); }}`
);

content = content.replace(
  /onClick=\{\(\) => handleRemoveImage\(scene\.id, 'right'\)\}/g,
  `onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemoveImage(scene.id, 'right'); }}`
);

fs.writeFileSync(filePath, content, 'utf8');
