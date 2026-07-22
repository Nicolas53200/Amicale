"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireBureau } from "@/lib/auth";
import { sendNotification } from "@/lib/actions/notifications";

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
    .eq("published", true)
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
  const { orgId } = await requireBureau();
  const supabase = await createClient();

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
    icon: (formData.get("icon") as string) || null,
    color: (formData.get("color") as string) || null,
    published: formData.get("published") !== "false",
    children_allowed: formData.get("children_allowed") === "true",
    child_age_limit: formData.get("child_age_limit")
      ? parseInt(formData.get("child_age_limit") as string)
      : 16,
    max_adults_per_household: formData.get("max_adults_per_household")
      ? parseInt(formData.get("max_adults_per_household") as string)
      : 6,
  });

  if (error) throw error;
  revalidatePath("/bureau/evenements");
  revalidatePath("/amicaliste/evenements");
}

interface RegisterEventParams {
  nbAdultes: number;
  nbEnfants?: number;
  enfantsIdx?: number[];
  totalPersonnes: number;
  isBenevole?: string;
}

export async function registerForEvent(eventId: string, params: RegisterEventParams) {
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
      nb_personnes: params.totalPersonnes,
      nb_adultes: params.nbAdultes,
      nb_enfants: params.nbEnfants ?? 0,
      enfants_idx: params.enfantsIdx ?? [],
      is_benevole: params.isBenevole || null,
      benevole_poste: params.isBenevole || null,
      benevole_status: params.isBenevole ? "attente" : null,
      status: "inscrit",
    },
    { onConflict: "event_id,member_id" }
  );

  if (error) throw error;

  const { data: event } = await supabase
    .from("events")
    .select("title, org_id, commission_id")
    .eq("id", eventId)
    .single();

  if (event) {
    const { data: memberInfo } = await supabase
      .from("members")
      .select("first_name, last_name")
      .eq("id", member.id)
      .single();
    const name = memberInfo
      ? `${memberInfo.first_name} ${memberInfo.last_name}`
      : "Un membre";
    const personnesStr = `${params.totalPersonnes} personne${params.totalPersonnes > 1 ? "s" : ""}`;
    await sendNotification({
      orgId: event.org_id,
      title: `Inscription — ${event.title}`,
      message: `${name} s'est inscrit(e) à l'événement "${event.title}" (${personnesStr})${params.isBenevole ? " en tant que bénévole" : ""}.`,
      commissionId: event.commission_id,
      type: "event",
    });
  }

  revalidatePath(`/amicaliste/evenements/${eventId}`);
  revalidatePath(`/bureau/evenements/${eventId}`);
}

export async function updateEvent(id: string, formData: FormData) {
  await requireBureau();
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({
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
      icon: (formData.get("icon") as string) || null,
      color: (formData.get("color") as string) || null,
      published: formData.get("published") !== "false",
      children_allowed: formData.get("children_allowed") === "true",
      child_age_limit: formData.get("child_age_limit")
        ? parseInt(formData.get("child_age_limit") as string)
        : 16,
      max_adults_per_household: formData.get("max_adults_per_household")
        ? parseInt(formData.get("max_adults_per_household") as string)
        : 6,
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/evenements");
  revalidatePath(`/bureau/evenements/${id}`);
  revalidatePath("/amicaliste/evenements");
}

export async function deleteEvent(id: string) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bureau/evenements");
  revalidatePath("/amicaliste/evenements");
}

// ── Bureau: benevole & inscription management ──

export async function validateRegistration(
  eventId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_registrations")
    .update({ status: "valide" })
    .eq("event_id", eventId)
    .eq("member_id", memberId);
  if (error) throw error;
  revalidatePath(`/bureau/evenements/${eventId}`);
}

export async function refuseRegistration(
  eventId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();

  const { data: reg } = await supabase
    .from("event_registrations")
    .select("members:member_id(first_name, last_name)")
    .eq("event_id", eventId)
    .eq("member_id", memberId)
    .single();

  const { error } = await supabase
    .from("event_registrations")
    .update({ status: "refuse" })
    .eq("event_id", eventId)
    .eq("member_id", memberId);
  if (error) throw error;

  const { data: event } = await supabase
    .from("events")
    .select("title, org_id")
    .eq("id", eventId)
    .single();

  if (event && reg) {
    const m = (reg.members as unknown as { first_name: string; last_name: string }[] | null)?.[0] ?? null;
    const name = m ? `${m.first_name} ${m.last_name}` : "Un membre";
    await sendNotification({
      orgId: event.org_id,
      title: `Inscription refusee — ${event.title}`,
      message: `L'inscription de ${name} a l'evenement "${event.title}" a ete refusee.`,
      targetMemberId: memberId,
      type: "event",
    });
  }

  revalidatePath(`/bureau/evenements/${eventId}`);
}

export async function deleteRegistration(
  eventId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("member_id", memberId);
  if (error) throw error;
  revalidatePath(`/bureau/evenements/${eventId}`);
  revalidatePath(`/amicaliste/evenements/${eventId}`);
}

export async function validateBenevole(
  eventId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();

  const { error } = await supabase
    .from("event_registrations")
    .update({ benevole_status: "valide" })
    .eq("event_id", eventId)
    .eq("member_id", memberId);
  if (error) throw error;

  const { data: event } = await supabase
    .from("events")
    .select("title, org_id")
    .eq("id", eventId)
    .single();

  if (event) {
    const { data: reg } = await supabase
      .from("event_registrations")
      .select("is_benevole, benevole_poste, members:member_id(first_name, last_name)")
      .eq("event_id", eventId)
      .eq("member_id", memberId)
      .single();
    const m = (reg?.members as unknown as { first_name: string; last_name: string }[] | null)?.[0] ?? null;
    const poste = reg?.benevole_poste || reg?.is_benevole || "Benevole";
    await sendNotification({
      orgId: event.org_id,
      title: `Candidature benevole validee — ${event.title}`,
      message: `Votre candidature comme benevole au poste "${poste}" pour "${event.title}" a ete validee.`,
      targetMemberId: memberId,
      type: "event",
    });
  }

  revalidatePath(`/bureau/evenements/${eventId}`);
}

export async function refuseBenevole(
  eventId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();

  const { data: reg } = await supabase
    .from("event_registrations")
    .select("is_benevole, benevole_poste, members:member_id(first_name, last_name)")
    .eq("event_id", eventId)
    .eq("member_id", memberId)
    .single();

  const { error } = await supabase
    .from("event_registrations")
    .update({ benevole_status: "refuse", is_benevole: null, benevole_poste: null })
    .eq("event_id", eventId)
    .eq("member_id", memberId);
  if (error) throw error;

  const { data: event } = await supabase
    .from("events")
    .select("title, org_id")
    .eq("id", eventId)
    .single();

  if (event) {
    const m = (reg?.members as unknown as { first_name: string; last_name: string }[] | null)?.[0] ?? null;
    const poste = reg?.benevole_poste || reg?.is_benevole || "Benevole";
    await sendNotification({
      orgId: event.org_id,
      title: `Candidature benevole refusee — ${event.title}`,
      message: `Votre candidature comme benevole au poste "${poste}" pour "${event.title}" a ete refusee. Tous les postes sont deja pourvus.`,
      targetMemberId: memberId,
      type: "event",
    });
  }

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

  const { data: event } = await supabase
    .from("events")
    .select("title, org_id, commission_id")
    .eq("id", eventId)
    .single();

  if (event) {
    const { data: memberInfo } = await supabase
      .from("members")
      .select("first_name, last_name")
      .eq("id", member.id)
      .single();
    const name = memberInfo
      ? `${memberInfo.first_name} ${memberInfo.last_name}`
      : "Un membre";
    await sendNotification({
      orgId: event.org_id,
      title: `Désinscription — ${event.title}`,
      message: `${name} s'est désinscrit(e) de l'événement "${event.title}".`,
      commissionId: event.commission_id,
      type: "event",
    });
  }

  revalidatePath(`/amicaliste/evenements/${eventId}`);
  revalidatePath(`/bureau/evenements/${eventId}`);
}
