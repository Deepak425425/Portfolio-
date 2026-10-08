import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PREVIEW_PATH = process.env.VERCEL === '1' ? '/tmp/preview.json' : path.join(process.cwd(), 'data', 'preview.json');

export async function POST(req: Request) {
  try {
    const { images, textPlacements, teamData } = await req.json();
    
    const previewData = { images, textPlacements, teamData };
    
    // Ensure directory exists
    const dir = path.dirname(PREVIEW_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(PREVIEW_PATH, JSON.stringify(previewData, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'Failed to create preview session' }, { status: 500 });
  }
}
