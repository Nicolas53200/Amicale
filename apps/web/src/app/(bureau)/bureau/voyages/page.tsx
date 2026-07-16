import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { getTrips } from "@/lib/actions/trips";

export default async function VoyagesPage() {
  const trips = await getTrips();
  const total = trips.length;
  const upcoming = trips.filter(
    (t) => new Date(t.start_date) >= new Date()
  ).length;
  const totalInscrits = trips.reduce(
    (s, t) =>
      s +
      ((t.trip_registrations as { count: number }[])?.[0]?.count ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Voyages"
        subtitle={`${total} voyage${total > 1 ? "s" : ""} · ${upcoming} à venir`}
        backHref="/bureau/dashboard"
      >
        <Link
          href="/bureau/voyages/new"
          className="rounded-full bg-white/20 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-sm"
        >
          + Nouveau voyage
        </Link>
      </GradientHeader>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={String(total)} icon="✈️" />
        <StatCard label="À venir" value={String(upcoming)} icon="🔜" />
        <StatCard label="Inscrits" value={String(totalInscrits)} icon="👥" />
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon="✈️"
          title="Aucun voyage"
          description="Créez votre premier voyage pour commencer"
          action={{ label: "Créer un voyage", href: "/bureau/voyages/new" }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <TripCard
              key={t.id}
              id={t.id}
              destination={t.destination}
              startDate={t.start_date}
              endDate={t.end_date}
              priceAdult={String(t.price_adult)}
              maxSeats={t.max_seats}
              registrationCount={
                (t.trip_registrations as { count: number }[])?.[0]?.count ?? 0
              }
              basePath="/bureau/voyages"
            />
          ))}
        </div>
      )}
    </div>
  );
}
