import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCmsData } from '@/lib/cms';
import { put, list, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';


function getMediaType(filename: string, mimeType?: string) {
  if (mimeType && mimeType.startsWith('video/')) return 'video';
  if (mimeType && mimeType.startsWith('image/')) return 'image';
  
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['mp4', 'webm', 'mov', 'quicktime'].includes(ext)) return 'video';
  return 'image';
}

export async function GET() {
  try {
    const cmsData: any[] = getCmsData() || [];
    const mediaMap = new Map();

        cmsData.forEach(img => {
      if (!img.src) return;
      const src = img.src;
      
      const mediaType = img.mediaType || getMediaType(src, img.mimeType);
      
      if (!mediaMap.has(src)) {
        mediaMap.set(src, {
          id: src,
          sourceType: 'existing',
          originalPath: src,
          publicUrl: src,
          displayName: src.split('/').pop() || src,
          mediaType: mediaType,
          mimeType: img.mimeType,
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
            mediaType: getMediaType(f, undefined),
            usages: []
          });
        } else {
          mediaMap.get(src).sourceType = 'uploaded';
        }
      });
    }

    const scanDirs = [
      { dir: path.join(process.cwd(), 'public/campaign-worlds'), prefix: '/campaign-worlds/' },
      { dir: path.join(process.cwd(), 'public/images'), prefix: '/images/' },
      { dir: path.join(process.cwd(), 'public/work'), prefix: '/work/' }
    ];

    scanDirs.forEach(({ dir, prefix }) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(f => {
          if (f.endsWith('.mp3')) return;
          const src = prefix + f;
          if (!mediaMap.has(src)) {
            mediaMap.set(src, {
              id: src,
              sourceType: 'existing',
              originalPath: src,
              publicUrl: src,
              displayName: f,
              mediaType: getMediaType(f, undefined),
              usages: []
            });
          }
        });
      }
    });

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { blobs } = await list({ prefix: 'studio/' });
        blobs.forEach((b: any) => {
          if (!mediaMap.has(b.url)) {
            mediaMap.set(b.url, {
              id: b.url,
              sourceType: 'uploaded',
              originalPath: b.url,
              publicUrl: b.url,
              displayName: b.pathname.replace('studio/', ''),
              mediaType: getMediaType(b.pathname, b.contentType),
              mimeType: b.contentType,
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
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'unnamed-file';
    const filename = Date.now() + '-' + safeName;
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    // Accurately determine mediaType from MIME or extension
    const mediaType = getMediaType(filename, file.type);
    const mimeType = file.type || (
      ext === 'mp4' ? 'video/mp4' :
      ext === 'webm' ? 'video/webm' :
      ext === 'mov' ? 'video/quicktime' :
      ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'webp' ? 'image/webp' :
      ext === 'svg' ? 'image/svg+xml' : 'application/octet-stream'
    );
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`studio/${filename}`, file, {
          access: 'public',
          addRandomSuffix: false
        });
        
        const mediaRecord = {
          id: blob.url,
          sourceType: 'uploaded' as const,
          originalPath: blob.url,
          publicUrl: blob.url,
          displayName: filename,
          mediaType,
          mimeType,
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
        sourceType: 'uploaded' as const,
        originalPath: url,
        publicUrl: url,
        displayName: filename,
        mediaType,
        mimeType,
        usages: []
      };
      
      return NextResponse.json(mediaRecord);
    } catch (e: any) {
      console.warn('Filesystem read-only or write error', e);
      return NextResponse.json({ error: e?.message || 'Storage error: Unable to save uploaded file locally.' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Failed to parse upload request:', err);
    return NextResponse.json({ error: err?.message || 'Failed to process file upload.' }, { status: 500 });
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
