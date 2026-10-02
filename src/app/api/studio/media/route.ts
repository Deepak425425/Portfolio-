import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public/uploads/studio');
    if (!fs.existsSync(dir)) return NextResponse.json([]);
    const files = fs.readdirSync(dir).map(f => '/uploads/studio/' + f);
    return NextResponse.json(files);
  } catch (e) {
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
