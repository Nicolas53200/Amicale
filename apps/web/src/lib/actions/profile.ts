"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("members")
    .select("*, organizations:org_id(name, slug, logo_url)")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function updateProfile(formData: FormData) {
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

  const updates: Record<string, string | null> = {};

  const fields = ["phone", "adresse", "grade", "centre"] as const;
  for (const field of fields) {
    const val = formData.get(field) as string;
    if (val !== null) updates[field] = val || null;
  }

  const dateNaissance = formData.get("date_naissance") as string;
  if (dateNaissance) {
    updates.date_naissance = dateNaissance;
  }

  const { error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", member.id);

  if (error) throw error;
  revalidatePath("/amicaliste/profil");
  revalidatePath("/bureau/profil");
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
