const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /const newImages = await Promise\.all\(imageFiles\.map\(async f => \(\{\s*id: `tray-\$\{Date\.now\(\)\}-\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`,[\s\S]*?name: f\.name\s*\}\)\)\);/m,
  `const newImages = await Promise.all(imageFiles.map(async (f, idx) => ({
      id: \`asset-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      url: await getBase64(f),
      originalFilename: f.name,
      displayName: generateNextDisplayName([...projectAssets, ...Array(idx).fill(0)])
    })));`
);

// also fix handleRemoveTrayImage if t.id error
content = content.replace(/prev\.filter\(t => t\.id !== id\)/g, `prev.filter(a => a.id !== id)`);

fs.writeFileSync(filePath, content, 'utf8');
