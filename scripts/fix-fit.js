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
    let original = content;

    // Fix unbounded max-h-full on img/canvas
    content = content.replace(/(<img[^>]+className="[^"]*)(max-h-full)([^"]*")/g, (match, p1, p2, p3) => {
       // if it's not a thumbnail (like w-16 h-16)
       if (/w-\d+ h-\d+/.test(p1) || /w-\d+ h-\d+/.test(p3) || /aspect-square/.test(p1) || /aspect-square/.test(p3)) {
          return match;
       }
       return `${p1}max-h-[70vh]${p3}`;
    });

    content = content.replace(/(<canvas[^>]+className="[^"]*)(max-h-full)([^"]*")/g, (match, p1, p2, p3) => {
       return `${p1}max-h-[70vh]${p3}`;
    });

    // Fix unbounded w-full h-full without max-h
    content = content.replace(/(<img[^>]+className="[^"]*\bw-full h-full\b[^"]*")/g, (match) => {
       if (!/max-h-/.test(match) && !/aspect-square/.test(match)) {
           return match.replace('w-full h-full', 'w-full h-full max-h-[70vh]');
       }
       return match;
    });

    // Enforce object-contain over object-cover on main previews
    content = content.replace(/(<img[^>]+className="[^"]*)(object-cover)([^"]*")/g, (match, p1, p2, p3) => {
       // Only replace if it's likely a main preview (not a thumb)
       if (!/w-\d+ h-\d+/.test(p1) && !/w-\d+ h-\d+/.test(p3) && !/aspect-square/.test(p1) && !/aspect-square/.test(p3) && !/w-full h-full/.test(p1)) {
          return `${p1}object-contain${p3}`;
       }
       return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Applied FIT constraints in: ${filePath}`);
    }
  }
});
