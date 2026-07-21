import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
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
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Événements"
        subtitle="Gérez les événements de votre amicale"
        backHref="/bureau/dashboard"
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Total</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">{total}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">À venir</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-500">{upcoming}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Inscrits</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">{totalInscrits}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Tous les événements
        </h3>
        <Link
          href="/bureau/evenements/new"
          className="btn-gradient rounded-full px-4 py-2 text-[12px] font-semibold text-white"
        >
          + Nouveau
        </Link>
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
              description={e.description}
              imageUrl={e.image_url}
              icon={e.icon}
              price={String(e.price ?? 0)}
              maxAttendees={e.max_attendees}
              registrationCount={
                (e.event_registrations as { count: number }[])?.[0]?.count ?? 0
              }
              basePath="/bureau/evenements"
              color={e.color}
              published={e.published}
              variant="bureau"
            />
          ))}
        </div>
      )}
    </div>
  );
}
