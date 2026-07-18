"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireBureau } from "@/lib/auth";

export async function getCommissions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commissions")
    .select("*, commission_members(count)")
    .eq("active", true)
    .order("is_fixed", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCommission(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commissions")
    .select(
      "*, commission_members(*, members:member_id(id, first_name, last_name, avatar_url, role))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getCommissionStats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commissions")
    .select("id, budget, is_fixed, active")
    .eq("active", true);

  if (error) throw error;

  const total = data.length;
  const fixed = data.filter((c) => c.is_fixed).length;
  const custom = total - fixed;
  const budgetTotal = data.reduce(
    (sum, c) => sum + parseFloat(c.budget || "0"),
    0
  );

  return { total, fixed, custom, budgetTotal };
}

export async function createCommission(formData: FormData) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const featuresRaw = formData.get("features") as string;
  const features = featuresRaw
    ? JSON.parse(featuresRaw)
    : ["notifications", "documents", "compta", "membres"];

  const { error } = await supabase.from("commissions").insert({
    org_id: orgId,
    name: formData.get("name") as string,
    model: (formData.get("model") as string) || "simple",
    icon: (formData.get("icon") as string) || null,
    color: (formData.get("color") as string) || null,
    budget: parseFloat((formData.get("budget") as string) || "0"),
    features,
    description: (formData.get("description") as string) || null,
    is_fixed: false,
  });

  if (error) throw error;
  revalidatePath("/bureau/commissions");
}

export async function updateCommission(id: string, formData: FormData) {
  await requireBureau();
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "budget") {
      updates[key] = parseFloat(value as string);
    } else if (key === "features") {
      updates[key] = JSON.parse(value as string);
    } else if (value !== "") {
      updates[key] = value;
    }
  }

  const { error } = await supabase
    .from("commissions")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/commissions");
  revalidatePath(`/bureau/commissions/${id}`);
}

export async function deleteCommission(id: string) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase
    .from("commissions")
    .update({ active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/commissions");
}

export async function addCommissionMember(
  commissionId: string,
  memberId: string,
  role = "membre"
) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase.from("commission_members").insert({
    commission_id: commissionId,
    member_id: memberId,
    role,
  });

  if (error) throw error;
  revalidatePath(`/bureau/commissions/${commissionId}`);
}

export async function removeCommissionMember(
  commissionId: string,
  memberId: string
) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_members")
    .delete()
    .eq("commission_id", commissionId)
    .eq("member_id", memberId);

  if (error) throw error;
  revalidatePath(`/bureau/commissions/${commissionId}`);
}
