import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCmsData } from '@/lib/cms';
import { put, list, del } from '@vercel/blob';

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

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { blobs } = await list({ prefix: 'studio/' });
        blobs.forEach(b => {
          if (!mediaMap.has(b.url)) {
            mediaMap.set(b.url, {
              id: b.url,
              sourceType: 'uploaded',
              originalPath: b.url,
              publicUrl: b.url,
              displayName: b.pathname.replace('studio/', ''),
              usages: []
            });
          }
        });
      } catch (e) {
        console.error('Failed to list blobs:', e);
      }
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
  
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`studio/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false
      });
      
      const mediaRecord = {
        id: blob.url,
        sourceType: 'uploaded',
        originalPath: blob.url,
        publicUrl: blob.url,
        displayName: filename,
        usages: []
      };
      
      return NextResponse.json(mediaRecord);
    } catch (error) {
      console.error('Blob upload failed:', error);
      return NextResponse.json({ error: 'Storage failure: Failed to upload to Vercel Blob.' }, { status: 500 });
    }
  }

  try {
    const dir = path.join(process.cwd(), 'public/uploads/studio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), buffer);
    
    const url = '/uploads/studio/' + filename;
    const mediaRecord = {
      id: url,
      sourceType: 'uploaded',
      originalPath: url,
      publicUrl: url,
      displayName: filename,
      usages: []
    };
    
    return NextResponse.json(mediaRecord);
  } catch (e) {
    console.warn('Filesystem read-only', e);
    return NextResponse.json({ error: 'Missing Storage Configuration: Vercel requires BLOB_READ_WRITE_TOKEN to persist uploaded files.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  // Ensure it's not a local asset that shouldn't be deleted
  if (!id.includes('.blob.vercel-storage.com/') && !id.startsWith('/uploads/studio/')) {
    return NextResponse.json({ error: 'Cannot delete built-in existing assets' }, { status: 403 });
  }

  if (process.env.BLOB_READ_WRITE_TOKEN && id.includes('.blob.vercel-storage.com/')) {
    try {
      await del(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Blob delete failed:', error);
      return NextResponse.json({ error: 'Storage failure: Failed to delete from Vercel Blob.' }, { status: 500 });
    }
  }

  try {
    if (id.startsWith('/uploads/studio/')) {
      const filename = path.basename(id);
      const filepath = path.join(process.cwd(), 'public/uploads/studio', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return NextResponse.json({ success: true });
      }
    }
    return NextResponse.json({ error: 'File not found locally' }, { status: 404 });
  } catch (e) {
    console.warn('Filesystem delete failed', e);
    return NextResponse.json({ error: 'Delete failed locally' }, { status: 500 });
  }
}
