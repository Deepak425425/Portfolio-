const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/\}\)\}\s*<button\s*onClick=\{\(\) => handleAddScene/g,
  `});\n              })}\n\n              <button \n                onClick={() => handleAddScene`);

fs.writeFileSync(filePath, content, 'utf8');
