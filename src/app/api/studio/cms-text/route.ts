import { NextResponse } from 'next/server';
import { getCmsText, updateCmsText } from '@/lib/cmsText';
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
        if (previewData.textPlacements) {
          return NextResponse.json(previewData.textPlacements, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
          });
        }
      }
    } catch (e) {
      console.error("Failed to read preview text", e);
    }
  }

  const data = await getCmsText();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { id, publishedValue } = body;

  if (!id || typeof publishedValue !== 'string') {
    return NextResponse.json({ error: 'Missing id or publishedValue' }, { status: 400 });
  }

  const updatedData = await updateCmsText(id, publishedValue);
  try {
    revalidatePath('/');
    revalidatePath('/api/studio/cms-text');
  } catch (e) {
    console.warn('Revalidation warning:', e);
  }

  return NextResponse.json(updatedData, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  });
}
