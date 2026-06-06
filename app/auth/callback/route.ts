import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  // Handle error from Supabase (e.g. expired OTP)
  if (error) {
    const params = new URLSearchParams({
      error,
      error_code: errorCode ?? '',
      error_description: errorDescription ?? '',
    });
    return NextResponse.redirect(`${origin}/auth/error?${params.toString()}`);
  }

  // Exchange code for session
  if (code) {
    const supabase = createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const params = new URLSearchParams({
        error: 'exchange_failed',
        error_code: exchangeError.status?.toString() ?? '',
        error_description: exchangeError.message,
      });
      return NextResponse.redirect(`${origin}/auth/error?${params.toString()}`);
    }

    // Success — send to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code or error — redirect home
  return NextResponse.redirect(`${origin}/`);
}