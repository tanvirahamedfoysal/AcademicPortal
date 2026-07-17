import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = {
  admin: '/admin',
  student: '/student',
  auth: '/auth'
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isAuthenticated = !!token;

  if (pathname.startsWith(protectedRoutes.auth)) {
    if (isAuthenticated) {
      const redirectPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(protectedRoutes.admin)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  if (pathname.startsWith(protectedRoutes.student)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (userRole !== 'STUDENT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/auth/:path*'
  ],
};