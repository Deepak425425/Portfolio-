const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The original JSX to be replaced
const menuSearchRegex = /<button onClick=\{handleExportPDF\}[^>]*>Export as PDF<\/button>\s*<button onClick=\{\(\) => \{ setIsExportOpen\(false\); handleExportProject\(\); \}\}[^>]*>Export Project Data<\/button>\s*<button onClick=\{handleExportProjectZip\}[^>]*>Export Project ZIP<\/button>\s*<div className="h-px bg-zinc-100 my-2"><\/div>\s*<label[^>]*>\s*Import Project\.\.\.\s*<input type="file" accept="\.json" onChange=\{handleImport\} className="hidden" \/>\s*<\/label>\s*<label[^>]*>\s*Import Project ZIP\s*<input type="file" accept="\.zip" onChange=\{handleImportProjectZip\} className="hidden" \/>\s*<\/label>/;

const newMenu = `<button onClick={handleExportPDF} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export as PDF</button>
                 <button onClick={handleExportProjectZip} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export Project ZIP</button>
                 <div className="h-px bg-zinc-100 my-2"></div>
                 <label className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium cursor-pointer block text-zinc-600">
                   Import Project ZIP
                   <input type="file" accept=".zip" onChange={handleImportProjectZip} className="hidden" />
                 </label>`;

if (menuSearchRegex.test(content)) {
    content = content.replace(menuSearchRegex, newMenu);
} else {
    console.error("Menu Pattern not found!");
}

// Remove handleExportProject
const handleExportProjectRegex = /const handleExportProject = \(\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\s*};\s*/;
content = content.replace(handleExportProjectRegex, '');

// Remove handleImport
const handleImportRegex = /const handleImport = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?e\.target\.value = ''; \/\/ reset input\s*};\s*/;
content = content.replace(handleImportRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
