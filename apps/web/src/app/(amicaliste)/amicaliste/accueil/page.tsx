import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/accueil/hero-carousel";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AccueilPage() {
  const supabase = await createClient();

  const [eventsRes, tripsRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, date, location")
      .gte("date", new Date().toISOString())
      .order("date")
      .limit(6),
    supabase
      .from("trips")
      .select("id, destination, start_date, end_date, location:destination")
      .gte("start_date", new Date().toISOString())
      .order("start_date")
      .limit(2),
  ]);

  const events = eventsRes.data ?? [];
  const trips = tripsRes.data ?? [];

  const carouselItems = [
    ...events.slice(0, 3).map((ev) => ({
      id: ev.id,
      title: ev.title,
      date: ev.date,
      location: ev.location,
      type: "event" as const,
    })),
    ...trips.slice(0, 1).map((t) => ({
      id: t.id,
      title: t.destination,
      date: t.start_date,
      location: null,
      type: "trip" as const,
    })),
  ];

  const eventIcons = ["🍴", "🎵", "🏆", "⛰️", "🎪", "🎉"];

  return (
    <div className="flex flex-col">
      <HeroCarousel items={carouselItems} />

      {/* Prochains événements */}
      <div className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-content-primary">
            Prochains événements
          </h2>
          <Link
            href="/amicaliste/evenements"
            className="text-[13px] font-semibold text-brand-500"
          >
            Voir tout
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Aucun événement à venir"
            description="Les prochains événements apparaîtront ici"
          />
        ) : (
          <div className="flex flex-col">
            {events.map((ev, i) => {
              const d = new Date(ev.date);
              return (
                <Link
                  key={ev.id}
                  href={`/amicaliste/evenements/${ev.id}`}
                  className="flex items-center gap-3 border-b border-border-subtle py-3.5 transition-colors last:border-b-0 active:bg-surface-secondary"
                >
                  <div className="flex w-11 flex-col items-center">
                    <span className="text-xl font-bold leading-none text-brand-500">
                      {d.getDate()}
                    </span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase text-content-muted">
                      {d
                        .toLocaleDateString("fr-FR", { month: "short" })
                        .replace(".", "")}
                    </span>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                    <span className="text-lg">
                      {eventIcons[i % eventIcons.length]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-content-primary">
                      {ev.title}
                    </p>
                    <p className="text-[12px] text-content-muted">
                      {d.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).replace(":", "h")}
                      {ev.location && ` · ${ev.location}`}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-content-muted"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Voyages à venir */}
      {trips.length > 0 && (
        <div className="pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-content-primary">
              Voyages à venir
            </h2>
            <Link
              href="/amicaliste/voyages"
              className="text-[13px] font-semibold text-brand-500"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex flex-col">
            {trips.map((t) => {
              const d = new Date(t.start_date);
              return (
                <Link
                  key={t.id}
                  href={`/amicaliste/voyages/${t.id}`}
                  className="flex items-center gap-3 border-b border-border-subtle py-3.5 transition-colors last:border-b-0 active:bg-surface-secondary"
                >
                  <div className="flex w-11 flex-col items-center">
                    <span className="text-xl font-bold leading-none text-brand-500">
                      {d.getDate()}
                    </span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase text-content-muted">
                      {d
                        .toLocaleDateString("fr-FR", { month: "short" })
                        .replace(".", "")}
                    </span>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                    <span className="text-lg">✈️</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-content-primary">
                      {t.destination}
                    </p>
                    <p className="text-[12px] text-content-muted">
                      {d.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                      })}
                      {t.end_date &&
                        ` — ${new Date(t.end_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}`}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-content-muted"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {/* Services */}
      <div className="pt-6 pb-4">
        <h2 className="mb-3 text-[17px] font-bold text-content-primary">
          Services
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/amicaliste/aide"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <span className="text-lg">❓</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Aide & FAQ
              </p>
              <p className="text-[11px] text-content-muted">
                Questions frequentes
              </p>
            </div>
          </Link>
          <Link
            href="/amicaliste/commissions"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
              <span className="text-lg">📋</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Commissions
              </p>
              <p className="text-[11px] text-content-muted">
                Organisation interne
              </p>
            </div>
          </Link>
          <Link
            href="/amicaliste/locations"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20">
              <span className="text-lg">🏠</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Locations
              </p>
              <p className="text-[11px] text-content-muted">
                Biens disponibles
              </p>
            </div>
          </Link>
          <Link
            href="/amicaliste/journal"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
              <span className="text-lg">📰</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Journal
              </p>
              <p className="text-[11px] text-content-muted">
                Actualites de l&apos;amicale
              </p>
            </div>
          </Link>
          <Link
            href="/amicaliste/profil"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
              <span className="text-lg">👤</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Mon profil
              </p>
              <p className="text-[11px] text-content-muted">
                Informations personnelles
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
