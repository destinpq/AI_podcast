import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is on the auth error page
  if (request.nextUrl.pathname === '/auth-error') {
    // Redirect to home page with demo parameter
    const url = new URL('/', request.url);
    url.searchParams.set('demo', 'true');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/auth-error', '/firebase-error', '/error'],
}; 