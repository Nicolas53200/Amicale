import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent } from "@/lib/actions/events";
import { GradientHeader } from "@/components/layout/gradient-header";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EventActions } from "@/components/events/event-actions";

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
  const inscrits = registrations.filter((r: { is_benevole: string | null }) => !r.is_benevole);
  const benevoles = registrations.filter((r: { is_benevole: string | null }) => r.is_benevole);
  const d = new Date(event.date);

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

      {/* Inscrits */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Inscrits ({inscrits.length}
          {event.max_attendees ? ` / ${event.max_attendees}` : ""})
        </h3>
        {inscrits.length === 0 ? (
          <p className="py-2 text-center text-[13px] text-content-muted">Aucun inscrit</p>
        ) : (
          <div className="flex flex-col gap-2">
            {inscrits.map((r: { member_id: string; nb_personnes: number; status: string; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
              <div key={r.member_id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                <Avatar
                  name={`${r.members.first_name} ${r.members.last_name}`}
                  src={r.members.avatar_url}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-content-primary">
                    {r.members.first_name} {r.members.last_name}
                  </p>
                  <p className="text-[11px] text-content-muted">
                    {r.nb_personnes} personne{r.nb_personnes > 1 ? "s" : ""}
                  </p>
                </div>
                <Badge variant={r.status === "inscrit" ? "success" : "neutral"}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bénévoles */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Bénévoles ({benevoles.length}
          {event.max_benevoles ? ` / ${event.max_benevoles}` : ""})
        </h3>
        {benevoles.length === 0 ? (
          <p className="py-2 text-center text-[13px] text-content-muted">Aucun bénévole</p>
        ) : (
          <div className="flex flex-col gap-2">
            {benevoles.map((r: { member_id: string; is_benevole: string | null; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
              <div key={r.member_id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                <Avatar
                  name={`${r.members.first_name} ${r.members.last_name}`}
                  src={r.members.avatar_url}
                  size="sm"
                />
                <span className="flex-1 text-[13px] font-medium text-content-primary">
                  {r.members.first_name} {r.members.last_name}
                </span>
                <Badge variant="warning">{r.is_benevole}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
