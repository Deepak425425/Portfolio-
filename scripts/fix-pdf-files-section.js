const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldRegex = /const filesString = \`1st Frame: \$\{sceneAssetLeft \? \(sceneAssetLeft\.displayName \|\| "1st Frame"\) : "—"}\\n2nd Frame: \$\{sceneAssetRight \? \(sceneAssetRight\.displayName \|\| "2nd Frame"\) : "—"}\`;/;

const newCode = `const leftFile = sceneAssetLeft ? (sceneAssetLeft.displayName || "1st Frame") : "1st Frame: —";
        const rightFile = sceneAssetRight ? (sceneAssetRight.displayName || "2nd Frame") : "2nd Frame: —";
        const filesString = \`\${leftFile}\\n\${rightFile}\`;`;

if (oldRegex.test(content)) {
    content = content.replace(oldRegex, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
} else {
    console.error("Pattern not found!");
}
