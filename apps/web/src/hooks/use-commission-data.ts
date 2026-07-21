"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";

interface UseCommissionDataOptions {
  commissionId: string;
}

export function useCommissionItems(commissionId: string, category?: string) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("commission_items")
      .select("*")
      .eq("commission_id", commissionId)
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    const { data } = await query;
    setItems(data ?? []);
    setLoading(false);
  }, [commissionId, category]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const add = async (item: Record<string, unknown>) => {
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const { data } = await supabase
      .from("commission_items")
      .insert({ ...item, org_id: orgId, commission_id: commissionId })
      .select()
      .single();
    if (data) setItems((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id: string, updates: Record<string, unknown>) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("commission_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (data) setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
    return data;
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("commission_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, loading, reload: load, add, update, remove };
}

export function useCommissionContacts(commissionId: string, type?: string) {
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("commission_contacts")
      .select("*")
      .eq("commission_id", commissionId)
      .order("name");

    if (type) query = query.eq("type", type);
    const { data } = await query;
    setContacts(data ?? []);
    setLoading(false);
  }, [commissionId, type]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const add = async (contact: Record<string, unknown>) => {
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const { data } = await supabase
      .from("commission_contacts")
      .insert({ ...contact, org_id: orgId, commission_id: commissionId })
      .select()
      .single();
    if (data) setContacts((prev) => [...prev, data]);
    return data;
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("commission_contacts").delete().eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return { contacts, loading, reload: load, add, remove };
}

export function useCommissionActivities(commissionId: string, type?: string) {
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("commission_activities")
      .select("*")
      .eq("commission_id", commissionId)
      .order("date", { ascending: false });

    if (type) query = query.eq("type", type);
    const { data } = await query;
    setActivities(data ?? []);
    setLoading(false);
  }, [commissionId, type]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const add = async (activity: Record<string, unknown>) => {
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const { data } = await supabase
      .from("commission_activities")
      .insert({ ...activity, org_id: orgId, commission_id: commissionId })
      .select()
      .single();
    if (data) setActivities((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id: string, updates: Record<string, unknown>) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("commission_activities")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (data) setActivities((prev) => prev.map((a) => (a.id === id ? data : a)));
    return data;
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("commission_activities").delete().eq("id", id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  return { activities, loading, reload: load, add, update, remove };
}

export function useCommissionSettings({ commissionId }: UseCommissionDataOptions) {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("commission_settings")
      .select("key, value")
      .eq("commission_id", commissionId);

    const result: Record<string, unknown> = {};
    for (const row of data ?? []) {
      result[row.key] = row.value;
    }
    setSettings(result);
    setLoading(false);
  }, [commissionId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const set = async (key: string, value: unknown) => {
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    await supabase
      .from("commission_settings")
      .upsert(
        { org_id: orgId, commission_id: commissionId, key, value },
        { onConflict: "commission_id,key" }
      );
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, loading, reload: load, set };
}
