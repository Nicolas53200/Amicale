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

/**
 * Server-side helper: returns the current member's org_id, member id, and bureau status.
 * Use in server actions that need member info but don't require bureau privileges.
 */
export async function getCurrentMember(): Promise<{
  orgId: string;
  memberId: string;
  isBureau: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member } = await supabase
    .from("members")
    .select("id, org_id, is_bureau")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("No member profile");
  return {
    orgId: member.org_id,
    memberId: member.id,
    isBureau: !!member.is_bureau,
  };
}

/**
 * Server-side helper: like getCurrentMember(), but throws if the member is not bureau.
 * Use as a guard at the top of admin-only server actions.
 */
export async function requireBureau(): Promise<{
  orgId: string;
  memberId: string;
  isBureau: true;
}> {
  const member = await getCurrentMember();
  if (!member.isBureau) {
    throw new Error("Accès réservé au bureau");
  }
  return { orgId: member.orgId, memberId: member.memberId, isBureau: true };
}
