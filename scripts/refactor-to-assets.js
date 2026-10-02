const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Types
content = content.replace(
  /interface Scene \{[\s\S]*?notes: string;\n\}/,
  `interface Scene {
  id: string;
  number: number;
  enabled: boolean;
  phrase: string;
  leftImageAssetId: string | null;
  rightImageAssetId: string | null;
  frameType?: string;
  motionPrompt: string;
  notes: string;
}`
);

content = content.replace(
  /interface TrayImage \{[\s\S]*?name: string;\n\}/,
  `interface ProjectAsset {
  id: string;
  url: string;
  originalFilename: string;
  displayName: string;
}`
);

content = content.replace(
  /trayImages\?: TrayImage\[\];/,
  `projectAssets?: ProjectAsset[];\n  trayImages?: any[];`
);

// 2. Initializing State & Helper
content = content.replace(
  /const generateNextDisplayName = \(currentScenes: Scene\[\]\) => \{[\s\S]*?return `\$\{getOrdinal\(count \+ 1\)\} Frame`;\n\};/,
  `const generateNextDisplayName = (assets: ProjectAsset[]) => {
  return \`\${getOrdinal(assets.length + 1)} Frame\`;
};`
);

content = content.replace(
  /const \[trayImages, setTrayImages\] = useState<TrayImage\[\]>\(\[\]\);/,
  `const [projectAssets, setProjectAssets] = useState<ProjectAsset[]>([]);\n  const [assetSearch, setAssetSearch] = useState("");\n  const [assetMenuOpen, setAssetMenuOpen] = useState<string | null>(null);\n  const [isDragOverAssets, setIsDragOverAssets] = useState(false);`
);

content = content.replace(
  /const \[swapPrompt, setSwapPrompt\] = useState<any>\(null\);/,
  `const [swapPrompt, setSwapPrompt] = useState<any>(null);`
); // do nothing

// 3. Migration
content = content.replace(
  /const migrated = data\.scenes\.map\(\(s: any\) => \(\{[\s\S]*?rightImageDisplayName:.*?\}\)\);\n\s*setProjectName\(data\.projectName \|\| ""\);\n\s*setScenes\(migrated\);\n\s*setTrayImages\(data\.trayImages \|\| \[\]\);/,
  `let currentAssets = data.projectAssets || [];
          if (!data.projectAssets && data.trayImages) {
             currentAssets = data.trayImages.map((t: any) => ({
                 id: t.id,
                 url: t.url,
                 originalFilename: t.name,
                 displayName: t.displayName || t.name
             }));
          }

          const migrated = data.scenes.map((s: any) => {
              let leftId = s.leftImageAssetId || null;
              if (!leftId && (s.leftImage || s.image)) {
                  const newId = 'asset-' + Date.now() + Math.random();
                  currentAssets.push({
                      id: newId, url: s.leftImage || s.image,
                      originalFilename: s.leftImageName || s.imageName || 'imported',
                      displayName: s.leftImageDisplayName || generateNextDisplayName(currentAssets)
                  });
                  leftId = newId;
              }
              let rightId = s.rightImageAssetId || null;
              if (!rightId && s.rightImage) {
                  const newId = 'asset-' + Date.now() + Math.random();
                  currentAssets.push({
                      id: newId, url: s.rightImage,
                      originalFilename: s.rightImageName || 'imported',
                      displayName: s.rightImageDisplayName || generateNextDisplayName(currentAssets)
                  });
                  rightId = newId;
              }
              return {
                 id: s.id,
                 number: s.number,
                 enabled: s.enabled !== undefined ? s.enabled : true,
                 phrase: s.phrase || "",
                 leftImageAssetId: leftId,
                 rightImageAssetId: rightId,
                 motionPrompt: s.motionPrompt || "",
                 notes: s.notes || ""
              };
          });
          setProjectName(data.projectName || "");
          setProjectAssets(currentAssets);
          setScenes(migrated);`
);

content = content.replace(
  /localStorage\.setItem\('groton-script-board-autosave', JSON\.stringify\(\{ projectName, scenes, trayImages \}\)\);/,
  `localStorage.setItem('groton-script-board-autosave', JSON.stringify({ projectName, scenes, projectAssets }));`
);

content = content.replace(
  /const data: BoardData = \{ projectName, scenes, trayImages \};/,
  `const data: BoardData = { projectName, scenes, projectAssets };`
);

content = content.replace(
  /\[projectName, scenes, trayImages, isLoaded\]/,
  `[projectName, scenes, projectAssets, isLoaded]`
);

// 4. HandleMove / Swap
content = content.replace(
  /srcScene\.leftImage = null; srcScene\.leftImageName = null; srcScene\.leftImageDisplayName = null;/g,
  `srcScene.leftImageAssetId = null;`
);
content = content.replace(
  /srcScene\.rightImage = null; srcScene\.rightImageName = null; srcScene\.rightImageDisplayName = null;/g,
  `srcScene.rightImageAssetId = null;`
);

content = content.replace(
  /destScene\.leftImage = srcData\.url; destScene\.leftImageName = srcData\.name; destScene\.leftImageDisplayName = srcData\.displayName;/g,
  `destScene.leftImageAssetId = srcData.assetId;`
);
content = content.replace(
  /destScene\.rightImage = srcData\.url; destScene\.rightImageName = srcData\.name; destScene\.rightImageDisplayName = srcData\.displayName;/g,
  `destScene.rightImageAssetId = srcData.assetId;`
);

content = content.replace(
  /srcScene\.leftImage = destData\.url; srcScene\.leftImageName = destData\.name; srcScene\.leftImageDisplayName = destData\.displayName;/g,
  `srcScene.leftImageAssetId = destData.assetId;`
);
content = content.replace(
  /srcScene\.rightImage = destData\.url; srcScene\.rightImageName = destData\.name; srcScene\.rightImageDisplayName = destData\.displayName;/g,
  `srcScene.rightImageAssetId = destData.assetId;`
);


// 5. handleAddScene / handleDeleteScene / UpdateAsset
content = content.replace(
  /leftImage: null,[\s\S]*?rightImageDisplayName: null,/m,
  `leftImageAssetId: null,\n      rightImageAssetId: null,`
);

const handleAssetLogic = `
  const handleUpdateAsset = (id: string, updates: Partial<ProjectAsset>) => {
     setProjectAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  
  const handleRemoveAsset = (id: string) => {
     setProjectAssets(prev => prev.filter(a => a.id !== id));
     setScenes(prev => prev.map(s => ({
        ...s,
        leftImageAssetId: s.leftImageAssetId === id ? null : s.leftImageAssetId,
        rightImageAssetId: s.rightImageAssetId === id ? null : s.rightImageAssetId
     })));
  };
  
  const handleRenameAsset = (id: string) => {
     const newName = prompt("Enter new display name:");
     if (newName) {
        handleUpdateAsset(id, { displayName: newName });
     }
  };
`;

content = content.replace(
  /const handleUpdateScene = \(id: string, field: keyof Scene, value: any\) => \{[\s\S]*?\};/,
  `const handleUpdateScene = (id: string, field: keyof Scene, value: any) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));
  };\n\n${handleAssetLogic}`
);

// 6. Handle Image Upload / Tray Upload
content = content.replace(
  /const handleImageUpload = async \(id: string, e: React\.ChangeEvent<HTMLInputElement> \| FileList, side: 'left' \| 'right'\) => \{[\s\S]*?\};\s*const handleTrayUpload = async/m,
  `const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement> | FileList, side: 'left' | 'right') => {
    const fileList = e instanceof FileList ? e : e.target.files;
    const file = fileList?.[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await getBase64(file);
      const newAsset: ProjectAsset = {
         id: \`asset-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
         url: base64,
         originalFilename: file.name,
         displayName: generateNextDisplayName(projectAssets)
      };
      setProjectAssets(prev => [...prev, newAsset]);
      setScenes(scenes.map(s => s.id === id ? { ...s, [side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId']: newAsset.id } : s));
    }
  };
  
  const handleTrayUpload = async`
);

content = content.replace(
  /const handleTrayUpload = async \(e: React\.ChangeEvent<HTMLInputElement> \| FileList\) => \{[\s\S]*?setTrayImages\(prev => \[\.\.\.prev, \.\.\.newImages\]\);\n\s*\};/,
  `const handleTrayUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = Array.from(e instanceof FileList ? e : (e.target.files || []));
    if (!files.length) return;
    
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const newAssets = await Promise.all(imageFiles.map(async (f, idx) => ({
      id: \`asset-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      url: await getBase64(f),
      originalFilename: f.name,
      displayName: generateNextDisplayName([...projectAssets, ...Array(idx).fill(0)])
    })));
    
    setProjectAssets(prev => [...prev, ...newAssets]);
  };`
);

// Remove old handleRemoveTrayImage and handleRemoveImage
content = content.replace(
  /const handleRemoveTrayImage = \(id: string\) => \{[\s\S]*?setTrayImages\(prev => prev\.filter\(t => t\.id !== id\)\);\n\s*\};\n\s*const handleRemoveImage = \(id: string, side: 'left' \| 'right'\) => \{[\s\S]*?\} : s\)\);\n\s*\};/,
  `const handleRemoveImage = (id: string, side: 'left' | 'right') => {
    setScenes(scenes.map(s => s.id === id ? {
      ...s,
      [side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId']: null
    } : s));
  };`
);


// 7. Assets Panel UI
const assetsPanelUI = `
        {/* ASSETS PANEL */}
        <aside className="hidden lg:flex w-[300px] bg-white border-r border-zinc-200 flex-col shrink-0 z-10 relative"
               onDragOver={(e) => { e.preventDefault(); setIsDragOverAssets(true); }}
               onDragLeave={(e) => { e.preventDefault(); setIsDragOverAssets(false); }}
               onDrop={(e) => {
                 e.preventDefault();
                 setIsDragOverAssets(false);
                 if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                   handleTrayUpload(e.dataTransfer.files);
                 }
               }}
        >
          {isDragOverAssets && (
             <div className="absolute inset-0 z-50 bg-[#8B7CFF]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white pointer-events-none">
                <div className="w-12 h-12 mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  <Icons.AddDrop />
                </div>
                <span className="text-sm font-bold tracking-widest uppercase">Drop Images to Add</span>
             </div>
          )}
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
             <div className="flex flex-col">
               <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">Project Assets</h3>
               <span className="text-[9px] text-zinc-400 mt-0.5">{projectAssets.length} assets</span>
             </div>
             <label className="text-[10px] font-bold tracking-widest uppercase bg-zinc-200 hover:bg-zinc-300 px-3 py-1.5 rounded cursor-pointer transition-colors text-black shadow-sm">
               + Add
               <input type="file" multiple accept="image/*" className="hidden" onChange={handleTrayUpload} />
             </label>
          </div>
          
          {projectAssets.length > 0 && (
            <div className="p-4 border-b border-zinc-100">
               <div className="relative">
                 <input type="text" placeholder="Search assets..." value={assetSearch} onChange={e => setAssetSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-[#8B7CFF] focus:bg-white transition-all"/>
                 <div className="absolute left-3 top-2.5"><Icons.Search /></div>
               </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 relative grid grid-cols-2 gap-3 content-start">
             {projectAssets.filter(a => a.displayName.toLowerCase().includes(assetSearch.toLowerCase()) || a.originalFilename.toLowerCase().includes(assetSearch.toLowerCase())).length === 0 ? (
               <div className="col-span-2 text-xs text-zinc-400 p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl mt-4">
                 {assetSearch ? "No assets found." : "Drop images here to build your asset library."}
               </div>
             ) : (
               projectAssets.filter(a => a.displayName.toLowerCase().includes(assetSearch.toLowerCase()) || a.originalFilename.toLowerCase().includes(assetSearch.toLowerCase())).map(asset => {
                  const isUsed = scenes.some(s => s.leftImageAssetId === asset.id || s.rightImageAssetId === asset.id);
                  return (
                    <div key={asset.id} 
                         className="flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-[#8B7CFF]/50 hover:shadow-md transition-all group cursor-grab relative"
                         draggable 
                         onDragStart={(e) => {
                             e.dataTransfer.setData('application/json', JSON.stringify({ type: 'PROJECT_ASSET', assetId: asset.id }));
                             setTimeout(() => { if (e.target) (e.target as HTMLElement).style.opacity = '0.5'; }, 0);
                         }}
                         onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                       <div className="w-full aspect-square bg-zinc-100 relative">
                         <img src={asset.url} className="w-full h-full object-cover pointer-events-none"/>
                         <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                           <button onClick={(e) => { e.stopPropagation(); setAssetMenuOpen(asset.id === assetMenuOpen ? null : asset.id); }} className="p-1 bg-white/80 backdrop-blur-sm rounded text-black hover:bg-white shadow-sm">
                             <Icons.MoreHorizontal />
                           </button>
                           {assetMenuOpen === asset.id && (
                             <div className="absolute top-full right-0 mt-1 w-24 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden py-1 z-50">
                                <button onClick={() => { setAssetMenuOpen(null); handleRenameAsset(asset.id); }} className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 text-[10px] font-bold text-zinc-700">Rename</button>
                                <button onClick={() => { setAssetMenuOpen(null); handleRemoveAsset(asset.id); }} className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 text-[10px] font-bold">Remove</button>
                             </div>
                           )}
                         </div>
                       </div>
                       <div className="p-2 flex flex-col">
                         <span className="text-[9px] font-bold truncate text-black mb-0.5" title={asset.displayName}>{asset.displayName}</span>
                         <span className={\`text-[8px] uppercase font-bold tracking-widest \${isUsed ? 'text-[#8B7CFF]' : 'text-zinc-400'}\`}>
                           {isUsed ? 'IN SCENE' : 'UNUSED'}
                         </span>
                       </div>
                    </div>
                  );
               })
             )}
          </div>
        </aside>
`;

content = content.replace(
  /<aside className="hidden lg:flex w-72 bg-white border-r border-zinc-200 flex-col shrink-0 z-10">[\s\S]*?<\/aside>/,
  assetsPanelUI
);

// 8. Top Navigation indicator
content = content.replace(
  /<span className=\{\(s\.leftImage \|\| s\.rightImage\) \? "text-\[#8B7CFF\]" : ""\}>/g,
  `<span className={(s.leftImageAssetId || s.rightImageAssetId) ? "text-[#8B7CFF]" : ""}>`
);
content = content.replace(
  /if \(missingImageOnly && \(scene\.leftImage \|\| scene\.rightImage\)\) return false;/g,
  `if (missingImageOnly && (scene.leftImageAssetId || scene.rightImageAssetId)) return false;`
);

// 9. Scene Slots Mapping
content = content.replace(
  /\{filteredScenes\.map\(\(scene, idx\) => \(/,
  `{filteredScenes.map((scene, idx) => {\n  const leftAsset = projectAssets.find(a => a.id === scene.leftImageAssetId);\n  const rightAsset = projectAssets.find(a => a.id === scene.rightImageAssetId);\n  return (`
);

content = content.replace(
  /scene\.leftImage/g,
  `leftAsset?.url`
);
content = content.replace(
  /scene\.rightImage/g,
  `rightAsset?.url`
);

content = content.replace(
  /leftAsset\?\.urlName/g,
  `leftAsset?.originalFilename` // handle edge case replacement
);
content = content.replace(
  /leftAsset\?\.urlDisplayName/g,
  `leftAsset?.displayName`
);
content = content.replace(
  /rightAsset\?\.urlName/g,
  `rightAsset?.originalFilename`
);
content = content.replace(
  /rightAsset\?\.urlDisplayName/g,
  `rightAsset?.displayName`
);

// We need to fix the drop logic inside the slots:
// 1. PROJECT_ASSET logic
// 2. SCENE_IMAGE logic
// 3. Rename UI
content = content.replace(
  /if \(data\.type === 'TRAY_IMAGE'\) \{[\s\S]*?return;\n\s*\}/g,
  `if (data.type === 'PROJECT_ASSET') {
      handleUpdateScene(scene.id, side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId', data.assetId);
      return;
   }`
);

// Left slot Drop logic
content = content.replace(
  /if \(data\.type === 'SCENE_IMAGE'\) \{\s*if \(data\.sourceSceneId === scene\.id && data\.sourceSide === 'left'\) return;\s*if \(leftAsset\?\.url\) \{\s*setSwapPrompt\(\{[\s\S]*?\}\);\s*\} else \{\s*handleMoveImage\([\s\S]*?\);\s*\}\s*return;\s*\}/g,
  `if (data.type === 'SCENE_IMAGE') {
       if (data.sourceSceneId === scene.id && data.sourceSide === 'left') return;
       if (leftAsset) {
           setSwapPrompt({
               sourceSceneId: data.sourceSceneId, sourceSide: data.sourceSide, targetSceneId: scene.id, targetSide: 'left',
               sourceData: { assetId: data.assetId },
               targetData: { assetId: leftAsset.id }
           });
       } else {
           handleMoveImage(data.sourceSceneId, data.sourceSide, scene.id, 'left', data);
       }
       return;
   }`
);

// Right slot Drop logic
content = content.replace(
  /if \(data\.type === 'SCENE_IMAGE'\) \{\s*if \(data\.sourceSceneId === scene\.id && data\.sourceSide === 'right'\) return;\s*if \(rightAsset\?\.url\) \{\s*setSwapPrompt\(\{[\s\S]*?\}\);\s*\} else \{\s*handleMoveImage\([\s\S]*?\);\s*\}\s*return;\s*\}/g,
  `if (data.type === 'SCENE_IMAGE') {
       if (data.sourceSceneId === scene.id && data.sourceSide === 'right') return;
       if (rightAsset) {
           setSwapPrompt({
               sourceSceneId: data.sourceSceneId, sourceSide: data.sourceSide, targetSceneId: scene.id, targetSide: 'right',
               sourceData: { assetId: data.assetId },
               targetData: { assetId: rightAsset.id }
           });
       } else {
           handleMoveImage(data.sourceSceneId, data.sourceSide, scene.id, 'right', data);
       }
       return;
   }`
);


// Fix Drag start properties
content = content.replace(
  /sourceSceneId: scene\.id, sourceSide: 'left', url: leftAsset\?\.url, name: scene\.leftImageName, displayName: scene\.leftImageDisplayName/g,
  `sourceSceneId: scene.id, sourceSide: 'left', assetId: leftAsset?.id`
);

content = content.replace(
  /sourceSceneId: scene\.id, sourceSide: 'right', url: rightAsset\?\.url, name: scene\.rightImageName, displayName: scene\.rightImageDisplayName/g,
  `sourceSceneId: scene.id, sourceSide: 'right', assetId: rightAsset?.id`
);


// Replace scene display name updates
content = content.replace(
  /value=\{scene\.leftImageDisplayName \|\| ""\}/g,
  `value={leftAsset?.displayName || ""}`
);
content = content.replace(
  /onChange=\{\(e\) => handleUpdateScene\(scene\.id, 'leftImageDisplayName', e\.target\.value\)\}/g,
  `onChange={(e) => { if (leftAsset) handleUpdateAsset(leftAsset.id, { displayName: e.target.value }); }}`
);

content = content.replace(
  /value=\{scene\.rightImageDisplayName \|\| ""\}/g,
  `value={rightAsset?.displayName || ""}`
);
content = content.replace(
  /onChange=\{\(e\) => handleUpdateScene\(scene\.id, 'rightImageDisplayName', e\.target\.value\)\}/g,
  `onChange={(e) => { if (rightAsset) handleUpdateAsset(rightAsset.id, { displayName: e.target.value }); }}`
);

// Remove the Pick from tray button
content = content.replace(
  /<button onClick=\{\(\) => \{ setPickerSceneId\(scene\.id\); setPickerSide\('left'\); \}\} className="text-\[9px\] uppercase tracking-widest font-bold bg-\[#8B7CFF\] text-white px-2 py-1\.5 rounded hover:bg-\[#7a6ce0\] transition-colors">\s*Pick from Tray\s*<\/button>/g,
  ``
);
content = content.replace(
  /<button onClick=\{\(\) => \{ setPickerSceneId\(scene\.id\); setPickerSide\('left'\); \}\} className="text-\[9px\] font-bold tracking-widest uppercase text-\[#8B7CFF\] hover:text-\[#7a6ce0\] text-center w-full mt-1">\s*Pick from Tray\s*<\/button>/g,
  ``
);
content = content.replace(
  /<button onClick=\{\(\) => \{ setPickerSceneId\(scene\.id\); setPickerSide\('right'\); \}\} className="text-\[9px\] uppercase tracking-widest font-bold bg-\[#8B7CFF\] text-white px-2 py-1\.5 rounded hover:bg-\[#7a6ce0\] transition-colors">\s*Pick from Tray\s*<\/button>/g,
  ``
);
content = content.replace(
  /<button onClick=\{\(\) => \{ setPickerSceneId\(scene\.id\); setPickerSide\('right'\); \}\} className="text-\[9px\] font-bold tracking-widest uppercase text-\[#8B7CFF\] hover:text-\[#7a6ce0\] text-center w-full mt-1">\s*Pick from Tray\s*<\/button>/g,
  ``
);


// PDF Export
content = content.replace(
  /const hasLeft = !!scene\.leftImage;/g,
  `const leftAsset = projectAssets.find(a => a.id === scene.leftImageAssetId);\n          const rightAsset = projectAssets.find(a => a.id === scene.rightImageAssetId);\n          const hasLeft = !!leftAsset;`
);

content = content.replace(
  /const hasRight = !!scene\.rightImage;/g,
  `const hasRight = !!rightAsset;`
);

content = content.replace(
  /renderImageSlot\(scene\.leftImage,/g,
  `renderImageSlot(leftAsset?.url || null,`
);
content = content.replace(
  /renderImageSlot\(scene\.rightImage,/g,
  `renderImageSlot(rightAsset?.url || null,`
);

content = content.replace(
  /const framesText = doc\.splitTextToSize\(\(scene\.leftImageDisplayName \? "Left: " \+ scene\.leftImageDisplayName : "Left: \(None\)"\) \+ " \| " \+ \(scene\.rightImageDisplayName \? "Right: " \+ scene\.rightImageDisplayName : "Right: \(None\)"\), textWidth\);/g,
  `const framesText = doc.splitTextToSize((leftAsset?.displayName ? "Left: " + leftAsset.displayName : "Left: (None)") + " | " + (rightAsset?.displayName ? "Right: " + rightAsset.displayName : "Right: (None)"), textWidth);`
);

// End map brace
content = content.replace(
  /\}\)\}\s*<button\s*onClick=\{\(\) => handleAddScene/g,
  `  });\n              })}\n\n              <button \n                onClick={() => handleAddScene`
);

// Remove Picker Modal completely since the user drag and drops directly from project assets now
content = content.replace(
  /\{pickerSceneId && pickerSide && \([\s\S]*?<\/div>\s*\)\}/,
  ``
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactor script completed.');
