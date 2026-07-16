"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getInbox() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:from_id(first_name, last_name, avatar_url)")
    .eq("to_id", member.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSentMessages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*, recipient:to_id(first_name, last_name, avatar_url)")
    .eq("from_id", member.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const orgId = user.user_metadata?.org_id;

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("Membre non trouvé");

  const { error } = await supabase.from("messages").insert({
    org_id: orgId,
    from_id: member.id,
    to_id: formData.get("to_id") as string,
    subject: (formData.get("subject") as string) || null,
    body: formData.get("body") as string,
  });

  if (error) throw error;
  revalidatePath("/bureau/messagerie");
  revalidatePath("/amicaliste/messagerie");
}

export async function markAsRead(messageId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) throw error;
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("Membre non trouvé");

  // Only allow deleting messages the user sent
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId)
    .eq("from_id", member.id);

  if (error) throw error;
  revalidatePath("/bureau/messagerie");
  revalidatePath("/amicaliste/messagerie");
}
