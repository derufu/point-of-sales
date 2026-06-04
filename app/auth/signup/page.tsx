"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, {});
  const actionState = state ?? {};
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Create Account
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Join POS System and start managing your business
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>
            {actionState.errors?.name && (
              <p className="mt-1 text-sm text-red-500">{actionState.errors.name[0]}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>
            {actionState.errors?.email && (
              <p className="mt-1 text-sm text-red-500">
                {actionState.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {actionState.errors?.password && (
              <p className="mt-1 text-sm text-red-500">
                {actionState.errors.password[0]}
              </p>
            )}
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Password must have 8+ characters, uppercase, number, and special
              character (!@#$%^&*)
            </p>
          </div>

          {/* Error Message */}
          {actionState.message && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {actionState.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            Create Account <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">OR</span>
          <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
