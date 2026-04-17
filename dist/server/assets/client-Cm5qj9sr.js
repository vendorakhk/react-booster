import { createClient } from "@supabase/supabase-js";
const missingEnvError = "App configuration is incomplete. Add your Supabase URL and publishable key in Project Settings.";
function getSupabaseConfig() {
  const url = "https://aprwmchvanwiowrsbkkc.supabase.co";
  const publishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcndtY2h2YW53aW93cnNia2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTg4MDgsImV4cCI6MjA5MTk3NDgwOH0.emaBu1zd_SQry9kGu1efQszvaxjtpDILSEM939UTQR4";
  return { url, publishableKey, isConfigured: Boolean(publishableKey) };
}
function createSupabaseClient() {
  const { url, publishableKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) throw new Error(missingEnvError);
  return createClient(url, publishableKey, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
function isSupabaseConfigured() {
  return getSupabaseConfig().isConfigured;
}
function getSupabaseConfigError() {
  return missingEnvError;
}
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const supabaseUntyped = supabase;
export {
  getSupabaseConfigError as g,
  isSupabaseConfigured as i,
  supabaseUntyped as s
};
