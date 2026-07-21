import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent } from "@/lib/actions/events";
import { GradientHeader } from "@/components/layout/gradient-header";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EventActions } from "@/components/events/event-actions";
import { EventRegistrationManager } from "@/components/events/event-registration-manager";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export default async function EvenementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event;
  try {
    event = await getEvent(id);
  } catch {
    notFound();
  }

  const registrations = event.event_registrations ?? [];
  const d = new Date(event.date);

  const totalPersonnes = registrations.reduce(
    (s: number, r: { nb_personnes: number }) => s + (r.nb_personnes || 1),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={event.title}
        subtitle={d.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        backHref="/bureau/evenements"
      />

      {/* Info card */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {event.price > 0 ? (
            <Badge variant="default">{fmt(event.price)}</Badge>
          ) : (
            <Badge variant="success">Gratuit</Badge>
          )}
          {event.category && <Badge variant="neutral">{event.category}</Badge>}
          {event.location && (
            <span className="text-[12px] text-content-muted">
              📍 {event.location}
            </span>
          )}
          {event.max_attendees && (
            <Badge variant={totalPersonnes >= event.max_attendees ? "danger" : "warning"}>
              {totalPersonnes}/{event.max_attendees} places
            </Badge>
          )}
        </div>
        {event.description && (
          <p className="mt-3 text-[13px] text-content-secondary">
            {event.description}
          </p>
        )}
        <div className="mt-3 flex gap-3">
          <Link
            href={`/bureau/evenements/${id}/edit`}
            className="btn-gradient rounded-full px-4 py-2 text-[12px] font-semibold text-white"
          >
            Modifier
          </Link>
          <EventActions eventId={id} />
        </div>
      </div>

      {/* Registration manager with benevole workflow */}
      <EventRegistrationManager
        eventId={id}
        registrations={registrations}
        maxAttendees={event.max_attendees}
        maxBenevoles={event.max_benevoles}
        price={event.price}
      />
    </div>
  );
}
