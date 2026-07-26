"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Event {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  price: number;
  max_attendees: number | null;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  published: boolean;
  commission_id: string | null;
  event_registrations: { count: number }[];
}

interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  nb_personnes: number;
  nb_adultes: number;
  nb_enfants: number;
  status: string;
  is_benevole: string | null;
  created_at: string;
  members: { id: string; first_name: string; last_name: string; avatar_url: string | null };
  events: { title: string };
}

interface AccountingEntry {
  id: string;
  type: string;
  label: string;
  amount: string;
  status: string;
  created_at: string;
}

export default function EvenementsBureauPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<EventRegistration[]>([]);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [commissionId, setCommissionId] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [comptaType, setComptaType] = useState<"facture" | "recette" | "caution">("facture");
  const [comptaLabel, setComptaLabel] = useState("");
  const [comptaAmount, setComptaAmount] = useState("");
  const [submittingCompta, setSubmittingCompta] = useState(false);
  const { showToast } = useToast();

  const loadAll = useCallback(async () => {
    const supabase = createClient();

    const { data: commData } = await supabase
      .from("commissions")
      .select("id, budget")
      .or("name.ilike.%événement%,name.ilike.%evenement%")
      .eq("active", true)
      .limit(1)
      .single();

    const cId = commData?.id ?? null;
    setCommissionId(cId);
    setBudget(parseFloat(commData?.budget || "0"));

    const { data: eventsData } = await supabase
      .from("events")
      .select("*, event_registrations(count)")
      .order("date", { ascending: true });
    setEvents((eventsData as Event[]) ?? []);

    const { data: regs } = await supabase
      .from("event_registrations")
      .select("*, members:member_id(id, first_name, last_name, avatar_url), events:event_id(title)")
      .eq("status", "inscrit")
      .order("created_at", { ascending: false });
    setPendingRegistrations((regs as unknown as EventRegistration[]) ?? []);

    if (cId) {
      const { data: ae } = await supabase
        .from("accounting_entries")
        .select("id, type, label, amount, status, created_at")
        .eq("commission_id", cId)
        .order("created_at", { ascending: false });
      setEntries(ae ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const now = new Date();
  const totalInscrits = events.reduce(
    (s, e) => s + (e.event_registrations[0]?.count ?? 0), 0
  );
  const upcoming = events.filter((e) => new Date(e.date) >= now).length;
  const currentYear = now.getFullYear();

  const recettes = entries.filter((e) => e.type === "recette").reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = entries.filter((e) => e.type !== "recette").reduce((s, e) => s + parseFloat(e.amount), 0);
  const solde = budget + recettes - depenses;

  async function handleTogglePublish(ev: Event) {
    setActing(ev.id);
    const supabase = createClient();
    await supabase
      .from("events")
      .update({ published: !ev.published })
      .eq("id", ev.id);
    showToast(ev.published ? "Événement dépublié" : "Événement publié", "success");
    setActing(null);
    loadAll();
  }

  async function handleDeleteEvent(ev: Event) {
    if (!confirm(`Supprimer "${ev.title}" ?`)) return;
    setActing(ev.id);
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", ev.id);
    showToast("Événement supprimé", "success");
    setActing(null);
    loadAll();
  }

  async function handleValidateReg(reg: EventRegistration) {
    setActing(reg.id);
    const supabase = createClient();
    await supabase
      .from("event_registrations")
      .update({ status: "valide" })
      .eq("id", reg.id);
    showToast(`Inscription de ${reg.members.first_name} validée`, "success");
    setActing(null);
    loadAll();
  }

  async function handleRefuseReg(reg: EventRegistration) {
    setActing(reg.id);
    const supabase = createClient();
    await supabase
      .from("event_registrations")
      .update({ status: "refuse" })
      .eq("id", reg.id);
    showToast(`Inscription de ${reg.members.first_name} refusée`, "success");
    setActing(null);
    loadAll();
  }

  async function handleSubmitCompta(e: React.FormEvent) {
    e.preventDefault();
    if (!comptaLabel.trim() || !comptaAmount.trim() || !commissionId) return;
    setSubmittingCompta(true);
    const supabase = createClient();
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
    await supabase.from("accounting_entries").insert({
      org_id: org?.id,
      commission_id: commissionId,
      type: comptaType,
      label: comptaLabel.trim(),
      amount: parseFloat(comptaAmount),
      status: comptaType === "recette" ? "recette" : "attente",
    });
    setComptaLabel("");
    setComptaAmount("");
    setSubmittingCompta(false);
    showToast("Opération envoyée", "success");
    loadAll();
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <GradientHeader title="Commission Événements" subtitle="Chargement..." backHref="/bureau/dashboard" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-[14px] bg-surface-secondary" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Commission Événements"
        subtitle={`Gestion des événements ${currentYear}`}
        backHref="/bureau/dashboard"
      >
        <Link
          href="/bureau/evenements/new"
          className="rounded-full bg-white/20 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-sm"
        >
          + Créer
        </Link>
      </GradientHeader>

      <Tabs defaultValue="evenements">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="evenements">
            <span className="mr-1">📅</span>Événements
          </TabsTrigger>
          <TabsTrigger value="inscriptions">
            <span className="mr-1">📥</span>Inscriptions
            {pendingRegistrations.length > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {pendingRegistrations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="compta">
            <span className="mr-1">💰</span>Compta
          </TabsTrigger>
        </TabsList>

        {/* ── ÉVÉNEMENTS ── */}
        <TabsContent value="evenements">
          <div className="flex flex-col gap-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-content-secondary">
              {events.length} événement{events.length > 1 ? "s" : ""} · {upcoming} à venir · {totalInscrits} inscrits
            </p>

            {events.length === 0 ? (
              <EmptyState
                icon="🎉"
                title="Aucun événement"
                description="Créez votre premier événement pour commencer"
                action={{ label: "Créer un événement", href: "/bureau/evenements/new" }}
              />
            ) : (
              events.map((ev) => {
                const d = new Date(ev.date);
                const inscrits = ev.event_registrations[0]?.count ?? 0;
                const color = ev.color || "#ef4444";
                const isPast = d < now;

                return (
                  <div key={ev.id} className="overflow-hidden rounded-[14px] bg-surface-elevated shadow-sm">
                    <div
                      className="relative flex h-[90px] items-end p-3"
                      style={{ background: color }}
                    >
                      <div className="absolute inset-0 bg-black/15" />
                      <div className="relative z-[1] flex-1">
                        <p className="text-[14px] font-bold text-white">{ev.title}</p>
                        <p className="mt-0.5 text-[11px] text-white/80">
                          {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                          {ev.location && ` · ${ev.location}`}
                        </p>
                      </div>
                      <Badge
                        variant={ev.published ? "success" : "neutral"}
                        className="relative z-[1]"
                      >
                        {ev.published ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-2.5">
                      <Link
                        href={`/bureau/evenements/${ev.id}`}
                        className="flex items-center justify-center gap-1 rounded-[10px] bg-blue-50 px-2 py-2 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(ev)}
                        disabled={acting === ev.id}
                        className={`flex items-center justify-center gap-1 rounded-[10px] px-2 py-2 text-[11px] font-semibold ${
                          ev.published
                            ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        }`}
                      >
                        {ev.published ? "Dépublier" : "Publier"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev)}
                        disabled={acting === ev.id}
                        className="flex items-center justify-center gap-1 rounded-[10px] bg-red-50 px-2 py-2 text-[11px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <Link
              href="/bureau/evenements/new"
              className="flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-border p-3 text-[12px] font-semibold text-content-muted transition-colors hover:border-brand-400 hover:text-brand-500"
            >
              + Créer un nouvel événement
            </Link>
          </div>
        </TabsContent>

        {/* ── INSCRIPTIONS ── */}
        <TabsContent value="inscriptions">
          <div className="flex flex-col gap-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-content-secondary">
              {pendingRegistrations.length} inscription{pendingRegistrations.length > 1 ? "s" : ""} en attente
            </p>

            {pendingRegistrations.length === 0 ? (
              <EmptyState
                icon="📥"
                title="Aucune inscription en attente"
                description="Les demandes d'inscription des amicalistes apparaîtront ici"
              />
            ) : (
              pendingRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[12px] font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                    {reg.members.first_name?.[0]}{reg.members.last_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {reg.members.first_name} {reg.members.last_name}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {reg.events.title} · {reg.nb_adultes} ad.{reg.nb_enfants > 0 ? ` + ${reg.nb_enfants} enf.` : ""}
                      {reg.is_benevole && " · Bénévole"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleValidateReg(reg)}
                      disabled={acting === reg.id}
                      className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRefuseReg(reg)}
                      disabled={acting === reg.id}
                      className="rounded-full bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── COMPTA ── */}
        <TabsContent value="compta">
          <div className="flex flex-col gap-4">
            {budget > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-content-muted">Budget</p>
                  <p className="text-[16px] font-bold text-content-primary">{fmt(budget)}</p>
                </div>
                <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-content-muted">Recettes</p>
                  <p className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400">{fmt(recettes)}</p>
                </div>
                <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-content-muted">Dépenses</p>
                  <p className="text-[16px] font-bold text-red-600 dark:text-red-400">{fmt(depenses)}</p>
                </div>
                <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-content-muted">Solde</p>
                  <p className={`text-[16px] font-bold ${solde >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {fmt(solde)}
                  </p>
                </div>
              </div>
            )}

            <p className="text-[12px] font-bold uppercase tracking-wide text-content-secondary">Envoyer au comptable</p>
            <form onSubmit={handleSubmitCompta} className="rounded-[14px] bg-surface-elevated p-4 shadow-sm">
              <div className="mb-3 flex gap-1 rounded-[12px] bg-surface-secondary p-1">
                {(["facture", "recette", "caution"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setComptaType(t)}
                    className={`flex-1 rounded-[10px] px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      comptaType === t
                        ? "bg-surface-elevated text-content-primary shadow-sm"
                        : "text-content-muted"
                    }`}
                  >
                    {t === "facture" ? "Devis/Facture" : t === "recette" ? "Recette" : "Caution"}
                  </button>
                ))}
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Libellé</label>
                <input
                  type="text"
                  value={comptaLabel}
                  onChange={(e) => setComptaLabel(e.target.value)}
                  placeholder="ex: Traiteur"
                  className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={comptaAmount}
                  onChange={(e) => setComptaAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingCompta}
                className="btn-gradient w-full rounded-[10px] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {submittingCompta ? "Envoi..." : "Envoyer au comptable"}
              </button>
            </form>

            <p className="text-[12px] font-bold uppercase tracking-wide text-content-secondary">Historique</p>
            {entries.length === 0 ? (
              <EmptyState title="Aucune opération" description="Les opérations comptables apparaîtront ici" />
            ) : (
              <div className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-[14px] bg-surface-elevated px-4 py-3 shadow-sm">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-content-primary">{entry.label}</span>
                        <Badge variant={entry.status === "valide" || entry.status === "recette" ? "success" : entry.status === "rejete" ? "danger" : "warning"}>
                          {entry.status === "valide" ? "Validé" : entry.status === "recette" ? "Recette" : entry.status === "rejete" ? "Rejeté" : "En attente"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-content-muted">
                        {new Date(entry.created_at).toLocaleDateString("fr-FR")} · <span className="capitalize">{entry.type}</span>
                      </p>
                    </div>
                    <p className={`ml-4 text-[13px] font-semibold tabular-nums ${entry.type === "recette" ? "text-emerald-600" : "text-content-primary"}`}>
                      {entry.type === "recette" ? "+" : "-"}{fmt(parseFloat(entry.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
