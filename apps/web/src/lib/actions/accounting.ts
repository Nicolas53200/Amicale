"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAccountingEntries(commissionId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("accounting_entries")
    .select("*, commissions:commission_id(name, icon, color)")
    .order("created_at", { ascending: false });

  if (commissionId) {
    query = query.eq("commission_id", commissionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAccountingStats(commissionId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("accounting_entries")
    .select("type, amount, status");

  if (commissionId) {
    query = query.eq("commission_id", commissionId);
  }

  const { data, error } = await query;
  if (error) throw error;

  let recettes = 0;
  let depenses = 0;

  for (const entry of data) {
    const amount = parseFloat(entry.amount);
    if (entry.type === "recette") {
      recettes += amount;
    } else {
      depenses += amount;
    }
  }

  let budget = 0;
  if (commissionId) {
    const { data: comm } = await supabase
      .from("commissions")
      .select("budget")
      .eq("id", commissionId)
      .single();
    budget = parseFloat(comm?.budget || "0");
  } else {
    const { data: comms } = await supabase
      .from("commissions")
      .select("budget")
      .eq("active", true);
    budget = (comms ?? []).reduce(
      (sum, c) => sum + parseFloat(c.budget || "0"),
      0
    );
  }

  const solde = budget + recettes - depenses;
  const pending = data.filter((e) => e.status === "attente").length;

  return { budget, recettes, depenses, solde, pending };
}

export async function createAccountingEntry(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const orgId = user.user_metadata?.org_id;
  if (!orgId) throw new Error("Organisation non trouvée");

  const commissionId = formData.get("commission_id") as string;
  const type = formData.get("type") as string;

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase.from("accounting_entries").insert({
    org_id: orgId,
    commission_id: commissionId,
    type,
    label: formData.get("label") as string,
    provider: (formData.get("provider") as string) || null,
    amount: parseFloat(formData.get("amount") as string),
    status: type === "recette" ? "recette" : "attente",
    document_url: (formData.get("document_url") as string) || null,
    payment_mode: (formData.get("payment_mode") as string) || null,
    submitted_by: member?.id || null,
  });

  if (error) throw error;
  revalidatePath("/bureau/comptabilite");
  revalidatePath(`/bureau/commissions/${commissionId}`);
}

export async function updateEntryStatus(
  id: string,
  status: string,
  paymentMode?: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const updates: Record<string, unknown> = { status };
  if (status === "valide") {
    updates.validated_by = member?.id || null;
    updates.payment_date = new Date().toISOString().split("T")[0];
    if (paymentMode) updates.payment_mode = paymentMode;
  }

  const { error } = await supabase
    .from("accounting_entries")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/comptabilite");
}
