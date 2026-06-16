"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

// ============================================================
// SCHEMAS
// ============================================================

const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*]/,
      "Password must contain at least one special character (!@#$%^&*)"
    ),
});

const LoginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ============================================================
// TYPES
// ============================================================

export type FormState<T extends string = string> = {
  errors?: Partial<Record<T, string[]>>;
  message?: string;
};

export type SignupFormState = FormState<"name" | "email" | "password">;
export type LoginFormState = FormState<"email" | "password">;

// ============================================================
// RATE LIMITER (in-memory)
// Replace with Upstash Redis in production for multi-instance support
// ============================================================

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW - (now - record.firstAttempt);
    return { allowed: false, retryAfterMs };
  }

  loginAttempts.set(ip, { ...record, count: record.count + 1 });
  return { allowed: true };
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "anonymous"
  );
}

// ============================================================
// SIGNUP
// ============================================================

export async function signup(
  state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password, name } = validatedFields.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    console.error("[signup] Supabase error:", error.message);

    if (
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already exists") ||
      error.code === "user_already_exists"
    ) {
      return {
        errors: {
          email: ["An account with this email already exists. Please log in."],
        },
      };
    }

    if (error.message.toLowerCase().includes("invalid email")) {
      return { errors: { email: ["Please enter a valid email address."] } };
    }

    return { message: "An error occurred during signup. Please try again." };
  }

  if (!data.user) {
    return { message: "Signup failed. Please try again." };
  }

  redirect("/auth/login?message=Check your email to confirm your account");
}
// ============================================================
// LOGIN
// ============================================================

export async function login(
  email: string,
  password: string
): Promise<{ error?: string }> {
  // 1. Rate limiting
  const ip = await getClientIp();
  const { allowed, retryAfterMs } = checkRateLimit(ip);

  if (!allowed) {
    const minutes = Math.ceil((retryAfterMs ?? 0) / 60000);
    return {
      error: `Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    };
  }

  // 2. Validate fields
  const validatedFields = LoginFormSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      error: errors.email?.[0] ?? errors.password?.[0] ?? "Invalid input.",
    };
  }

  const supabase = await createClient();

  // 3. Attempt login
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    console.error("[login] Supabase error:", error.message);

    if (
      error.message.toLowerCase().includes("invalid") ||
      error.message.toLowerCase().includes("credentials") ||
      error.message.toLowerCase().includes("not found")
    ) {
      return { error: "Invalid email or password. Please try again." };
    }

    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Please confirm your email address before logging in." };
    }

    if (error.message.toLowerCase().includes("too many requests")) {
      return { error: "Too many attempts. Please wait a few minutes and try again." };
    }

    return { error: "Login failed. Please try again." };
  }

  // 4. Reset rate limit on success
  resetRateLimit(ip);

  redirect("/");
}
// ============================================================
// GET USER
// ============================================================

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.message !== "Auth session missing!") {
      console.error("[getUser] error:", error.message);
    }
    return null;
  }

  return user;
}

// ============================================================
// GET SESSION
// ============================================================

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("[getSession] error:", error.message);
    return null;
  }

  return session;
}

// ============================================================
// GET SESSION INFO (with expiry details)
// ============================================================

export async function getSessionInfo() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) return null;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at ?? 0;
  const expiresInSeconds = expiresAt - now;

  return {
    user: session.user,
    expiresAt,
    expiresInSeconds,
    isExpired: now >= expiresAt,
    isExpiringSoon: expiresInSeconds <= 5 * 60, // within 5 minutes
  };
}

// ============================================================
// REFRESH SESSION
// ============================================================

export async function refreshSession() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    console.error("[refreshSession] error:", error.message);
    return null;
  }

  return session;
}

// ============================================================
// CHECK IF SESSION IS EXPIRED
// ============================================================

export async function isSessionExpired(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= (session.expires_at ?? 0);
}