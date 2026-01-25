import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/mock-exam', '/dashboard', '/profile', '/ai-analytics'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check premium features (only ai-analytics requires premium, mock-exam is free)
  if (session && pathname.startsWith('/ai-analytics')) {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_type')
      .eq('id', session.user.id)
      .single();

    // Redirect to pricing if not premium
    if (profile && profile.subscription_type !== 'premium') {
      const pricingUrl = new URL('/pricing', req.url);
      pricingUrl.searchParams.set('feature', 'ai_analytics');
      return NextResponse.redirect(pricingUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/mock-exam/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/ai-analytics/:path*',
  ],
};
