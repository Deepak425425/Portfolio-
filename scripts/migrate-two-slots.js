const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace Scene Interface
content = content.replace(
  /interface Scene \{[\s\S]*?\}/,
  `interface Scene {
  id: string;
  number: number;
  enabled: boolean;
  phrase: string;
  leftImage: string | null;
  leftImageName: string | null;
  rightImage: string | null;
  rightImageName: string | null;
  frameType?: string;
  motionPrompt: string;
  notes: string;
}`
);

// 2. Add picker state for sides
content = content.replace(
  /const \[pickerSceneId, setPickerSceneId\] = useState<string \| null>\(null\);/,
  `const [pickerSceneId, setPickerSceneId] = useState<string | null>(null);
  const [pickerSide, setPickerSide] = useState<'left' | 'right' | null>(null);`
);

// 3. Update useEffect for backwards compatibility (migrating 'image' to 'leftImage')
content = content.replace(
  /const data = JSON\.parse\(saved\);\s*if \(data\.scenes && data\.scenes\.length > 0\) \{[\s\S]*?setScenes\(data\.scenes\);/m,
  `const data = JSON.parse(saved);
        if (data.scenes && data.scenes.length > 0) {
          const migrated = data.scenes.map((s: any) => ({
            ...s,
            leftImage: s.leftImage !== undefined ? s.leftImage : (s.image || null),
            leftImageName: s.leftImageName !== undefined ? s.leftImageName : (s.imageName || null),
            rightImage: s.rightImage || null,
            rightImageName: s.rightImageName || null
          }));
          setProjectName(data.projectName || "");
          setScenes(migrated);`
);

// 4. Update Filter logic
content = content.replace(
  /if \(missingImageOnly && scene\.image\) return false;/,
  `if (missingImageOnly && (scene.leftImage || scene.rightImage)) return false;`
);

// 5. Update INITIAL_SCENE and handleAddScene
content = content.replace(
  /image: null,\s*imageName: null,/g,
  `leftImage: null,\n      leftImageName: null,\n      rightImage: null,\n      rightImageName: null,`
);

// 6. Update handleImageUpload
content = content.replace(
  /const handleImageUpload = async \(id: string, e: React\.ChangeEvent<HTMLInputElement> \| FileList\) => \{[\s\S]*?const base64 = await getBase64\(file\);\s*setScenes\(scenes\.map\(s => s\.id === id \? \{ \.\.\.s, image: base64, imageName: file\.name \} : s\)\);/m,
  `const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement> | FileList, side: 'left' | 'right') => {
    const fileList = e instanceof FileList ? e : e.target.files;
    const file = fileList?.[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await getBase64(file);
      setScenes(scenes.map(s => s.id === id ? { 
        ...s, 
        ...(side === 'left' ? { leftImage: base64, leftImageName: file.name } : { rightImage: base64, rightImageName: file.name }) 
      } : s));`
);

// 7. Update handleRemoveImage
content = content.replace(
  /const handleRemoveImage = \(id: string\) => \{[\s\S]*?\};/m,
  `const handleRemoveImage = (id: string, side: 'left' | 'right') => {
    setScenes(scenes.map(s => s.id === id ? {
      ...s,
      ...(side === 'left' ? { leftImage: null, leftImageName: null } : { rightImage: null, rightImageName: null })
    } : s));
  };`
);

// 8. Update JSX in the Tray Area
content = content.replace(
  /const isUsed = scenes\.some\(s => s\.image === img\.url\);/g,
  `const isUsed = scenes.some(s => s.leftImage === img.url || s.rightImage === img.url);`
);

// 9. Update header count
content = content.replace(
  /\{scenes\.filter\(s => s\.image\)\.length\}/g,
  `{scenes.filter(s => s.leftImage || s.rightImage).length}`
);
content = content.replace(
  /className=\{s\.image \? "text-\\[#8B7CFF\\]" : ""\}/g,
  `className={(s.leftImage || s.rightImage) ? "text-[#8B7CFF]" : ""}`
);

// 9.5 Update Picker Logic in Tray
content = content.replace(
  /handleUpdateScene\(pickerSceneId, 'image', img\.url\);\s*handleUpdateScene\(pickerSceneId, 'imageName', img\.name\);\s*setPickerSceneId\(null\);/g,
  `handleUpdateScene(pickerSceneId, pickerSide === 'left' ? 'leftImage' : 'rightImage', img.url);
                        handleUpdateScene(pickerSceneId, pickerSide === 'left' ? 'leftImageName' : 'rightImageName', img.name);
                        setPickerSceneId(null);
                        setPickerSide(null);`
);


// 10. Update PDF Export block
const pdfRegex = /const drawHeader = \(\) => \{[\s\S]*?cursorY \+= Math\.max\(120, textY - cursorY\);\s*\}/m;
const newPdfLogic = `
      const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text("GROTON AI", margin, cursorY);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("SCRIPT BOARD", margin, cursorY + 7);
        
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(\`Project: \${projectName || "Untitled"}\`, margin, cursorY + 16);
        doc.text(\`Date: \${new Date().toLocaleDateString()}\`, margin, cursorY + 21);
        
        // Subtle divider
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(margin, cursorY + 26, pageWidth - margin, cursorY + 26);
        
        cursorY += 40;
      };

      const drawFooter = (page: number) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(\`© 2024 Groton AI Studio | A Creative Venture by Grafly Studio  -  Page \${page}\`, pageWidth / 2, pageHeight - 10, { align: "center" });
      };

      drawHeader();
      drawFooter(pageNum);

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        
        const colLeft = margin;
        const imgBoxW = 90; // total width for images column
        const halfImgW = 42;
        const gap = 6;
        const colRight = margin + imgBoxW + 15;
        const textWidth = pageWidth - colRight - margin;
        
        const title = \`SCENE \${scene.number < 10 ? '0'+scene.number : scene.number}\`;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const framesText = doc.splitTextToSize((scene.leftImageName ? "Left: " + scene.leftImageName : "Left: (None)") + " | " + (scene.rightImageName ? "Right: " + scene.rightImageName : "Right: (None)"), textWidth);
        const phraseText = doc.splitTextToSize(scene.phrase || "(Empty)", textWidth);
        const motionText = doc.splitTextToSize(scene.motionPrompt || "(Empty)", textWidth);
        const notesText = doc.splitTextToSize(scene.notes || "(Empty)", textWidth);
        
        const textHeight = 
          (5 + framesText.length * 4) +
          (10 + phraseText.length * 4) +
          (10 + motionText.length * 4) +
          (10 + notesText.length * 4) + 15;
        
        const blockHeight = Math.max(120, textHeight) + 30; 
        
        if (cursorY + blockHeight > pageHeight - 20) {
          doc.addPage();
          pageNum++;
          cursorY = margin;
          drawFooter(pageNum);
          drawHeader();
        }
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 7;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, cursorY);
        
        cursorY += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;
        
        // Render Images (LEFT and RIGHT)
        const renderImageSlot = async (imgData: string | null, x: number, y: number, w: number, label: string) => {
           if (imgData) {
             try {
               const img = new Image();
               img.crossOrigin = "Anonymous";
               img.src = imgData;
               await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
               const aspect = img.width / img.height;
               let finalW = w;
               let finalH = finalW / aspect;
               if (finalH > 130) { finalH = 130; finalW = 130 * aspect; }
               doc.addImage(img, "JPEG", x, y + 5, finalW, finalH);
               doc.setDrawColor(230, 230, 230);
               doc.rect(x, y + 5, finalW, finalH);
             } catch (e) {
               doc.setDrawColor(230, 230, 230);
               doc.rect(x, y + 5, w, 60);
               doc.setTextColor(150, 150, 150);
               doc.setFontSize(7);
               doc.text("ERROR", x + 5, y + 35);
             }
           } else {
             doc.setDrawColor(230, 230, 230);
             doc.rect(x, y + 5, w, 60);
             doc.setTextColor(150, 150, 150);
             doc.setFont("helvetica", "bold");
             doc.setFontSize(8);
             doc.text("EMPTY", x + 10, y + 35);
           }
           doc.setFont("helvetica", "bold");
           doc.setFontSize(7);
           doc.setTextColor(120, 120, 120);
           doc.text(label, x, y);
        };

        await renderImageSlot(scene.leftImage, margin, cursorY, halfImgW, "LEFT IMAGE");
        await renderImageSlot(scene.rightImage, margin + halfImgW + gap, cursorY, halfImgW, "RIGHT IMAGE");
        
        // Render Text Columns
        let textY = cursorY + 5;
        const renderSection = (label: string, textLines: string[]) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text(label, colRight, textY);
          textY += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(30, 30, 30);
          doc.text(textLines, colRight, textY);
          textY += (textLines.length * 4) + 6;
        };

        renderSection("FILES", framesText);
        renderSection("SCRIPT / ACTION", phraseText);
        renderSection("MOTION / DIRECTION", motionText);
        renderSection("NOTES", notesText);
        
        cursorY += Math.max(120, textY - cursorY);
      }`;
content = content.replace(pdfRegex, newPdfLogic);

// 11. Update JSX Image Drop Zones in Main Canvas
const startStr = '<div className="w-full md:w-[320px] shrink-0 flex flex-col gap-3">';
let startImageSlot = content.indexOf(startStr);
let endImageSlot = content.indexOf('</div>', content.indexOf('{scene.imageName', startImageSlot));
if (startImageSlot !== -1 && endImageSlot !== -1) {
    const endStr = content.substring(startImageSlot, content.indexOf('</div>', endImageSlot + 1) + 6);
    content = content.replace(endStr, '__IMAGE_SLOT_REPLACEMENT__');
}

const newImageZones = `<div className="w-full lg:w-[360px] shrink-0 flex gap-4">
                        {/* LEFT IMAGE SLOT */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 text-center">Left Image</label>
                          <div className="w-full aspect-[4/5] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl relative overflow-hidden group/img transition-colors hover:border-[#8B7CFF]/50"
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-[#8B7CFF]/5'); }}
                              onDragLeave={(e) => { e.currentTarget.classList.remove('bg-[#8B7CFF]/5'); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-[#8B7CFF]/5');
                                try {
                                  const dataStr = e.dataTransfer.getData('application/json');
                                  if (dataStr) {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'TRAY_IMAGE') {
                                      handleUpdateScene(scene.id, 'leftImage', data.url);
                                      handleUpdateScene(scene.id, 'leftImageName', data.name);
                                      return;
                                    }
                                  }
                                } catch (err) {}
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  handleImageUpload(scene.id, e.dataTransfer.files, 'left');
                                }
                              }}
                          >
                             {scene.leftImage ? (
                               <>
                                 <img src={scene.leftImage} alt={scene.leftImageName || "Scene image"} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                    <label className="text-[9px] uppercase tracking-widest font-bold bg-white text-black px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-100 transition-colors">
                                      Replace
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e, 'left')} />
                                    </label>
                                    <button onClick={() => { setPickerSceneId(scene.id); setPickerSide('left'); }} className="text-[9px] uppercase tracking-widest font-bold bg-[#8B7CFF] text-white px-2 py-1.5 rounded hover:bg-[#7a6ce0] transition-colors">
                                      Pick from Tray
                                    </button>
                                    <button onClick={() => handleRemoveImage(scene.id, 'left')} className="text-[9px] uppercase tracking-widest font-bold text-white hover:text-red-400 transition-colors mt-2">
                                      Remove
                                    </button>
                                 </div>
                               </>
                             ) : (
                               <label className="w-full h-full flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:text-[#8B7CFF] transition-colors p-2 text-center">
                                  <Icons.Image />
                                  <span className="text-[9px] uppercase font-bold tracking-widest mt-2">Add Image</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e, 'left')} />
                               </label>
                             )}
                          </div>
                          {!scene.leftImage && (
                            <button onClick={() => { setPickerSceneId(scene.id); setPickerSide('left'); }} className="text-[9px] font-bold tracking-widest uppercase text-[#8B7CFF] hover:text-[#7a6ce0] text-center w-full mt-1">
                              Pick from Tray
                            </button>
                          )}
                        </div>

                        {/* RIGHT IMAGE SLOT */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 text-center">Right Image</label>
                          <div className="w-full aspect-[4/5] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl relative overflow-hidden group/img transition-colors hover:border-[#8B7CFF]/50"
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-[#8B7CFF]/5'); }}
                              onDragLeave={(e) => { e.currentTarget.classList.remove('bg-[#8B7CFF]/5'); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-[#8B7CFF]/5');
                                try {
                                  const dataStr = e.dataTransfer.getData('application/json');
                                  if (dataStr) {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'TRAY_IMAGE') {
                                      handleUpdateScene(scene.id, 'rightImage', data.url);
                                      handleUpdateScene(scene.id, 'rightImageName', data.name);
                                      return;
                                    }
                                  }
                                } catch (err) {}
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  handleImageUpload(scene.id, e.dataTransfer.files, 'right');
                                }
                              }}
                          >
                             {scene.rightImage ? (
                               <>
                                 <img src={scene.rightImage} alt={scene.rightImageName || "Scene image"} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                    <label className="text-[9px] uppercase tracking-widest font-bold bg-white text-black px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-100 transition-colors">
                                      Replace
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e, 'right')} />
                                    </label>
                                    <button onClick={() => { setPickerSceneId(scene.id); setPickerSide('right'); }} className="text-[9px] uppercase tracking-widest font-bold bg-[#8B7CFF] text-white px-2 py-1.5 rounded hover:bg-[#7a6ce0] transition-colors">
                                      Pick from Tray
                                    </button>
                                    <button onClick={() => handleRemoveImage(scene.id, 'right')} className="text-[9px] uppercase tracking-widest font-bold text-white hover:text-red-400 transition-colors mt-2">
                                      Remove
                                    </button>
                                 </div>
                               </>
                             ) : (
                               <label className="w-full h-full flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:text-[#8B7CFF] transition-colors p-2 text-center">
                                  <Icons.Image />
                                  <span className="text-[9px] uppercase font-bold tracking-widest mt-2">Add Image</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e, 'right')} />
                               </label>
                             )}
                          </div>
                          {!scene.rightImage && (
                            <button onClick={() => { setPickerSceneId(scene.id); setPickerSide('right'); }} className="text-[9px] font-bold tracking-widest uppercase text-[#8B7CFF] hover:text-[#7a6ce0] text-center w-full mt-1">
                              Pick from Tray
                            </button>
                          )}
                        </div>
                      </div>`;

content = content.replace('__IMAGE_SLOT_REPLACEMENT__', newImageZones);

// 12. Add Picker Modal at the end of the component
const pickerModal = `
      {pickerSceneId && pickerSide && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
             <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <h3 className="text-sm font-bold tracking-widest uppercase text-black">Select from Project Assets</h3>
                <button onClick={() => { setPickerSceneId(null); setPickerSide(null); }} className="p-2 text-zinc-400 hover:text-black transition-colors">
                  <Icons.Close />
                </button>
             </div>
             <div className="p-6 overflow-y-auto grid grid-cols-3 md:grid-cols-4 gap-4">
                {trayImages.length === 0 && (
                  <div className="col-span-full text-center text-zinc-400 text-sm py-10">No assets in project tray. Add some in the sidebar.</div>
                )}
                {trayImages.map(img => (
                  <div key={img.id} 
                       onClick={() => {
                         handleUpdateScene(pickerSceneId, pickerSide === 'left' ? 'leftImage' : 'rightImage', img.url);
                         handleUpdateScene(pickerSceneId, pickerSide === 'left' ? 'leftImageName' : 'rightImageName', img.name);
                         setPickerSceneId(null);
                         setPickerSide(null);
                       }}
                       className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[#8B7CFF] cursor-pointer transition-colors relative group"
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#8B7CFF]/0 group-hover:bg-[#8B7CFF]/10 transition-colors"></div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\}\s*$/, pickerModal);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script Board migrated to two-slot architecture successfully.');
