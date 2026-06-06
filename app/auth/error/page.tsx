'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Coffee, AlertTriangle, RefreshCw, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// Human-readable messages per error_code
const ERROR_CONFIG: Record<string, { title: string; message: string; action: 'resend' | 'login' }> = {
  otp_expired: {
    title: 'Verification link expired',
    message:
      'Email verification links expire after 24 hours for security. Request a new one and verify your account straight away.',
    action: 'resend',
  },
  otp_disabled: {
    title: 'Link already used',
    message: 'This verification link has already been used. You can sign in directly.',
    action: 'login',
  },
  access_denied: {
    title: 'Access denied',
    message: 'This link is no longer valid. Request a new verification email to continue.',
    action: 'resend',
  },
};

const FALLBACK = {
  title: 'Something went wrong',
  message: 'An unexpected error occurred. Please try again or contact support.',
  action: 'login' as const,
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error_code') ?? '';
  const errorDescription = searchParams.get('error_description') ?? '';

  const config = ERROR_CONFIG[errorCode] ?? FALLBACK;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="w-8 h-8 text-amber-700 dark:text-amber-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">CaféPOS</span>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-700">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          {/* Icon badge */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-20 scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-9 h-9 text-red-500 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{config.title}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-sm mx-auto">
              {config.message}
            </p>
          </div>

          {/* Card */}
          <Card className="p-8 bg-white dark:bg-slate-800 border-0 shadow-xl rounded-2xl space-y-4">
            {config.action === 'resend' ? (
              <>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white group">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend verification email
                  </Button>
                </Link>
                <Link href="/auth/login" className="block">
                  <Button
                    variant="ghost"
                    className="w-full rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
                  >
                    Back to Sign In
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block">
                  <Button className="w-full rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white">
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button
                    variant="ghost"
                    className="w-full rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Back to Home
                  </Button>
                </Link>
              </>
            )}
          </Card>

          {/* Debug info — only shown in dev */}
          {process.env.NODE_ENV === 'development' && errorDescription && (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">
                <span className="font-semibold">debug:</span> {errorCode} — {errorDescription}
              </p>
            </div>
          )}

          {/* Help */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-500">
            Still having trouble?{' '}
            <a
              href="mailto:support@CaféPOS.com"
              className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">CaféPOS</span>
          </div>
          <p>© 2026 CaféPOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}