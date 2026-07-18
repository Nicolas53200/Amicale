"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "@/lib/auth";

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
  const supabase = await createClient();
  const orgId = await getOrgId();

  const { error } = await supabase.from("trips").insert({
    org_id: orgId,
    commission_id: (formData.get("commission_id") as string) || null,
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
  });

  if (error) throw error;
  revalidatePath("/bureau/voyages");
  revalidatePath("/amicaliste/voyages");
}

export async function updateTrip(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trips")
    .update({
      commission_id: (formData.get("commission_id") as string) || null,
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
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/voyages");
  revalidatePath(`/bureau/voyages/${id}`);
  revalidatePath("/amicaliste/voyages");
}

export async function deleteTrip(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bureau/voyages");
  revalidatePath("/amicaliste/voyages");
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
  revalidatePath(`/amicaliste/voyages/${tripId}`);
  revalidatePath(`/bureau/voyages/${tripId}`);
}
