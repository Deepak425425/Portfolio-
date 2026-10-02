const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace UI labels
content = content.replace(
    /<label className="text-\[10px\] font-bold tracking-\[0\.15em\] uppercase text-zinc-400 text-center">Left Image<\/label>/g,
    '<label className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 text-center">1st Frame</label>'
);

content = content.replace(
    /<label className="text-\[10px\] font-bold tracking-\[0\.15em\] uppercase text-zinc-400 text-center">Right Image<\/label>/g,
    '<label className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 text-center">2nd Frame</label>'
);

// 2. Replace PDF Export headers
content = content.replace(
    /const leftSlotName = sceneAssetLeft\?\.displayName \? sceneAssetLeft\.displayName\.toUpperCase\(\) : "1ST FRAME";/,
    'const leftSlotName = "1ST FRAME";'
);

content = content.replace(
    /const rightSlotName = sceneAssetRight\?\.displayName \? sceneAssetRight\.displayName\.toUpperCase\(\) : "2ND FRAME";/,
    'const rightSlotName = "2ND FRAME";'
);

fs.writeFileSync(filePath, content, 'utf8');
