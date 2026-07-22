"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireBureau } from "@/lib/auth";
import { sendNotification } from "@/lib/actions/notifications";

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
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const tagsRaw = formData.get("tags") as string;

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
    icon: (formData.get("icon") as string) || null,
    color: (formData.get("color") as string) || null,
    capacity: formData.get("capacity")
      ? parseInt(formData.get("capacity") as string)
      : null,
    status: (formData.get("status") as string) || "disponible",
    tags: tagsRaw ? JSON.parse(tagsRaw) : [],
  });

  if (error) throw error;
  revalidatePath("/bureau/locations");
  revalidatePath("/amicaliste/locations");
}

export async function updateAsset(id: string, formData: FormData) {
  await requireBureau();
  const supabase = await createClient();

  const tagsRaw = formData.get("tags") as string;

  const { error } = await supabase
    .from("assets")
    .update({
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      description: (formData.get("description") as string) || null,
      daily_rate: parseFloat(formData.get("daily_rate") as string),
      deposit: formData.get("deposit")
        ? parseFloat(formData.get("deposit") as string)
        : 0,
      rules: (formData.get("rules") as string) || null,
      icon: (formData.get("icon") as string) || null,
      color: (formData.get("color") as string) || null,
      capacity: formData.get("capacity")
        ? parseInt(formData.get("capacity") as string)
        : null,
      status: (formData.get("status") as string) || "disponible",
      tags: tagsRaw ? JSON.parse(tagsRaw) : [],
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/locations");
  revalidatePath(`/bureau/locations/${id}`);
  revalidatePath("/amicaliste/locations");
}

export async function deleteAsset(id: string) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase.from("assets").delete().eq("id", id);
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

  const { data: asset } = await supabase
    .from("assets")
    .select("name, org_id")
    .eq("id", assetId)
    .single();

  if (asset) {
    const { data: memberInfo } = await supabase
      .from("members")
      .select("first_name, last_name")
      .eq("id", member.id)
      .single();
    const name = memberInfo
      ? `${memberInfo.first_name} ${memberInfo.last_name}`
      : "Un membre";
    await sendNotification({
      orgId: asset.org_id,
      title: `Demande de réservation — ${asset.name}`,
      message: `${name} a demandé une réservation pour "${asset.name}" du ${formData.get("start_date")} au ${formData.get("end_date")}.`,
      type: "location",
    });
  }

  revalidatePath(`/bureau/locations/${assetId}`);
  revalidatePath(`/amicaliste/locations/${assetId}`);
}

export async function updateAssetPhotos(
  id: string,
  photos: string[],
  coverIndex: number | null
) {
  await requireBureau();
  const supabase = await createClient();

  const { error } = await supabase
    .from("assets")
    .update({ photos, cover_index: coverIndex })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(`/bureau/locations/${id}`);
  revalidatePath(`/amicaliste/locations/${id}`);
  revalidatePath("/amicaliste/locations");
}

export async function updateBookingStatus(bookingId: string, status: string, refusalReason?: string) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("asset_bookings")
    .select("member_id, asset_id, start_date, end_date, assets:asset_id(name)")
    .eq("id", bookingId)
    .single();

  const updateData: Record<string, unknown> = { status };
  if (status === "refusee" && refusalReason) {
    updateData.refusal_reason = refusalReason;
  }

  const { error } = await supabase
    .from("asset_bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) throw error;

  if (booking && (status === "validee" || status === "refusee")) {
    const assetName =
      (booking.assets as unknown as { name: string } | null)?.name ?? "un bien";
    const isValidated = status === "validee";
    await sendNotification({
      orgId,
      title: isValidated
        ? `Réservation validée — ${assetName}`
        : `Réservation refusée — ${assetName}`,
      message: isValidated
        ? `Votre réservation de "${assetName}" du ${booking.start_date} au ${booking.end_date} a été validée.`
        : `Votre réservation de "${assetName}" du ${booking.start_date} au ${booking.end_date} a été refusée.`,
      targetMemberId: booking.member_id,
      type: "location",
    });
  }

  revalidatePath("/bureau/locations");
  if (booking) {
    revalidatePath(`/bureau/locations/${booking.asset_id}`);
    revalidatePath(`/amicaliste/locations/${booking.asset_id}`);
  }
}
