import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Where to send the user on success. Sanitized so an attacker can't
  // craft ?next=https://evil.com or ?next=//evil.com and redirect users off-site.
  let next = searchParams.get('next') ?? '/dashboard'
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard'
  }

  // Builds an absolute redirect URL that respects the original host even
  // when the request comes through a proxy/load balancer (e.g. Vercel),
  // where `request.url` can otherwise report the wrong protocol/host.
  const buildRedirect = (path: string) => {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return `${origin}${path}`
    }
    if (forwardedHost) {
      return `https://${forwardedHost}${path}`
    }
    return `${origin}${path}`
  }

  // 1. Handle explicit error params Supabase sends back (e.g. expired or
  //    already-used verification link). error_description is more useful
  //    to show the user than the raw error code, when present.
  if (error) {
    const message = errorDescription ?? error
    return NextResponse.redirect(
      buildRedirect(`/auth/error?message=${encodeURIComponent(message)}`)
    )
  }

  // 2. Missing code = malformed or tampered link
  if (!code) {
    return NextResponse.redirect(buildRedirect('/auth/error?message=missing_code'))
  }

  try {
    const supabase = await createClient()

    // 3. Exchange the one-time code for a real session (sets auth cookies)
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        buildRedirect(`/auth/error?message=${encodeURIComponent(exchangeError.message)}`)
      )
    }

    // 4. Confirm a session/user actually exists post-exchange
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(buildRedirect('/auth/error?message=no_user'))
    }

    // 5. Success — send the user where they were headed (default: dashboard)
    return NextResponse.redirect(buildRedirect(next))

  } catch (err) {
    console.error('Callback critical error:', err)
    return NextResponse.redirect(buildRedirect('/auth/error?message=unexpected_error'))
  }
}