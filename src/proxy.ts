import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Authentication for /testing is now handled entirely client-side via React context
  // so that the session does not survive a page refresh.
  return NextResponse.next();
}

export const config = {
  // We can keep the matcher, or remove it. Keeping it empty might be safer, or just match testing as before.
  matcher: ['/testing/:path*'],
};
