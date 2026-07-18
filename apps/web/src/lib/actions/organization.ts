"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "@/lib/auth";

export async function getOrganization() {
  const supabase = await createClient();

  let orgId: string;
  try {
    orgId = await getOrgId();
  } catch {
    return null;
  }

  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  return data;
}

export async function updateOrganization(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getOrgId();

  const name = formData.get("name") as string;
  const settings = {
    modules: {
      locations: formData.get("mod_locations") === "on",
      voyages: formData.get("mod_voyages") === "on",
      evenements: formData.get("mod_evenements") === "on",
      bons_cadeaux: formData.get("mod_bons_cadeaux") === "on",
    },
    theme_color: (formData.get("theme_color") as string) || "#FF6B35",
  };

  const { error } = await supabase
    .from("organizations")
    .update({ name, settings })
    .eq("id", orgId);

  if (error) throw error;
  revalidatePath("/bureau/parametres");
}

export async function getOrgStats() {
  const supabase = await createClient();

  const [membersRes, commissionsRes, eventsRes, tripsRes, assetsRes, entriesRes] =
    await Promise.all([
      supabase.from("members").select("id, status, role, created_at"),
      supabase.from("commissions").select("id, budget, model").eq("active", true),
      supabase.from("events").select("id, date, price, event_registrations(count)"),
      supabase.from("trips").select("id, start_date, price_adult, trip_registrations(count)"),
      supabase.from("assets").select("id, asset_bookings(count)"),
      supabase
        .from("accounting_entries")
        .select("type, amount, status, created_at")
        .order("created_at", { ascending: false }),
    ]);

  const members = membersRes.data ?? [];
  const commissions = commissionsRes.data ?? [];
  const events = eventsRes.data ?? [];
  const trips = tripsRes.data ?? [];
  const assets = assetsRes.data ?? [];
  const entries = entriesRes.data ?? [];

  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const recettes = entries
    .filter((e) => e.type === "recette" && e.status === "validee")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = entries
    .filter((e) => e.type === "facture" && e.status === "validee")
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  const upcomingEvents = events.filter((e) => new Date(e.date) >= now).length;
  const upcomingTrips = trips.filter((t) => new Date(t.start_date) >= now).length;

  const totalRegistrations = events.reduce(
    (s, e) => s + ((e.event_registrations as { count: number }[])?.[0]?.count ?? 0),
    0
  );
  const totalTripRegistrations = trips.reduce(
    (s, t) => s + ((t.trip_registrations as { count: number }[])?.[0]?.count ?? 0),
    0
  );
  const totalBookings = assets.reduce(
    (s, a) => s + ((a.asset_bookings as { count: number }[])?.[0]?.count ?? 0),
    0
  );

  const newMembersThisMonth = members.filter(
    (m) => new Date(m.created_at) >= monthAgo
  ).length;

  const activeMembers = members.filter((m) => m.status === "actif").length;
  const budgetTotal = commissions.reduce(
    (s, c) => s + parseFloat(c.budget || "0"),
    0
  );

  return {
    members: { total: members.length, active: activeMembers, newThisMonth: newMembersThisMonth },
    commissions: { total: commissions.length, budgetTotal },
    events: { total: events.length, upcoming: upcomingEvents, registrations: totalRegistrations },
    trips: { total: trips.length, upcoming: upcomingTrips, registrations: totalTripRegistrations },
    assets: { total: assets.length, bookings: totalBookings },
    finance: { recettes, depenses, solde: recettes - depenses, pending: entries.filter((e) => e.status === "attente").length },
  };
}
