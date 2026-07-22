"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Asset {
  id: string;
  name: string;
  type: string;
  daily_rate: number | string | null;
  deposit: number | string | null;
  asset_bookings: { count: number }[];
}

interface Booking {
  id: string;
  asset_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number | string | null;
  notes: string | null;
  created_at: string;
  members: { first_name: string; last_name: string } | null;
  caution_received?: boolean;
  etat_lieux_entree?: boolean;
  cles_remises?: boolean;
  etat_lieux_sortie?: boolean;
  cles_retournees?: boolean;
  caution_returned?: boolean;
  refusal_reason?: string | null;
  caution_received_at?: string | null;
  caution_received_by_member?: { first_name: string; last_name: string } | null;
  caution_amount?: number | string | null;
  caution_mode?: string | null;
  caution_observations?: string | null;
  etat_lieux_entree_at?: string | null;
  etat_lieux_entree_by_member?: { first_name: string; last_name: string } | null;
  etat_lieux_entree_observations?: string | null;
  cles_remises_at?: string | null;
  cles_remises_by_member?: { first_name: string; last_name: string } | null;
  etat_lieux_sortie_at?: string | null;
  etat_lieux_sortie_by_member?: { first_name: string; last_name: string } | null;
  etat_lieux_sortie_observations?: string | null;
  cles_retournees_at?: string | null;
  cles_retournees_by_member?: { first_name: string; last_name: string } | null;
  caution_returned_at?: string | null;
  caution_returned_by_member?: { first_name: string; last_name: string } | null;
  caution_retained_amount?: number | string | null;
  caution_retained_reason?: string | null;
}

interface LocationTabsProps {
  assets: Asset[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "biens", icon: "🏠", label: "Biens" },
  { id: "calendrier", icon: "📅", label: "Calendrier" },
  { id: "demandes", icon: "📋", label: "Demandes" },
  { id: "suivi", icon: "📊", label: "Suivi" },
  { id: "compta", icon: "💰", label: "Compta" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const typeIcons: Record<string, string> = {
  appartement: "🏠",
  barnum: "⛺",
  remorque: "🚛",
  camping: "🏕️",
};

const typeColors: Record<string, { bg: string; text: string }> = {
  appartement: { bg: "bg-blue-500", text: "text-white" },
  barnum: { bg: "bg-emerald-500", text: "text-white" },
  remorque: { bg: "bg-amber-500", text: "text-white" },
  camping: { bg: "bg-teal-500", text: "text-white" },
};

const assetCalendarColors: Record<string, { bg: string; dot: string }> = {
  appartement: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    dot: "bg-blue-500",
  },
  barnum: {
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    dot: "bg-emerald-500",
  },
  remorque: {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    dot: "bg-amber-500",
  },
  camping: {
    bg: "bg-teal-100 dark:bg-teal-500/20",
    dot: "bg-teal-500",
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtFull = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

const DAY_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusBadge(status: string) {
  switch (status) {
    case "en_attente":
      return <Badge variant="warning">En attente</Badge>;
    case "confirmee":
    case "validee":
      return <Badge variant="success">Confirmee</Badge>;
    case "refusee":
      return <Badge variant="danger">Refusee</Badge>;
    case "annulee":
      return <Badge variant="neutral">Annulee</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function memberName(m: { first_name: string; last_name: string } | null) {
  if (!m) return "Membre inconnu";
  return `${m.first_name} ${m.last_name}`;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function LocationTabs({ assets }: LocationTabsProps) {
  const [active, setActive] = useState<TabId>("biens");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  /* Build an asset lookup map */
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("asset_bookings")
        .select(
          `id, asset_id, start_date, end_date, status, total_amount, notes, created_at,
           caution_received, etat_lieux_entree, cles_remises, etat_lieux_sortie, cles_retournees, caution_returned,
           refusal_reason,
           caution_received_at, caution_amount, caution_mode, caution_observations,
           etat_lieux_entree_at, etat_lieux_entree_observations,
           cles_remises_at,
           etat_lieux_sortie_at, etat_lieux_sortie_observations,
           cles_retournees_at,
           caution_returned_at, caution_retained_amount, caution_retained_reason,
           members:member_id(first_name, last_name),
           caution_received_by_member:caution_received_by(first_name, last_name),
           etat_lieux_entree_by_member:etat_lieux_entree_by(first_name, last_name),
           cles_remises_by_member:cles_remises_by(first_name, last_name),
           etat_lieux_sortie_by_member:etat_lieux_sortie_by(first_name, last_name),
           cles_retournees_by_member:cles_retournees_by(first_name, last_name),
           caution_returned_by_member:caution_returned_by(first_name, last_name)`
        )
        .order("start_date");
      if (data) setBookings(data as unknown as Booking[]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Fetch bookings when switching away from "biens" */
  useEffect(() => {
    if (active !== "biens") {
      fetchBookings();
    }
  }, [active, fetchBookings]);

  async function updateStatus(bookingId: string, status: string, reason?: string) {
    const supabase = createClient();
    const update: Record<string, unknown> = { status };
    if (reason !== undefined) update.refusal_reason = reason;
    await supabase
      .from("asset_bookings")
      .update(update)
      .eq("id", bookingId);
    fetchBookings();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                active === tab.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-surface-elevated text-content-secondary"
              )}
            >
              <span className="text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {active === "biens" && <BiensTab assets={assets} />}
      {active === "calendrier" && (
        <CalendrierTab
          bookings={bookings}
          assets={assets}
          assetMap={assetMap}
          loading={loading}
        />
      )}
      {active === "demandes" && (
        <DemandesTab
          bookings={bookings.filter((b) => b.status === "en_attente")}
          assetMap={assetMap}
          loading={loading}
          onUpdateStatus={updateStatus}
        />
      )}
      {active === "suivi" && (
        <SuiviTab
          bookings={bookings.filter(
            (b) => b.status === "confirmee" || b.status === "validee"
          )}
          assetMap={assetMap}
          loading={loading}
          onRefresh={fetchBookings}
        />
      )}
      {active === "compta" && (
        <ComptaTab
          bookings={bookings}
          assets={assets}
          assetMap={assetMap}
          loading={loading}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Biens Tab                                                          */
/* ------------------------------------------------------------------ */

function BiensTab({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return (
      <EmptyState
        icon="🏠"
        title="Aucun bien"
        description="Ajoutez votre premier bien locatif pour commencer"
        action={{ label: "Ajouter un bien", href: "/bureau/locations/new" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {assets.map((a) => {
        const colors = typeColors[a.type] || {
          bg: "bg-brand-500",
          text: "text-white",
        };
        return (
          <Link
            key={a.id}
            href={`/bureau/locations/${a.id}`}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-[16px] ${colors.bg} p-4 shadow-sm transition-shadow active:shadow-none`}
            style={{ minHeight: "140px" }}
          >
            <div>
              <span className="text-2xl">{typeIcons[a.type] || "📦"}</span>
              <h3
                className={`mt-2 text-[14px] font-bold ${colors.text}`}
              >
                {a.name}
              </h3>
              <p className={`text-[11px] ${colors.text} opacity-80`}>
                {fmt(parseFloat(String(a.daily_rate ?? 0)))}/jour
              </p>
            </div>
            <div className="mt-2">
              <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Disponible
              </span>
            </div>
          </Link>
        );
      })}

      <Link
        href="/bureau/locations/new"
        className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-border bg-surface-elevated p-4 text-content-muted transition-colors hover:border-brand-300 hover:text-brand-500"
        style={{ minHeight: "140px" }}
      >
        <span className="mb-1 text-2xl">+</span>
        <span className="text-[12px] font-semibold">Ajouter un bien</span>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendrier Tab                                                     */
/* ------------------------------------------------------------------ */

function CalendrierTab({
  bookings,
  assets,
  assetMap,
  loading,
}: {
  bookings: Booking[];
  assets: Asset[];
  assetMap: Map<string, Asset>;
  loading: boolean;
}) {
  const [month, setMonth] = useState(new Date());
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date();

  function bookingsForDay(day: number) {
    const d = new Date(year, m, day);
    d.setHours(0, 0, 0, 0);
    return bookings.filter((b) => {
      const s = new Date(b.start_date);
      s.setHours(0, 0, 0, 0);
      const e = new Date(b.end_date);
      e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    });
  }

  const isToday = (day: number) =>
    year === today.getFullYear() &&
    m === today.getMonth() &&
    day === today.getDate();

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(year, m - 1))}
          className="rounded-lg px-2 py-1 text-[13px] text-content-muted hover:bg-surface-secondary"
        >
          &larr;
        </button>
        <h3 className="text-[14px] font-bold capitalize text-content-primary">
          {month.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          type="button"
          onClick={() => setMonth(new Date(year, m + 1))}
          className="rounded-lg px-2 py-1 text-[13px] text-content-muted hover:bg-surface-secondary"
        >
          &rarr;
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={i}
            className="py-1 text-center text-[10px] font-medium uppercase text-content-muted"
          >
            {d}
          </div>
        ))}

        {/* Offset cells */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`off-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayBookings = bookingsForDay(day);
          const hasBookings = dayBookings.length > 0;

          return (
            <div
              key={day}
              className={cn(
                "flex h-10 flex-col items-center justify-center rounded-lg text-[12px] tabular-nums",
                isToday(day) &&
                  "ring-2 ring-brand-500 ring-offset-1 ring-offset-surface-elevated",
                hasBookings
                  ? "bg-surface-secondary font-medium text-content-primary"
                  : "text-content-secondary"
              )}
              title={
                hasBookings
                  ? dayBookings
                      .map((b) => {
                        const asset = assetMap.get(b.asset_id);
                        return `${asset?.name ?? "?"} - ${memberName(b.members)}`;
                      })
                      .join("\n")
                  : undefined
              }
            >
              <span>{day}</span>
              {hasBookings && (
                <div className="mt-0.5 flex gap-0.5">
                  {dayBookings.slice(0, 3).map((b) => {
                    const asset = assetMap.get(b.asset_id);
                    const colors =
                      assetCalendarColors[asset?.type ?? ""] ?? {
                        dot: "bg-gray-400",
                      };
                    return (
                      <span
                        key={b.id}
                        className={cn("inline-block h-1.5 w-1.5 rounded-full", colors.dot)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {assets.map((a) => {
          const colors = assetCalendarColors[a.type] ?? {
            dot: "bg-gray-400",
          };
          return (
            <span
              key={a.id}
              className="flex items-center gap-1 text-[10px] text-content-muted"
            >
              <span
                className={cn("inline-block h-2.5 w-2.5 rounded-full", colors.dot)}
              />
              {a.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Demandes Tab                                                       */
/* ------------------------------------------------------------------ */

function DemandesTab({
  bookings,
  assetMap,
  loading,
  onUpdateStatus,
}: {
  bookings: Booking[];
  assetMap: Map<string, Asset>;
  loading: boolean;
  onUpdateStatus: (id: string, status: string, reason?: string) => void;
}) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [refusingId, setRefusingId] = useState<string | null>(null);
  const [refusalReason, setRefusalReason] = useState("");

  async function handleAccept(id: string) {
    setProcessing(id);
    try {
      await onUpdateStatus(id, "validee");
    } finally {
      setProcessing(null);
    }
  }

  async function handleRefuse() {
    if (!refusingId) return;
    setProcessing(refusingId);
    try {
      await onUpdateStatus(refusingId, "refusee", refusalReason || undefined);
    } finally {
      setProcessing(null);
      setRefusingId(null);
      setRefusalReason("");
    }
  }

  if (loading) return <LoadingIndicator />;

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Aucune demande en attente"
        description="Les nouvelles demandes de réservation apparaîtront ici"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-content-muted">
        {bookings.length} demande{bookings.length > 1 ? "s" : ""} en attente
      </p>
      {bookings.map((b) => {
        const asset = assetMap.get(b.asset_id);
        const isProcessing = processing === b.id;
        return (
          <div
            key={b.id}
            className="rounded-[16px] bg-surface-elevated p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">
                    {typeIcons[asset?.type ?? ""] ?? "📦"}
                  </span>
                  <h4 className="text-[14px] font-bold text-content-primary">
                    {asset?.name ?? "Bien inconnu"}
                  </h4>
                </div>
                <p className="mt-1 text-[13px] text-content-secondary">
                  {memberName(b.members)}
                </p>
                <p className="mt-0.5 text-[12px] text-content-muted">
                  {fmtDate(b.start_date)} &rarr; {fmtDate(b.end_date)}
                </p>
                {b.total_amount != null && (
                  <p className="mt-1 text-[13px] font-semibold text-content-primary">
                    {fmtFull(parseFloat(String(b.total_amount)))}
                  </p>
                )}
                {b.notes && (
                  <p className="mt-1 text-[12px] italic text-content-muted">
                    {b.notes}
                  </p>
                )}
              </div>
              {statusBadge(b.status)}
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => handleAccept(b.id)}
              >
                {isProcessing ? "..." : "Accepter"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isProcessing}
                onClick={() => setRefusingId(b.id)}
              >
                Refuser
              </Button>
            </div>
          </div>
        );
      })}

      {refusingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRefusingId(null)}>
          <div className="w-full max-w-sm rounded-[16px] bg-surface-elevated p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-[14px] font-bold text-content-primary">Motif du refus</h3>
            <textarea
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder="Indiquez le motif du refus (optionnel)..."
              rows={3}
              className="mb-3 w-full rounded-[12px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setRefusingId(null); setRefusalReason(""); }}>
                Annuler
              </Button>
              <Button size="sm" variant="destructive" onClick={handleRefuse} disabled={processing === refusingId}>
                {processing === refusingId ? "..." : "Confirmer le refus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suivi Tab                                                          */
/* ------------------------------------------------------------------ */

const SUIVI_STEPS = [
  { key: "caution_received", label: "Caution reçue", icon: "💰", atKey: "caution_received_at", byKey: "caution_received_by_member", hasAmount: true, hasMode: true, hasRetained: false, obsKey: "caution_observations" as string | null },
  { key: "etat_lieux_entree", label: "État des lieux entrée", icon: "📋", atKey: "etat_lieux_entree_at", byKey: "etat_lieux_entree_by_member", hasAmount: false, hasMode: false, hasRetained: false, obsKey: "etat_lieux_entree_observations" as string | null },
  { key: "cles_remises", label: "Clés remises", icon: "🔑", atKey: "cles_remises_at", byKey: "cles_remises_by_member", hasAmount: false, hasMode: false, hasRetained: false, obsKey: null as string | null },
  { key: "etat_lieux_sortie", label: "État des lieux sortie", icon: "📋", atKey: "etat_lieux_sortie_at", byKey: "etat_lieux_sortie_by_member", hasAmount: false, hasMode: false, hasRetained: false, obsKey: "etat_lieux_sortie_observations" as string | null },
  { key: "cles_retournees", label: "Clés retournées", icon: "🔑", atKey: "cles_retournees_at", byKey: "cles_retournees_by_member", hasAmount: false, hasMode: false, hasRetained: false, obsKey: null as string | null },
  { key: "caution_returned", label: "Caution restituée", icon: "💰", atKey: "caution_returned_at", byKey: "caution_returned_by_member", hasAmount: false, hasMode: false, hasRetained: true, obsKey: null as string | null },
];

type SuiviKey = "caution_received" | "etat_lieux_entree" | "cles_remises" | "etat_lieux_sortie" | "cles_retournees" | "caution_returned";

const CAUTION_MODES = [
  { value: "cheque", label: "Chèque" },
  { value: "especes", label: "Espèces" },
  { value: "virement", label: "Virement" },
  { value: "cb", label: "Carte bancaire" },
];

function SuiviTab({
  bookings,
  assetMap,
  loading,
  onRefresh,
}: {
  bookings: Booking[];
  assetMap: Map<string, Asset>;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState<Record<string, string>>({});

  async function toggleStep(bookingId: string, stepKey: SuiviKey, current: boolean, extraFields?: Record<string, unknown>) {
    setToggling(`${bookingId}-${stepKey}`);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      let memberId: string | null = null;
      if (user) {
        const { data: member } = await supabase.from("members").select("id").eq("user_id", user.id).single();
        memberId = member?.id ?? null;
      }
      const update: Record<string, unknown> = {
        [stepKey]: !current,
        [`${stepKey}_at`]: !current ? new Date().toISOString() : null,
        [`${stepKey}_by`]: !current ? memberId : null,
        ...extraFields,
      };
      await supabase
        .from("asset_bookings")
        .update(update)
        .eq("id", bookingId);
      onRefresh();
    } finally {
      setToggling(null);
      setEditingStep(null);
      setStepForm({});
    }
  }

  if (loading) return <LoadingIndicator />;

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="Aucune réservation confirmée"
        description="Les réservations validées apparaîtront ici avec leur suivi"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-content-muted">
        {bookings.length} reservation{bookings.length > 1 ? "s" : ""} confirmee{bookings.length > 1 ? "s" : ""}
      </p>

      {bookings.map((b) => {
        const asset = assetMap.get(b.asset_id);
        const completedSteps = SUIVI_STEPS.filter(
          (s) => b[s.key as keyof Booking]
        ).length;
        const progress = Math.round((completedSteps / SUIVI_STEPS.length) * 100);
        const isExpanded = expanded === b.id;

        return (
          <div key={b.id} className="rounded-[16px] bg-surface-elevated shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : b.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-surface-secondary text-[16px]">
                {typeIcons[asset?.type ?? ""] ?? "📦"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-bold text-content-primary">
                    {asset?.name ?? "Bien inconnu"}
                  </h4>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    progress === 100
                      ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  )}>
                    {completedSteps}/{SUIVI_STEPS.length}
                  </span>
                </div>
                <p className="text-[12px] text-content-secondary">
                  {memberName(b.members)} · {fmtDate(b.start_date)} → {fmtDate(b.end_date)}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      progress === 100 ? "bg-green-500" : "bg-brand-500"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className={cn(
                "text-[14px] transition-transform",
                isExpanded && "rotate-180"
              )}>
                ▾
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <div className="flex flex-col gap-2">
                  {SUIVI_STEPS.map((step, i) => {
                    const done = !!b[step.key as keyof Booking];
                    const isToggling = toggling === `${b.id}-${step.key}`;
                    const stepAt = b[step.atKey as keyof Booking] as string | null | undefined;
                    const stepBy = b[step.byKey as keyof Booking] as { first_name: string; last_name: string } | null | undefined;
                    const obs = step.obsKey ? (b[step.obsKey as keyof Booking] as string | null | undefined) : null;
                    const isEditing = editingStep === `${b.id}-${step.key}`;

                    return (
                      <div key={step.key} className={cn(
                        "rounded-[12px] transition-colors overflow-hidden",
                        done
                          ? "bg-green-50 dark:bg-green-500/10"
                          : "bg-surface-secondary"
                      )}>
                        <button
                          type="button"
                          onClick={() => {
                            if (done) {
                              toggleStep(b.id, step.key as SuiviKey, done);
                            } else if (step.hasAmount || step.obsKey || step.hasRetained) {
                              setEditingStep(isEditing ? null : `${b.id}-${step.key}`);
                              setStepForm({});
                            } else {
                              toggleStep(b.id, step.key as SuiviKey, done);
                            }
                          }}
                          disabled={isToggling}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                        >
                          <span className="text-[14px]">{step.icon}</span>
                          <span className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                            done
                              ? "bg-green-500 text-white"
                              : "border-2 border-content-muted text-content-muted"
                          )}>
                            {isToggling ? "…" : done ? "✓" : String(i + 1)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className={cn(
                              "text-[13px] font-medium",
                              done ? "text-green-700 dark:text-green-400" : "text-content-secondary"
                            )}>
                              {step.label}
                            </span>
                            {done && stepAt && (
                              <p className="text-[10px] text-content-muted">
                                {new Date(stepAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                {stepBy ? ` par ${stepBy.first_name} ${stepBy.last_name}` : ""}
                              </p>
                            )}
                          </div>
                          {done && step.key === "caution_received" && b.caution_amount != null && (
                            <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
                              {fmtFull(parseFloat(String(b.caution_amount)))}
                              {b.caution_mode ? ` (${b.caution_mode})` : ""}
                            </span>
                          )}
                          {done && step.key === "caution_returned" && b.caution_retained_amount != null && parseFloat(String(b.caution_retained_amount)) > 0 && (
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              -{fmtFull(parseFloat(String(b.caution_retained_amount)))} retenu
                            </span>
                          )}
                        </button>
                        {done && obs && (
                          <p className="px-3 pb-2 text-[11px] italic text-content-muted">
                            {obs}
                          </p>
                        )}
                        {isEditing && !done && (
                          <div className="border-t border-border/50 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-2">
                              {step.hasAmount && (
                                <>
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      placeholder="Montant caution"
                                      value={stepForm.amount ?? ""}
                                      onChange={(e) => setStepForm((f) => ({ ...f, amount: e.target.value }))}
                                      className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-1.5 text-[12px] text-content-primary placeholder:text-content-muted"
                                    />
                                  </div>
                                  <select
                                    value={stepForm.mode ?? ""}
                                    onChange={(e) => setStepForm((f) => ({ ...f, mode: e.target.value }))}
                                    className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-1.5 text-[12px] text-content-primary"
                                  >
                                    <option value="">Mode de paiement...</option>
                                    {CAUTION_MODES.map((m) => (
                                      <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                  </select>
                                </>
                              )}
                              {step.hasRetained && (
                                <>
                                  <input
                                    type="number"
                                    placeholder="Montant retenu (0 si rien)"
                                    value={stepForm.retained ?? ""}
                                    onChange={(e) => setStepForm((f) => ({ ...f, retained: e.target.value }))}
                                    className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-1.5 text-[12px] text-content-primary placeholder:text-content-muted"
                                  />
                                  {stepForm.retained && parseFloat(stepForm.retained) > 0 && (
                                    <input
                                      type="text"
                                      placeholder="Motif de la retenue"
                                      value={stepForm.retainedReason ?? ""}
                                      onChange={(e) => setStepForm((f) => ({ ...f, retainedReason: e.target.value }))}
                                      className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-1.5 text-[12px] text-content-primary placeholder:text-content-muted"
                                    />
                                  )}
                                </>
                              )}
                              {step.obsKey && (
                                <textarea
                                  placeholder="Observations (optionnel)..."
                                  value={stepForm.obs ?? ""}
                                  onChange={(e) => setStepForm((f) => ({ ...f, obs: e.target.value }))}
                                  rows={2}
                                  className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-1.5 text-[12px] text-content-primary placeholder:text-content-muted"
                                />
                              )}
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => { setEditingStep(null); setStepForm({}); }}
                                  className="rounded-[10px] px-3 py-1.5 text-[12px] font-medium text-content-muted hover:bg-surface-secondary"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const extra: Record<string, unknown> = {};
                                    if (step.hasAmount) {
                                      if (stepForm.amount) extra.caution_amount = parseFloat(stepForm.amount);
                                      if (stepForm.mode) extra.caution_mode = stepForm.mode;
                                    }
                                    if (step.hasRetained) {
                                      if (stepForm.retained) extra.caution_retained_amount = parseFloat(stepForm.retained);
                                      if (stepForm.retainedReason) extra.caution_retained_reason = stepForm.retainedReason;
                                    }
                                    if (step.obsKey && stepForm.obs) {
                                      extra[step.obsKey] = stepForm.obs;
                                    }
                                    toggleStep(b.id, step.key as SuiviKey, false, extra);
                                  }}
                                  className="btn-gradient rounded-[10px] px-4 py-1.5 text-[12px] font-semibold text-white"
                                >
                                  Valider
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {b.total_amount != null && (
                  <p className="mt-3 text-[13px] font-semibold text-content-primary">
                    Montant : {fmtFull(parseFloat(String(b.total_amount)))}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compta Tab                                                         */
/* ------------------------------------------------------------------ */

function ComptaTab({
  bookings,
  assets,
  assetMap,
  loading,
}: {
  bookings: Booking[];
  assets: Asset[];
  assetMap: Map<string, Asset>;
  loading: boolean;
}) {
  if (loading) return <LoadingIndicator />;

  const confirmed = bookings.filter(
    (b) => b.status === "confirmee" || b.status === "validee"
  );

  const totalRevenue = confirmed.reduce(
    (sum, b) => sum + parseFloat(String(b.total_amount ?? 0)),
    0
  );

  const pending = bookings.filter((b) => b.status === "en_attente");
  const pendingRevenue = pending.reduce(
    (sum, b) => sum + parseFloat(String(b.total_amount ?? 0)),
    0
  );

  /* Per-asset breakdown */
  const perAsset = new Map<
    string,
    { confirmed: number; pending: number; count: number }
  >();
  for (const a of assets) {
    perAsset.set(a.id, { confirmed: 0, pending: 0, count: 0 });
  }
  for (const b of confirmed) {
    const entry = perAsset.get(b.asset_id);
    if (entry) {
      entry.confirmed += parseFloat(String(b.total_amount ?? 0));
      entry.count += 1;
    }
  }
  for (const b of pending) {
    const entry = perAsset.get(b.asset_id);
    if (entry) {
      entry.pending += parseFloat(String(b.total_amount ?? 0));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <p className="text-[12px] text-content-muted">Revenus confirmes</p>
          <p className="mt-1 text-[18px] font-bold text-emerald-600 dark:text-emerald-400">
            {fmtFull(totalRevenue)}
          </p>
          <p className="mt-0.5 text-[11px] text-content-muted">
            {confirmed.length} reservation{confirmed.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <p className="text-[12px] text-content-muted">En attente</p>
          <p className="mt-1 text-[18px] font-bold text-amber-600 dark:text-amber-400">
            {fmtFull(pendingRevenue)}
          </p>
          <p className="mt-0.5 text-[11px] text-content-muted">
            {pending.length} demande{pending.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Per-asset breakdown */}
      <div>
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Par bien
        </h3>
        <div className="flex flex-col gap-2">
          {assets.map((a) => {
            const data = perAsset.get(a.id);
            if (!data) return null;
            const colors = typeColors[a.type] ?? {
              bg: "bg-brand-500",
              text: "text-white",
            };

            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-4 shadow-sm"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[16px]",
                    colors.bg
                  )}
                >
                  <span className={colors.text}>
                    {typeIcons[a.type] ?? "📦"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-semibold text-content-primary">
                    {a.name}
                  </h4>
                  <p className="text-[11px] text-content-muted">
                    {data.count} reservation{data.count > 1 ? "s" : ""}{" "}
                    confirmee{data.count > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-content-primary">
                    {fmtFull(data.confirmed)}
                  </p>
                  {data.pending > 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      +{fmtFull(data.pending)} en attente
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bookings.length === 0 && (
        <EmptyState
          icon="💰"
          title="Aucune donnée financière"
          description="Les revenus apparaîtront ici une fois les premières réservations effectuées"
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading indicator                                                  */
/* ------------------------------------------------------------------ */

function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}
