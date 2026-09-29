const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '../src/app/tools');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith('page.tsx')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const pages = walkSync(toolsDir);

for (const page of pages) {
  if (page.includes('rename')) continue; // SKIP RENAME

  let content = fs.readFileSync(page, 'utf-8');
  let changed = false;

  // 1. Check if we need to add import
  const needsImport = content.includes('a.download =') || content.includes('zip.file(');
  if (needsImport && !content.includes('getGrotonExportFilename')) {
    // Insert import after the last import statement
    const importRegex = /import .* from ".*";\n/g;
    let lastMatch;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      lastMatch = match;
    }
    
    if (lastMatch) {
      const insertPos = lastMatch.index + lastMatch[0].length;
      content = content.slice(0, insertPos) + 'import { getGrotonExportFilename } from "@/utils/export";\n' + content.slice(insertPos);
      changed = true;
    } else {
      content = 'import { getGrotonExportFilename } from "@/utils/export";\n' + content;
      changed = true;
    }
  }

  // 2. Replace a.download = ...
  // Regex looks for: a.download = <expr>;
  // Or a.download = <expr> \n
  const downloadRegex = /a\.download\s*=\s*(.+?);/g;
  content = content.replace(downloadRegex, (match, expr) => {
    if (expr.includes('getGrotonExportFilename')) return match;
    changed = true;
    return `a.download = getGrotonExportFilename(${expr});`;
  });

  // 3. Replace zip.file(...)
  // Usually zip.file(name, content)
  // We need to wrap the first argument.
  const zipRegex = /zip\.file\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;
  content = content.replace(zipRegex, (match, arg1, arg2) => {
    if (arg1.includes('getGrotonExportFilename')) return match;
    // We only want to wrap the filename argument
    changed = true;
    return `zip.file(getGrotonExportFilename(${arg1}), ${arg2})`;
  });

  if (changed) {
    fs.writeFileSync(page, content, 'utf-8');
    console.log('Updated:', page);
  }
}
