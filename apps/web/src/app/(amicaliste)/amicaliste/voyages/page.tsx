import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { getUpcomingTrips } from "@/lib/actions/trips";

export default async function VoyagesPage() {
  const trips = await getUpcomingTrips();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Voyages"
        subtitle={`${trips.length} voyage${trips.length > 1 ? "s" : ""} à venir`}
      />

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
