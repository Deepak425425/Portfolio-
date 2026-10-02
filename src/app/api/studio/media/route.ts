import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public/uploads/studio');
  if (!fs.existsSync(dir)) return NextResponse.json([]);
  const files = fs.readdirSync(dir).map(f => '/uploads/studio/' + f);
  return NextResponse.json(files);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const dir = path.join(process.cwd(), 'public/uploads/studio');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(path.join(dir, filename), buffer);
  return NextResponse.json({ url: '/uploads/studio/' + filename });
}