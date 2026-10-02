const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Icons
const newIcons = `
  Filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  MoreHorizontal: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
`;
content = content.replace(/Close: \(\) => .*?,/g, (match) => match + newIcons);

// 2. Add New State Variables
const stateRegex = /const \[isExportOpen, setIsExportOpen\] = useState\(false\);/;
const newState = `const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);`;
content = content.replace(stateRegex, newState);

// 3. Replace the entire return statement
const returnStartIndex = content.indexOf('return (\r\n    <div className="min-h-screen bg-white') !== -1 
  ? content.indexOf('return (\r\n    <div className="min-h-screen bg-white') 
  : content.indexOf('return (\n    <div className="min-h-screen bg-white');
if (returnStartIndex === -1) {
  console.error("Could not find start index.");
  process.exit(1);
}
const newReturn = `return (
    <div className="h-screen bg-zinc-50 flex flex-col font-sans text-gray-800 overflow-hidden selection:bg-[#8B7CFF] selection:text-white">
      
      {/* NEW HEADER */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-6">
           <div className="font-bold tracking-[0.2em] text-xs md:text-sm uppercase text-black flex items-center gap-2">
             <div className="w-2 h-2 bg-[#8B7CFF] rounded-full"></div>
             GROTON
           </div>
           <div className="h-5 w-px bg-zinc-200 hidden md:block"></div>
           <input 
             type="text" 
             value={projectName}
             onChange={(e) => setProjectName(e.target.value)}
             placeholder="Untitled Script Board"
             className="font-serif text-lg md:text-xl bg-transparent border-none outline-none focus:ring-0 text-black placeholder-zinc-400 w-48 md:w-64"
           />
         </div>

         <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
           <span className="text-black">Project</span>
           {scenes.map(s => (
             <React.Fragment key={s.id}>
               <span className="opacity-30">—</span>
               <span className={s.image ? "text-[#8B7CFF]" : ""}>
                 {s.number.toString().padStart(2, '0')}
               </span>
             </React.Fragment>
           ))}
         </div>

         <div className="flex items-center gap-2 md:gap-3 relative" ref={exportRef}>
           {showSavedIndicator && <span className="hidden md:inline text-[10px] uppercase tracking-widest font-bold text-[#8B7CFF] mr-2">Saved</span>}
           
           <div className="hidden md:flex items-center bg-zinc-100 rounded-lg p-1.5 border border-zinc-200 focus-within:border-[#8B7CFF] transition-colors">
             <Icons.Search />
             <input 
               type="text" 
               placeholder="Search..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none outline-none text-xs w-24 focus:w-40 transition-all px-2 font-medium placeholder-zinc-400 text-black"
             />
           </div>

           <div className="relative">
             <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={\`p-2 rounded-lg transition-colors \${isFilterOpen ? 'bg-zinc-200 text-black' : 'hover:bg-zinc-100 text-zinc-500'}\`}>
                <Icons.Filter />
             </button>
             {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-xl rounded-xl p-4 z-50 flex flex-col gap-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-1">Filters</span>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-medium text-zinc-700 group-hover:text-black">Missing Image</span>
                    <input type="checkbox" checked={missingImageOnly} onChange={e => setMissingImageOnly(e.target.checked)} className="rounded border-zinc-300 text-[#8B7CFF] focus:ring-[#8B7CFF]" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-medium text-zinc-700 group-hover:text-black">Has Notes</span>
                    <input type="checkbox" checked={notesOnly} onChange={e => setNotesOnly(e.target.checked)} className="rounded border-zinc-300 text-[#8B7CFF] focus:ring-[#8B7CFF]" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-medium text-zinc-700 group-hover:text-black">Has Motion</span>
                    <input type="checkbox" checked={motionRefOnly} onChange={e => setMotionRefOnly(e.target.checked)} className="rounded border-zinc-300 text-[#8B7CFF] focus:ring-[#8B7CFF]" />
                  </label>
                </div>
             )}
           </div>

           <button onClick={() => setIsExportOpen(!isExportOpen)} className={\`p-2 rounded-lg transition-colors flex items-center gap-1.5 \${isExportOpen ? 'bg-zinc-200 text-black' : 'hover:bg-zinc-100 text-zinc-600'}\`}>
              <Icons.Export />
              <span className="text-xs font-bold hidden sm:inline">EXPORT</span>
           </button>
           
           {isExportOpen && (
             <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-xl rounded-xl overflow-hidden py-2 z-50">
               <button onClick={handleExportPDF} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export as PDF</button>
               <button onClick={() => { setIsExportOpen(false); handleExportProject(); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">Export Project Data</button>
               <div className="h-px bg-zinc-100 my-2"></div>
               <label className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium cursor-pointer block text-zinc-600">
                 Import Project...
                 <input type="file" accept=".json" onChange={handleImport} className="hidden" />
               </label>
               <button onClick={() => { setIsExportOpen(false); handleSave(); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-zinc-600">Save Locally</button>
             </div>
           )}
           
           <div className="relative">
              <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={\`p-2 rounded-lg transition-colors \${isMoreMenuOpen ? 'bg-zinc-200 text-black' : 'hover:bg-zinc-100 text-zinc-500'}\`}>
                <Icons.MoreHorizontal />
              </button>
              {isMoreMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-xl rounded-xl overflow-hidden py-2 z-50">
                   <button onClick={() => { setIsMoreMenuOpen(false); clearEmojis(); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm text-zinc-700">Remove all emojis</button>
                   <button onClick={() => { setIsMoreMenuOpen(false); clearMotion(); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm text-zinc-700">Clear all motion prompts</button>
                   <div className="h-px bg-zinc-100 my-2"></div>
                   <button onClick={() => { setIsMoreMenuOpen(false); handleClearBoard(); }} className="w-full text-left px-5 py-2.5 hover:bg-red-50 text-red-600 text-sm font-bold">Clear Entire Board</button>
                </div>
              )}
           </div>
         </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ASSETS PANEL */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-zinc-200 flex-col shrink-0 z-10">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
             <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">Project Assets</h3>
             <label className="text-[10px] font-bold tracking-widest uppercase bg-zinc-200 hover:bg-zinc-300 px-3 py-1.5 rounded cursor-pointer transition-colors text-black shadow-sm">
               + Add
               <input type="file" multiple accept="image/*" className="hidden" onChange={handleTrayUpload} />
             </label>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative"
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault();
                 if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                   handleTrayUpload(e.dataTransfer.files);
                 }
               }}
          >
             {trayImages.length === 0 ? (
               <div className="text-xs text-zinc-400 p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl mt-4">
                 Drop images here to build your asset library.
               </div>
             ) : (
               trayImages.map(img => {
                  const isUsed = scenes.some(s => s.image === img.url);
                  return (
                    <div key={img.id} 
                         className="flex items-center gap-3 p-2 bg-white border border-zinc-200 rounded-xl hover:border-[#8B7CFF]/50 hover:shadow-md transition-all group cursor-grab"
                         draggable 
                         onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'TRAY_IMAGE', url: img.url, name: img.name }))}
                    >
                       <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-100 relative">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={img.url} className="w-full h-full object-cover" draggable={false}/>
                       </div>
                       <div className="flex flex-col overflow-hidden w-full">
                         <span className="text-[11px] font-medium truncate text-black mb-0.5" title={img.name}>{img.name}</span>
                         <span className={\`text-[9px] uppercase font-bold tracking-widest \${isUsed ? 'text-[#8B7CFF]' : 'text-zinc-400'}\`}>
                           {isUsed ? 'In Scene' : 'Unassigned'}
                         </span>
                       </div>
                       <button onClick={() => handleRemoveTrayImage(img.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                         <Icons.Close />
                       </button>
                    </div>
                  );
               })
             )}
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main 
          className="flex-1 overflow-y-auto bg-zinc-50 flex flex-col items-center py-12 px-4 md:px-8 lg:px-16 relative"
          onClick={() => setActiveMenuId(null)}
        >
           <div className="w-full max-w-[900px] flex flex-col gap-10 pb-32">
              
              {filteredScenes.length === 0 && (
                <div className="text-center py-20 text-zinc-400 font-medium">No scenes match your current filters.</div>
              )}

              {filteredScenes.map((scene, idx) => (
                <div key={scene.id} className={\`bg-white border \${scene.enabled ? 'border-zinc-200 shadow-sm' : 'border-zinc-200 opacity-60'} rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative group transition-opacity\`}>
                   
                   {/* Context Menu Button */}
                   <div className="absolute top-6 right-6" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === scene.id ? null : scene.id)}
                        className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <Icons.MoreHorizontal />
                      </button>
                      
                      {activeMenuId === scene.id && (
                        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-zinc-200 shadow-xl rounded-xl overflow-hidden py-2 z-30">
                           <button onClick={() => { setActiveMenuId(null); handleUpdateScene(scene.id, 'enabled', !scene.enabled); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">
                             {scene.enabled ? 'Disable Scene' : 'Enable Scene'}
                           </button>
                           <button onClick={() => { setActiveMenuId(null); handleAddScene(idx); }} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-black">
                             Duplicate
                           </button>
                           <div className="h-px bg-zinc-100 my-2"></div>
                           <button onClick={() => { setActiveMenuId(null); handleMoveScene(idx, 'up'); }} disabled={idx === 0} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-zinc-700 disabled:opacity-30">Move Up</button>
                           <button onClick={() => { setActiveMenuId(null); handleMoveScene(idx, 'down'); }} disabled={idx === scenes.length - 1} className="w-full text-left px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium text-zinc-700 disabled:opacity-30">Move Down</button>
                           <div className="h-px bg-zinc-100 my-2"></div>
                           <button onClick={() => { setActiveMenuId(null); handleDeleteScene(scene.id); }} className="w-full text-left px-5 py-2.5 hover:bg-red-50 text-sm font-bold text-red-600">Delete Scene</button>
                        </div>
                      )}
                   </div>

                   {/* Scene Header */}
                   <div className="flex items-end justify-between border-b border-zinc-100 pb-4 pr-12">
                      <div className="flex items-center gap-4">
                        <h2 className="font-serif text-2xl md:text-3xl text-black">SCENE {scene.number.toString().padStart(2, '0')}</h2>
                        <div className="text-[10px] font-mono font-bold tracking-widest bg-zinc-100 text-zinc-500 px-2 py-1 rounded">00:00 – 00:04</div>
                      </div>
                   </div>

                   {/* Scene Body (2 Columns) */}
                   <div className="flex flex-col md:flex-row gap-8">
                      
                      {/* Left Column: Image Area */}
                      <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-3">
                         <div className="w-full aspect-[4/3] md:aspect-[4/5] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl relative overflow-hidden group/img transition-colors hover:border-[#8B7CFF]/50"
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
                                      handleUpdateScene(scene.id, 'image', data.url);
                                      handleUpdateScene(scene.id, 'imageName', data.name);
                                      return;
                                    }
                                  }
                                } catch (err) {}
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  handleImageUpload(scene.id, e.dataTransfer.files);
                                }
                              }}
                         >
                            {scene.image ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={scene.image} alt={scene.imageName || "Scene image"} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                   <label className="text-xs uppercase tracking-widest font-bold bg-white text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors">
                                     Replace Image
                                     <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e)} />
                                   </label>
                                   <button onClick={() => handleRemoveImage(scene.id)} className="text-[10px] uppercase tracking-widest font-bold text-white hover:text-red-400 transition-colors">
                                     Remove
                                   </button>
                                </div>
                              </>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:text-[#8B7CFF] transition-colors p-6 text-center">
                                 <Icons.Image />
                                 <span className="text-[10px] uppercase font-bold tracking-widest mt-3 text-inherit">Drop Image Here</span>
                                 <span className="text-xs font-medium text-zinc-500 mt-1">or click to browse</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e)} />
                              </label>
                            )}
                         </div>
                         {scene.imageName && (
                           <div className="text-[10px] font-medium text-zinc-400 truncate w-full px-1 text-center">
                             {scene.imageName}
                           </div>
                         )}
                      </div>

                      {/* Right Column: Text Inputs */}
                      <div className="flex-1 flex flex-col gap-6">
                         <div className="flex flex-col group/input">
                           <label className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-400 mb-2 transition-colors group-focus-within/input:text-[#8B7CFF]">Scene Action / Dialogue</label>
                           <textarea 
                             value={scene.phrase}
                             onChange={(e) => handleUpdateScene(scene.id, 'phrase', e.target.value)}
                             className="w-full min-h-[80px] p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-black resize-none outline-none focus:border-[#8B7CFF] focus:bg-white transition-all shadow-sm"
                             placeholder="Describe the action or insert dialogue here..."
                           />
                         </div>

                         <div className="flex flex-col group/input">
                           <label className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-400 mb-2 transition-colors group-focus-within/input:text-[#8B7CFF]">Motion / Direction</label>
                           <textarea 
                             value={scene.motionPrompt}
                             onChange={(e) => handleUpdateScene(scene.id, 'motionPrompt', e.target.value)}
                             className="w-full min-h-[80px] p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-black resize-none outline-none focus:border-[#8B7CFF] focus:bg-white transition-all shadow-sm"
                             placeholder="Camera movement, lighting, subject motion..."
                           />
                         </div>

                         <div className="flex flex-col group/input">
                           <label className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-400 mb-2 transition-colors group-focus-within/input:text-[#8B7CFF]">Internal Notes</label>
                           <textarea 
                             value={scene.notes}
                             onChange={(e) => handleUpdateScene(scene.id, 'notes', e.target.value)}
                             className="w-full min-h-[60px] p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 resize-none outline-none focus:border-[#8B7CFF] focus:bg-white transition-all italic shadow-sm"
                             placeholder="Props needed, locations, reminders..."
                           />
                         </div>
                      </div>
                   </div>
                </div>
              ))}

              <button 
                onClick={() => handleAddScene(scenes.length - 1)} 
                className="w-full py-8 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 hover:border-[#8B7CFF] hover:text-[#8B7CFF] hover:bg-[#8B7CFF]/5 transition-all font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 mt-4"
              >
                 <Icons.Plus /> Create New Scene
              </button>
           </div>
        </main>

      </div>
    </div>
  );
}`;

content = content.substring(0, returnStartIndex) + newReturn;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script Board Redesigned successfully.');
