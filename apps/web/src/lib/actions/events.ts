"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_registrations(count)")
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getUpcomingEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_registrations(count)")
    .gte("date", new Date().toISOString())
    .order("date")
    .limit(20);

  if (error) throw error;
  return data;
}

export async function getEvent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "*, event_registrations(*, members:member_id(id, first_name, last_name, avatar_url))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const orgId = user.user_metadata?.org_id;

  const { error } = await supabase.from("events").insert({
    org_id: orgId,
    commission_id: (formData.get("commission_id") as string) || null,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    date: formData.get("date") as string,
    end_date: (formData.get("end_date") as string) || null,
    location: (formData.get("location") as string) || null,
    max_attendees: formData.get("max_attendees")
      ? parseInt(formData.get("max_attendees") as string)
      : null,
    price: formData.get("price")
      ? parseFloat(formData.get("price") as string)
      : 0,
    max_benevoles: formData.get("max_benevoles")
      ? parseInt(formData.get("max_benevoles") as string)
      : null,
    category: (formData.get("category") as string) || null,
  });

  if (error) throw error;
  revalidatePath("/bureau/evenements");
  revalidatePath("/amicaliste/evenements");
}

export async function registerForEvent(eventId: string, nbPersonnes = 1, isBenevole?: string) {
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

  const { error } = await supabase.from("event_registrations").upsert(
    {
      event_id: eventId,
      member_id: member.id,
      nb_personnes: nbPersonnes,
      is_benevole: isBenevole || null,
      status: "inscrit",
    },
    { onConflict: "event_id,member_id" }
  );

  if (error) throw error;
  revalidatePath(`/amicaliste/evenements/${eventId}`);
  revalidatePath(`/bureau/evenements/${eventId}`);
}

export async function cancelRegistration(eventId: string) {
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

  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("member_id", member.id);

  if (error) throw error;
  revalidatePath(`/amicaliste/evenements/${eventId}`);
  revalidatePath(`/bureau/evenements/${eventId}`);
}
