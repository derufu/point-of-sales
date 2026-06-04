'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/actions/auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Coffee, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
      } else {
        setUser(user);
        setDisplayName(user.user_metadata?.store_name || '');
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Coffee className="w-12 h-12 text-amber-600 animate-bounce" />
      </div>
    );
  }

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            BrewPOS
          </h1>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="rounded-lg border-slate-200 dark:border-slate-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Profile
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your account details and store information.
              </p>
            </div>
          </div>

          {/* Account Information */}
          <Card className="bg-white dark:bg-slate-800 border-0">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Account Information</CardTitle>
              <CardDescription>Your Supabase authentication details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="userId" className="text-slate-700 dark:text-slate-300">
                    User ID
                  </Label>
                  <Input
                    id="userId"
                    value={user?.id || ''}
                    disabled
                    className="bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-xs"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                  <AvatarFallback className="bg-amber-600 text-white text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {displayName || 'Coffee Shop'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-slate-200 dark:bg-slate-700" />

          {/* Store Information */}
          <Card className="bg-white dark:bg-slate-800 border-0">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Store Information</CardTitle>
              <CardDescription>Your coffee shop details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="storeName" className="text-slate-700 dark:text-slate-300">
                  Store Name
                </Label>
                <Input
                  id="storeName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Coffee Shop"
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="joinDate" className="text-slate-700 dark:text-slate-300">
                  Member Since
                </Label>
                <Input
                  id="joinDate"
                  value={
                    user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : ''
                  }
                  disabled
                  className="bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-white dark:bg-slate-800 border-0">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Account Settings</CardTitle>
              <CardDescription>Manage your account preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Sign Out</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sign out from all devices
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="rounded-lg"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
