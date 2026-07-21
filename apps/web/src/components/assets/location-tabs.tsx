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
          "id, asset_id, start_date, end_date, status, total_amount, notes, created_at, members:member_id(first_name, last_name)"
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

  async function updateStatus(bookingId: string, status: string) {
    const supabase = createClient();
    await supabase
      .from("asset_bookings")
      .update({ status })
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
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(id: string, status: string) {
    setProcessing(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setProcessing(null);
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
                onClick={() => handleAction(b.id, "validee")}
              >
                {isProcessing ? "..." : "Accepter"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isProcessing}
                onClick={() => handleAction(b.id, "refusee")}
              >
                {isProcessing ? "..." : "Refuser"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suivi Tab                                                          */
/* ------------------------------------------------------------------ */

function SuiviTab({
  bookings,
  assetMap,
  loading,
}: {
  bookings: Booking[];
  assetMap: Map<string, Asset>;
  loading: boolean;
}) {
  if (loading) return <LoadingIndicator />;

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="Aucune réservation confirmée"
        description="Les réservations validées apparaîtront ici"
      />
    );
  }

  /* Group bookings by month */
  const grouped = new Map<string, Booking[]>();
  for (const b of bookings) {
    const d = new Date(b.start_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const list = grouped.get(key) ?? [];
    list.push(b);
    grouped.set(key, list);
  }

  const sortedKeys = Array.from(grouped.keys()).sort();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-content-muted">
        {bookings.length} reservation{bookings.length > 1 ? "s" : ""}{" "}
        confirmee{bookings.length > 1 ? "s" : ""}
      </p>

      {sortedKeys.map((monthKey) => {
        const monthBookings = grouped.get(monthKey)!;
        const [yearStr, monthStr] = monthKey.split("-");
        const label = new Date(
          parseInt(yearStr ?? "0"),
          parseInt(monthStr ?? "1") - 1
        ).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

        return (
          <div key={monthKey}>
            <h4 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-content-muted">
              {label}
            </h4>
            <div className="relative flex flex-col gap-3 border-l-2 border-brand-200 pl-4 dark:border-brand-500/30">
              {monthBookings.map((b) => {
                const asset = assetMap.get(b.asset_id);
                const colors = typeColors[asset?.type ?? ""] ?? {
                  bg: "bg-brand-500",
                };
                return (
                  <div key={b.id} className="relative">
                    {/* Timeline dot */}
                    <span
                      className={cn(
                        "absolute -left-[21px] top-2 h-2.5 w-2.5 rounded-full",
                        colors.bg
                      )}
                    />
                    <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
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
                            {fmtDate(b.start_date)} &rarr;{" "}
                            {fmtDate(b.end_date)}
                          </p>
                        </div>
                        {statusBadge(b.status)}
                      </div>
                      {b.total_amount != null && (
                        <p className="mt-2 text-[13px] font-semibold text-content-primary">
                          {fmtFull(parseFloat(String(b.total_amount)))}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
