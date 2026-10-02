const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/\s*\}\)\}\s*<button \s*onClick/g,
  `\n              );\n            })}\n\n              <button \n                onClick`);

fs.writeFileSync(filePath, content, 'utf8');
