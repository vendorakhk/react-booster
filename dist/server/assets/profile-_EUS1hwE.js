import { s as supabaseUntyped } from "./client-Cm5qj9sr.js";
function getDisplayName(session) {
  const metadata = session.user.user_metadata ?? {};
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    session.user.email?.split("@")[0]
  ];
  const displayName = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );
  return displayName?.trim() ?? null;
}
async function ensureUserProfile(session) {
  const user = session?.user;
  if (!user) return;
  const { error } = await supabaseUntyped.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name: getDisplayName(session),
      balance_usdt: 0
    },
    {
      onConflict: "id",
      ignoreDuplicates: true
    }
  );
  if (error) throw error;
}
export {
  ensureUserProfile as e
};
