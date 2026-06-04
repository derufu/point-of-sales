'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Coffee,
  Zap,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/actions/auth';

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-8 h-8 text-amber-700 dark:text-amber-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">BrewPOS</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              Features
            </a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              Pricing
            </a>
            <a href="#contact" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-700">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-700">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">Modern POS Made Simple</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Serve Coffee,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  Not Chaos
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-md">
                BrewPOS is the modern point-of-sale system built for independent coffee shops. Fast, intuitive, and designed to keep you focused on what matters—great coffee.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!user ? (
                <>
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-base group">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="rounded-lg text-base border-slate-200 dark:border-slate-700">
                    Watch Demo
                  </Button>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-base group">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { value: '500+', label: 'Coffee Shops' },
                { value: '10K+', label: 'Daily Orders' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur-3xl opacity-20 dark:opacity-10"></div>
            <Card className="relative p-6 bg-white dark:bg-slate-800 border-0 shadow-2xl rounded-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center">
                <Coffee className="w-24 h-24 text-amber-300 opacity-30" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Powerful Features for Your Shop
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to run a modern coffee shop efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Lightning Fast',
                description: 'Process orders in seconds with our optimized checkout flow. No lags, no delays.',
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Real-Time Analytics',
                description: 'Track sales, inventory, and customer trends with beautiful dashboards.',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Team Management',
                description: 'Manage staff, track shifts, and monitor performance across your team.',
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Inventory Control',
                description: 'Never run out of beans again. Smart inventory tracking and alerts.',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Business Growth',
                description: 'Loyalty programs and customer insights to grow your business.',
              },
              {
                icon: <Coffee className="w-8 h-8" />,
                title: 'Menu Customization',
                description: 'Create unlimited menus with modifiers, sizes, and special items.',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 bg-slate-50 dark:bg-slate-800 border-0 hover:shadow-lg transition-shadow rounded-xl"
              >
                <div className="text-amber-600 dark:text-amber-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why BrewPOS Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Why Coffee Shop Owners Choose BrewPOS</h2>
              <p className="text-lg text-amber-50">
                Built by coffee shop owners who understand the unique challenges of running an independent cafe.
              </p>

              {[
                'No long-term contracts',
                'Affordable pricing starting at $49/month',
                '24/7 Priority support',
                'Cloud-based, works offline too',
                'Easy onboarding (30 minutes)',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">{item}</span>
                </div>
              ))}
            </div>

            <Card className="p-8 bg-white/10 backdrop-blur border-white/20 rounded-2xl">
              <div className="space-y-4 text-center">
                <p className="text-5xl font-bold">99.9%</p>
                <p className="text-lg text-amber-50">Uptime SLA</p>
                <Separator className="bg-white/20" />
                <p className="text-amber-50 text-sm">
                  We keep your shop running. Always.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              No hidden fees. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                features: ['Single Register', 'Basic Analytics', 'Email Support', 'Up to 500 orders/month'],
              },
              {
                name: 'Professional',
                price: '$99',
                features: [
                  'Up to 3 Registers',
                  'Advanced Analytics',
                  'Priority Support',
                  'Unlimited Orders',
                  'Inventory Management',
                ],
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: [
                  'Unlimited Registers',
                  'Custom Integration',
                  'Dedicated Support',
                  'White Label',
                  'Advanced Reporting',
                ],
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`p-8 rounded-xl transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-600 dark:border-amber-400 shadow-xl'
                    : 'bg-slate-50 dark:bg-slate-800 border-0 hover:shadow-lg'
                }`}
              >
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-slate-600 dark:text-slate-400">/month</span>
                  )}
                </div>

                <Button
                  className={`w-full mb-8 rounded-lg font-semibold ${
                    plan.highlight
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  Get Started
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Level Up Your Coffee Shop?
          </h2>
          <p className="text-xl text-slate-400">
            Join 500+ independent coffee shops already using BrewPOS
          </p>
          <Link href={user ? '/dashboard' : '/auth/signup'}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-base">
              {user ? 'Go to Dashboard' : 'Start Your Free 14-Day Trial'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 dark:bg-black border-t border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Updates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@brewpos.com" className="hover:text-white transition">
                    support@brewpos.com
                  </a>
                </li>
                <li>
                  <a href="tel:+1234567890" className="hover:text-white transition">
                    +1 (234) 567-890
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="bg-slate-800 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Coffee className="w-5 h-5 text-amber-600" />
              <span className="text-white font-semibold">BrewPOS</span>
            </div>
            <p>© 2026 BrewPOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
