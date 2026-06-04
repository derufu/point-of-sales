'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coffee, LogOut, BarChart3, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
      } else {
        setUser(user);
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
        <div className="text-center">
          <Coffee className="w-12 h-12 text-amber-600 mx-auto animate-bounce mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-8 h-8 text-amber-700 dark:text-amber-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">BrewPOS</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">Welcome back!</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-lg border-slate-200 dark:border-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Coming Soon Cards */}
          <Card className="p-8 bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <ShoppingCart className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">POS System</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              Fast and intuitive point-of-sale interface for managing orders.
            </p>
            <Link href="/pos">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                Open POS
              </Button>
            </Link>
          </Card>

          <Card className="p-8 bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analytics</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              Real-time sales analytics and business insights.
            </p>
            <Button disabled variant="outline" className="w-full rounded-lg">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-8 bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Coffee className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Menu Manager</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              Manage your coffee shop menu and items.
            </p>
            <Button disabled variant="outline" className="w-full rounded-lg">
              Coming Soon
            </Button>
          </Card>
        </div>

        {/* Welcome Section */}
        <Card className="p-12 bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-xl rounded-2xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to BrewPOS</h1>
          <p className="text-lg text-amber-50 max-w-2xl">
            You&apos;re all set! Start by opening the POS system to begin processing orders, or explore analytics to understand your business better.
          </p>
        </Card>
      </main>
    </div>
  );
}
