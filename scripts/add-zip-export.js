const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const exportPDFRegex = /const handleExportPDF = async \(\) => \{[\s\S]*?alert\("Failed to generate PDF\. Please try again\."\);\s*\}\s*\};/;

const additionalFns = `const handleExportProjectZip = async () => {
    setIsExportOpen(false);
    try {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        const assetsFolder = zip.folder("assets");
        const zipAssets = [];
        
        for (const asset of projectAssets) {
            let fileExt = "png";
            let mimeType = "image/png";
            let base64Data = asset.url;
            
            if (asset.url && asset.url.startsWith("data:")) {
                const parts = asset.url.split(";base64,");
                if (parts.length === 2) {
                    mimeType = parts[0].replace("data:", "");
                    fileExt = mimeType.split("/")[1] || "png";
                    base64Data = parts[1];
                }
            }
            
            const fileName = \`\${asset.id}.\${fileExt}\`;
            assetsFolder?.file(fileName, base64Data, { base64: true });
            
            zipAssets.push({
                ...asset,
                url: undefined,
                file: \`assets/\${fileName}\`,
                mimeType
            });
        }
        
        const projectData = {
            format: "groton-script-board",
            version: 1,
            project: {
                name: projectName,
                createdAt: new Date().toISOString(),
            },
            assets: zipAssets,
            scenes: scenes
        };
        
        zip.file("project.json", JSON.stringify(projectData, null, 2));
        
        const readmeContent = \`GROTON AI — Script Board Project Backup

This ZIP contains:
- Project data
- Scene structure
- Project assets
- Image assignments
- Frame names
- Script/action
- Motion/direction
- Internal notes

Format:
groton-script-board

Version:
1

This file is informational only.\`;

        zip.file("README.txt", readmeContent);
        
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const sanitizedName = (projectName || "Untitled_Project").replace(/[^a-z0-9]/gi, '_');
        a.download = \`GROTON_\${sanitizedName}.zip\`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("ZIP Export failed", e);
        alert("FAILED TO EXPORT PROJECT");
    }
  };

  const handleImportProjectZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsExportOpen(false);
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        await zip.loadAsync(file);
        
        const projectFile = zip.file("project.json");
        if (!projectFile) {
            throw new Error("Missing project.json");
        }
        
        const projectDataStr = await projectFile.async("string");
        const projectData = JSON.parse(projectDataStr);
        
        if (projectData.format !== "groton-script-board") {
            throw new Error("Invalid format");
        }
        
        const restoredAssets = [];
        if (projectData.assets && Array.isArray(projectData.assets)) {
            for (const asset of projectData.assets) {
                if (asset.file) {
                    const assetFile = zip.file(asset.file);
                    if (assetFile) {
                        const base64Data = await assetFile.async("base64");
                        const mimeType = asset.mimeType || "image/png";
                        restoredAssets.push({
                            ...asset,
                            url: \`data:\${mimeType};base64,\${base64Data}\`,
                            file: undefined,
                            mimeType: undefined
                        });
                    } else {
                        restoredAssets.push(asset);
                    }
                } else {
                    restoredAssets.push(asset);
                }
            }
        }
        
        if (projectData.scenes) {
            setProjectName(projectData.project?.name || "Imported Project");
            setScenes(projectData.scenes);
            setProjectAssets(restoredAssets);
            alert("PROJECT IMPORTED");
        } else {
            throw new Error("Missing scenes data");
        }
    } catch (err) {
        console.error("ZIP Import failed", err);
        alert("Unable to import project. The ZIP is invalid or incomplete.");
    }
    e.target.value = '';
  };
`;

const match = content.match(exportPDFRegex);
if (match) {
    content = content.replace(exportPDFRegex, match[0] + '\n\n' + additionalFns);
} else {
    console.error("Could not find handleExportPDF");
}

// Now replace the JSX menu
const oldExportMenu = `<button onClick={handleExportPDF} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export as PDF</button>
                 <button onClick={() => { setIsExportOpen(false); handleExportProject(); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export Project Data</button>
                 <div className="h-px bg-zinc-100 my-2"></div>
                 <label className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium cursor-pointer block text-zinc-600">
                   Import Project...
                   <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                 </label>`;

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

content = content.replace(oldExportMenu, newExportMenu);
fs.writeFileSync(filePath, content, 'utf8');
