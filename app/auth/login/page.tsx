'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { login } from '@/app/actions/auth';
import { Coffee, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  console.log('Supabase Client:', supabase);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-10 h-10 text-amber-700 dark:text-amber-400" />
            <span className="text-3xl font-bold text-slate-900 dark:text-white">CaféPOS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Sign in to your coffee shop dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-lg h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-lg h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Info */}
        {/* <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Demo:</strong> Use any email and password to test. Supabase will handle authentication.
          </p>
        </div> */}
      </div>
    </div>
  );
}
