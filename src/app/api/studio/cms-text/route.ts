import { NextResponse } from 'next/server';
import { getCmsText, updateCmsText } from '@/lib/cmsText';

export async function GET() {
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
