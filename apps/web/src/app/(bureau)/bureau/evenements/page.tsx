import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getEvents } from "@/lib/actions/events";

export default async function EvenementsPage() {
  const events = await getEvents();
  const total = events.length;
  const upcoming = events.filter(
    (e) => new Date(e.date) >= new Date()
  ).length;
  const totalInscrits = events.reduce(
    (s, e) =>
      s +
      ((e.event_registrations as { count: number }[])?.[0]?.count ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">
            Événements
          </h1>
          <p className="text-sm text-content-secondary">
            Gérez les événements de votre amicale
          </p>
        </div>
        <Button asChild>
          <Link href="/bureau/evenements/new">Nouvel événement</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total" value={String(total)} icon="📅" />
        <StatCard label="À venir" value={String(upcoming)} icon="🔜" />
        <StatCard label="Inscrits" value={String(totalInscrits)} icon="👥" />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="Aucun événement"
          description="Créez votre premier événement pour commencer"
          action={{ label: "Créer un événement", href: "/bureau/evenements/new" }}
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
              basePath="/bureau/evenements"
            />
          ))}
        </div>
      )}
    </div>
  );
}
