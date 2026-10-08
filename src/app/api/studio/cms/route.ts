import { NextResponse } from 'next/server';
import { getCmsData, updateCmsImage } from '@/lib/cms';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
const PREVIEW_PATH = process.env.VERCEL === '1' ? '/tmp/preview.json' : path.join(process.cwd(), 'data', 'preview.json');

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isPreview = url.searchParams.get('preview') === 'true';

  if (isPreview) {
    try {
      if (fs.existsSync(PREVIEW_PATH)) {
        const previewData = JSON.parse(fs.readFileSync(PREVIEW_PATH, 'utf-8'));
        if (previewData.images) return NextResponse.json(previewData.images);
      }
    } catch (e) {
      console.error("Failed to read preview images", e);
    }
  }

  return NextResponse.json(getCmsData());
}

export async function POST(req: Request) {
  const { id, src, mediaType, mimeType } = await req.json();
  const updated = updateCmsImage(id, src, mediaType, mimeType);
  return NextResponse.json(updated);
}