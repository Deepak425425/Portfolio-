import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCmsData } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cmsData = getCmsData();
    const mediaMap = new Map();

    cmsData.forEach(img => {
      if (!img.src) return;
      const src = img.src;
      
      if (!mediaMap.has(src)) {
        mediaMap.set(src, {
          id: src,
          sourceType: 'existing',
          originalPath: src,
          publicUrl: src,
          displayName: src.split('/').pop() || src,
          usages: []
        });
      }
      
      const media = mediaMap.get(src);
      // Avoid duplicate usage records for the same page/section
      const hasUsage = media.usages.some((u: any) => u.page === img.page && u.section === img.section);
      if (!hasUsage) {
        media.usages.push({
          page: img.page,
          section: img.section
        });
      }
    });

    const dir = path.join(process.cwd(), 'public/uploads/studio');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(f => {
        const src = '/uploads/studio/' + f;
        if (!mediaMap.has(src)) {
          mediaMap.set(src, {
            id: src,
            sourceType: 'uploaded',
            originalPath: src,
            publicUrl: src,
            displayName: f,
            usages: []
          });
        } else {
          mediaMap.get(src).sourceType = 'uploaded';
        }
      });
    }

    return NextResponse.json(Array.from(mediaMap.values()));
  } catch (e) {
    console.error(e);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  try {
    const dir = path.join(process.cwd(), 'public/uploads/studio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), buffer);
    return NextResponse.json({ url: '/uploads/studio/' + filename });
  } catch (e) {
    // Vercel Read-Only fallback: return as base64 string
    console.warn('Filesystem read-only, returning base64', e);
    return NextResponse.json({ url: `data:${file.type};base64,${buffer.toString('base64')}` });
  }
}
