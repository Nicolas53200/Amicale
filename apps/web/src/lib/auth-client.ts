import { createClient } from "@/lib/supabase/client";

/**
 * Client-side helper: fetches the current user's org_id from the members table.
 * Use in client components instead of reading user_metadata (which is client-writable).
 */
export async function getOrgIdClient(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  return member?.org_id ?? null;
}
