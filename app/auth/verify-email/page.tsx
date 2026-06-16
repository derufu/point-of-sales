'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Coffee, Mail, ArrowRight, RefreshCw, CheckCircle, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// ✅ Wrapped in Suspense because useSearchParams() requires it in Next.js App Router
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    if (!email) {
      setResendStatus('error');
      setErrorMessage('No email address found. Please sign up again.');
      return;
    }

    setResendStatus('sending');
    setErrorMessage('');

    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        // must match the redirect used at sign-up time and be present
        // in Supabase's Redirect URLs allow list
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setResendStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setResendStatus('sent');
    setCountdown(60);
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => {
      setCountdown((c) => c - 1);
      if (countdown === 1) setResendStatus('idle');
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
              <LogIn className="w-4 h-4 mr-2" />
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
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-30 dark:opacity-20 scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700 flex items-center justify-center shadow-lg">
                <Mail className="w-9 h-9 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Check your inbox</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              We sent a verification link to
            </p>
            {email && (
              <p className="font-semibold text-amber-600 dark:text-amber-400 text-lg break-all">
                {email}
              </p>
            )}
          </div>

          {/* Card */}
          <Card className="p-8 bg-white dark:bg-slate-800 border-0 shadow-xl rounded-2xl space-y-6">
            <div className="space-y-4">
              {[
                { step: '1', text: 'Open the email from CaféPOS' },
                { step: '2', text: 'Click the "Verify my email" button' },
                { step: '3', text: "You'll be redirected automatically" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{step}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{text}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-3">
              {resendStatus === 'error' && (
                <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                onClick={handleResend}
                disabled={resendStatus === 'sending' || countdown > 0}
                className="w-full rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-60"
              >
                {resendStatus === 'sending' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {resendStatus === 'sent' && <CheckCircle className="w-4 h-4 mr-2" />}
                {(resendStatus === 'idle' || resendStatus === 'error') && <Mail className="w-4 h-4 mr-2" />}
                {resendStatus === 'sending'
                  ? 'Sending…'
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend verification email'}
              </Button>

              <Link href="/auth/login" className="block">
                <Button
                  variant="ghost"
                  className="w-full rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
                >
                  Back to Sign In
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
            </div>
          </Card>

          <p className="text-center text-sm text-slate-500 dark:text-slate-500">
            Can't find the email? Check your spam folder or{' '}
            <a
              href="mailto:support@CaféPOS.com"
              className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-500">
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}