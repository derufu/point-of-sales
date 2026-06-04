import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Zap, LogOut } from "lucide-react";
import { getUser, logout } from "@/app/actions/auth";

export default async function LandingPage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          POS System
        </div>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <form action={logout}>
                <Button variant="destructive" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center lg:px-12">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          Modern Point of Sale Solution
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Streamline your business operations with our powerful POS system.
          Manage inventory, sales, and customer relationships all in one place.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          {!user ? (
            <>
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile">
                <Button size="lg" className="gap-2">
                  Dashboard <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Features
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg bg-white p-8 dark:bg-zinc-800">
              <BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Real-time Analytics
              </h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Track sales, inventory, and customer insights in real-time dashboards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-white p-8 dark:bg-zinc-800">
              <Users className="h-12 w-12 text-green-600 dark:text-green-400" />
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Customer Management
              </h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Build loyalty with customer profiles, transaction history, and rewards programs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-white p-8 dark:bg-zinc-800">
              <Zap className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Fast & Reliable
              </h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Lightning-fast transactions and 99.9% uptime for your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-4xl rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-12 text-center text-white">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to revolutionize your business?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of businesses using our POS system.
          </p>
          {!user && (
            <Link href="/auth/signup" className="mt-8 inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
              >
                Get Started Today <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-8 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-6xl text-center text-zinc-600 dark:text-zinc-400">
          <p>&copy; 2026 POS System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
