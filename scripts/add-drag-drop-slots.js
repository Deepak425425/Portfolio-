const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add swapPrompt state
content = content.replace(
  /const \[pickerSide, setPickerSide\] = useState<'left' \| 'right' \| null>\(null\);/g,
  `const [pickerSide, setPickerSide] = useState<'left' | 'right' | null>(null);\n  const [swapPrompt, setSwapPrompt] = useState<any>(null);`
);

// 2. Add handleMoveImage and handleSwapImage
const moveLogic = `
  const handleMoveImage = (srcId: string, srcSide: 'left' | 'right', destId: string, destSide: 'left' | 'right', srcData: any) => {
    setScenes(prev => {
        const next = [...prev];
        const sIndex = next.findIndex(s => s.id === srcId);
        const dIndex = next.findIndex(s => s.id === destId);
        if (sIndex < 0 || dIndex < 0) return prev;
        
        const srcScene = { ...next[sIndex] };
        if (srcSide === 'left') {
            srcScene.leftImage = null; srcScene.leftImageName = null; srcScene.leftImageDisplayName = null;
        } else {
            srcScene.rightImage = null; srcScene.rightImageName = null; srcScene.rightImageDisplayName = null;
        }
        next[sIndex] = srcScene;
        
        const destScene = sIndex === dIndex ? srcScene : { ...next[dIndex] };
        if (destSide === 'left') {
            destScene.leftImage = srcData.url; destScene.leftImageName = srcData.name; destScene.leftImageDisplayName = srcData.displayName;
        } else {
            destScene.rightImage = srcData.url; destScene.rightImageName = srcData.name; destScene.rightImageDisplayName = srcData.displayName;
        }
        next[dIndex] = destScene;
        return next;
    });
  };

  const handleSwapImage = (srcId: string, srcSide: 'left' | 'right', destId: string, destSide: 'left' | 'right', srcData: any, destData: any) => {
    setScenes(prev => {
        const next = [...prev];
        const sIndex = next.findIndex(s => s.id === srcId);
        const dIndex = next.findIndex(s => s.id === destId);
        if (sIndex < 0 || dIndex < 0) return prev;
        
        const srcScene = { ...next[sIndex] };
        if (srcSide === 'left') {
            srcScene.leftImage = destData.url; srcScene.leftImageName = destData.name; srcScene.leftImageDisplayName = destData.displayName;
        } else {
            srcScene.rightImage = destData.url; srcScene.rightImageName = destData.name; srcScene.rightImageDisplayName = destData.displayName;
        }
        next[sIndex] = srcScene;
        
        const destScene = sIndex === dIndex ? srcScene : { ...next[dIndex] };
        if (destSide === 'left') {
            destScene.leftImage = srcData.url; destScene.leftImageName = srcData.name; destScene.leftImageDisplayName = srcData.displayName;
        } else {
            destScene.rightImage = srcData.url; destScene.rightImageName = srcData.name; destScene.rightImageDisplayName = srcData.displayName;
        }
        next[dIndex] = destScene;
        return next;
    });
  };

  const handleAddScene = (index: number) => {`;

content = content.replace(/const handleAddScene = \(index: number\) => \{/, moveLogic);


// 3. Update Left Image Drop Zone handlers
const newLeftHandlers = `onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#8B7CFF]', 'bg-[#8B7CFF]/5'); const overlay = e.currentTarget.querySelector('.drop-overlay-slot'); if (overlay) overlay.classList.replace('hidden', 'flex'); }}
                              onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#8B7CFF]', 'bg-[#8B7CFF]/5'); const overlay = e.currentTarget.querySelector('.drop-overlay-slot'); if (overlay) overlay.classList.replace('flex', 'hidden'); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-[#8B7CFF]', 'bg-[#8B7CFF]/5');
                                const overlay = e.currentTarget.querySelector('.drop-overlay-slot');
                                if (overlay) overlay.classList.replace('flex', 'hidden');
                                try {
                                  const dataStr = e.dataTransfer.getData('application/json');
                                  if (dataStr) {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'TRAY_IMAGE') {
                                      handleUpdateScene(scene.id, 'leftImage', data.url);
                                      handleUpdateScene(scene.id, 'leftImageName', data.name);
                                      if (!scene.leftImageDisplayName) handleUpdateScene(scene.id, 'leftImageDisplayName', generateNextDisplayName(scenes));
                                      return;
                                    }
                                    if (data.type === 'SCENE_IMAGE') {
                                       if (data.sourceSceneId === scene.id && data.sourceSide === 'left') return;
                                       if (scene.leftImage) {
                                           setSwapPrompt({
                                               sourceSceneId: data.sourceSceneId, sourceSide: data.sourceSide, targetSceneId: scene.id, targetSide: 'left',
                                               sourceData: { url: data.url, name: data.name, displayName: data.displayName },
                                               targetData: { url: scene.leftImage, name: scene.leftImageName, displayName: scene.leftImageDisplayName }
                                           });
                                       } else {
                                           handleMoveImage(data.sourceSceneId, data.sourceSide, scene.id, 'left', data);
                                       }
                                       return;
                                    }
                                  }
                                } catch (err) {}
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  handleImageUpload(scene.id, e.dataTransfer.files, 'left');
                                }
                              }}`;

content = content.replace(
  /onDragOver=\{\(e\) => \{ e\.preventDefault\(\); e\.currentTarget\.classList\.add\('bg-\[#8B7CFF\]\/5'\); \}\}\s*onDragLeave=\{\(e\) => \{ e\.currentTarget\.classList\.remove\('bg-\[#8B7CFF\]\/5'\); \}\}\s*onDrop=\{\(e\) => \{[\s\S]*?if \(e\.dataTransfer\.files && e\.dataTransfer\.files\.length > 0\) \{\s*handleImageUpload\(scene\.id, e\.dataTransfer\.files, 'left'\);\s*\}\s*\}\}/,
  newLeftHandlers
);

// 4. Update Right Image Drop Zone handlers
const newRightHandlers = `onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#8B7CFF]', 'bg-[#8B7CFF]/5'); const overlay = e.currentTarget.querySelector('.drop-overlay-slot'); if (overlay) overlay.classList.replace('hidden', 'flex'); }}
                              onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#8B7CFF]', 'bg-[#8B7CFF]/5'); const overlay = e.currentTarget.querySelector('.drop-overlay-slot'); if (overlay) overlay.classList.replace('flex', 'hidden'); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-[#8B7CFF]', 'bg-[#8B7CFF]/5');
                                const overlay = e.currentTarget.querySelector('.drop-overlay-slot');
                                if (overlay) overlay.classList.replace('flex', 'hidden');
                                try {
                                  const dataStr = e.dataTransfer.getData('application/json');
                                  if (dataStr) {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'TRAY_IMAGE') {
                                      handleUpdateScene(scene.id, 'rightImage', data.url);
                                      handleUpdateScene(scene.id, 'rightImageName', data.name);
                                      if (!scene.rightImageDisplayName) handleUpdateScene(scene.id, 'rightImageDisplayName', generateNextDisplayName(scenes));
                                      return;
                                    }
                                    if (data.type === 'SCENE_IMAGE') {
                                       if (data.sourceSceneId === scene.id && data.sourceSide === 'right') return;
                                       if (scene.rightImage) {
                                           setSwapPrompt({
                                               sourceSceneId: data.sourceSceneId, sourceSide: data.sourceSide, targetSceneId: scene.id, targetSide: 'right',
                                               sourceData: { url: data.url, name: data.name, displayName: data.displayName },
                                               targetData: { url: scene.rightImage, name: scene.rightImageName, displayName: scene.rightImageDisplayName }
                                           });
                                       } else {
                                           handleMoveImage(data.sourceSceneId, data.sourceSide, scene.id, 'right', data);
                                       }
                                       return;
                                    }
                                  }
                                } catch (err) {}
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  handleImageUpload(scene.id, e.dataTransfer.files, 'right');
                                }
                              }}`;

content = content.replace(
  /onDragOver=\{\(e\) => \{ e\.preventDefault\(\); e\.currentTarget\.classList\.add\('bg-\[#8B7CFF\]\/5'\); \}\}\s*onDragLeave=\{\(e\) => \{ e\.currentTarget\.classList\.remove\('bg-\[#8B7CFF\]\/5'\); \}\}\s*onDrop=\{\(e\) => \{[\s\S]*?if \(e\.dataTransfer\.files && e\.dataTransfer\.files\.length > 0\) \{\s*handleImageUpload\(scene\.id, e\.dataTransfer\.files, 'right'\);\s*\}\s*\}\}/,
  newRightHandlers
);

// 5. Add overlay element to both slots
const overlayHtml = `<div className="absolute inset-0 z-40 hidden drop-overlay-slot bg-[#8B7CFF]/90 backdrop-blur-sm flex-col items-center justify-center text-white pointer-events-none transition-all">
                                <div className="w-8 h-8 mb-2 rounded-full bg-white/20 flex items-center justify-center"><Icons.AddDrop /></div>
                                <span className="text-[10px] font-bold tracking-widest uppercase">Drop Image Here</span>
                             </div>`;

content = content.replace(
  /\{scene\.leftImage \? \(/,
  `${overlayHtml}\n                             {scene.leftImage ? (`
);

content = content.replace(
  /\{scene\.rightImage \? \(/,
  `${overlayHtml}\n                             {scene.rightImage ? (`
);

// 6. Make Left img draggable
const leftImgDraggable = `<img src={scene.leftImage} alt={scene.leftImageName || "Scene image"} className="w-full h-full object-cover" 
                                   draggable
                                   onDragStart={(e) => {
                                       e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'left', url: scene.leftImage, name: scene.leftImageName, displayName: scene.leftImageDisplayName }));
                                       setTimeout(() => { if (e.target) (e.target as HTMLElement).style.opacity = '0.4'; }, 0);
                                   }}
                                   onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                                 />`;
content = content.replace(
  /<img src=\{scene\.leftImage\} alt=\{scene\.leftImageName \|\| "Scene image"\} className="w-full h-full object-cover" \/>/g,
  leftImgDraggable
);

// 7. Make Right img draggable
const rightImgDraggable = `<img src={scene.rightImage} alt={scene.rightImageName || "Scene image"} className="w-full h-full object-cover" 
                                   draggable
                                   onDragStart={(e) => {
                                       e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'right', url: scene.rightImage, name: scene.rightImageName, displayName: scene.rightImageDisplayName }));
                                       setTimeout(() => { if (e.target) (e.target as HTMLElement).style.opacity = '0.4'; }, 0);
                                   }}
                                   onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                                 />`;
content = content.replace(
  /<img src=\{scene\.rightImage\} alt=\{scene\.rightImageName \|\| "Scene image"\} className="w-full h-full object-cover" \/>/g,
  rightImgDraggable
);


// 8. Add Swap Prompt Modal
const swapPromptModal = `
      {swapPrompt && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-zinc-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                  <Icons.Merge />
                </div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-black mb-2">Replace image in this slot?</h3>
                <p className="text-xs text-zinc-500">The destination slot already contains an image.</p>
             </div>
             <div className="p-2 grid grid-cols-3 gap-2 bg-zinc-50">
                <button onClick={() => setSwapPrompt(null)} className="py-3 text-xs font-bold text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => { handleSwapImage(swapPrompt.sourceSceneId, swapPrompt.sourceSide, swapPrompt.targetSceneId, swapPrompt.targetSide, swapPrompt.sourceData, swapPrompt.targetData); setSwapPrompt(null); }} className="py-3 text-xs font-bold text-[#8B7CFF] bg-[#8B7CFF]/10 hover:bg-[#8B7CFF]/20 rounded-xl transition-colors">Swap</button>
                <button onClick={() => { handleMoveImage(swapPrompt.sourceSceneId, swapPrompt.sourceSide, swapPrompt.targetSceneId, swapPrompt.targetSide, swapPrompt.sourceData); setSwapPrompt(null); }} className="py-3 text-xs font-bold text-white bg-[#8B7CFF] hover:bg-[#7a6ce0] rounded-xl transition-colors">Replace</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(/<\/div>\s*\);\s*\}\s*$/, swapPromptModal);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script Board drag and drop integrated successfully.');
