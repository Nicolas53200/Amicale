"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAssets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*, asset_bookings(count)")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getAsset(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select(
      "*, asset_bookings(*, members:member_id(id, first_name, last_name, avatar_url))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createAsset(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const orgId = user.user_metadata?.org_id;

  const { error } = await supabase.from("assets").insert({
    org_id: orgId,
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    description: (formData.get("description") as string) || null,
    daily_rate: parseFloat(formData.get("daily_rate") as string),
    deposit: formData.get("deposit")
      ? parseFloat(formData.get("deposit") as string)
      : 0,
    rules: (formData.get("rules") as string) || null,
  });

  if (error) throw error;
  revalidatePath("/bureau/locations");
  revalidatePath("/amicaliste/locations");
}

export async function getBookingsForAsset(assetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asset_bookings")
    .select(
      "*, members:member_id(first_name, last_name)"
    )
    .eq("asset_id", assetId)
    .order("start_date");

  if (error) throw error;
  return data;
}

export async function requestBooking(formData: FormData) {
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

  const assetId = formData.get("asset_id") as string;

  const { error } = await supabase.from("asset_bookings").insert({
    asset_id: assetId,
    member_id: member.id,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    total_amount: parseFloat(formData.get("total_amount") as string),
    status: "en_attente",
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw error;
  revalidatePath(`/bureau/locations/${assetId}`);
  revalidatePath(`/amicaliste/locations/${assetId}`);
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("asset_bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) throw error;
  revalidatePath("/bureau/locations");
}
