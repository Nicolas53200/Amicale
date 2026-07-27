"use server";

import { createClient } from "@/lib/supabase/server";

export interface TodoItem {
  type: "messages" | "events" | "notifications" | "trips";
  icon: string;
  label: string;
  count: number;
  href: string;
}

export async function getTodoItems(): Promise<TodoItem[]> {
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

  const nowISO = new Date().toISOString();
  const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString();

  const [messagesRes, notificationsRes, eventsRes, tripsRes] =
    await Promise.all([
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("to_id", member.id)
        .is("read_at", null),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .or(`target_member_id.eq.${member.id},target_member_id.is.null`)
        .eq("read", false),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("published", true)
        .gte("date", nowISO)
        .lte("date", weekFromNow),
      supabase
        .from("trips")
        .select("id", { count: "exact", head: true })
        .gte("start_date", nowISO)
        .lte("start_date", weekFromNow),
    ]);

  const items: TodoItem[] = [];

  const unreadMessages = messagesRes.count ?? 0;
  if (unreadMessages > 0) {
    items.push({
      type: "messages",
      icon: "💬",
      label: `${unreadMessages} message${unreadMessages > 1 ? "s" : ""} non lu${unreadMessages > 1 ? "s" : ""}`,
      count: unreadMessages,
      href: "/amicaliste/messagerie",
    });
  }

  const unreadNotifications = notificationsRes.count ?? 0;
  if (unreadNotifications > 0) {
    items.push({
      type: "notifications",
      icon: "🔔",
      label: `${unreadNotifications} notification${unreadNotifications > 1 ? "s" : ""} non lue${unreadNotifications > 1 ? "s" : ""}`,
      count: unreadNotifications,
      href: "/amicaliste/notifications",
    });
  }

  const upcomingEvents = eventsRes.count ?? 0;
  if (upcomingEvents > 0) {
    items.push({
      type: "events",
      icon: "📅",
      label: `${upcomingEvents} événement${upcomingEvents > 1 ? "s" : ""} cette semaine`,
      count: upcomingEvents,
      href: "/amicaliste/evenements",
    });
  }

  const upcomingTrips = tripsRes.count ?? 0;
  if (upcomingTrips > 0) {
    items.push({
      type: "trips",
      icon: "✈️",
      label: `${upcomingTrips} voyage${upcomingTrips > 1 ? "s" : ""} cette semaine`,
      count: upcomingTrips,
      href: "/amicaliste/voyages",
    });
  }

  return items;
}
