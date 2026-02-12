'use server';

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = createServerClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyName = formData.get('companyName') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      data: {
        company_name: companyName,
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Update customer record with additional info
  if (data.user) {
    await supabase
      .from('customers')
      .update({
        company_name: companyName,
        first_name: firstName,
        last_name: lastName,
      })
      .eq('auth_user_id', data.user.id);
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = createServerClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = createServerClient();

  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const supabase = createServerClient();

  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
