const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SRC_DIR = path.join(__dirname, '../src');

// Collect all target images
const imageDirectories = ['campaign-worlds', 'images', 'work'];
const allImages = [];

for (const dir of imageDirectories) {
    const fullDirPath = path.join(PUBLIC_DIR, dir);
    if (!fs.existsSync(fullDirPath)) continue;
    
    const files = fs.readdirSync(fullDirPath);
    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            allImages.push({
                dir: dir,
                oldName: file,
                oldPath: `/${dir}/${file}`,
                fullOldPath: path.join(fullDirPath, file),
                ext: path.extname(file)
            });
        }
    }
}

// Generate new names and mapping
let counter = 1;
const renameMap = [];

for (const img of allImages) {
    const newName = `groton-${counter}${img.ext}`;
    const newPath = `/${img.dir}/${newName}`;
    const fullNewPath = path.join(PUBLIC_DIR, img.dir, newName);
    
    renameMap.push({
        ...img,
        newName,
        newPath,
        fullNewPath
    });
    counter++;
}

// Function to recursively find all source files
function scanSourceFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            scanSourceFiles(filePath, fileList);
        } else if (file.match(/\.(tsx|ts|js|jsx|css)$/)) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const sourceFiles = scanSourceFiles(SRC_DIR);

// Update references in source code
let updatedFilesCount = 0;
for (const file of sourceFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    for (const map of renameMap) {
        // Replace absolute paths (e.g., "/campaign-worlds/...")
        // Also handle possible relative paths if they exist, but Next.js usually uses absolute public paths
        const oldPathRegex = new RegExp(map.oldPath.replace(/\./g, '\\.'), 'g');
        if (content.match(oldPathRegex)) {
            content = content.replace(oldPathRegex, map.newPath);
            hasChanges = true;
        }
        
        // Also check if they just used the filename without the dir
        const justNameRegex = new RegExp(`['"]${map.oldName}['"]`, 'g');
        if (content.match(justNameRegex)) {
             // Let's be careful here, maybe it's just 'campaign.jpg'
             // We'll replace it carefully.
             content = content.replace(justNameRegex, `"${map.newName}"`);
             hasChanges = true;
        }
    }
    
    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFilesCount++;
    }
}

console.log(`Updated references in ${updatedFilesCount} source files.`);

// Rename the actual files
let renamedFilesCount = 0;
for (const map of renameMap) {
    fs.renameSync(map.fullOldPath, map.fullNewPath);
    renamedFilesCount++;
    console.log(`Renamed: ${map.oldPath} -> ${map.newPath}`);
}

console.log(`Successfully renamed ${renamedFilesCount} image files.`);
