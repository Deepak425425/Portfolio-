const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(process.cwd(), 'src/app/studio'));
ensureDir(path.join(process.cwd(), 'src/app/studio/login'));
ensureDir(path.join(process.cwd(), 'src/app/api/studio/auth'));
ensureDir(path.join(process.cwd(), 'src/app/api/studio/cms'));
ensureDir(path.join(process.cwd(), 'src/app/api/studio/media'));
ensureDir(path.join(process.cwd(), 'src/lib'));
ensureDir(path.join(process.cwd(), 'data'));
ensureDir(path.join(process.cwd(), 'public/uploads/studio'));

// 1. middleware.ts
const middlewareContent = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isStudio = request.nextUrl.pathname.startsWith('/studio');
  const isStudioApi = request.nextUrl.pathname.startsWith('/api/studio');

  if (isStudio) {
    if (request.nextUrl.pathname === '/studio/login') return NextResponse.next();
    const token = request.cookies.get('groton_auth_token')?.value;
    if (token !== 'secure_admin_token_2026') {
      return NextResponse.redirect(new URL('/studio/login', request.url));
    }
  }

  if (isStudioApi) {
    if (request.nextUrl.pathname === '/api/studio/auth') return NextResponse.next();
    const token = request.cookies.get('groton_auth_token')?.value;
    if (token !== 'secure_admin_token_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/studio/:path*', '/api/studio/:path*'],
};
`;
fs.writeFileSync(path.join(process.cwd(), 'src/middleware.ts'), middlewareContent);

// 2. lib/cms.ts
const cmsLibContent = `import fs from 'fs';
import path from 'path';

const CMS_FILE_PATH = path.join(process.cwd(), 'data', 'cms.json');

export type CmsImage = {
  id: string;
  name: string;
  src: string;
  page: string;
  section: string;
};

const DEFAULT_IMAGES: CmsImage[] = [
  { id: 'hero_main', name: 'Hero Background', src: '/campaign-worlds/download (22).jpeg', page: 'home', section: 'Hero' },
  { id: 'selected_work_1', name: 'Selected Work 1', src: '/campaign-worlds/groton-1.jpg', page: 'home', section: 'Selected Work' },
  { id: 'selected_work_2', name: 'Selected Work 2', src: '/campaign-worlds/groton-9.jpg', page: 'home', section: 'Selected Work' },
  { id: 'selected_work_3', name: 'Selected Work 3', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'home', section: 'Selected Work' },
  { id: 'about_visual', name: 'About Visual', src: '/campaign-worlds/ghgh.jpeg', page: 'home', section: 'About' },
];

export function getCmsData(): CmsImage[] {
  if (!fs.existsSync(CMS_FILE_PATH)) {
    if (!fs.existsSync(path.dirname(CMS_FILE_PATH))) {
      fs.mkdirSync(path.dirname(CMS_FILE_PATH), { recursive: true });
    }
    fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(DEFAULT_IMAGES, null, 2));
    return DEFAULT_IMAGES;
  }
  try {
    return JSON.parse(fs.readFileSync(CMS_FILE_PATH, 'utf-8'));
  } catch (e) {
    return DEFAULT_IMAGES;
  }
}

export function updateCmsImage(id: string, newSrc: string) {
  const data = getCmsData();
  const updated = data.map(img => img.id === id ? { ...img, src: newSrc } : img);
  fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(updated, null, 2));
  return updated;
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src/lib/cms.ts'), cmsLibContent);

// 3. API Routes
const authApi = `import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  if ((body.username === 'admin' || body.email === 'admin') && body.password === 'admin') {
    const res = NextResponse.json({ success: true });
    res.cookies.set('groton_auth_token', 'secure_admin_token_2026', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    return res;
  }
  return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
}
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('groton_auth_token');
  return res;
}`;
fs.writeFileSync(path.join(process.cwd(), 'src/app/api/studio/auth/route.ts'), authApi);

const cmsApi = `import { NextResponse } from 'next/server';
import { getCmsData, updateCmsImage } from '@/lib/cms';

export async function GET() {
  return NextResponse.json(getCmsData());
}

export async function POST(req: Request) {
  const { id, src } = await req.json();
  const updated = updateCmsImage(id, src);
  return NextResponse.json(updated);
}`;
fs.writeFileSync(path.join(process.cwd(), 'src/app/api/studio/cms/route.ts'), cmsApi);

const mediaApi = `import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public/uploads/studio');
  if (!fs.existsSync(dir)) return NextResponse.json([]);
  const files = fs.readdirSync(dir).map(f => '/uploads/studio/' + f);
  return NextResponse.json(files);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const dir = path.join(process.cwd(), 'public/uploads/studio');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(path.join(dir, filename), buffer);
  return NextResponse.json({ url: '/uploads/studio/' + filename });
}`;
fs.writeFileSync(path.join(process.cwd(), 'src/app/api/studio/media/route.ts'), mediaApi);

// 4. Studio Layout
const layoutTsx = `import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('groton_auth_token');
  const isLoggedIn = token?.value === 'secure_admin_token_2026';

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      <aside className="w-64 border-r border-zinc-800/50 bg-[#0d0d0d] p-6 flex flex-col">
        <h1 className="text-xl font-bold tracking-widest uppercase mb-12">Groton<span className="text-[#8B7CFF]">Studio</span></h1>
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/studio" className="px-4 py-2.5 rounded-lg bg-zinc-800/50 text-sm font-medium">Pages (HOME)</Link>
          <Link href="/studio" className="px-4 py-2.5 rounded-lg hover:bg-zinc-800/30 text-zinc-400 text-sm font-medium transition-colors">Media Library</Link>
          <Link href="/studio" className="px-4 py-2.5 rounded-lg hover:bg-zinc-800/30 text-zinc-400 text-sm font-medium transition-colors">Settings</Link>
        </nav>
        <button onClick={() => {
            fetch('/api/studio/auth', { method: 'DELETE' }).then(() => window.location.href = '/studio/login');
        }} className="text-left px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Logout</button>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}`;
fs.writeFileSync(path.join(process.cwd(), 'src/app/studio/layout.tsx'), layoutTsx);

// 5. Login Page
const loginTsx = `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/studio/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setLoading(false);
    if (res.ok) {
      router.push('/studio');
      router.refresh();
    } else {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-zinc-100">
      <div className="w-full max-w-sm p-8 bg-[#0d0d0d] border border-zinc-800/50 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2 text-center">Groton</h1>
        <p className="text-xs text-zinc-500 text-center uppercase tracking-[0.2em] mb-8">Site Studio</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Email / Username" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#8B7CFF] transition-colors"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#8B7CFF] transition-colors"
          />
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#8B7CFF] text-white rounded-lg px-4 py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#7a6ce0] transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}`;
fs.writeFileSync(path.join(process.cwd(), 'src/app/studio/login/page.tsx'), loginTsx);

// 6. Studio Dashboard
const studioTsx = `'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type CmsImage = { id: string; name: string; src: string; page: string; section: string; };

export default function Studio() {
  const [images, setImages] = useState<CmsImage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/studio/cms').then(r => r.json()).then(setImages);
  }, []);

  const loadMedia = () => {
    fetch('/api/studio/media').then(r => r.json()).then(setMediaLibrary);
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
    const res = await fetch('/api/studio/media', { method: 'POST', body: formData });
    if (res.ok) {
      loadMedia(); // reload library
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

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <header className="flex justify-between items-end mb-10 pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Homepage Editor</h2>
          <p className="text-zinc-500 mt-2 text-sm">Manage dynamic images across the main website</p>
        </div>
        <a href="/" target="_blank" className="text-sm font-medium text-[#8B7CFF] hover:underline">View Live Site →</a>
      </header>

      <div className="space-y-8">
        {images.map(img => (
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
      </div>

      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Media Library</h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8 p-6 border-2 border-dashed border-zinc-800 rounded-xl text-center">
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium">
                  Upload New Image
                </button>
                <p className="text-xs text-zinc-500 mt-3">JPG, PNG, WEBP allowed.</p>
              </div>
              <h4 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-widest">Select Existing</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaLibrary.map(src => (
                  <button 
                    key={src} 
                    onClick={() => selectMedia(src)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#8B7CFF] transition-all group"
                  >
                    <Image src={src} alt="Media" fill className="object-cover" />
                    <div className="absolute inset-0 bg-[#8B7CFF]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full font-medium">USE IMAGE</span>
                    </div>
                  </button>
                ))}
                {mediaLibrary.length === 0 && <p className="col-span-full text-zinc-500 text-sm py-10 text-center">No images uploaded yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
fs.writeFileSync(path.join(process.cwd(), 'src/app/studio/page.tsx'), studioTsx);

console.log("Studio built successfully!");
