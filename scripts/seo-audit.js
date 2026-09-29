const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/app');

function scanDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            scanDir(filePath, fileList);
        } else if (file === 'layout.tsx' || file === 'page.tsx') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const files = scanDir(SRC_DIR);
let report = "### Current Metadata Audit\n\n";

let globalFound = false;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const hasMetadata = content.includes('export const metadata');
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const descMatch = content.match(/description:\s*["']([^"']+)["']/);
    
    if (hasMetadata || titleMatch || descMatch) {
        report += `File: ${path.relative(SRC_DIR, file)}\n`;
        report += `Title: ${titleMatch ? titleMatch[1] : 'MISSING'}\n`;
        report += `Desc: ${descMatch ? descMatch[1] : 'MISSING'}\n`;
        report += `---\n`;
    }
}

fs.writeFileSync(path.join(__dirname, '../seo-audit-report.txt'), report);
console.log("SEO audit generated in seo-audit-report.txt");
