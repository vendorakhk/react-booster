import type { Session } from "@supabase/supabase-js";
import { supabaseUntyped as supabase } from "./client";

function getDisplayName(session: Session) {
  const metadata = session.user.user_metadata ?? {};
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    session.user.email?.split("@")[0],
  ];

  const displayName = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  return displayName?.trim() ?? null;
}

export async function ensureUserProfile(session: Session | null | undefined) {
  const user = session?.user;
  if (!user) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name: getDisplayName(session),
      balance_usdt: 0,
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );

  if (error) throw error;
}
