import { GradientHeader } from "@/components/layout/gradient-header";
import { getUpcomingEvents } from "@/lib/actions/events";
import { EventsListClient } from "@/components/events/events-list-client";

export default async function EvenementsPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Evenements"
        subtitle={`${events.length} evenement${events.length > 1 ? "s" : ""} a venir`}
      />
      <EventsListClient events={events} />
    </div>
  );
}
