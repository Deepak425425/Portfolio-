import { NextResponse } from 'next/server';
import { getTeamData, updateTeamData } from '@/lib/team';
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
        if (previewData.teamData) {
          return NextResponse.json(previewData.teamData, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
          });
        }
      }
    } catch (e) {
      console.error("Failed to read preview team data", e);
    }
  }

  const data = await getTeamData();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updatedData = await updateTeamData(body);
    try {
      revalidatePath('/team');
      revalidatePath('/api/studio/team');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json(
      { success: true, data: updatedData },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error: any) {
    console.error('Error saving team data:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update team data' }, { status: 500 });
  }
}
