import { NextResponse } from 'next/server';
import { getCmsText, updateCmsText } from '@/lib/cmsText';
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
        if (previewData.textPlacements) return NextResponse.json(previewData.textPlacements);
      }
    } catch (e) {
      console.error("Failed to read preview text", e);
    }
  }

  const data = getCmsText();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { id, publishedValue } = body;

  if (!id || typeof publishedValue !== 'string') {
    return NextResponse.json({ error: 'Missing id or publishedValue' }, { status: 400 });
  }

  const updatedData = updateCmsText(id, publishedValue);
  return NextResponse.json(updatedData);
}
