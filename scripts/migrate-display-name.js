const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add fields to Scene Interface
content = content.replace(
  /leftImageName: string \| null;\n\s*rightImage: string \| null;/m,
  `leftImageName: string | null;\n  leftImageDisplayName: string | null;\n  rightImage: string | null;`
);
content = content.replace(
  /rightImageName: string \| null;/m,
  `rightImageName: string | null;\n  rightImageDisplayName: string | null;`
);

// 2. Add Ordinal Logic right before export default function ScriptBoard
content = content.replace(
  /export default function ScriptBoard\(\) \{/,
  `const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const generateNextDisplayName = (currentScenes: Scene[]) => {
  let count = 0;
  currentScenes.forEach(s => {
    if (s.leftImage) count++;
    if (s.rightImage) count++;
  });
  return \`\${getOrdinal(count + 1)} Frame\`;
};

export default function ScriptBoard() {`
);

// 3. Update useEffect Migration
content = content.replace(
  /leftImageName: s\.leftImageName !== undefined \? s\.leftImageName : \(s\.imageName \|\| null\),/m,
  `leftImageName: s.leftImageName !== undefined ? s.leftImageName : (s.imageName || null),\n            leftImageDisplayName: s.leftImageDisplayName || (s.leftImage || s.image ? "1st Frame" : null),`
);
content = content.replace(
  /rightImageName: s\.rightImageName \|\| null/m,
  `rightImageName: s.rightImageName || null,\n            rightImageDisplayName: s.rightImageDisplayName || (s.rightImage ? "2nd Frame" : null)`
);

// 4. Update handleAddScene
content = content.replace(
  /leftImageName: null,\n\s*rightImage: null,\n\s*rightImageName: null,/m,
  `leftImageName: null,\n      leftImageDisplayName: null,\n      rightImage: null,\n      rightImageName: null,\n      rightImageDisplayName: null,`
);

// 5. Update handleImageUpload
content = content.replace(
  /\.\.\.\(side === 'left' \? \{ leftImage: base64, leftImageName: file\.name \} : \{ rightImage: base64, rightImageName: file\.name \}\)/,
  `...(side === 'left' ? { leftImage: base64, leftImageName: file.name, leftImageDisplayName: s.leftImageDisplayName || generateNextDisplayName(scenes) } : { rightImage: base64, rightImageName: file.name, rightImageDisplayName: s.rightImageDisplayName || generateNextDisplayName(scenes) })`
);

// 6. Update handleRemoveImage
content = content.replace(
  /\.\.\.\(side === 'left' \? \{ leftImage: null, leftImageName: null \} : \{ rightImage: null, rightImageName: null \}\)/,
  `...(side === 'left' ? { leftImage: null, leftImageName: null, leftImageDisplayName: null } : { rightImage: null, rightImageName: null, rightImageDisplayName: null })`
);

// 7. Update Picker Logic in tray
content = content.replace(
  /handleUpdateScene\(pickerSceneId, pickerSide === 'left' \? 'leftImageName' : 'rightImageName', img\.name\);/g,
  `handleUpdateScene(pickerSceneId, pickerSide === 'left' ? 'leftImageName' : 'rightImageName', img.name);
                         const sceneToUpdate = scenes.find(s => s.id === pickerSceneId);
                         if (sceneToUpdate) {
                           if (pickerSide === 'left' && !sceneToUpdate.leftImageDisplayName) {
                             handleUpdateScene(pickerSceneId, 'leftImageDisplayName', generateNextDisplayName(scenes));
                           }
                           if (pickerSide === 'right' && !sceneToUpdate.rightImageDisplayName) {
                             handleUpdateScene(pickerSceneId, 'rightImageDisplayName', generateNextDisplayName(scenes));
                           }
                         }`
);

// 8. Update JSX Drop Logic
// Replace `handleUpdateScene(scene.id, 'leftImageName', data.name);`
content = content.replace(
  /handleUpdateScene\(scene\.id, 'leftImageName', data\.name\);\s*return;/g,
  `handleUpdateScene(scene.id, 'leftImageName', data.name);
                                      if (!scene.leftImageDisplayName) handleUpdateScene(scene.id, 'leftImageDisplayName', generateNextDisplayName(scenes));
                                      return;`
);
content = content.replace(
  /handleUpdateScene\(scene\.id, 'rightImageName', data\.name\);\s*return;/g,
  `handleUpdateScene(scene.id, 'rightImageName', data.name);
                                      if (!scene.rightImageDisplayName) handleUpdateScene(scene.id, 'rightImageDisplayName', generateNextDisplayName(scenes));
                                      return;`
);

// 9. Display Name Editor UI Replacement!
const leftDisplayNameUI = `
                             {/* DISPLAY NAME EDITOR LEFT */}
                             <div className="absolute top-2 left-2 z-10">
                                <div className="group/rename relative flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm hover:bg-white transition-colors cursor-text">
                                  <input 
                                    value={scene.leftImageDisplayName || ""}
                                    onChange={(e) => handleUpdateScene(scene.id, 'leftImageDisplayName', e.target.value)}
                                    className="bg-transparent border-none outline-none text-[10px] font-bold text-black w-24 truncate placeholder-zinc-400"
                                    placeholder="Name image..."
                                  />
                                  <Icons.Pencil />
                                </div>
                             </div>
`;
const rightDisplayNameUI = `
                             {/* DISPLAY NAME EDITOR RIGHT */}
                             <div className="absolute top-2 left-2 z-10">
                                <div className="group/rename relative flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm hover:bg-white transition-colors cursor-text">
                                  <input 
                                    value={scene.rightImageDisplayName || ""}
                                    onChange={(e) => handleUpdateScene(scene.id, 'rightImageDisplayName', e.target.value)}
                                    className="bg-transparent border-none outline-none text-[10px] font-bold text-black w-24 truncate placeholder-zinc-400"
                                    placeholder="Name image..."
                                  />
                                  <Icons.Pencil />
                                </div>
                             </div>
`;

content = content.replace(
  /<img src=\{scene\.leftImage\} alt=\{scene\.leftImageName \|\| "Scene image"\} className="w-full h-full object-cover" \/>/g,
  `<img src={scene.leftImage} alt={scene.leftImageName || "Scene image"} className="w-full h-full object-cover" />` + leftDisplayNameUI
);

content = content.replace(
  /<img src=\{scene\.rightImage\} alt=\{scene\.rightImageName \|\| "Scene image"\} className="w-full h-full object-cover" \/>/g,
  `<img src={scene.rightImage} alt={scene.rightImageName || "Scene image"} className="w-full h-full object-cover" />` + rightDisplayNameUI
);

// 10. Update PDF Logic
content = content.replace(
  /const framesText = doc\.splitTextToSize\(\(scene\.leftImageName \? "Left: " \+ scene\.leftImageName : "Left: \(None\)"\) \+ " \| " \+ \(scene\.rightImageName \? "Right: " \+ scene\.rightImageName : "Right: \(None\)"\), textWidth\);/g,
  `const framesText = doc.splitTextToSize((scene.leftImageDisplayName ? "Left: " + scene.leftImageDisplayName : "Left: (None)") + " | " + (scene.rightImageDisplayName ? "Right: " + scene.rightImageDisplayName : "Right: (None)"), textWidth);`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script Board display names migrated successfully.');
