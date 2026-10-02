import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const password = process.env.STUDIO_ADMIN_PASSWORD || 'Grafly@Deepak';
  if ((body.username === 'admin' || body.email === 'admin') && body.password === password) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('groton_auth_token', 'secure_admin_token_2026', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    return res;
  }
  return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
}
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('groton_auth_token');
  return res;
}