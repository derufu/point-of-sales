'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(
  store_name: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  postal_code: string,
  country: string,
  website: string,
  bio: string
) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      store_name,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      website,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}