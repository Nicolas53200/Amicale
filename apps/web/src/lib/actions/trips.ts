"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireBureau } from "@/lib/auth";
import { sendNotification } from "@/lib/actions/notifications";

export async function getTrips() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*, trip_registrations(count)")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getUpcomingTrips() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*, trip_registrations(count)")
    .gte("start_date", new Date().toISOString())
    .order("start_date")
    .limit(20);

  if (error) throw error;
  return data;
}

export async function getTrip(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      "*, trip_registrations(*, members:member_id(id, first_name, last_name, avatar_url))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTrip(formData: FormData) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const includedRaw = formData.get("included") as string;
  const notIncludedRaw = formData.get("not_included") as string;

  const { error } = await supabase.from("trips").insert({
    org_id: orgId,
    commission_id: (formData.get("commission_id") as string) || null,
    name: (formData.get("name") as string) || null,
    destination: formData.get("destination") as string,
    description: (formData.get("description") as string) || null,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    price_adult: parseFloat(formData.get("price_adult") as string),
    price_child: formData.get("price_child")
      ? parseFloat(formData.get("price_child") as string)
      : null,
    max_seats: formData.get("max_seats")
      ? parseInt(formData.get("max_seats") as string)
      : null,
    min_seats: formData.get("min_seats")
      ? parseInt(formData.get("min_seats") as string)
      : null,
    transport: (formData.get("transport") as string) || null,
    accommodation: (formData.get("accommodation") as string) || null,
    icon: (formData.get("icon") as string) || null,
    color: (formData.get("color") as string) || null,
    children_allowed: formData.get("children_allowed") === "true",
    max_adults_per_household: formData.get("max_adults_per_household")
      ? parseInt(formData.get("max_adults_per_household") as string)
      : null,
    registration_deadline: (formData.get("registration_deadline") as string) || null,
    child_age_limit: formData.get("child_age_limit")
      ? parseInt(formData.get("child_age_limit") as string)
      : null,
    guides_needed: formData.get("guides_needed")
      ? parseInt(formData.get("guides_needed") as string)
      : null,
    included: includedRaw ? JSON.parse(includedRaw) : [],
    not_included: notIncludedRaw ? JSON.parse(notIncludedRaw) : [],
  });

  if (error) throw error;
  revalidatePath("/bureau/voyages");
  revalidatePath("/amicaliste/voyages");
}

export async function updateTrip(id: string, formData: FormData) {
  await requireBureau();
  const supabase = await createClient();

  const includedRaw = formData.get("included") as string;
  const notIncludedRaw = formData.get("not_included") as string;

  const { error } = await supabase
    .from("trips")
    .update({
      commission_id: (formData.get("commission_id") as string) || null,
      name: (formData.get("name") as string) || null,
      destination: formData.get("destination") as string,
      description: (formData.get("description") as string) || null,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      price_adult: parseFloat(formData.get("price_adult") as string),
      price_child: formData.get("price_child")
        ? parseFloat(formData.get("price_child") as string)
        : null,
      max_seats: formData.get("max_seats")
        ? parseInt(formData.get("max_seats") as string)
        : null,
      min_seats: formData.get("min_seats")
        ? parseInt(formData.get("min_seats") as string)
        : null,
      transport: (formData.get("transport") as string) || null,
      accommodation: (formData.get("accommodation") as string) || null,
      icon: (formData.get("icon") as string) || null,
      color: (formData.get("color") as string) || null,
      children_allowed: formData.get("children_allowed") === "true",
      max_adults_per_household: formData.get("max_adults_per_household")
        ? parseInt(formData.get("max_adults_per_household") as string)
        : null,
      registration_deadline: (formData.get("registration_deadline") as string) || null,
      child_age_limit: formData.get("child_age_limit")
        ? parseInt(formData.get("child_age_limit") as string)
        : null,
      guides_needed: formData.get("guides_needed")
        ? parseInt(formData.get("guides_needed") as string)
        : null,
      included: includedRaw ? JSON.parse(includedRaw) : [],
      not_included: notIncludedRaw ? JSON.parse(notIncludedRaw) : [],
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/voyages");
  revalidatePath(`/bureau/voyages/${id}`);
  revalidatePath("/amicaliste/voyages");
}

export async function deleteTrip(id: string) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bureau/voyages");
  revalidatePath("/amicaliste/voyages");
}

// ── Bureau: trip inscription management ──

export async function validateTripRegistration(
  tripId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();

  const { error } = await supabase
    .from("trip_registrations")
    .update({ status: "acceptee" })
    .eq("trip_id", tripId)
    .eq("member_id", memberId);
  if (error) throw error;

  const { data: trip } = await supabase
    .from("trips")
    .select("destination, name, org_id")
    .eq("id", tripId)
    .single();

  if (trip) {
    const { data: reg } = await supabase
      .from("trip_registrations")
      .select("nb_adults, nb_children, members:member_id(first_name, last_name)")
      .eq("trip_id", tripId)
      .eq("member_id", memberId)
      .single();
    const m = (reg?.members as unknown as { first_name: string; last_name: string }[] | null)?.[0] ?? null;
    const name = m ? `${m.first_name} ${m.last_name}` : "Un membre";
    const tripName = trip.name || trip.destination;
    const nbPers = (reg?.nb_adults || 0) + (reg?.nb_children || 0);
    await sendNotification({
      orgId: trip.org_id,
      title: `Confirmation inscription — ${tripName}`,
      message: `Votre inscription pour "${tripName}" a ete confirmee (${nbPers} personne${nbPers > 1 ? "s" : ""}).`,
      targetMemberId: memberId,
      type: "voyage",
    });
  }

  revalidatePath(`/bureau/voyages/${tripId}`);
}

export async function refuseTripRegistration(
  tripId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();

  const { data: reg } = await supabase
    .from("trip_registrations")
    .select("members:member_id(first_name, last_name)")
    .eq("trip_id", tripId)
    .eq("member_id", memberId)
    .single();

  const { error } = await supabase
    .from("trip_registrations")
    .update({ status: "refusee" })
    .eq("trip_id", tripId)
    .eq("member_id", memberId);
  if (error) throw error;

  const { data: trip } = await supabase
    .from("trips")
    .select("destination, name, org_id")
    .eq("id", tripId)
    .single();

  if (trip) {
    const m = (reg?.members as unknown as { first_name: string; last_name: string }[] | null)?.[0] ?? null;
    const name = m ? `${m.first_name} ${m.last_name}` : "Un membre";
    const tripName = trip.name || trip.destination;
    await sendNotification({
      orgId: trip.org_id,
      title: `Inscription refusee — ${tripName}`,
      message: `L'inscription de ${name} au voyage "${tripName}" a ete refusee.`,
      targetMemberId: memberId,
      type: "voyage",
    });
  }

  revalidatePath(`/bureau/voyages/${tripId}`);
}

export async function deleteTripRegistration(
  tripId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase
    .from("trip_registrations")
    .delete()
    .eq("trip_id", tripId)
    .eq("member_id", memberId);
  if (error) throw error;
  revalidatePath(`/bureau/voyages/${tripId}`);
  revalidatePath(`/amicaliste/voyages/${tripId}`);
}

export async function cancelTripRegistration(tripId: string) {
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
    .from("trip_registrations")
    .delete()
    .eq("trip_id", tripId)
    .eq("member_id", member.id);

  if (error) throw error;
  revalidatePath(`/amicaliste/voyages/${tripId}`);
  revalidatePath(`/bureau/voyages/${tripId}`);
}

export async function registerForTrip(
  tripId: string,
  nbAdults: number,
  nbChildren: number,
  totalAmount: number
) {
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

  const { error } = await supabase.from("trip_registrations").upsert(
    {
      trip_id: tripId,
      member_id: member.id,
      nb_adults: nbAdults,
      nb_children: nbChildren,
      total_amount: totalAmount,
      payment_status: "en_attente",
    },
    { onConflict: "trip_id,member_id" }
  );

  if (error) throw error;

  const { data: trip } = await supabase
    .from("trips")
    .select("destination, name, org_id, commission_id")
    .eq("id", tripId)
    .single();

  if (trip) {
    const { data: memberInfo } = await supabase
      .from("members")
      .select("first_name, last_name")
      .eq("id", member.id)
      .single();
    const memberName = memberInfo
      ? `${memberInfo.first_name} ${memberInfo.last_name}`
      : "Un membre";
    const tripName = trip.name || trip.destination;
    await sendNotification({
      orgId: trip.org_id,
      title: `Inscription voyage — ${tripName}`,
      message: `${memberName} s'est inscrit(e) au voyage "${tripName}" (${nbAdults} adulte(s)${nbChildren > 0 ? `, ${nbChildren} enfant(s)` : ""}).`,
      commissionId: trip.commission_id,
      type: "voyage",
    });
  }

  revalidatePath(`/amicaliste/voyages/${tripId}`);
  revalidatePath(`/bureau/voyages/${tripId}`);
}
