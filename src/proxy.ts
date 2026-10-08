import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const isStudio = request.nextUrl.pathname.startsWith('/studio');
  const isStudioApi = request.nextUrl.pathname.startsWith('/api/studio');

  if (isStudio) {
    if (request.nextUrl.pathname === '/studio/login') return NextResponse.next();
    const token = request.cookies.get('groton_auth_token')?.value;
    if (token !== 'secure_admin_token_2026') {
      return NextResponse.redirect(new URL('/studio/login', request.url));
    }
  }

  if (isStudioApi) {
    if (request.nextUrl.pathname === '/api/studio/auth') return NextResponse.next();
    
    // Allow public read access to CMS media and text so the website renders published content
    const isPublicCmsRead = request.method === 'GET' && (
      request.nextUrl.pathname === '/api/studio/cms' ||
      request.nextUrl.pathname === '/api/studio/cms-text' ||
      request.nextUrl.pathname === '/api/studio/preview'
    );
    if (isPublicCmsRead) return NextResponse.next();

    const token = request.cookies.get('groton_auth_token')?.value;
    if (token !== 'secure_admin_token_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/testing/:path*', '/studio', '/studio/:path*', '/api/studio', '/api/studio/:path*'],
};
