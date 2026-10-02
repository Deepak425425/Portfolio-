const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The original JSX to be replaced
const searchRegex = /<button onClick=\{handleExportPDF\}[^>]*>Export as PDF<\/button>\s*<button onClick=\{\(\) => \{ setIsExportOpen\(false\); handleExportProject\(\); \}\}[^>]*>Export Project Data<\/button>\s*<div className="h-px bg-zinc-100 my-2"><\/div>\s*<label[^>]*>\s*Import Project\.\.\.\s*<input type="file" accept="\.json" onChange=\{handleImport\} className="hidden" \/>\s*<\/label>/;

const newExportMenu = `<button onClick={handleExportPDF} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export as PDF</button>
                 <button onClick={() => { setIsExportOpen(false); handleExportProject(); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export Project Data</button>
                 <button onClick={handleExportProjectZip} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-bold text-[#8B7CFF]">Export Project ZIP</button>
                 <div className="h-px bg-zinc-100 my-2"></div>
                 <label className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium cursor-pointer block text-zinc-600">
                   Import Project...
                   <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                 </label>
                 <label className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-bold cursor-pointer block text-[#8B7CFF]">
                   Import Project ZIP
                   <input type="file" accept=".zip" onChange={handleImportProjectZip} className="hidden" />
                 </label>`;

if (searchRegex.test(content)) {
    content = content.replace(searchRegex, newExportMenu);
    fs.writeFileSync(filePath, content, 'utf8');
} else {
    console.error("Pattern not found! Please check the UI code.");
}
