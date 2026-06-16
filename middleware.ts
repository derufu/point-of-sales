import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for core authentication callbacks/pages
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Safely retrieve user data (validates JWT server-side)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Robust verification check using both timestamp and metadata boolean
  const isEmailVerified = !!user?.email_confirmed_at || !!user?.user_metadata?.email_verified;

  // 2. Redirect root path `/` based on complete auth state
  if (pathname === '/') {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (!isEmailVerified) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Define and evaluate highly protected app routes
  const protectedRoutes = ['/dashboard', '/pos', '/menu', '/profile'];
  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isAccessingProtectedRoute) {
    // Scenario A: Completely unauthenticated
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // Scenario B: Logged in but email is unverified
    if (!isEmailVerified) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/profile/:path*', '/pos/:path*', '/menu/:path*'],
};
