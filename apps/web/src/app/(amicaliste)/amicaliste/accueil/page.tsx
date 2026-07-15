import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/events/event-card";
import { TripCard } from "@/components/trips/trip-card";
import { CommissionCard } from "@/components/commission/commission-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AccueilPage() {
  const supabase = await createClient();

  const [eventsRes, tripsRes, commissionsRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, date, location, price, max_attendees, event_registrations(count)")
      .gte("date", new Date().toISOString())
      .order("date")
      .limit(3),
    supabase
      .from("trips")
      .select("id, destination, start_date, end_date, price_adult, max_seats, trip_registrations(count)")
      .gte("start_date", new Date().toISOString())
      .order("start_date")
      .limit(2),
    supabase
      .from("commissions")
      .select("*, commission_members(count)")
      .eq("active", true)
      .order("name")
      .limit(4),
  ]);

  const events = eventsRes.data ?? [];
  const trips = tripsRes.data ?? [];
  const commissions = commissionsRes.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Bienvenue</h1>
        <p className="text-sm text-content-secondary">
          Retrouvez ici les dernières actualités de votre amicale
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prochains événements</CardTitle>
            <Link href="/amicaliste/evenements" className="text-xs text-brand-500 hover:underline">
              Voir tout
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              title="Aucun événement à venir"
              description="Les prochains événements apparaîtront ici"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((ev) => (
                <EventCard
                  key={ev.id}
                  id={ev.id}
                  title={ev.title}
                  date={ev.date}
                  location={ev.location}
                  price={String(ev.price ?? 0)}
                  maxAttendees={ev.max_attendees}
                  registrationCount={
                    (ev.event_registrations as { count: number }[])?.[0]?.count ?? 0
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {trips.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content-primary">
              Voyages à venir
            </h2>
            <Link href="/amicaliste/voyages" className="text-xs text-brand-500 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {trips.map((t) => (
              <TripCard
                key={t.id}
                id={t.id}
                destination={t.destination}
                startDate={t.start_date}
                endDate={t.end_date}
                priceAdult={String(t.price_adult)}
                maxSeats={t.max_seats}
                registrationCount={
                  (t.trip_registrations as { count: number }[])?.[0]?.count ?? 0
                }
              />
            ))}
          </div>
        </div>
      )}

      {commissions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content-primary">
              Commissions
            </h2>
            <Link href="/amicaliste/commissions" className="text-xs text-brand-500 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {commissions.map((c) => (
              <CommissionCard
                key={c.id}
                id={c.id}
                name={c.name}
                model={c.model}
                icon={c.icon}
                color={c.color}
                budget={c.budget}
                memberCount={
                  Array.isArray(c.commission_members)
                    ? c.commission_members.length
                    : (c.commission_members as { count: number }[])?.[0]?.count ?? 0
                }
                isFixed={c.is_fixed}
                basePath="/amicaliste/commissions"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
