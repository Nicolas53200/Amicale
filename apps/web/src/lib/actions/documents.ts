"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "@/lib/auth";

export async function getDocuments(commissionId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("documents")
    .select("*, commissions:commission_id(name, icon), members:created_by(first_name, last_name)")
    .order("created_at", { ascending: false });

  if (commissionId) {
    query = query.eq("commission_id", commissionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDocument(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*, commissions:commission_id(name, icon), members:created_by(first_name, last_name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const orgId = await getOrgId();

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase.from("documents").insert({
    org_id: orgId,
    commission_id: (formData.get("commission_id") as string) || null,
    title: formData.get("title") as string,
    content: (formData.get("content") as string) || null,
    file_url: (formData.get("file_url") as string) || null,
    file_type: (formData.get("file_type") as string) || null,
    created_by: member?.id || null,
  });

  if (error) throw error;
  revalidatePath("/bureau/commissions");
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bureau/commissions");
}
