"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireBureau } from "@/lib/auth";
import { sendNotification } from "@/lib/actions/notifications";

export async function getCotisations(year?: number) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  let query = supabase
    .from("cotisations")
    .select("*, members:member_id(id, first_name, last_name, avatar_url)")
    .eq("org_id", orgId)
    .order("year", { ascending: false });

  if (year) {
    query = query.eq("year", year);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMyCotisations() {
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

  const { data, error } = await supabase
    .from("cotisations")
    .select("*")
    .eq("member_id", member.id)
    .order("year", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCotisation(formData: FormData) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const memberIds = formData.getAll("member_ids") as string[];
  const year = parseInt(formData.get("year") as string);
  const amount = parseFloat(formData.get("amount") as string);

  const rows = memberIds.map((memberId) => ({
    org_id: orgId,
    member_id: memberId,
    year,
    amount,
    status: "en_attente" as const,
  }));

  const { error } = await supabase
    .from("cotisations")
    .upsert(rows, { onConflict: "org_id,member_id,year" });

  if (error) throw error;
  revalidatePath("/bureau/cotisations");
  revalidatePath("/amicaliste/cotisations");
}

export async function generateYearCotisations(year: number, amount: number) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id")
    .eq("org_id", orgId);

  if (!members || members.length === 0) return;

  const rows = members.map((m) => ({
    org_id: orgId,
    member_id: m.id,
    year,
    amount,
    status: "en_attente" as const,
  }));

  const { error } = await supabase
    .from("cotisations")
    .upsert(rows, { onConflict: "org_id,member_id,year" });

  if (error) throw error;
  revalidatePath("/bureau/cotisations");
  revalidatePath("/amicaliste/cotisations");
}

export async function updateCotisationStatus(
  id: string,
  status: string,
  method?: string
) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "paye") {
    updateData.paid_at = new Date().toISOString();
    if (method) updateData.method = method;
  }

  const { data: cotisation } = await supabase
    .from("cotisations")
    .select("member_id, year, amount")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("cotisations")
    .update(updateData)
    .eq("id", id);

  if (error) throw error;

  if (cotisation && status === "paye") {
    await sendNotification({
      orgId,
      title: `Cotisation ${cotisation.year} validée`,
      message: `Votre cotisation de ${cotisation.amount} € pour l'année ${cotisation.year} a été enregistrée.`,
      targetMemberId: cotisation.member_id,
      type: "info",
    });
  }

  revalidatePath("/bureau/cotisations");
  revalidatePath("/amicaliste/cotisations");
}

export async function deleteCotisation(id: string) {
  await requireBureau();
  const supabase = await createClient();
  const { error } = await supabase.from("cotisations").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bureau/cotisations");
  revalidatePath("/amicaliste/cotisations");
}

export async function getCotisationStats(year: number) {
  const { orgId } = await requireBureau();
  const supabase = await createClient();

  const { data } = await supabase
    .from("cotisations")
    .select("status, amount")
    .eq("org_id", orgId)
    .eq("year", year);

  const total = data?.length ?? 0;
  const paye = data?.filter((c) => c.status === "paye").length ?? 0;
  const exonere = data?.filter((c) => c.status === "exonere").length ?? 0;
  const enAttente = data?.filter((c) => c.status === "en_attente").length ?? 0;
  const montantCollecte = data
    ?.filter((c) => c.status === "paye")
    .reduce((s, c) => s + Number(c.amount), 0) ?? 0;

  return { total, paye, exonere, enAttente, montantCollecte };
}
