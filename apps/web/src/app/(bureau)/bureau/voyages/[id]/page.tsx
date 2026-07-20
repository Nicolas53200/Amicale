import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrip } from "@/lib/actions/trips";
import { GradientHeader } from "@/components/layout/gradient-header";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TripActions } from "@/components/trips/trip-actions";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export default async function VoyageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let trip;
  try {
    trip = await getTrip(id);
  } catch {
    notFound();
  }

  const registrations = trip.trip_registrations ?? [];
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalSeats = registrations.reduce(
    (s: number, r: { nb_adults: number; nb_children: number }) => s + r.nb_adults + r.nb_children,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={trip.name || trip.destination}
        subtitle={`${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} → ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · ${days} jour${days > 1 ? "s" : ""}`}
        backHref="/bureau/voyages"
      />

      {/* Info card */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{fmt(trip.price_adult)}/adulte</Badge>
          {trip.price_child && (
            <Badge variant="neutral">{fmt(trip.price_child)}/enfant</Badge>
          )}
          {trip.max_seats && (
            <Badge variant={totalSeats >= trip.max_seats ? "danger" : "warning"}>
              {totalSeats}/{trip.max_seats} places
            </Badge>
          )}
          {trip.children_allowed && (
            <Badge variant="neutral">Enfants acceptes</Badge>
          )}
        </div>
        {trip.description && (
          <p className="mt-3 text-[13px] text-content-secondary">
            {trip.description}
          </p>
        )}
        <div className="mt-3 flex gap-3">
          <Link
            href={`/bureau/voyages/${id}/edit`}
            className="btn-gradient rounded-full px-4 py-2 text-[12px] font-semibold text-white"
          >
            Modifier
          </Link>
          <TripActions tripId={id} />
        </div>
      </div>

      {/* Logistique */}
      {(trip.transport || trip.accommodation || trip.registration_deadline) && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            Logistique
          </h3>
          <div className="flex flex-col gap-2">
            {trip.transport && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">🚌</span>
                <span className="text-[13px] text-content-secondary">{trip.transport}</span>
              </div>
            )}
            {trip.accommodation && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">🏨</span>
                <span className="text-[13px] text-content-secondary">{trip.accommodation}</span>
              </div>
            )}
            {trip.registration_deadline && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">📅</span>
                <span className="text-[13px] text-content-secondary">
                  Inscription avant le {new Date(trip.registration_deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            )}
            {trip.max_adults_per_household && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">👥</span>
                <span className="text-[13px] text-content-secondary">
                  Max {trip.max_adults_per_household} adulte{trip.max_adults_per_household > 1 ? "s" : ""} par foyer
                </span>
              </div>
            )}
            {trip.min_seats && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">📊</span>
                <span className="text-[13px] text-content-secondary">
                  Minimum {trip.min_seats} inscrits requis
                </span>
              </div>
            )}
            {trip.guides_needed && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">🧑‍🏫</span>
                <span className="text-[13px] text-content-secondary">
                  {trip.guides_needed} accompagnateur{trip.guides_needed > 1 ? "s" : ""} recherche{trip.guides_needed > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inclus / Non inclus */}
      {((trip.included?.length > 0) || (trip.not_included?.length > 0)) && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          {trip.included?.length > 0 && (
            <div className="mb-3">
              <h3 className="mb-2 text-[14px] font-bold text-content-primary">Inclus</h3>
              <div className="flex flex-col gap-1">
                {trip.included.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[12px] text-green-600">✓</span>
                    <span className="text-[13px] text-content-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {trip.not_included?.length > 0 && (
            <div>
              <h3 className="mb-2 text-[14px] font-bold text-content-primary">Non inclus</h3>
              <div className="flex flex-col gap-1">
                {trip.not_included.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[12px] text-red-500">✗</span>
                    <span className="text-[13px] text-content-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inscrits */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Inscrits ({registrations.length}
          {trip.max_seats ? ` / ${trip.max_seats}` : ""})
        </h3>
        {registrations.length === 0 ? (
          <p className="py-2 text-center text-[13px] text-content-muted">Aucun inscrit</p>
        ) : (
          <div className="flex flex-col gap-2">
            {registrations.map((r: { member_id: string; nb_adults: number; nb_children: number; total_amount: number; payment_status: string; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
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
                    {r.nb_adults} adulte{r.nb_adults > 1 ? "s" : ""}
                    {r.nb_children > 0 && `, ${r.nb_children} enfant${r.nb_children > 1 ? "s" : ""}`}
                    {" · "}
                    {fmt(r.total_amount)}
                  </p>
                </div>
                <Badge
                  variant={
                    r.payment_status === "paye"
                      ? "success"
                      : r.payment_status === "en_attente"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {r.payment_status === "paye" ? "Paye" : r.payment_status === "en_attente" ? "En attente" : r.payment_status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
