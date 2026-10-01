"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Types ---
interface Scene {
  id: string;
  number: number;
  enabled: boolean;
  phrase: string;
  image: string | null;
  imageName: string | null;
  motionPrompt: string;
  notes: string;
}

interface TrayImage {
  id: string;
  url: string;
  name: string;
}

interface BoardData {
  projectName: string;
  scenes: Scene[];
  trayImages?: TrayImage[];
}

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Icons ---
const Icons = {
  ScriptBoard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  Pencil: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  ZoomOut: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="8" x2="14" y1="11" y2="11"/></svg>,
  ZoomIn: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Drag: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 cursor-grab"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>,
  Up: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-800"><path d="m18 15-6-6-6 6"/></svg>,
  Down: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-800"><path d="m6 9 6 6 6-6"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-800"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Scissors: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>,
  Merge: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 8 5-5 5 5"/><path d="M12 3v18"/><path d="m7 16 5 5 5-5"/></svg>,
  Beat: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  AddDrop: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="12" y2="12"/><line x1="12" x2="12" y1="9" y2="15"/></svg>,
  FileAdd: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  Clear: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>,
  Image: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Save: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Close: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>,
  Import: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Export: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
};

const INITIAL_SCENES: Scene[] = [];

export default function ScriptBoard() {
  const router = useRouter();
  
  // --- State ---
  const [projectName, setProjectName] = useState("");
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [trayImages, setTrayImages] = useState<TrayImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickerSceneId, setPickerSceneId] = useState<string | null>(null);
  
  // Toggles
  const [multiFrame, setMultiFrame] = useState(false);
  const [missingImageOnly, setMissingImageOnly] = useState(false);
  const [notesOnly, setNotesOnly] = useState(false);
  const [motionRefOnly, setMotionRefOnly] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);

  // --- Derived Data ---
  const filteredScenes = useMemo(() => {
    return scenes.filter(scene => {
      // Toggles
      if (missingImageOnly && scene.image) return false;
      if (notesOnly && !scene.notes) return false;
      if (motionRefOnly && !scene.motionPrompt) return false;
      if (selectedOnly && !scene.enabled) return false;
      
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !scene.phrase.toLowerCase().includes(query) &&
          !scene.motionPrompt.toLowerCase().includes(query) &&
          !scene.notes.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [scenes, missingImageOnly, notesOnly, motionRefOnly, selectedOnly, searchQuery]);

  // --- Handlers ---
  const handleAddScene = (index: number) => {
    const newScenes = [...scenes];
    newScenes.splice(index + 1, 0, {
      id: `scene-${Date.now()}`,
      number: 0,
      enabled: true,
      phrase: "",
      image: null,
      imageName: null,
      motionPrompt: "",
      notes: ""
    });
    setScenes(newScenes.map((s, idx) => ({ ...s, number: idx + 1 })));
  };

  const handleDeleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    setScenes(scenes.filter(s => s.id !== id).map((s, idx) => ({ ...s, number: idx + 1 })));
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === scenes.length - 1) return;
    
    const newScenes = [...scenes];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newScenes[index];
    newScenes[index] = newScenes[swapIndex];
    newScenes[swapIndex] = temp;
    
    setScenes(newScenes.map((s, idx) => ({ ...s, number: idx + 1 })));
  };

  const handleUpdateScene = (id: string, field: keyof Scene, value: any) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const fileList = e instanceof FileList ? e : e.target.files;
    const file = fileList?.[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await getBase64(file);
      setScenes(scenes.map(s => s.id === id ? { ...s, image: base64, imageName: file.name } : s));
      
      // Auto-add to tray if new
      setTrayImages(prev => {
        if (!prev.find(t => t.url === base64)) {
          return [...prev, { id: `tray-${Date.now()}`, url: base64, name: file.name }];
        }
        return prev;
      });
    }
  };
  
  const handleTrayUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = Array.from(e instanceof FileList ? e : (e.target.files || []));
    if (!files.length) return;
    
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const newImages = await Promise.all(imageFiles.map(async f => ({
      id: `tray-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: await getBase64(f),
      name: f.name
    })));
    
    setTrayImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveTrayImage = (id: string) => {
    setTrayImages(prev => prev.filter(t => t.id !== id));
  };
  
  const handleRemoveImage = (id: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, image: null, imageName: null } : s));
  };

  // Toolbar Actions
  const clearEmojis = () => {
    // Simple naive regex to clear emojis
    const clearStr = (str: string) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    setScenes(scenes.map(s => ({
      ...s,
      phrase: clearStr(s.phrase),
      motionPrompt: clearStr(s.motionPrompt),
      notes: clearStr(s.notes)
    })));
  };

  const clearMotion = () => {
    if(confirm("Clear all motion prompts?")) {
      setScenes(scenes.map(s => ({ ...s, motionPrompt: "" })));
    }
  };

  const handleExportProject = () => {
    const data: BoardData = { projectName, scenes, trayImages };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = projectName ? `${projectName.replace(/\s+/g, '-')}-project.json` : "script-board-project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let cursorY = margin;
      let pageNum = 1;

      const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("GROTON AI", margin, cursorY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("SCRIPT BOARD", margin, cursorY + 6);
        
        doc.setFontSize(10);
        doc.text(`Project: ${projectName || "Untitled"}`, margin, cursorY + 12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, cursorY + 17);
        
        cursorY += 30;
      };

      const drawFooter = (page: number) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`GROTON AI SCRIPT BOARD - Page ${page}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      };

      drawHeader();
      drawFooter(pageNum);

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        
        // Calculate required height for this scene
        const colLeft = margin;
        const imgBoxW = 70;
        const colRight = margin + imgBoxW + 10;
        const textWidth = pageWidth - colRight - margin;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const title = `SCENE ${scene.number < 10 ? '0'+scene.number : scene.number}`;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        const phraseLabel = "SCRIPT / PHRASE";
        const phraseText = doc.splitTextToSize(scene.phrase || "Not provided", textWidth);
        
        const motionLabel = "MOTION PROMPT";
        const motionText = doc.splitTextToSize(scene.motionPrompt || "Not provided", textWidth);
        
        const notesLabel = "NOTES";
        const notesText = doc.splitTextToSize(scene.notes || "Not provided", textWidth);
        
        const textHeight = 5 + (phraseText.length * 4) + 10 + (motionText.length * 4) + 10 + (notesText.length * 4) + 10;
        const blockHeight = Math.max(90, textHeight) + 15;
        
        if (cursorY + blockHeight > pageHeight - 20) {
          doc.addPage();
          pageNum++;
          cursorY = margin;
          drawFooter(pageNum);
        }
        
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, cursorY, pageWidth - margin*2, blockHeight - 10);
        
        let finalW = 0;
        let finalH = 0;
        if (scene.image) {
          try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = scene.image;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            
            const aspect = img.width / img.height;
            finalW = imgBoxW - 10;
            finalH = finalW / aspect;
            
            if (finalH > 80) {
               finalH = 80;
               finalW = 80 * aspect;
            }
            
            const xOffset = margin + 5 + (imgBoxW - 10 - finalW) / 2;
            const yOffset = cursorY + 5 + (80 - finalH) / 2;
            
            doc.addImage(img, "JPEG", xOffset, yOffset, finalW, finalH);
            
            doc.setDrawColor(220, 220, 220);
            doc.rect(xOffset, yOffset, finalW, finalH);
          } catch (e) {
            doc.setTextColor(150, 150, 150);
            doc.text("Image error", margin + 10, cursorY + 40);
          }
        } else {
          doc.setDrawColor(220, 220, 220);
          doc.rect(margin + 5, cursorY + 5, imgBoxW - 10, 80);
          doc.setTextColor(150, 150, 150);
          doc.text("No image", margin + 25, cursorY + 45);
        }
        
        let textY = cursorY + 10;
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(title, colRight, textY);
        textY += 10;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(phraseLabel, colRight, textY);
        textY += 4;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(phraseText, colRight, textY);
        textY += (phraseText.length * 4) + 6;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(motionLabel, colRight, textY);
        textY += 4;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(motionText, colRight, textY);
        textY += (motionText.length * 4) + 6;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(notesLabel, colRight, textY);
        textY += 4;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(notesText, colRight, textY);
        
        cursorY += blockHeight;
      }
      
      const filename = projectName ? `${projectName.replace(/\s+/g, '-')}-groton-storyboard.pdf` : 'groton-storyboard.pdf';
      doc.save(filename);
    } catch (e) {
      console.error("PDF generation failed", e);
      alert("Failed to generate PDF. Please ensure images are fully loaded and accessible.");
    }
  };

  const handleClearBoard = () => {
    if(confirm("Are you sure you want to clear the board? All unsaved progress will be lost.")) {
      setScenes([]);
      setTrayImages([]);
      setProjectName("");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result) as BoardData;
        if (data.scenes) {
          setProjectName(data.projectName || "Imported Project");
          setScenes(data.scenes);
          setTrayImages(data.trayImages || []);
        }
      } catch (err) {
        console.error("Failed to parse board data", err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  const handleSave = () => {
    alert("Project saved locally.");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-800 text-sm">
      
      {/* TOP HEADER */}
      <header className="w-full flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Icons.ScriptBoard />
          <span className="font-semibold">Script Board</span>
          <div className="flex items-center gap-2 text-gray-500 ml-4 group">
            <Icons.Pencil />
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="border-none outline-none focus:ring-0 text-sm text-gray-600 bg-transparent w-64 hover:bg-gray-50 px-1 rounded transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-500">{scenes.length} rows - {scenes.filter(s => s.image).length} images ({scenes.filter(s => s.image).length} linked)</span>
          
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><Icons.ZoomOut /></button>
            <span className="text-gray-500 w-10 text-center">100%</span>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><Icons.ZoomIn /></button>
          </div>

          <div className="flex items-center gap-3 ml-2">
            <button onClick={handleAddScene.bind(null, scenes.length - 1)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors font-bold mr-2">
              <Icons.Plus /> Add Scene
            </button>
            <label className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded cursor-pointer transition-colors text-gray-700 font-medium">
              <Icons.Import /> Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors text-gray-700 font-medium">
                <Icons.Export /> Export
              </button>
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 shadow-lg rounded hidden group-hover:block z-50 overflow-hidden">
                <button onClick={handleExportPDF} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium border-b border-gray-100">Export PDF</button>
                <button onClick={handleExportProject} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">Export Project</button>
              </div>
            </div>

            <button onClick={handleClearBoard} className="flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 text-red-600 rounded transition-colors font-medium ml-1">
              <Icons.Trash /> Clear Board
            </button>
            
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors text-gray-700 font-medium">
              <Icons.Save /> Save
            </button>
            <button onClick={() => router.push("/testing")} className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors text-gray-700 font-medium ml-2">
              <Icons.Close /> Close
            </button>
          </div>
        </div>
      </header>

      {/* TRAY & ASSETS AREA */}
      <section className="w-full bg-[#fcfcfc] border-b border-gray-200 px-4 py-4 flex flex-col gap-3">
        {/* Tray */}
        <div className="flex items-start gap-4 text-xs">
          <div className="w-24 text-gray-500 mt-1 flex flex-col gap-1">
            <span className="font-medium text-gray-700">Image Tray</span>
            <span className="text-[10px]">{trayImages.length} images</span>
            <span className="text-[10px]">{trayImages.filter(t => !scenes.some(s => s.image === t.url)).length} unassigned</span>
            <label className="mt-2 bg-white border border-gray-300 text-center py-1 rounded cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-1 font-medium text-gray-700">
              <Icons.Plus /> Add
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleTrayUpload} />
            </label>
          </div>
          
          <div 
            className="flex-1 min-h-[100px] border border-dashed border-gray-300 rounded p-2 bg-white flex items-center gap-2 overflow-x-auto"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleTrayUpload(e.dataTransfer.files);
              }
            }}
          >
            {trayImages.length === 0 ? (
              <div className="text-gray-400 w-full text-center py-6">
                Drop images here from your computer, or use the Add button.
              </div>
            ) : (
              trayImages.map(img => (
                <div 
                  key={img.id} 
                  className="h-20 w-16 flex-shrink-0 relative group rounded border border-gray-200 overflow-hidden cursor-grab active:cursor-grabbing hover:border-blue-400"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'TRAY_IMAGE', url: img.url, name: img.name }));
                  }}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" draggable={false} />
                  <button 
                    onClick={() => handleRemoveTrayImage(img.id)}
                    className="absolute top-0.5 right-0.5 bg-white/90 text-red-500 p-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icons.Close />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] truncate px-1 py-0.5 opacity-0 group-hover:opacity-100">
                    {img.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Ref Videos */}
        <div className="flex items-start gap-4 text-xs">
          <div className="w-24 text-gray-500 mt-1">
            Ref videos<br/><span className="text-[10px]">(0)</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
              <Icons.FileAdd /> Add
            </button>
            <span className="text-gray-400">Drop video files here — they export as ref-video1, ref-video2... in the zip.</span>
          </div>
        </div>

        {/* Ref Files */}
        <div className="flex items-start gap-4 text-xs">
          <div className="w-24 text-gray-500 mt-1">
            Ref files<br/><span className="text-[10px]">(0)</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
              <Icons.FileAdd /> Add
            </button>
            <span className="text-gray-400">Drop audio, txt/md, xlsx, pdf or any other file here — they export to ref-files/ in the zip. Click a file to view or play it.</span>
          </div>
        </div>

        {/* Add Set */}
        <div className="flex items-center gap-2 mt-2">
          <input type="text" placeholder="New set name (e.g. backgrounds)..." className="text-xs border border-gray-300 rounded px-2 py-1 w-64 outline-none focus:border-blue-400" />
          <button className="text-xs px-2 py-1 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50">+ Add set</button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="w-full px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between sticky top-[53px] z-10 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          
          {/* Toggles */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${multiFrame ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${multiFrame ? 'translate-x-4' : ''}`} />
            </div>
            <span className="group-hover:text-black">Multi-frame</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${missingImageOnly ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${missingImageOnly ? 'translate-x-4' : ''}`} />
            </div>
            <span className="group-hover:text-black">Missing image only · 0</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${notesOnly ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${notesOnly ? 'translate-x-4' : ''}`} />
            </div>
            <span className="group-hover:text-black">Notes only · 0</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${motionRefOnly ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${motionRefOnly ? 'translate-x-4' : ''}`} />
            </div>
            <span className="group-hover:text-black">Motion ref only · 0</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${selectedOnly ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${selectedOnly ? 'translate-x-4' : ''}`} />
            </div>
            <span className="group-hover:text-black">Selected only · 0</span>
          </label>

          {/* Size Select */}
          <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
            <span>Size</span>
            <select className="border border-gray-300 rounded px-2 py-0.5 bg-white outline-none focus:border-blue-400">
              <option>Any</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Icons.Copy /> Copy phrases
            </button>
            <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Icons.Edit /> Edit phrases
            </button>
            <button onClick={clearEmojis} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Icons.Clear /> Clear emojis
            </button>
            <button onClick={clearMotion} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Icons.Clear /> Clear motion
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center border border-gray-300 rounded px-2 py-1 bg-white w-56 ml-2">
            <Icons.Search />
            <input 
              type="text" 
              placeholder="Search phrase / motion / note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-2 outline-none border-none w-full text-xs text-gray-700 bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {filteredScenes.length}/{scenes.length} rows shown
        </div>
      </div>

      {/* SCENE ROWS AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 bg-[#fafafa]">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
          
          {filteredScenes.map((scene, idx) => (
            <div key={scene.id} className={`w-full bg-white border rounded-xl flex shadow-sm transition-opacity ${scene.enabled ? 'border-gray-200' : 'border-gray-200 opacity-50'}`}>
              
              {/* Left Controls */}
              <div className="flex flex-col items-center gap-3 w-12 py-4 border-r border-gray-100 bg-[#fbfbfb] rounded-l-xl flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <button className="cursor-grab hover:bg-gray-200 p-1 rounded transition-colors"><Icons.Drag /></button>
                
                <div className="w-6 h-6 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center text-xs">
                  {scene.number}
                </div>
                
                <label className="flex items-center cursor-pointer mt-1">
                  <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${scene.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <input type="checkbox" className="hidden" checked={scene.enabled} onChange={(e) => handleUpdateScene(scene.id, 'enabled', e.target.checked)} />
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${scene.enabled ? 'translate-x-4' : ''}`} />
                  </div>
                </label>

                <div className="flex flex-col gap-1 mt-2">
                  <button onClick={() => handleMoveScene(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"><Icons.Up /></button>
                  <button onClick={() => handleAddScene(idx)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Icons.Plus /></button>
                  <button onClick={() => handleMoveScene(idx, 'down')} disabled={idx === scenes.length - 1} className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"><Icons.Down /></button>
                </div>
                
                <button onClick={() => handleDeleteScene(scene.id)} className="p-1 hover:bg-red-100 rounded text-gray-500 mt-auto mb-2 transition-colors"><Icons.Trash /></button>
              </div>

              {/* Main 5 Columns */}
              <div className="flex-1 flex gap-3 p-3 overflow-hidden">
                
                {/* 1. Phrase / Script */}
                <div className="flex flex-col flex-1 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                  <textarea 
                    value={scene.phrase}
                    onChange={(e) => handleUpdateScene(scene.id, 'phrase', e.target.value)}
                    className="flex-1 w-full p-3 text-sm text-gray-700 resize-none outline-none placeholder-gray-400 italic"
                    placeholder="(no phrase — animation only beat)"
                  />
                  <div className="flex items-center gap-2 p-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 uppercase tracking-wide font-medium">
                    <button className="hover:text-gray-800 flex items-center gap-1"><Icons.Scissors /> Split</button>
                    <button className="hover:text-gray-800 flex items-center gap-1"><Icons.Merge /> Merge</button>
                    <button className="hover:text-gray-800 flex items-center gap-1"><Icons.Up /> Beat ↑</button>
                    <button className="hover:text-gray-800 flex items-center gap-1"><Icons.Down /> Beat ↓</button>
                    <button className="hover:text-gray-800 flex items-center gap-1"><Icons.Beat /> Animation beat</button>
                  </div>
                </div>

                {/* 2. Image Thumbnail */}
                <div className="w-[140px] flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-full aspect-[4/5] bg-gray-100 border border-gray-200 rounded-lg relative overflow-hidden group">
                    {scene.image ? (
                      <>
                        <span className="absolute top-1 left-1 bg-white/80 backdrop-blur text-gray-800 font-medium text-[9px] px-1.5 py-0.5 rounded shadow-sm z-10 border border-gray-200/50">
                          0:00
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={scene.image} alt={scene.imageName || "Scene image"} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <label className="text-xs bg-white text-black px-3 py-1 rounded cursor-pointer font-medium shadow-sm hover:bg-gray-100">
                            Replace
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e)} />
                          </label>
                          <button onClick={() => handleRemoveImage(scene.id)} className="text-xs bg-red-500 text-white px-3 py-1 rounded font-medium shadow-sm hover:bg-red-600">
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                         <Icons.Image />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium truncate w-full text-center">
                    {scene.imageName || `scene${scene.number}`}
                  </span>
                </div>

                {/* 3. Add / Drop Area */}
                <div className="w-[100px] flex-shrink-0">
                  <label 
                    className="w-full h-full max-h-[175px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center gap-1 p-2 text-center hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer group relative"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                      
                      try {
                        const dataStr = e.dataTransfer.getData('application/json');
                        if (dataStr) {
                          const data = JSON.parse(dataStr);
                          if (data.type === 'TRAY_IMAGE') {
                            setScenes(scenes.map(s => s.id === scene.id ? { ...s, image: data.url, imageName: data.name } : s));
                            return;
                          }
                        }
                      } catch (err) {}
                      
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleImageUpload(scene.id, e.dataTransfer.files);
                      }
                    }}
                  >
                     <Icons.AddDrop />
                     <span className="text-[10px] text-gray-500 font-medium leading-tight mt-1 group-hover:text-gray-700">drop here</span>
                     <span className="text-[10px] text-gray-400 leading-tight">or click to</span>
                     <span className="text-[10px] text-gray-400 leading-tight">upload</span>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e)} />
                  </label>
                  
                  <button 
                    onClick={() => setPickerSceneId(scene.id)}
                    className="w-full mt-1 py-1 text-[9px] uppercase tracking-wider font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Pick from tray
                  </button>
                </div>

                {/* 4. Motion Prompt */}
                <div className="flex flex-col flex-1 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                  <textarea 
                    value={scene.motionPrompt}
                    onChange={(e) => handleUpdateScene(scene.id, 'motionPrompt', e.target.value)}
                    className="flex-1 w-full p-3 text-[13px] text-gray-800 resize-none outline-none leading-relaxed"
                    placeholder="Motion prompt..."
                  />
                  <div className="flex items-center justify-center p-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 uppercase tracking-wide font-medium">
                    <button className="hover:text-gray-800 flex items-center gap-1"><Icons.Image /> motion ref image</button>
                  </div>
                </div>

                {/* 5. Notes */}
                <div className="flex flex-col flex-1 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                  <textarea 
                    value={scene.notes}
                    onChange={(e) => handleUpdateScene(scene.id, 'notes', e.target.value)}
                    className="flex-1 w-full p-3 text-[13px] text-gray-600 resize-none outline-none leading-relaxed italic"
                    placeholder="Notes..."
                  />
                  <div className="flex items-center justify-center p-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 uppercase tracking-wide font-medium">
                    <button className="hover:text-gray-800 flex items-center gap-1"><Icons.Image /> notes image</button>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {filteredScenes.length === 0 && (
            <div className="w-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
              <span className="mb-2">No scenes in this project.</span>
              <button onClick={() => handleAddScene(-1)} className="text-blue-500 font-bold hover:underline mb-2">+ Add first scene</button>
              {searchQuery || missingImageOnly || notesOnly || motionRefOnly || selectedOnly ? (
                <button onClick={() => { setMissingImageOnly(false); setNotesOnly(false); setMotionRefOnly(false); setSelectedOnly(false); setSearchQuery(""); }} className="text-sm text-gray-400 hover:underline">Clear filters</button>
              ) : null}
            </div>
          )}

        </div>
      </main>

      {/* TRAY PICKER MODAL */}
      {pickerSceneId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPickerSceneId(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="font-semibold text-gray-800">Pick from Tray</h3>
                <p className="text-xs text-gray-500 mt-0.5">Select an image to assign to this scene.</p>
              </div>
              <button onClick={() => setPickerSceneId(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <Icons.Close />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
              {trayImages.length === 0 ? (
                 <div className="col-span-full py-12 flex flex-col items-center text-gray-400 text-sm">
                   <Icons.Image />
                   <span className="mt-2">Your tray is empty.</span>
                 </div>
              ) : (
                trayImages.map(img => (
                  <button 
                    key={img.id} 
                    className="aspect-[4/5] bg-gray-100 rounded-lg border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all overflow-hidden relative group focus:outline-none focus:border-blue-500"
                    onClick={() => {
                      setScenes(scenes.map(s => s.id === pickerSceneId ? { ...s, image: img.url, imageName: img.name } : s));
                      setPickerSceneId(null);
                    }}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] truncate px-1.5 py-1 text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Select
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
