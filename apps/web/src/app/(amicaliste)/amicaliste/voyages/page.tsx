import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { TripCard } from "@/components/trips/trip-card";
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
        <div className="flex flex-col gap-3">
          {trips.map((t) => (
            <TripCard
              key={t.id}
              id={t.id}
              name={t.name}
              destination={t.destination}
              startDate={t.start_date}
              endDate={t.end_date}
              priceAdult={String(t.price_adult)}
              maxSeats={t.max_seats}
              registrationCount={
                (t.trip_registrations as { count: number }[])?.[0]?.count ?? 0
              }
              color={t.color}
              imageUrl={t.image_url}
              icon={t.icon}
              transport={t.transport}
              accommodation={t.accommodation}
              childrenAllowed={t.children_allowed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
