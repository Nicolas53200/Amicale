"use server";

import { createClient } from "@/lib/supabase/server";

export async function exportMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("first_name, last_name, email, phone, role, status, grade, centre, created_at")
    .order("last_name");

  if (!data) return "";

  const headers = ["Prénom", "Nom", "Email", "Téléphone", "Rôle", "Statut", "Grade", "Centre", "Date inscription"];
  const rows = data.map((m) => [
    m.first_name,
    m.last_name,
    m.email || "",
    m.phone || "",
    m.role,
    m.status,
    m.grade || "",
    m.centre || "",
    new Date(m.created_at).toLocaleDateString("fr-FR"),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}

export async function exportAccounting() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounting_entries")
    .select("type, label, amount, status, created_at, commissions:commission_id(name)")
    .order("created_at", { ascending: false });

  if (!data) return "";

  const headers = ["Type", "Libellé", "Montant", "Statut", "Commission", "Date"];
  const rows = data.map((e) => [
    e.type,
    e.label,
    e.amount,
    e.status,
    (e.commissions as unknown as { name: string } | null)?.name || "",
    new Date(e.created_at).toLocaleDateString("fr-FR"),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}

export async function exportEventRegistrations(eventId: string) {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("id", eventId)
    .single();

  const { data } = await supabase
    .from("event_registrations")
    .select("nb_personnes, is_benevole, status, members:member_id(first_name, last_name, email, phone)")
    .eq("event_id", eventId);

  if (!data) return "";

  const headers = ["Prénom", "Nom", "Email", "Téléphone", "Nb personnes", "Bénévole", "Statut"];
  const rows = data.map((r) => {
    const m = r.members as unknown as { first_name: string; last_name: string; email: string | null; phone: string | null };
    return [
      m.first_name,
      m.last_name,
      m.email || "",
      m.phone || "",
      r.nb_personnes,
      r.is_benevole || "Non",
      r.status,
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}
