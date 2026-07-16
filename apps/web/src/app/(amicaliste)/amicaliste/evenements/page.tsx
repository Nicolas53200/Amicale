import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { getUpcomingEvents } from "@/lib/actions/events";

export default async function EvenementsPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Événements"
        subtitle={`${events.length} événement${events.length > 1 ? "s" : ""} à venir`}
      />

      {events.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="Aucun événement à venir"
          description="Les prochains événements apparaîtront ici"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <EventCard
              key={e.id}
              id={e.id}
              title={e.title}
              date={e.date}
              location={e.location}
              price={String(e.price ?? 0)}
              maxAttendees={e.max_attendees}
              registrationCount={
                (e.event_registrations as { count: number }[])?.[0]?.count ?? 0
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
