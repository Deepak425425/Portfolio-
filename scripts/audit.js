const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '..', 'src', 'app', 'tools');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(toolsDir, function(filePath) {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it uses max-h-full on image or canvas
    const hasUnboundedMaxHFull = /max-h-full/.test(content);
    
    // Check if it uses max-h-[50vh] or 60vh or 70vh
    const hasBoundedHeight = /max-h-\[(\d+)vh\]/.test(content);

    // If it has object-cover or stretches
    const hasObjectCover = /object-cover/.test(content) && !/w-16 h-16/.test(content) && !/aspect-square/.test(content);

    if (hasUnboundedMaxHFull || hasObjectCover || (!hasBoundedHeight && /object-contain/.test(content))) {
       console.log(`Needs audit: ${filePath}`);
       if (hasUnboundedMaxHFull) console.log(`  -> Uses max-h-full`);
       if (hasObjectCover) console.log(`  -> Uses object-cover`);
       if (!hasBoundedHeight && /object-contain/.test(content)) console.log(`  -> Uses object-contain but no bounded height`);
    }
  }
});
