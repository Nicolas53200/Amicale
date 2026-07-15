"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*, commissions:commission_id(name, icon)")
    .or(`target_member_id.eq.${member.id},target_member_id.is.null`)
    .order("sent_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .or(`target_member_id.eq.${member.id},target_member_id.is.null`)
    .eq("read", false);

  return count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
  revalidatePath("/amicaliste/notifications");
  revalidatePath("/bureau/dashboard");
}

export async function markAllRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) return;

  await supabase
    .from("notifications")
    .update({ read: true })
    .or(`target_member_id.eq.${member.id},target_member_id.is.null`)
    .eq("read", false);

  revalidatePath("/amicaliste/notifications");
  revalidatePath("/bureau/dashboard");
}
