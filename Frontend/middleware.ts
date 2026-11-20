import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value?.toUpperCase();
  const isAuthenticated = Boolean(token);

  // Publications and the research repository are hidden from anonymous
  // visitors and protected against direct URL access as well as navigation.
  if ((pathname === '/articles' || pathname.startsWith('/articles/') || pathname === '/repositories' || pathname.startsWith('/repositories/')) && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('reason', 'restricted');
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/auth')) {
    if (!isAuthenticated) return NextResponse.next();
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (userRole !== 'ADMIN') return NextResponse.redirect(new URL(userRole === 'MODERATOR' ? '/moderator' : '/student', request.url));
  }

  if (pathname.startsWith('/moderator')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') return NextResponse.redirect(new URL('/student', request.url));
  }

  if (pathname.startsWith('/student')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (userRole !== 'STUDENT' && userRole !== 'ADMIN' && userRole !== 'MODERATOR') return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/moderator/:path*', '/student/:path*', '/auth/:path*', '/articles', '/articles/:path*', '/repositories', '/repositories/:path*'] };
