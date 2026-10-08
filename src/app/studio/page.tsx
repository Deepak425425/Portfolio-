'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

type CmsImage = { id: string; name: string; src: string; page: string; section: string; mediaType?: "image" | "video"; mimeType?: string; };

type MediaRecord = {
  id: string;
  sourceType: 'existing' | 'uploaded';
  originalPath: string;
  publicUrl: string;
  displayName: string;
  mediaType?: "image" | "video";
  mimeType?: string;
  usages: { page: string; section: string }[];
};

function isVideoMedia(url?: string, mediaType?: "image" | "video"): boolean {
  if (mediaType === 'video') return true;
  if (!url) return false;
  return /\.(mp4|webm|mov|quicktime)($|\?)/i.test(url);
}

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [testingUsers, setTestingUsers] = useState<any[]>([]);
  const [testingActivity, setTestingActivity] = useState<any[]>([]);
  const [viewingActivityUserId, setViewingActivityUserId] = useState<string | null>(null);

  const handleActivityDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to permanently delete this record (and any associated stored files)?')) return;
    try {
      const res = await fetch('/api/studio/testing-users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ activityId })
      });
      if (res.ok) {
        setTestingActivity(prev => prev.filter(a => a.id !== activityId));
      } else {
        const err = await res.json();
        alert('Delete failed: ' + (err.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Network error during deletion.');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [mediaPageFilter, setMediaPageFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/studio/cms', { cache: 'no-store' }).then(r => r.json()).then(setImages);
    fetch('/api/studio/media', { cache: 'no-store' }).then(r => r.json()).then(setMediaLibrary);
    fetch('/api/studio/cms-text', { cache: 'no-store' }).then(r => r.json()).then(setTextPlacements);
    if (view === 'testing-users') {
      fetch('/api/studio/testing-users', { cache: 'no-store' }).then(r => r.json()).then(data => {
        setTestingUsers(data.users || []);
        setTestingActivity(data.activity || []);
      });
    }
  }, [view]);

  const loadMedia = async () => {
    const res = await fetch('/api/studio/media', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setMediaLibrary(data);
    }
  };

  const handleReplaceClick = (id: string) => {
    setEditingId(id);
    setIsMediaModalOpen(true);
    loadMedia();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    if (!inputEl.files?.[0]) return;
    const file = inputEl.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      setIsUploading(true);
      const res = await fetch('/api/studio/media', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });
      if (res.ok) {
        await loadMedia(); // reload library
      } else {
        let errorMsg = 'Upload failed';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `Server error (${res.status}: ${res.statusText || 'Upload failed'})`;
        }
        alert(errorMsg);
      }
    } catch (error: any) {
      alert(`Upload request failed: ${error?.message || 'Network error'}`);
    } finally {
      setIsUploading(false);
      if (inputEl) inputEl.value = '';
    }
  };

  const selectMedia = async (src: string, mediaType?: "image" | "video", mimeType?: string) => {
    if (!editingId) return;
    const determinedType: "image" | "video" = mediaType || (isVideoMedia(src) ? 'video' : 'image');
    setImages(prev => prev.map(img => img.id === editingId ? { ...img, src, mediaType: determinedType, mimeType } : img));
    setIsMediaModalOpen(false);
  };

  const saveChanges = async (id: string) => {
    const img = images.find(i => i.id === id);
    if (!img) return;
    const determinedType: "image" | "video" = img.mediaType || (isVideoMedia(img.src) ? 'video' : 'image');
    await fetch('/api/studio/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, src: img.src, mediaType: determinedType, mimeType: img.mimeType })
    });
    alert('Media successfully updated and published to the live site!');
  };

  const deleteMedia = async (mediaId: string, url: string) => {
    // Check if image is used in placements
    const isUsed = images.some(img => img.src === url);
    if (isUsed) {
      alert('This media is currently used on the website. Replace the media on the public page before deleting it.');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this uploaded media?')) return;

    try {
      const res = await fetch(`/api/studio/media?id=${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
      if (res.ok) {
        loadMedia();
        setPreviewMedia(null);
      } else {
        const err = await res.json();
        alert('Delete failed: ' + (err.error || 'Unknown error'));
      }
    } catch (e) {
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
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="px-4 py-2 bg-[#8B7CFF] hover:bg-[#7a6ce0] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Uploading...</span>
              </>
            ) : (
              'Upload New Media'
            )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp, image/svg+xml, video/mp4, video/webm, video/quicktime, video/*, image/*" 
          />
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
          {filteredMediaLibrary.map(media => {
            const isVideo = isVideoMedia(media.publicUrl, media.mediaType);
            return (
              <div key={media.id} className="flex flex-col gap-3 group">
                <button onClick={() => setPreviewMedia(media)} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#8B7CFF]">
                  {isVideo ? (
                    <video src={media.publicUrl} muted playsInline className="object-cover w-full h-full transition-transform group-hover:scale-105 pointer-events-none" />
                  ) : (
                    <Image src={media.publicUrl} alt={media.displayName} fill className="object-cover transition-transform group-hover:scale-105" />
                  )}
                </button>
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-xs text-white font-medium truncate">{media.displayName}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded flex items-center gap-1">
                      {media.sourceType}
                      {isVideo && <span className="bg-[#8B7CFF]/20 text-[#8B7CFF] px-1.5 py-0.5 rounded text-[8px] font-bold">VIDEO</span>}
                    </span>
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
            );
          })}
          {filteredMediaLibrary.length === 0 && <p className="col-span-full text-zinc-500 text-sm py-10 text-center">No media found.</p>}
        </div>

        {/* Media Preview Modal */}
        {previewMedia && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl w-full max-w-5xl h-[80vh] flex shadow-2xl overflow-hidden">
              <div className="w-2/3 h-full bg-zinc-950 relative border-r border-zinc-800">
                {isVideoMedia(previewMedia.publicUrl, previewMedia.mediaType) ? (
                  <video src={previewMedia.publicUrl} controls playsInline autoPlay className="w-full h-full object-contain" />
                ) : (
                  <Image src={previewMedia.publicUrl} alt={previewMedia.displayName} fill className="object-contain" />
                )}
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

  if (view === 'testing-users') {
    return (
      <div className="p-10 max-w-5xl mx-auto">
        <header className="mb-10 pb-6 border-b border-zinc-800">
          <h2 className="text-3xl font-bold tracking-tight">Testing Lab Users <span className="text-zinc-500 text-2xl ml-2">{testingUsers.length}</span></h2>
          <p className="text-zinc-500 mt-2 text-sm">Monitor experimental tool usage and activity</p>
        </header>

        <div className="flex flex-col gap-6">
          {testingUsers.length === 0 ? (
            <p className="text-zinc-500 text-sm py-10 text-center">No users have signed in yet.</p>
          ) : (
            testingUsers.map(user => {
              const userActivity = testingActivity.filter(a => a.user_id === user.id);
              return (
                <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{user.email}</h3>
                      <p className="text-xs text-zinc-400">Last active: {new Date(user.last_login_at).toLocaleString()}</p>
                      <p className="text-xs text-zinc-400 mt-1">Tools used: {new Set(userActivity.map(a => a.tool)).size}</p>
                    </div>
                    <button
                      onClick={() => setViewingActivityUserId(viewingActivityUserId === user.id ? null : user.id)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition-colors uppercase tracking-wider"
                    >
                      {viewingActivityUserId === user.id ? 'Hide Activity' : 'View Activity'}
                    </button>
                  </div>

                  {viewingActivityUserId === user.id && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-3">
                      <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Recent Activity</h4>
                      {userActivity.length === 0 ? (
                        <p className="text-xs text-zinc-500">No activity recorded yet.</p>
                      ) : (
                        userActivity.map(activity => (
                          <div key={activity.id} className="flex flex-col text-sm bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                            <div className="flex justify-between mb-1">
                              <span className="text-zinc-300 font-medium">{activity.tool}</span>
                              <span className="text-zinc-500 text-xs">{new Date(activity.timestamp).toLocaleString()}</span>
                            </div>
                            <span className="text-[#8B7CFF] text-xs mb-2">{activity.action}</span>

                            {activity.file_info && (
                              <div className="mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">STORED FILES</span>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-xs text-white truncate max-w-[200px]">{activity.file_info.name}</p>
                                    <p className="text-[10px] text-zinc-500">{activity.file_info.size ? (activity.file_info.size / (1024 * 1024)).toFixed(2) + ' MB' : ''} • {activity.file_info.type}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <a
                                      href={activity.file_info.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] px-2 py-1 border border-zinc-700 hover:border-zinc-500 rounded text-zinc-300 hover:text-white transition-colors"
                                    >
                                      PREVIEW
                                    </a>
                                    <button
                                      onClick={() => handleActivityDelete(activity.id)}
                                      className="text-[10px] px-2 py-1 border border-red-900/50 bg-red-900/10 hover:bg-red-900/30 rounded text-red-500 hover:text-red-400 transition-colors"
                                    >
                                      DELETE
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <header className="flex justify-between items-end mb-10 pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pageFilter === 'BLOG' ? 'INSIGHTS / BLOG' : pageFilter} Editor</h2>
          <p className="text-zinc-500 mt-2 text-sm">Manage dynamic content for the {pageFilter === 'BLOG' ? 'Insights & Blog' : pageFilter} page</p>
        </div>
        <a 
          href={pageFilter === 'HOME' || pageFilter === 'GLOBAL' ? '/' : pageFilter === 'BLOG' ? '/blog' : '/' + pageFilter.toLowerCase()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#8B7CFF] hover:underline flex items-center gap-1.5"
        >
          View Live Page ↗
        </a>
      </header>

      {filteredImages.length > 0 && (
        <div className="mt-8 mb-6 border-b border-zinc-800 pb-4">
          <h3 className="text-lg font-bold tracking-widest text-zinc-400 uppercase">Visual Media Placements</h3>
        </div>
      )}
      <div className="space-y-8">
        {filteredImages.map(img => {
          const isVideo = isVideoMedia(img.src, img.mediaType);
          return (
            <div key={img.id} className="flex flex-col md:flex-row gap-6 p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
              <div className="w-full md:w-64 h-40 relative rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 flex items-center justify-center">
                {isVideo ? (
                  <video src={img.src} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                ) : (
                  <Image src={img.src} alt={img.name} fill className="object-cover" />
                )}
                {isVideo && (
                  <span className="absolute top-2 right-2 bg-black/80 text-[#8B7CFF] text-[9px] font-bold px-2 py-0.5 rounded tracking-wider border border-[#8B7CFF]/30">
                    VIDEO
                  </span>
                )}
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
                    {isVideo ? 'Replace Video' : 'Replace Image'}
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
          );
        })}
        {filteredImages.length === 0 && <p className="text-zinc-500 py-10 text-center">No media placements mapped for this page yet.</p>}
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleUpload} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp, image/svg+xml, video/mp4, video/webm, video/quicktime, video/*, image/*" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  {isUploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Uploading Media...</span>
                    </>
                  ) : (
                    'Upload New Media'
                  )}
                </button>
                <p className="text-xs text-zinc-500 mt-3">JPG, PNG, WEBP, SVG, MP4, WebM allowed.</p>
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
                {filteredMediaLibrary.map(media => {
                  const isVideo = isVideoMedia(media.publicUrl, media.mediaType);
                  return (
                    <button
                      key={media.id}
                      onClick={() => selectMedia(media.publicUrl, media.mediaType, media.mimeType)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#8B7CFF] transition-all group"
                    >
                      {isVideo ? (
                        <video src={media.publicUrl} muted playsInline className="w-full h-full object-cover pointer-events-none" />
                      ) : (
                        <Image src={media.publicUrl} alt={media.displayName} fill className="object-cover" />
                      )}
                      <div className="absolute inset-0 bg-[#8B7CFF]/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                        <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full font-medium mb-2">
                          {isVideo ? 'USE VIDEO' : 'USE IMAGE'}
                        </span>
                        <span className="text-[10px] text-white text-center drop-shadow-md truncate w-full">{media.displayName}</span>
                      </div>
                    </button>
                  );
                })}
                {filteredMediaLibrary.length === 0 && <p className="col-span-full text-zinc-500 text-sm py-10 text-center">No media found.</p>}
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
        <button onClick={() => { setVal(item.defaultValue); onSave(item.id, item.defaultValue); }} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">
          Reset to Default
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
