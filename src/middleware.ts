import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isAdmin = token?.email === process.env.ADMIN_EMAIL;
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
export const config = {
  matcher: ['/', '/admin/:path*', '/api/topup/confirm', '/api/withdraw/confirm'],
};