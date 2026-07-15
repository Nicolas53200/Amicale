import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent } from "@/lib/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">
            {event.title}
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            {new Date(event.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {event.location && ` · ${event.location}`}
          </p>
          <div className="mt-2 flex gap-2">
            {event.price > 0 ? (
              <Badge variant="default">{fmt(event.price)}</Badge>
            ) : (
              <Badge variant="success">Gratuit</Badge>
            )}
            {event.category && <Badge variant="neutral">{event.category}</Badge>}
          </div>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/bureau/evenements">Retour</Link>
        </Button>
      </div>

      {event.description && (
        <p className="text-sm text-content-secondary">{event.description}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Inscrits ({inscrits.length}
              {event.max_attendees ? ` / ${event.max_attendees}` : ""})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inscrits.length === 0 ? (
              <p className="text-sm text-content-muted">Aucun inscrit</p>
            ) : (
              <div className="flex flex-col gap-2">
                {inscrits.map((r: { member_id: string; nb_personnes: number; status: string; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
                  <div key={r.member_id} className="flex items-center gap-3">
                    <Avatar
                      name={`${r.members.first_name} ${r.members.last_name}`}
                      src={r.members.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-content-primary">
                        {r.members.first_name} {r.members.last_name}
                      </p>
                      <p className="text-xs text-content-muted">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Bénévoles ({benevoles.length}
              {event.max_benevoles ? ` / ${event.max_benevoles}` : ""})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {benevoles.length === 0 ? (
              <p className="text-sm text-content-muted">Aucun bénévole</p>
            ) : (
              <div className="flex flex-col gap-2">
                {benevoles.map((r: { member_id: string; is_benevole: string | null; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
                  <div key={r.member_id} className="flex items-center gap-3">
                    <Avatar
                      name={`${r.members.first_name} ${r.members.last_name}`}
                      src={r.members.avatar_url}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-content-primary">
                      {r.members.first_name} {r.members.last_name}
                    </span>
                    <Badge variant="warning">{r.is_benevole}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
