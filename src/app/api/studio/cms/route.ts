import { NextResponse } from 'next/server';
import { getCmsData, updateCmsImage } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getCmsData());
}

export async function POST(req: Request) {
  const { id, src } = await req.json();
  const updated = updateCmsImage(id, src);
  return NextResponse.json(updated);
}