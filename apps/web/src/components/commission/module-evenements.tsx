"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Event {
  id: string;
  title: string;
  date: string;
  location: string | null;
  price: number;
  max_attendees: number | null;
  event_registrations: { count: number }[];
}

export function ModuleEvenements({
  commissionId,
}: {
  commissionId: string;
  isReadOnly?: boolean;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("events")
        .select("id, title, date, location, price, max_attendees, event_registrations(count)")
        .eq("commission_id", commissionId)
        .order("date", { ascending: false });
      setEvents((data as Event[]) ?? []);
      setLoading(false);
    }
    load();
  }, [commissionId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-[12px] bg-surface-secondary" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="Aucun événement"
        description="Les événements de cette commission apparaîtront ici"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev) => {
        const d = new Date(ev.date);
        const inscrits = ev.event_registrations[0]?.count ?? 0;
        const isPast = d < new Date();

        return (
          <Link
            key={ev.id}
            href={`/amicaliste/evenements/${ev.id}`}
            className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 transition-colors hover:bg-surface-primary"
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-brand-100 dark:bg-brand-500/20">
              <span className="text-[9px] font-bold uppercase text-brand-600 dark:text-brand-400">
                {d.toLocaleDateString("fr-FR", { month: "short" })}
              </span>
              <span className="text-[14px] font-bold leading-none text-brand-700 dark:text-brand-300">
                {d.getDate()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-content-primary">{ev.title}</p>
              <p className="text-[11px] text-content-muted">
                {inscrits} inscrit{inscrits > 1 ? "s" : ""}
                {ev.max_attendees && ` / ${ev.max_attendees}`}
                {ev.location && ` · ${ev.location}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {ev.price > 0 && (
                <span className="text-[11px] font-semibold text-brand-600">{fmt(ev.price)}</span>
              )}
              <Badge variant={isPast ? "neutral" : "success"}>
                {isPast ? "Passé" : "À venir"}
              </Badge>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
