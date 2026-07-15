import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getUpcomingTrips } from "@/lib/actions/trips";

export default async function VoyagesPage() {
  const trips = await getUpcomingTrips();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Voyages</h1>
        <p className="text-sm text-content-secondary">
          Les prochains voyages proposés par votre amicale
        </p>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon="✈️"
          title="Aucun voyage à venir"
          description="Les prochains voyages apparaîtront ici"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
