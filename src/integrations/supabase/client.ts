// Browser Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const missingEnvError =
  'App configuration is incomplete. Add your Supabase URL and publishable key in Project Settings.';

function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined);
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== 'undefined' ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined);
  return { url, publishableKey, isConfigured: Boolean(url && publishableKey) };
}

function createSupabaseClient() {
  const { url, publishableKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) throw new Error(missingEnvError);
  return createClient<Database>(url!, publishableKey!, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export function isSupabaseConfigured() {
  return getSupabaseConfig().isConfigured;
}

export function getSupabaseConfigError() {
  return missingEnvError;
}

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});

// Loose-typed alias for code that hasn't been migrated to the typed client yet.
export const supabaseUntyped = supabase as any;
