import { GradientHeader } from "@/components/layout/gradient-header";
import { getUpcomingEvents } from "@/lib/actions/events";
import { EventsListClient } from "@/components/events/events-list-client";

export default async function EvenementsPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Événements"
        subtitle={`${events.length} événement${events.length > 1 ? "s" : ""} à venir`}
      />
      <EventsListClient events={events} />
    </div>
  );
}
