import { createClient } from "@/lib/supabase/server";

/**
 * Server-side helper: fetches the current user's org_id from the members table.
 * Use in server actions instead of reading user_metadata (which is client-writable).
 */
export async function getOrgId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("No member profile");
  return member.org_id;
}
