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
  leftImageAssetId: string | null;
  rightImageAssetId: string | null;
  frameType?: string;
  motionPrompt: string;
  notes: string;
}

interface ProjectAsset {
  id: string;
  url: string;
  originalFilename: string;
  displayName: string;
}

interface BoardData {
  projectName: string;
  scenes: Scene[];
  projectAssets?: ProjectAsset[];
  trayImages?: any[];
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
  ScriptBoard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7C3AED]"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
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
  Filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  MoreHorizontal: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,

  Import: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Export: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
};

const INITIAL_SCENES: Scene[] = [];

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const generateNextDisplayName = (assets: ProjectAsset[]) => {
  return `${getOrdinal(assets.length + 1)} Frame`;
};

export default function ScriptBoard() {
  const router = useRouter();
  
  // --- State ---
  const [projectName, setProjectName] = useState("");
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [projectAssets, setProjectAssets] = useState<ProjectAsset[]>([]);
  const [assetSearch, setAssetSearch] = useState("");
  const [assetMenuOpen, setAssetMenuOpen] = useState<string | null>(null);
  const [isDragOverAssets, setIsDragOverAssets] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickerSceneId, setPickerSceneId] = useState<string | null>(null);
  const [pickerSide, setPickerSide] = useState<'left' | 'right' | null>(null);
  const [swapPrompt, setSwapPrompt] = useState<any>(null);
  
  // LocalStorage / Persistence
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('groton-script-board-autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.scenes && data.scenes.length > 0) {
          const migrated = data.scenes.map((s: any) => ({
            ...s,
            leftImage: s.leftImage !== undefined ? s.leftImage : (s.image || null),
            leftImageName: s.leftImageName !== undefined ? s.leftImageName : (s.imageName || null),
            leftImageDisplayName: s.leftImageDisplayName || (s.leftImage || s.image ? "1st Frame" : null),
            rightImage: s.rightImage || null,
            rightImageName: s.rightImageName || null,
            rightImageDisplayName: s.rightImageDisplayName || (s.rightImage ? "2nd Frame" : null)
          }));
          setProjectName(data.projectName || "");
          setScenes(migrated);
          setProjectAssets(data.trayImages || []);
        }
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('groton-script-board-autosave', JSON.stringify({ projectName, scenes, projectAssets }));
      setShowSavedIndicator(true);
      const timer = setTimeout(() => setShowSavedIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [projectName, scenes, projectAssets, isLoaded]);
  
  // Toggles
  const [multiFrame, setMultiFrame] = useState(false);
  const [missingImageOnly, setMissingImageOnly] = useState(false);
  const [notesOnly, setNotesOnly] = useState(false);
  const [motionRefOnly, setMotionRefOnly] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);
  
  // Export Menu
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExportOpen(false);
    };
    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExportOpen]);

  // --- Derived Data ---
  const filteredScenes = useMemo(() => {
    return scenes.filter(scene => {
      // Toggles
        if (missingImageOnly && (scene.leftImageAssetId || scene.rightImageAssetId)) return false;
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
  
  const handleMoveImage = (srcId: string, srcSide: 'left' | 'right', destId: string, destSide: 'left' | 'right', srcData: any) => {
    setScenes(prev => {
        const next = [...prev];
        const sIndex = next.findIndex(s => s.id === srcId);
        const dIndex = next.findIndex(s => s.id === destId);
        if (sIndex < 0 || dIndex < 0) return prev;
        
        const srcScene = { ...next[sIndex] };
        if (srcSide === 'left') {
            srcScene.leftImageAssetId = null;
        } else {
            srcScene.rightImageAssetId = null;
        }
        next[sIndex] = srcScene;
        
        const destScene = sIndex === dIndex ? srcScene : { ...next[dIndex] };
        if (destSide === 'left') {
            destScene.leftImageAssetId = srcData.assetId;
        } else {
            destScene.rightImageAssetId = srcData.assetId;
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
            srcScene.leftImageAssetId = destData.assetId;
        } else {
            srcScene.rightImageAssetId = destData.assetId;
        }
        next[sIndex] = srcScene;
        
        const destScene = sIndex === dIndex ? srcScene : { ...next[dIndex] };
        if (destSide === 'left') {
            destScene.leftImageAssetId = srcData.assetId;
        } else {
            destScene.rightImageAssetId = srcData.assetId;
        }
        next[dIndex] = destScene;
        return next;
    });
  };

  const handleAddScene = (index: number) => {
    const newScenes = [...scenes];
    newScenes.splice(index + 1, 0, {
      id: `scene-${Date.now()}`,
      number: 0,
      enabled: true,
      phrase: "",
      leftImageAssetId: null,
      rightImageAssetId: null,
      frameType: "1st Frame",
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


  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement> | FileList, side: 'left' | 'right') => {
    const fileList = e instanceof FileList ? e : e.target.files;
    const file = fileList?.[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await getBase64(file);
      const newAsset: ProjectAsset = {
         id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
         url: base64,
         originalFilename: file.name,
         displayName: generateNextDisplayName(projectAssets)
      };
      setProjectAssets(prev => [...prev, newAsset]);
      setScenes(scenes.map(s => s.id === id ? { ...s, [side === 'left' ? 'leftImageAssetId' : 'rightImageAssetId']: newAsset.id } : s));
    }
  };
  
  const handleTrayUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = Array.from(e instanceof FileList ? e : (e.target.files || []));
    if (!files.length) return;
    
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const newImages = await Promise.all(imageFiles.map(async (f, idx) => ({
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: await getBase64(f),
      originalFilename: f.name,
      displayName: generateNextDisplayName([...projectAssets, ...Array(idx).fill(0)])
    })));
    
    setProjectAssets(prev => [...prev, ...newImages]);
  };

  const handleRemoveTrayImage = (id: string) => {
    setProjectAssets(prev => prev.filter(a => a.id !== id));
  };
  
  const handleRemoveImage = (id: string, side: 'left' | 'right') => {
    setScenes(scenes.map(s => s.id === id ? {
      ...s,
      ...(side === 'left' ? { leftImage: null, leftImageName: null, leftImageDisplayName: null } : { rightImage: null, rightImageName: null, rightImageDisplayName: null })
    } : s));
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
    const data: BoardData = { projectName, scenes, projectAssets };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = projectName ? `${projectName.replace(/\s+/g, '-')}-project.json` : "script-board-project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsExportOpen(false); // Close menu
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let cursorY = margin;
      let pageNum = 1;

      
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
        doc.text(`Project: ${projectName || "Untitled"}`, margin, cursorY + 16);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, cursorY + 21);
        
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
        doc.text(`© 2024 Groton AI Studio | A Creative Venture by Grafly Studio  -  Page ${page}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      };

      drawHeader();
      drawFooter(pageNum);

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const sceneAssetLeft = projectAssets.find(a => a.id === scene.leftImageAssetId);
        const sceneAssetRight = projectAssets.find(a => a.id === scene.rightImageAssetId);
        
        const colLeft = margin;
        const imgBoxW = 90; // total width for images column
        const halfImgW = 42;
        const gap = 6;
        const colRight = margin + imgBoxW + 15;
        const textWidth = pageWidth - colRight - margin;
        
        const title = `SCENE ${scene.number < 10 ? '0'+scene.number : scene.number}`;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const framesText = doc.splitTextToSize((sceneAssetLeft?.displayName ? "Left: " + sceneAssetLeft?.displayName : "Left: (None)") + " | " + (sceneAssetRight?.displayName ? "Right: " + sceneAssetRight?.displayName : "Right: (None)"), textWidth);
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

        await renderImageSlot(sceneAssetLeft?.url || null, margin, cursorY, halfImgW, sceneAssetLeft?.displayName ? sceneAssetLeft.displayName.toUpperCase() : "LEFT IMAGE");
        await renderImageSlot(sceneAssetRight?.url || null, margin + halfImgW + gap, cursorY, halfImgW, sceneAssetRight?.displayName ? sceneAssetRight.displayName.toUpperCase() : "RIGHT IMAGE");
        
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
      }
      
      const filename = projectName ? `${projectName.replace(/\s+/g, '-')}-groton-storyboard.pdf` : 'groton-storyboard.pdf';
      doc.save(filename);
    } catch (e) {
      console.error("PDF generation failed", e);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleClearBoard = () => {
    if(confirm("Are you sure you want to clear the board? All unsaved progress will be lost.")) {
      setScenes([]);
      setProjectAssets([]);
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
          setProjectAssets(data.trayImages || []);
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
               <span className={(s.leftImageAssetId || s.rightImageAssetId) ? "text-[#8B7CFF]" : ""}>
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
             <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2 rounded-lg transition-colors ${isFilterOpen ? 'bg-zinc-200 text-black' : 'hover:bg-zinc-100 text-zinc-500'}`}>
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

           <button onClick={() => setIsExportOpen(!isExportOpen)} className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${isExportOpen ? 'bg-zinc-200 text-black' : 'hover:bg-zinc-100 text-zinc-600'}`}>
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
              <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={`p-2 rounded-lg transition-colors ${isMoreMenuOpen ? 'bg-zinc-200 text-black' : 'hover:bg-zinc-100 text-zinc-500'}`}>
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
                         <span className={`text-[8px] uppercase font-bold tracking-widest ${isUsed ? 'text-[#8B7CFF]' : 'text-zinc-400'}`}>
                           {isUsed ? 'IN SCENE' : 'UNUSED'}
                         </span>
                       </div>
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

              {filteredScenes.map((scene, idx) => {
  const leftAsset = projectAssets.find(a => a.id === scene.leftImageAssetId);
  const rightAsset = projectAssets.find(a => a.id === scene.rightImageAssetId);
  return (
                <div key={scene.id} className={`bg-white border ${scene.enabled ? 'border-zinc-200 shadow-sm' : 'border-zinc-200 opacity-60'} rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative group transition-opacity`}>
                   
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
                      <div className="w-full lg:w-[360px] shrink-0 flex gap-4">
                        {/* LEFT IMAGE SLOT */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 text-center">Left Image</label>
                          <div className="w-full aspect-[4/5] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl relative overflow-hidden group/img transition-colors hover:border-[#8B7CFF]/50"
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#8B7CFF]', 'bg-[#8B7CFF]/5'); const overlay = e.currentTarget.querySelector('.drop-overlay-slot'); if (overlay) overlay.classList.replace('hidden', 'flex'); }}
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
                                    if (data.type === 'PROJECT_ASSET') {
      handleUpdateScene(scene.id, 'leftImageAssetId', data.assetId);
      return;
   }
                                    if (data.type === 'SCENE_IMAGE') {
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
   }
                                  }
                                } catch (err) {}
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  handleImageUpload(scene.id, e.dataTransfer.files, 'left');
                                }
                              }}
                          >
                             <div className="absolute inset-0 z-40 hidden drop-overlay-slot bg-[#8B7CFF]/90 backdrop-blur-sm flex-col items-center justify-center text-white pointer-events-none transition-all">
                                <div className="w-8 h-8 mb-2 rounded-full bg-white/20 flex items-center justify-center"><Icons.AddDrop /></div>
                                <span className="text-[10px] font-bold tracking-widest uppercase">Drop Image Here</span>
                             </div>
                             {leftAsset?.url ? (
                               <>
                                 <img src={leftAsset?.url} alt={leftAsset?.originalFilename || "Scene image"} className="w-full h-full object-cover" 
                                   draggable
                                   onDragStart={(e) => {
                                       e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'left', url: leftAsset?.url, name: leftAsset?.originalFilename, displayName: leftAsset?.displayName }));
                                       setTimeout(() => { if (e.target) (e.target as HTMLElement).style.opacity = '0.4'; }, 0);
                                   }}
                                   onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                                 />
                             {/* DISPLAY NAME EDITOR LEFT */}
                             <div className="absolute top-2 left-2 z-10">
                                <div className="group/rename relative flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm hover:bg-white transition-colors cursor-text">
                                  <input 
                                    value={leftAsset?.displayName || ""}
                                    onChange={(e) => { if (leftAsset) handleUpdateAsset(leftAsset.id, { displayName: e.target.value }); }}
                                    className="bg-transparent border-none outline-none text-[10px] font-bold text-black w-24 truncate placeholder-zinc-400"
                                    placeholder="Name image..."
                                  />
                                  <Icons.Pencil />
                                </div>
                             </div>

                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                    <label className="text-[9px] uppercase tracking-widest font-bold bg-white text-black px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-100 transition-colors">
                                      Replace
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e, 'left')} />
                                    </label>
                                    
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
                          
                        </div>

                        {/* RIGHT IMAGE SLOT */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 text-center">Right Image</label>
                          <div className="w-full aspect-[4/5] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl relative overflow-hidden group/img transition-colors hover:border-[#8B7CFF]/50"
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#8B7CFF]', 'bg-[#8B7CFF]/5'); const overlay = e.currentTarget.querySelector('.drop-overlay-slot'); if (overlay) overlay.classList.replace('hidden', 'flex'); }}
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
                                    if (data.type === 'PROJECT_ASSET') {
      handleUpdateScene(scene.id, 'rightImageAssetId', data.assetId);
      return;
   }
                                    if (data.type === 'SCENE_IMAGE') {
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
   }
                                  }
                                } catch (err) {}
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  handleImageUpload(scene.id, e.dataTransfer.files, 'right');
                                }
                              }}
                          >
                             <div className="absolute inset-0 z-40 hidden drop-overlay-slot bg-[#8B7CFF]/90 backdrop-blur-sm flex-col items-center justify-center text-white pointer-events-none transition-all">
                                <div className="w-8 h-8 mb-2 rounded-full bg-white/20 flex items-center justify-center"><Icons.AddDrop /></div>
                                <span className="text-[10px] font-bold tracking-widest uppercase">Drop Image Here</span>
                             </div>
                             {rightAsset?.url ? (
                               <>
                                 <img src={rightAsset?.url} alt={rightAsset?.originalFilename || "Scene image"} className="w-full h-full object-cover" 
                                   draggable
                                   onDragStart={(e) => {
                                       e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SCENE_IMAGE', sourceSceneId: scene.id, sourceSide: 'right', url: rightAsset?.url, name: rightAsset?.originalFilename, displayName: rightAsset?.displayName }));
                                       setTimeout(() => { if (e.target) (e.target as HTMLElement).style.opacity = '0.4'; }, 0);
                                   }}
                                   onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                                 />
                             {/* DISPLAY NAME EDITOR RIGHT */}
                             <div className="absolute top-2 left-2 z-10">
                                <div className="group/rename relative flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm hover:bg-white transition-colors cursor-text">
                                  <input 
                                    value={rightAsset?.displayName || ""}
                                    onChange={(e) => { if (rightAsset) handleUpdateAsset(rightAsset.id, { displayName: e.target.value }); }}
                                    className="bg-transparent border-none outline-none text-[10px] font-bold text-black w-24 truncate placeholder-zinc-400"
                                    placeholder="Name image..."
                                  />
                                  <Icons.Pencil />
                                </div>
                             </div>

                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                    <label className="text-[9px] uppercase tracking-widest font-bold bg-white text-black px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-100 transition-colors">
                                      Replace
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e, 'right')} />
                                    </label>
                                    
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
                          
                        </div>
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
              );
            })}

              <button 
                onClick={() => handleAddScene(scenes.length - 1)} 
                className="w-full py-8 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 hover:border-[#8B7CFF] hover:text-[#8B7CFF] hover:bg-[#8B7CFF]/5 transition-all font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 mt-4"
              >
                 <Icons.Plus /> Create New Scene
              </button>
           </div>
        </main></div>{swapPrompt && (
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
}