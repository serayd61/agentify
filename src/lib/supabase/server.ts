import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Mock client for when Supabase is not configured
/* eslint-disable @typescript-eslint/no-unused-vars */
function getMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: { message: 'Supabase not configured' } }),
      signInWithOAuth: async () => ({ data: { url: null, provider: 'google' }, error: { message: 'Supabase not configured' } }),
      resetPasswordForEmail: async () => ({ data: {}, error: { message: 'Supabase not configured' } }),
      updateUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    },
    from: (_table: string) => ({
      select: (_columns?: string) => ({
        eq: (_column: string, _value: unknown) => ({
          single: async () => ({ data: null, error: null }),
          order: (_column2: string, _options?: { ascending?: boolean }) => ({
            limit: (_count: number) => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }),
        order: (_column: string, _options?: { ascending?: boolean }) => Promise.resolve({ data: [], error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      insert: (_values: unknown) => ({
        select: (_columns?: string) => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
      update: (_values: unknown) => ({
        eq: (_column: string, _value: unknown) => Promise.resolve({ data: null, error: null }),
      }),
      upsert: (_values: unknown, _options?: { onConflict?: string }) => Promise.resolve({ error: null }),
    }),
  };
}

/* eslint-enable @typescript-eslint/no-unused-vars */


// Create Supabase client with async cookie handling
export function createServerClient() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return getMockClient() as unknown as ReturnType<typeof createSupabaseServerClient>;
  }

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component - ignored
          }
        },
      },
    }
  );
}

// Admin client with service role key
export async function createAdminClient() {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase admin not configured. Please set SUPABASE_SERVICE_ROLE_KEY');
    return getMockClient() as unknown as ReturnType<typeof createSupabaseServerClient>;
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component - ignored
          }
        },
      },
    }
  );
}
