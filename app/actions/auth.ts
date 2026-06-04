'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignupFormSchema, FormState } from '@/app/lib/definitions'

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
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

  const supabase = await createClient();
  const { email, password, name } = validatedFields.data;

  // Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    return {
      message: error.message || "An error occurred during signup",
    };
  }

  if (!data.user) {
    return {
      message: "Signup failed. Please try again.",
    };
  }

  // Redirect to login page
  redirect("/auth/login?message=Check your email to confirm your account");
}

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      errors: {
        email: email ? [] : ["Email is required"],
        password: password ? [] : ["Password is required"],
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: error.message || "Invalid email or password",
    };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}