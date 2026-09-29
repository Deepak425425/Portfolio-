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

let modifiedFiles = 0;

walkDir(toolsDir, function(filePath) {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix the workspace container to strictly bound its max height
    content = content.replace(
      /className="flex-1 flex flex-col gap-6 w-full lg:w-auto"/g,
      'className="flex-1 flex flex-col gap-6 w-full lg:w-auto h-[65vh] max-h-[65vh]"'
    );

    // Also fix the layout container if it uses min-h-[70vh] without binding
    content = content.replace(
      /<div className="flex flex-col lg:flex-row gap-8 lg:gap-16 min-h-\[70vh\]">/g,
      '<div className="flex flex-col lg:flex-row gap-8 lg:gap-16 h-[70vh] max-h-[70vh]">'
    );

    // Some canvases/images might need min-h-0 to not overflow flex containers
    content = content.replace(
      /className="flex-1 bg-zinc-100 relative/g,
      'className="flex-1 min-h-0 bg-zinc-100 relative'
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`Fixed bounds in: ${filePath}`);
    }
  }
});

console.log(`Completed. Modified ${modifiedFiles} files.`);
