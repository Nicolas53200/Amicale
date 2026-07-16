"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  price_adult: number;
  max_seats: number | null;
  trip_registrations: { count: number }[];
}

export function ModuleVoyages({
  commissionId,
}: {
  commissionId: string;
  isReadOnly?: boolean;
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("trips")
        .select("id, destination, start_date, end_date, price_adult, max_seats, trip_registrations(count)")
        .eq("commission_id", commissionId)
        .order("start_date", { ascending: false });
      setTrips((data as Trip[]) ?? []);
      setLoading(false);
    }
    load();
  }, [commissionId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-[12px] bg-surface-secondary" />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        icon="✈️"
        title="Aucun voyage"
        description="Les voyages de cette commission apparaitront ici"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {trips.map((trip) => {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const inscrits = trip.trip_registrations[0]?.count ?? 0;
        const isPast = start < new Date();

        return (
          <Link
            key={trip.id}
            href={`/amicaliste/voyages/${trip.id}`}
            className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 transition-colors hover:bg-surface-primary"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
              <span className="text-lg">✈️</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-content-primary">{trip.destination}</p>
              <p className="text-[11px] text-content-muted">
                {start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                {" → "}
                {end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                {" · "}
                {days} jour{days > 1 ? "s" : ""}
                {" · "}
                {inscrits} inscrit{inscrits > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-semibold text-brand-600">{fmt(trip.price_adult)}</span>
              <Badge variant={isPast ? "neutral" : "success"}>
                {isPast ? "Passe" : "A venir"}
              </Badge>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
