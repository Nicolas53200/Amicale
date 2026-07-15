import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Voyages</h1>
          <p className="text-sm text-content-secondary">
            Gérez les voyages de votre amicale
          </p>
        </div>
        <Button asChild>
          <Link href="/bureau/voyages/new">Nouveau voyage</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
