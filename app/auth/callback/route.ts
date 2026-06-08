import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  // If Supabase returned an error (expired link, etc.)
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?message=${error}`, request.url)
    );
  }

  // No code = invalid callback
  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/error?message=missing_code', request.url)
    );
  }

  try {
    const supabase = await createClient();

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    // Failed to exchange code
    if (exchangeError) {
      return NextResponse.redirect(
        new URL(
          `/auth/error?message=${encodeURIComponent(exchangeError.message)}`,
          request.url
        )
      );
    }

    // Get user after login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/error?message=no_user', request.url)
      );
    }

    // Success → redirect to dashboard
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
  } catch (err) {
    // Safe fallback (no TS error issues)
    console.error('Callback error:', err);

    return NextResponse.redirect(
      new URL('/auth/error?message=unexpected_error', request.url)
    );
  }
}