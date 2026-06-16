'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(email: string, password: string, storeName: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        store_name: storeName,
        role: 'owner',
      },
      // ✅ Fix 1: tell Supabase where to redirect after email confirmation
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // No session = email confirmation pending
  if (data.session === null) {
    // ✅ Fix 2: pass email so verify-email page can display it
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile;
}

export async function inviteStaff(email: string, role: 'manager' | 'staff') {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'owner') {
    return { error: 'Only owners can invite staff' };
  }

  const { error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: {
      role,
      owner_id: user.id,
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}"use server";

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
// RATE LIMITER (in-memory for Edge/Serverless, no extra deps)
// Replace with Upstash in production for persistence across instances
// ============================================================

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

const RATE_LIMIT_MAX = 5;           // max attempts
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in ms

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  // No previous attempts or window expired — reset
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW - (now - record.firstAttempt);
    return { allowed: false, retryAfterMs };
  }

  // Increment count
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
  // 1. Validate fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, name } = validatedFields.data;
  const supabase = await createClient();

  // 2. Attempt signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  // 3. Handle specific Supabase errors
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
      return {
        errors: { email: ["Please enter a valid email address."] },
      };
    }

    return {
      message: "An error occurred during signup. Please try again.",
    };
  }

  // 4. Ensure user was created
  if (!data.user) {
    return {
      message: "Signup failed. Please try again.",
    };
  }

  // 5. Redirect with confirmation message
  redirect("/auth/login?message=Check your email to confirm your account");
}

// ============================================================
// LOGIN
// ============================================================

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Rate limiting
  const ip = await getClientIp();
  const { allowed, retryAfterMs } = checkRateLimit(ip);

  if (!allowed) {
    const minutes = Math.ceil((retryAfterMs ?? 0) / 60000);
    return {
      message: `Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    };
  }

  // 2. Validate fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  // 3. Attempt login
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] Supabase error:", error.message);

    // Keep error messages generic to avoid user enumeration
    if (
      error.message.toLowerCase().includes("invalid") ||
      error.message.toLowerCase().includes("credentials") ||
      error.message.toLowerCase().includes("not found")
    ) {
      return { message: "Invalid email or password. Please try again." };
    }

    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        message: "Please confirm your email address before logging in.",
      };
    }

    if (error.message.toLowerCase().includes("too many requests")) {
      return {
        message: "Too many attempts. Please wait a few minutes and try again.",
      };
    }

    return { message: "Login failed. Please try again." };
  }

  // 4. Reset rate limit on successful login
  resetRateLimit(ip);

  // 5. Redirect to home
  redirect("/");
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    // Log but still redirect — Supabase clears the local session cookie even on error
    console.error("[logout] Supabase signOut error:", error.message);
  }

  redirect("/auth/login");
}

// ============================================================
// GET USER (safe server-side fetch)
// ============================================================

export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // AuthSessionMissingError is expected when not logged in — only log unexpected errors
    if (error.message !== "Auth session missing!") {
      console.error("[getUser] error:", error.message);
    }
    return null;
  }

  return user;
}

// ============================================================
// GET SESSION (for checking expiry/metadata)
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
// REFRESH SESSION (call this to extend expiry on activity)
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