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

interface Trip {
  id: string;
  name: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  price_adult: number;
  max_seats: number | null;
  color: string | null;
  icon: string | null;
  image_url: string | null;
  transport: string | null;
  accommodation: string | null;
  children_allowed: boolean;
  commission_id: string | null;
  trip_registrations: { count: number }[];
}

interface TripRegistration {
  id: string;
  trip_id: string;
  member_id: string;
  nb_adults: number;
  nb_children: number;
  status: string;
  created_at: string;
  members: { id: string; first_name: string; last_name: string; avatar_url: string | null };
  trips: { destination: string; name: string | null };
}

interface CommMember {
  id: string;
  role: string;
  member_id: string;
  members: { id: string; first_name: string; last_name: string; avatar_url: string | null; role: string };
}

interface OrgMember {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface AccountingEntry {
  id: string;
  type: string;
  label: string;
  amount: string;
  status: string;
  created_at: string;
}

export default function VoyagesBureauPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<TripRegistration[]>([]);
  const [commMembers, setCommMembers] = useState<CommMember[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [commissionId, setCommissionId] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState("membre");
  const [addingMember, setAddingMember] = useState(false);
  const [comptaType, setComptaType] = useState<"facture" | "recette" | "caution">("facture");
  const [comptaLabel, setComptaLabel] = useState("");
  const [comptaAmount, setComptaAmount] = useState("");
  const [submittingCompta, setSubmittingCompta] = useState(false);
  const [rapportTitre, setRapportTitre] = useState("");
  const [rapportActivites, setRapportActivites] = useState("");
  const [rapportPoints, setRapportPoints] = useState("");
  const { showToast } = useToast();

  const loadAll = useCallback(async () => {
    const supabase = createClient();

    const { data: commData } = await supabase
      .from("commissions")
      .select("id, budget")
      .ilike("name", "%voyage%")
      .eq("active", true)
      .limit(1)
      .single();

    const cId = commData?.id ?? null;
    setCommissionId(cId);
    setBudget(parseFloat(commData?.budget || "0"));

    const { data: tripsData } = await supabase
      .from("trips")
      .select("*, trip_registrations(count)")
      .order("start_date", { ascending: true });
    setTrips((tripsData as Trip[]) ?? []);

    const { data: regs } = await supabase
      .from("trip_registrations")
      .select("*, members:member_id(id, first_name, last_name, avatar_url), trips:trip_id(destination, name)")
      .eq("status", "en_attente")
      .order("created_at", { ascending: false });
    setPendingRegistrations((regs as unknown as TripRegistration[]) ?? []);

    if (cId) {
      const { data: cm } = await supabase
        .from("commission_members")
        .select("id, role, member_id, members:member_id(id, first_name, last_name, avatar_url, role)")
        .eq("commission_id", cId);
      setCommMembers((cm as unknown as CommMember[]) ?? []);

      const { data: ae } = await supabase
        .from("accounting_entries")
        .select("id, type, label, amount, status, created_at")
        .eq("commission_id", cId)
        .order("created_at", { ascending: false });
      setEntries(ae ?? []);
    }

    const { data: om } = await supabase
      .from("members")
      .select("id, first_name, last_name, avatar_url")
      .order("last_name", { ascending: true });
    setOrgMembers(om ?? []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const now = new Date();
  const totalInscrits = trips.reduce(
    (s, t) => s + (t.trip_registrations[0]?.count ?? 0), 0
  );
  const upcoming = trips.filter((t) => new Date(t.start_date) >= now).length;
  const currentYear = now.getFullYear();

  const recettes = entries.filter((e) => e.type === "recette").reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = entries.filter((e) => e.type !== "recette").reduce((s, e) => s + parseFloat(e.amount), 0);
  const solde = budget + recettes - depenses;

  const availableMembers = orgMembers.filter(
    (om) => !commMembers.some((cm) => cm.member_id === om.id)
  );

  async function handleValidateReg(reg: TripRegistration) {
    setActing(reg.id);
    const supabase = createClient();
    await supabase
      .from("trip_registrations")
      .update({ status: "acceptee" })
      .eq("id", reg.id);
    showToast(`Inscription de ${reg.members.first_name} acceptée`, "success");
    setActing(null);
    loadAll();
  }

  async function handleRefuseReg(reg: TripRegistration) {
    setActing(reg.id);
    const supabase = createClient();
    await supabase
      .from("trip_registrations")
      .update({ status: "refusee" })
      .eq("id", reg.id);
    showToast(`Inscription de ${reg.members.first_name} refusée`, "success");
    setActing(null);
    loadAll();
  }

  async function handleAddMember() {
    if (!selectedMemberId || !commissionId) return;
    setAddingMember(true);
    const supabase = createClient();
    await supabase.from("commission_members").insert({
      commission_id: commissionId,
      member_id: selectedMemberId,
      role: selectedRole,
    });
    setSelectedMemberId("");
    setSelectedRole("membre");
    setAddingMember(false);
    loadAll();
  }

  async function handleRemoveMember(memberRecordId: string) {
    const supabase = createClient();
    await supabase.from("commission_members").delete().eq("id", memberRecordId);
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

  function handleSendRapport() {
    if (!rapportTitre.trim()) {
      showToast("Veuillez saisir un titre", "error");
      return;
    }
    showToast("Rapport envoyé au président", "success");
    setRapportTitre("");
    setRapportActivites("");
    setRapportPoints("");
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <GradientHeader title="Commission Voyages" subtitle="Chargement..." backHref="/bureau/dashboard" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-[14px] bg-surface-secondary" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Commission Voyages"
        subtitle={`Organisation des voyages ${currentYear}`}
        backHref="/bureau/dashboard"
      >
        <Link
          href="/bureau/voyages/new"
          className="rounded-full bg-white/20 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-sm"
        >
          + Nouveau
        </Link>
      </GradientHeader>

      <Tabs defaultValue="tableau">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="tableau">
            <span className="mr-1">📊</span>Tableau
          </TabsTrigger>
          <TabsTrigger value="voyages">
            <span className="mr-1">✈️</span>Voyages
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
          <TabsTrigger value="rapport">
            <span className="mr-1">📝</span>Rapport
          </TabsTrigger>
          <TabsTrigger value="membres">
            <span className="mr-1">👥</span>Membres
          </TabsTrigger>
        </TabsList>

        {/* ── TABLEAU ── */}
        <TabsContent value="tableau">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase text-content-muted">Voyages {currentYear}</p>
                <p className="text-[20px] font-bold text-content-primary">{trips.length}</p>
                <p className="text-[10px] text-content-muted">organisés</p>
              </div>
              <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase text-content-muted">Inscrits total</p>
                <p className="text-[20px] font-bold text-purple-600 dark:text-purple-400">{totalInscrits}</p>
                <p className="text-[10px] text-content-muted">tous voyages</p>
              </div>
            </div>

            <p className="text-[12px] font-bold uppercase tracking-wide text-content-secondary">Actions rapides</p>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton icon="✈️" label="Gérer les voyages" bg="bg-purple-50 dark:bg-purple-500/10" iconColor="text-purple-600 dark:text-purple-400" />
              <ActionButton icon="📤" label="Envoyer à la compta" bg="bg-amber-50 dark:bg-amber-500/10" iconColor="text-amber-600 dark:text-amber-400" />
              <ActionButton icon="📊" label="Faire un rapport" bg="bg-blue-50 dark:bg-blue-500/10" iconColor="text-blue-600 dark:text-blue-400" />
              <ActionButton icon="💬" label="Messagerie" bg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400" />
            </div>

            {budget > 0 && (
              <div className="flex items-center gap-2 rounded-[14px] border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <span className="shrink-0 text-amber-500">ℹ️</span>
                <p className="text-[12px] text-amber-700 dark:text-amber-400">
                  Budget alloué : <strong>{fmt(budget)}</strong> · {fmt(depenses)} dépensés · {fmt(solde)} restants
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── VOYAGES ── */}
        <TabsContent value="voyages">
          <div className="flex flex-col gap-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-content-secondary">
              {trips.length} voyage{trips.length > 1 ? "s" : ""} · {upcoming} à venir
            </p>

            {trips.length === 0 ? (
              <EmptyState
                icon="✈️"
                title="Aucun voyage"
                description="Créez votre premier voyage pour commencer"
                action={{ label: "Créer un voyage", href: "/bureau/voyages/new" }}
              />
            ) : (
              trips.map((t) => {
                const start = new Date(t.start_date);
                const end = new Date(t.end_date);
                const inscrits = t.trip_registrations[0]?.count ?? 0;
                const color = t.color || "#6366f1";
                const isPast = start < now;
                const isOpen = !isPast && (!t.max_seats || inscrits < t.max_seats);

                return (
                  <div key={t.id} className="overflow-hidden rounded-[14px] bg-surface-elevated shadow-sm">
                    <div
                      className="relative flex h-[80px] items-end p-3"
                      style={{ background: color }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative z-[1] flex-1">
                        <p className="text-[13px] font-bold text-white">{t.name || t.destination}</p>
                        <p className="text-[11px] text-white/80">
                          {start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          –{end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}{fmt(t.price_adult)}
                          {" · "}{inscrits}{t.max_seats ? `/${t.max_seats}` : ""} inscrits
                        </p>
                      </div>
                      <Badge
                        variant={isPast ? "neutral" : isOpen ? "success" : "warning"}
                        className="relative z-[1]"
                      >
                        {isPast ? "Terminé" : isOpen ? "Ouvert" : "Complet"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-2.5">
                      <Link
                        href={`/bureau/voyages/${t.id}`}
                        className="flex items-center justify-center gap-1 rounded-[10px] bg-blue-50 px-2 py-2 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/bureau/voyages/${t.id}`}
                        className="flex items-center justify-center gap-1 rounded-[10px] bg-emerald-50 px-2 py-2 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        Inscrits
                      </Link>
                      <button
                        type="button"
                        onClick={() => showToast("Notification envoyée aux inscrits", "success")}
                        className="flex items-center justify-center gap-1 rounded-[10px] bg-purple-50 px-2 py-2 text-[11px] font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                      >
                        Notifier
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <Link
              href="/bureau/voyages/new"
              className="flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-border p-3 text-[12px] font-semibold text-content-muted transition-colors hover:border-brand-400 hover:text-brand-500"
            >
              + Ajouter un voyage
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[12px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {reg.members.first_name?.[0]}{reg.members.last_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {reg.members.first_name} {reg.members.last_name}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {reg.trips.name || reg.trips.destination} · {reg.nb_adults} ad.{reg.nb_children > 0 ? ` + ${reg.nb_children} enf.` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleValidateReg(reg)}
                      disabled={acting === reg.id}
                      className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      Accepter
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

            {budget > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-content-muted">
                  <span>Consommation du budget</span>
                  <span>{budget > 0 ? Math.round((depenses / budget) * 100) : 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${Math.min(budget > 0 ? (depenses / budget) * 100 : 0, 100)}%` }}
                  />
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
                    className={`flex-1 rounded-[10px] px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
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
                  placeholder="ex: Car privatisé"
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

        {/* ── RAPPORT ── */}
        <TabsContent value="rapport">
          <div className="flex flex-col gap-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-content-secondary">Rapport de commission</p>
            <div className="rounded-[14px] bg-surface-elevated p-4 shadow-sm">
              <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Titre du rapport</label>
                <input
                  type="text"
                  value={rapportTitre}
                  onChange={(e) => setRapportTitre(e.target.value)}
                  placeholder="ex: Bilan voyages 2026"
                  className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Activités réalisées</label>
                <textarea
                  value={rapportActivites}
                  onChange={(e) => setRapportActivites(e.target.value)}
                  rows={3}
                  placeholder="Voyages organisés, inscriptions, retours..."
                  className="w-full resize-none rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Points à aborder en réunion</label>
                <textarea
                  value={rapportPoints}
                  onChange={(e) => setRapportPoints(e.target.value)}
                  rows={2}
                  placeholder="Difficultés, propositions..."
                  className="w-full resize-none rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendRapport}
              className="btn-gradient rounded-[14px] px-4 py-3 text-[12px] font-semibold text-white"
            >
              Envoyer au bureau
            </button>
            <button
              type="button"
              onClick={() => showToast("Export PDF...", "success")}
              className="rounded-[14px] bg-blue-50 px-4 py-3 text-[12px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
            >
              Exporter PDF
            </button>
          </div>
        </TabsContent>

        {/* ── MEMBRES ── */}
        <TabsContent value="membres">
          <div className="flex flex-col gap-3">
            <div className="rounded-[14px] border border-border bg-surface-secondary p-3">
              <p className="mb-2 text-[12px] font-semibold text-content-primary">Ajouter un membre</p>
              <div className="flex flex-col gap-2">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="h-10 w-full rounded-[14px] border border-border bg-surface-primary px-3 text-[13px] text-content-primary"
                >
                  <option value="">Choisir un membre...</option>
                  {availableMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-10 flex-1 rounded-[14px] border border-border bg-surface-primary px-3 text-[13px] text-content-primary"
                  >
                    <option value="membre">Membre</option>
                    <option value="responsable">Responsable</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!selectedMemberId || addingMember}
                    className="btn-gradient h-10 rounded-full px-4 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    {addingMember ? "..." : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[12px] font-medium text-content-muted">
              {commMembers.length} membre{commMembers.length !== 1 ? "s" : ""} de la commission
            </p>

            {commMembers.length === 0 ? (
              <EmptyState icon="👥" title="Aucun membre" description="Ajoutez des membres à la commission voyages" />
            ) : (
              commMembers.map((cm) => (
                <div key={cm.id} className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[12px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {cm.members.first_name?.[0]}{cm.members.last_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {cm.members.first_name} {cm.members.last_name}
                    </p>
                    <p className="text-[11px] capitalize text-content-muted">{cm.role}</p>
                  </div>
                  <Badge variant={cm.role === "responsable" ? "default" : "neutral"}>
                    {cm.role}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(cm.id)}
                    className="rounded-full bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  >
                    Retirer
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActionButton({ icon, label, bg, iconColor }: { icon: string; label: string; bg: string; iconColor: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-[14px] ${bg} p-3 cursor-pointer transition-transform active:scale-[0.98]`}>
      <div className={`text-xl ${iconColor}`}>{icon}</div>
      <p className="text-[12px] font-semibold text-content-primary">{label}</p>
    </div>
  );
}
