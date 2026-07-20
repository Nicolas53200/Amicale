"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireBureau, getCurrentMember } from "@/lib/auth";

export async function getChangelogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("changelogs")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUnseenChangelogs() {
  const supabase = await createClient();
  const { orgId, memberId } = await getCurrentMember();

  const { data: member } = await supabase
    .from("members")
    .select("last_seen_changelog")
    .eq("id", memberId)
    .single();

  const lastSeen = member?.last_seen_changelog;

  let query = supabase
    .from("changelogs")
    .select("*")
    .order("published_at", { ascending: false });

  if (lastSeen) {
    query = query.gt("published_at", lastSeen);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data?.filter(
    (c: { org_id: string | null }) => c.org_id === null || c.org_id === orgId
  ) ?? [];
}

export async function markChangelogsSeen() {
  const supabase = await createClient();
  const { memberId } = await getCurrentMember();

  const { error } = await supabase
    .from("members")
    .update({ last_seen_changelog: new Date().toISOString() })
    .eq("id", memberId);

  if (error) throw error;
}

export async function createChangelog(formData: FormData) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const changesRaw = formData.get("changes") as string;
  const changes = changesRaw ? JSON.parse(changesRaw) : [];

  const { error } = await supabase.from("changelogs").insert({
    org_id: orgId,
    version: formData.get("version") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    changes,
    published_at: new Date().toISOString(),
  });

  if (error) throw error;
  revalidatePath("/bureau/nouveautes");
}

export async function deleteChangelog(id: string) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase.from("changelogs").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bureau/nouveautes");
}
