"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Commission Items ───────────────────────────────────────────────

export async function getCommissionItems(commissionId: string, category?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("commission_items")
    .select("*")
    .eq("commission_id", commissionId)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertCommissionItem(item: {
  id?: string;
  org_id: string;
  commission_id: string;
  category: string;
  name: string;
  description?: string;
  quantity?: number;
  threshold?: number;
  unit_price?: number;
  status?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_items")
    .upsert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCommissionItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("commission_items").delete().eq("id", id);
  if (error) throw error;
}

// ─── Commission Contacts ────────────────────────────────────────────

export async function getCommissionContacts(commissionId: string, type?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("commission_contacts")
    .select("*")
    .eq("commission_id", commissionId)
    .order("name");

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertCommissionContact(contact: {
  id?: string;
  org_id: string;
  commission_id: string;
  type: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_contacts")
    .upsert(contact)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCommissionContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("commission_contacts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Commission Activities ──────────────────────────────────────────

export async function getCommissionActivities(commissionId: string, type?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("commission_activities")
    .select("*")
    .eq("commission_id", commissionId)
    .order("date", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertCommissionActivity(activity: {
  id?: string;
  org_id: string;
  commission_id: string;
  type: string;
  title: string;
  description?: string;
  date?: string;
  end_date?: string;
  status?: string;
  amount?: number;
  max_participants?: number;
  current_participants?: number;
  location?: string;
  beneficiary?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_activities")
    .upsert(activity)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCommissionActivity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("commission_activities").delete().eq("id", id);
  if (error) throw error;
}

// ─── Commission Settings ────────────────────────────────────────────

export async function getCommissionSetting(commissionId: string, key: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commission_settings")
    .select("value")
    .eq("commission_id", commissionId)
    .eq("key", key)
    .single();

  return data?.value ?? null;
}

export async function getCommissionSettings(commissionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_settings")
    .select("key, value")
    .eq("commission_id", commissionId);

  if (error) throw error;
  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function setCommissionSetting(params: {
  org_id: string;
  commission_id: string;
  key: string;
  value: unknown;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_settings")
    .upsert(
      {
        org_id: params.org_id,
        commission_id: params.commission_id,
        key: params.key,
        value: params.value,
      },
      { onConflict: "commission_id,key" }
    );

  if (error) throw error;
}
