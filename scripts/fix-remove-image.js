const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `  const handleRemoveImage = (id: string, side: 'left' | 'right') => {
    setScenes(scenes.map(s => s.id === id ? {
      ...s,
      ...(side === 'left' ? { leftImage: null, leftImageName: null, leftImageDisplayName: null } : { rightImage: null, rightImageName: null, rightImageDisplayName: null })
    } : s));
  };`;

const newStr = `  const handleRemoveImage = (id: string, side: 'left' | 'right') => {
    setScenes(scenes.map(s => s.id === id ? {
      ...s,
      [side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId']: null
    } : s));
  };`;

// replace using regex to ignore whitespace variations
content = content.replace(/const handleRemoveImage = \(id: string, side: 'left' \| 'right'\) => \{[\s\S]*?\} : s\)\);\s*\};/, newStr);

fs.writeFileSync(filePath, content, 'utf8');
