'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { signup } from '@/app/actions/auth';
import { Coffee, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

// Add <HTMLFormElement> generic parameter
const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  if (password.length < 6) {
    setError('Password must be at least 6 characters');
    setLoading(false);
    return;
  }

  try {
    const result = await signup(email, password, storeName);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Get Started</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create your coffee shop account today
          </p>
        </div>

        {/* Signup Form */}
        <Card className="p-8 bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-slate-700 dark:text-slate-300">
                Coffee Shop Name
              </Label>
              <Input
                id="storeName"
                type="text"
                placeholder="My Awesome Coffee"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                disabled={loading}
                autoComplete="organization"
                className="rounded-lg h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>

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
                autoComplete="email"
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
                autoComplete="new-password"
                className="rounded-lg h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                At least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Confirm your email after signup to start using CaféPOS.
          </p>
        </div>
      </div>
    </div>
  );
}