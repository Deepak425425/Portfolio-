const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove INITIAL_SCENES and add getSingleScene
const initialSceneRegex = /const INITIAL_SCENES:\s*Scene\[\]\s*=\s*\[\];/;
const getSingleSceneFn = `const getSingleScene = (): Scene[] => [{
  id: \`scene-\${Date.now()}\`,
  number: 1,
  enabled: true,
  phrase: "",
  leftImageAssetId: null,
  rightImageAssetId: null,
  motionPrompt: "",
  notes: ""
}];`;
content = content.replace(initialSceneRegex, getSingleSceneFn);

// Replace useState<Scene[]>(INITIAL_SCENES)
content = content.replace(/useState<Scene\[\]>\(INITIAL_SCENES\)/, `useState<Scene[]>([])`);

// 2. Refactor useEffect hydration
const oldUseEffectRegex = /useEffect\(\(\) => \{\s*const saved = localStorage\.getItem\('groton-script-board-autosave'\);[\s\S]*?setIsLoaded\(true\);\s*\}, \[\]\);/;

const newUseEffect = `useEffect(() => {
    const saved = localStorage.getItem('groton-script-board-autosave');
    let loadedScenes: Scene[] = [];
    let loadedAssets: ProjectAsset[] = [];
    let loadedName = "";
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.scenes && data.scenes.length > 0) {
          loadedName = data.projectName || "";
          loadedAssets = data.projectAssets || data.trayImages || [];
          
          let migrated = data.scenes.map((s: any) => ({
            ...s,
            leftImage: s.leftImage !== undefined ? s.leftImage : (s.image || null),
            leftImageName: s.leftImageName !== undefined ? s.leftImageName : (s.imageName || null),
            leftImageDisplayName: s.leftImageDisplayName || (s.leftImage || s.image ? "1st Frame" : null),
            rightImage: s.rightImage || null,
            rightImageName: s.rightImageName || null,
            rightImageDisplayName: s.rightImageDisplayName || (s.rightImage ? "2nd Frame" : null)
          }));
          
          const isSceneEmpty = (s: any) => !s.leftImageAssetId && !s.rightImageAssetId && !(s.phrase||"").trim() && !(s.motionPrompt||"").trim() && !(s.notes||"").trim();
          
          while(migrated.length > 1) {
            const lastScene = migrated[migrated.length - 1];
            if (isSceneEmpty(lastScene)) {
               migrated.pop();
            } else {
               break;
            }
          }
          loadedScenes = migrated;
        }
      } catch (e) {}
    }
    
    if (loadedScenes.length === 0) {
      loadedScenes = getSingleScene();
    }
    
    setProjectName(loadedName);
    setScenes(loadedScenes);
    setProjectAssets(loadedAssets);
    setIsLoaded(true);
  }, []);`;

content = content.replace(oldUseEffectRegex, newUseEffect);

// 3. Fix handleClearBoard
const oldClearBoard = `  const handleClearBoard = () => {
    if(confirm("Are you sure you want to clear the board? All unsaved progress will be lost.")) {
      setScenes([]);
      setProjectAssets([]);
      setProjectName("");
    }
  };`;
const newClearBoard = `  const handleClearBoard = () => {
    if(confirm("Are you sure you want to clear the board? All unsaved progress will be lost.")) {
      setScenes(getSingleScene());
      setProjectAssets([]);
      setProjectName("");
    }
  };`;
content = content.replace(oldClearBoard, newClearBoard);

// 4. Fix PDF Export to only use valid scenes
const oldPdfLoopRegex = /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*scenes\.length;\s*i\+\+\s*\)\s*\{/;
const newPdfLoop = `const isSceneEmpty = (s: any) => !s.leftImageAssetId && !s.rightImageAssetId && !(s.phrase||"").trim() && !(s.motionPrompt||"").trim() && !(s.notes||"").trim();
      const validScenes = scenes.filter(s => !isSceneEmpty(s));
      for (let i = 0; i < validScenes.length; i++) {
        const scene = validScenes[i];
        const sceneAssetLeft = projectAssets.find(a => a.id === scene.leftImageAssetId);
        const sceneAssetRight = projectAssets.find(a => a.id === scene.rightImageAssetId);`;

// The script will replace the loop header and the first two asset definitions inside it to make sure we don't duplicate them
const oldPdfLoopFullRegex = /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*scenes\.length;\s*i\+\+\s*\)\s*\{\s*const\s+scene\s*=\s*scenes\[i\];\s*const\s+sceneAssetLeft\s*=\s*projectAssets\.find\(a\s*=>\s*a\.id\s*===\s*scene\.leftImageAssetId\);\s*const\s+sceneAssetRight\s*=\s*projectAssets\.find\(a\s*=>\s*a\.id\s*===\s*scene\.rightImageAssetId\);/;

content = content.replace(oldPdfLoopFullRegex, newPdfLoop);

fs.writeFileSync(filePath, content, 'utf8');
