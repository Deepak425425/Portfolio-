const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/interface TrayImage \{[\s\S]*?\}/, `interface ProjectAsset {
  id: string;
  url: string;
  originalFilename: string;
  displayName: string;
}`);

// Also fix `setTrayImages` -> `setProjectAssets` where missed
content = content.replace(/setTrayImages\(/g, 'setProjectAssets(');

fs.writeFileSync(filePath, content, 'utf8');
