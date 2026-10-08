import { NextResponse } from 'next/server';
import { getCmsData, updateCmsImage } from '@/lib/cms';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PREVIEW_PATH = process.env.VERCEL === '1' ? '/tmp/preview.json' : path.join(process.cwd(), 'data', 'preview.json');

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isPreview = url.searchParams.get('preview') === 'true';

  if (isPreview) {
    try {
      if (fs.existsSync(PREVIEW_PATH)) {
        const previewData = JSON.parse(fs.readFileSync(PREVIEW_PATH, 'utf-8'));
        if (previewData.images) {
          return NextResponse.json(previewData.images, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
          });
        }
      }
    } catch (e) {
      console.error("Failed to read preview images", e);
    }
  }

  const data = await getCmsData();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  });
}

export async function POST(req: Request) {
  const { id, src, mediaType, mimeType } = await req.json();
  const updated = await updateCmsImage(id, src, mediaType, mimeType);
  try {
    revalidatePath('/');
    revalidatePath('/api/studio/cms');
  } catch (e) {
    console.warn('Revalidation warning:', e);
  }

  return NextResponse.json(updated, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  });
}