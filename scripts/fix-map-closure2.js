const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('))}')) {
    // If it's the end of map... wait, we can just replace '  ))}' with '  );\n})}'
    lines[i] = lines[i].replace(/\}\)\}/, ');\n              })}');
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
