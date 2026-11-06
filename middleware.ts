import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /id/... is not a canonical URL; Indonesian lives without a prefix.
  if (pathname === '/id' || pathname.startsWith('/id/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/id/, '') || '/';
    return NextResponse.redirect(url);
  }

  const locale = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'id';
  const headers = new Headers(request.headers);
  headers.set('x-locale', locale);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
