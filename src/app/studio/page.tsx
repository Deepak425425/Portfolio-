'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

type CmsImage = { id: string; name: string; src: string; page: string; section: string; };

type MediaRecord = {
  id: string;
  sourceType: 'existing' | 'uploaded';
  originalPath: string;
  publicUrl: string;
  displayName: string;
  usages: { page: string; section: string }[];
};

function StudioContent() {
  const searchParams = useSearchParams();
  const pageFilter = searchParams.get('page') || 'HOME';
  const view = searchParams.get('view');

  const [images, setImages] = useState<CmsImage[]>([]);
  const [textPlacements, setTextPlacements] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<MediaRecord[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [mediaPageFilter, setMediaPageFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/studio/cms', { cache: 'no-store' }).then(r => r.json()).then(setImages);
    fetch('/api/studio/media', { cache: 'no-store' }).then(r => r.json()).then(setMediaLibrary);
    fetch('/api/studio/cms-text', { cache: 'no-store' }).then(r => r.json()).then(setTextPlacements);
  }, []);

  const loadMedia = () => {
    fetch('/api/studio/media', { cache: 'no-store' }).then(r => r.json()).then(setMediaLibrary);
  };

  const handleReplaceClick = (id: string) => {
    setEditingId(id);
    setIsMediaModalOpen(true);
    loadMedia();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch('/api/studio/media', { method: 'POST', body: formData });
      if (res.ok) {
        loadMedia(); // reload library
      } else {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      alert('Upload request failed');
    }
  };

  const selectMedia = async (src: string) => {
    if (!editingId) return;
    setImages(prev => prev.map(img => img.id === editingId ? { ...img, src } : img));
    setIsMediaModalOpen(false);
  };

  const saveChanges = async (id: string) => {
    const img = images.find(i => i.id === id);
    if (!img) return;
    await fetch('/api/studio/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, src: img.src })
    });
    alert('Image successfully updated and published to the live site!');
  };

  const deleteMedia = async (mediaId: string, url: string) => {
      // Check if image is used in placements
      const isUsed = images.some(img => img.src === url);
      if (isUsed) {
        alert('This image is currently used on the website. Replace the image on the public page before deleting it.');
        return;
      }
      
      if (!confirm('Are you sure you want to permanently delete this uploaded image?')) return;
      
      try {
        const res = await fetch(`/api/studio/media?id=${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
        if (res.ok) {
           loadMedia();
           setPreviewMedia(null);
        } else {
           const err = await res.json();
           alert('Delete failed: ' + (err.error || 'Unknown error'));
        }
      } catch(e) {
        alert('Network error during deletion.');
      }
  };

  const saveTextChanges = async (id: string, publishedValue: string) => {
    await fetch('/api/studio/cms-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, publishedValue })
    });
    alert('Text successfully updated and published to the live site!');
    fetch('/api/studio/cms-text', { cache: 'no-store' }).then(r => r.json()).then(setTextPlacements);
  };

  const filteredImages = images.filter(img => img.page === pageFilter);
  const filteredTextPlacements = textPlacements.filter(t => t.page === pageFilter);

  const pagesWithMedia = Array.from(new Set(mediaLibrary.flatMap(m => m.usages.map(u => u.page))));

  const filteredMediaLibrary = mediaLibrary.filter(media => {
    if (sourceFilter !== 'ALL' && sourceFilter.toLowerCase() !== media.sourceType) return false;
    if (mediaPageFilter !== 'ALL' && !media.usages.some(u => u.page === mediaPageFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!media.displayName.toLowerCase().includes(q) && 
          !media.usages.some(u => u.page.toLowerCase().includes(q) || u.section.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  if (view === 'media') {
      return (
        <div className="p-10 max-w-5xl mx-auto">
          <header className="flex justify-between items-end mb-10 pb-6 border-b border-zinc-800">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Media Library <span className="text-zinc-500 text-2xl ml-2">{mediaLibrary.length}</span></h2>
              <p className="text-zinc-500 mt-2 text-sm">Manage all uploaded assets across the website</p>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[#8B7CFF] hover:bg-[#7a6ce0] text-white text-sm font-medium rounded-lg transition-colors">
                Upload New Image
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
          </header>

          <div className="flex gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Search media..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm w-64 text-white outline-none focus:border-[#8B7CFF]"
            />
            <select 
              value={sourceFilter} 
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#8B7CFF]"
            >
              <option value="ALL">ALL SOURCES</option>
              <option value="EXISTING">EXISTING</option>
              <option value="UPLOADED">UPLOADED</option>
            </select>
            <select 
              value={mediaPageFilter} 
              onChange={e => setMediaPageFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#8B7CFF]"
            >
              <option value="ALL">ALL PAGES</option>
              {pagesWithMedia.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredMediaLibrary.map(media => (
              <div key={media.id} className="flex flex-col gap-3 group">
                <button onClick={() => setPreviewMedia(media)} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#8B7CFF]">
                  <Image src={media.publicUrl} alt={media.displayName} fill className="object-cover transition-transform group-hover:scale-105" />
                </button>
                <div className="flex flex-col gap-1 px-1">
                    <p className="text-xs text-white font-medium truncate">{media.displayName}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">{media.sourceType}</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate">{media.publicUrl.split('.').pop()?.toUpperCase()}</span>
                    </div>
                    {media.usages.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {media.usages.map((u, i) => (
                          <span key={i} className="text-[10px] text-zinc-400 truncate w-full">Used in: {u.page} / {u.section}</span>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}
            {filteredMediaLibrary.length === 0 && <p className="col-span-full text-zinc-500 text-sm py-10 text-center">No images found.</p>}
          </div>

          {/* Media Preview Modal */}
          {previewMedia && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl w-full max-w-5xl h-[80vh] flex shadow-2xl overflow-hidden">
                <div className="w-2/3 h-full bg-zinc-950 relative border-r border-zinc-800">
                  <Image src={previewMedia.publicUrl} alt={previewMedia.displayName} fill className="object-contain" />
                </div>
                <div className="w-1/3 h-full p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold break-all mb-6">{previewMedia.displayName}</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Source Type</span>
                        <span className="bg-zinc-800 text-xs px-2 py-1 rounded inline-block">{previewMedia.sourceType}</span>
                      </div>
                      <div>
                         <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">URL</span>
                         <a href={previewMedia.publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8B7CFF] hover:underline break-all">{previewMedia.publicUrl}</a>
                      </div>
                      {previewMedia.usages.length > 0 && (
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">Current Usages</span>
                          <ul className="text-xs text-zinc-300 space-y-1">
                            {previewMedia.usages.map((u, i) => <li key={i}>{u.page} / {u.section}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6 border-t border-zinc-800 mt-6">
                    <button onClick={() => setPreviewMedia(null)} className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors">
                      Close
                    </button>
                    {previewMedia.sourceType === 'uploaded' && (
                      <button onClick={() => deleteMedia(previewMedia.id, previewMedia.publicUrl)} className="flex-1 px-4 py-3 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/50 hover:border-red-600 text-sm font-medium rounded-lg transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <header className="flex justify-between items-end mb-10 pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pageFilter} Editor</h2>
          <p className="text-zinc-500 mt-2 text-sm">Manage dynamic images for the {pageFilter} page</p>
        </div>
        <a href={pageFilter === 'HOME' ? '/' : '/' + pageFilter.toLowerCase()} target="_blank" className="text-sm font-medium text-[#8B7CFF] hover:underline">View Live Page +'</a>
      </header>

      {filteredImages.length > 0 && (
        <div className="mt-8 mb-6 border-b border-zinc-800 pb-4">
          <h3 className="text-lg font-bold tracking-widest text-zinc-400 uppercase">Image Placements</h3>
        </div>
      )}
      <div className="space-y-8">
        {filteredImages.map(img => (
          <div key={img.id} className="flex flex-col md:flex-row gap-6 p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
            <div className="w-full md:w-64 h-40 relative rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0">
              <Image src={img.src} alt={img.name} fill className="object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-xs font-bold text-[#8B7CFF] tracking-widest uppercase mb-1">{img.section}</div>
              <h3 className="text-lg font-medium text-white mb-2">{img.name}</h3>
              <p className="text-xs text-zinc-500 mb-6 font-mono break-all">{img.src}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleReplaceClick(img.id)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Replace Image
                </button>
                <button 
                  onClick={() => saveChanges(img.id)}
                  className="px-4 py-2 bg-[#8B7CFF] hover:bg-[#7a6ce0] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Save & Publish
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredImages.length === 0 && <p className="text-zinc-500 py-10 text-center">No images mapped for this page yet.</p>}
      </div>

      {filteredTextPlacements.length > 0 && (
        <div className="mt-16 mb-6 border-b border-zinc-800 pb-4">
          <h3 className="text-lg font-bold tracking-widest text-zinc-400 uppercase">Text Placements</h3>
        </div>
      )}
      <div className="space-y-6">
        {filteredTextPlacements.map(textItem => (
           <TextEditorRow key={textItem.id} item={textItem} onSave={saveTextChanges} />
        ))}
      </div>

      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Media Library <span className="text-zinc-500 text-lg ml-2">{mediaLibrary.length}</span></h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="text-zinc-500 hover:text-white">x</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8 p-6 border-2 border-dashed border-zinc-800 rounded-xl text-center">
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium">
                  Upload New Image
                </button>
                <p className="text-xs text-zinc-500 mt-3">JPG, PNG, WEBP allowed.</p>
              </div>

              <div className="flex gap-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Search media..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm w-full md:w-64 text-white outline-none focus:border-[#8B7CFF]"
                />
                <select 
                  value={sourceFilter} 
                  onChange={e => setSourceFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#8B7CFF]"
                >
                  <option value="ALL">ALL SOURCES</option>
                  <option value="EXISTING">EXISTING</option>
                  <option value="UPLOADED">UPLOADED</option>
                </select>
                <select 
                  value={mediaPageFilter} 
                  onChange={e => setMediaPageFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#8B7CFF]"
                >
                  <option value="ALL">ALL PAGES</option>
                  {pagesWithMedia.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <h4 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-widest">Select Existing</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredMediaLibrary.map(media => (
                  <button 
                    key={media.id} 
                    onClick={() => selectMedia(media.publicUrl)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#8B7CFF] transition-all group"
                  >
                    <Image src={media.publicUrl} alt={media.displayName} fill className="object-cover" />
                    <div className="absolute inset-0 bg-[#8B7CFF]/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                      <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full font-medium mb-2">USE IMAGE</span>
                      <span className="text-[10px] text-white text-center drop-shadow-md truncate w-full">{media.displayName}</span>
                    </div>
                  </button>
                ))}
                {filteredMediaLibrary.length === 0 && <p className="col-span-full text-zinc-500 text-sm py-10 text-center">No images found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TextEditorRow({ item, onSave }: { item: any, onSave: (id: string, val: string) => void }) {
  const [val, setVal] = useState(item.publishedValue ?? item.defaultValue);
  
  return (
    <div className="flex flex-col gap-4 p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
       <div className="text-xs font-bold text-[#8B7CFF] tracking-widest uppercase mb-1">{item.section} - {item.label}</div>
       {item.type === 'single-line' ? (
         <input value={val} onChange={e => setVal(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-4 text-white focus:outline-none focus:border-[#8B7CFF]" />
       ) : (
         <textarea value={val} onChange={e => setVal(e.target.value)} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded p-4 text-white focus:outline-none focus:border-[#8B7CFF]" />
       )}
       <div className="flex gap-3 mt-2">
          <button onClick={() => onSave(item.id, val)} className="px-6 py-2.5 bg-[#8B7CFF] hover:bg-[#7a6ce0] text-white text-sm font-medium rounded-lg transition-colors">
            Save & Publish
          </button>
       </div>
    </div>
  )
}

export default function Studio() {
  return (
    <Suspense fallback={<div className="p-10 text-zinc-500">Loading...</div>}>
      <StudioContent />
    </Suspense>
  );
}
