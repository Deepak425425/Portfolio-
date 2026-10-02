const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix empty blocks
content = content.replace(/\{!leftAsset\?\.url && \(\s*\)\}/g, '');
content = content.replace(/\{!rightAsset\?\.url && \(\s*\)\}/g, '');

// Fix tray modal that was left over
const badTrayModal = /\{trayImages\.map\(img => \([\s\S]*?<\/div>\s*\}\)\s*\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;
content = content.replace(badTrayModal, '');

// Also remove `const trayImages = ...` definition if it still exists.
content = content.replace(/const \[trayImages, setTrayImages\] = useState<any\[\]>\(\[\]\);/g, '');

// The bottom of the file looks like:
//           </div>
//         </main>
//       </div>
//
//       {swapPrompt && ( ...
// Let's make sure it closes properly.
const mainEnd = /<\/main>\s*<\/div>\s*\{swapPrompt/g;
if (!mainEnd.test(content)) {
  // if there's leftover stray divs
  content = content.replace(/<\/main>\s*<\/div>[\s\S]*?\{swapPrompt/, '</main></div>{swapPrompt');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax errors.');
