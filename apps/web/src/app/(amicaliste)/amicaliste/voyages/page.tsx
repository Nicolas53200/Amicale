import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { getUpcomingTrips } from "@/lib/actions/trips";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const destinationGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
];

export default async function VoyagesPage() {
  const trips = await getUpcomingTrips();

  const totalSeats = trips.reduce((s, t) => {
    const count = (t.trip_registrations as { count: number }[])?.[0]?.count ?? 0;
    return s + count;
  }, 0);

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Voyages"
        subtitle={`${trips.length} voyage${trips.length > 1 ? "s" : ""} a venir`}
      />

      {/* Stats */}
      {trips.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
            <p className="text-[18px] font-bold text-blue-600 dark:text-blue-400">{trips.length}</p>
            <p className="text-[11px] text-content-muted">Destinations</p>
          </div>
          <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
            <p className="text-[18px] font-bold text-content-primary">{totalSeats}</p>
            <p className="text-[11px] text-content-muted">Inscrits</p>
          </div>
          <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
            <p className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400">
              {trips.length > 0 ? fmt(Math.min(...trips.map((t) => t.price_adult))) : "-"}
            </p>
            <p className="text-[11px] text-content-muted">A partir de</p>
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <EmptyState
          icon="✈️"
          title="Aucun voyage a venir"
          description="Les prochains voyages apparaitront ici"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((t, i) => {
            const start = new Date(t.start_date);
            const end = new Date(t.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const regCount = (t.trip_registrations as { count: number }[])?.[0]?.count ?? 0;
            const isFull = t.max_seats ? regCount >= t.max_seats : false;
            const gradient = destinationGradients[i % destinationGradients.length];

            return (
              <Link
                key={t.id}
                href={`/amicaliste/voyages/${t.id}`}
                className={`group relative overflow-hidden rounded-[16px] bg-gradient-to-br ${gradient} p-5 shadow-sm transition-shadow active:shadow-none`}
              >
                {/* Decorative circle */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        {start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — {end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                      <h3 className="mt-3 text-[18px] font-bold text-white">
                        {t.destination}
                      </h3>
                      <p className="mt-1 text-[13px] text-white/80">
                        {days} jour{days > 1 ? "s" : ""} · {fmt(t.price_adult)}/adulte
                      </p>
                    </div>
                    <span className="text-3xl">✈️</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        {regCount} inscrit{regCount > 1 ? "s" : ""}
                        {t.max_seats ? ` / ${t.max_seats}` : ""}
                      </span>
                      {isFull && (
                        <span className="rounded-full bg-red-500/80 px-2.5 py-0.5 text-[11px] font-bold text-white">
                          Complet
                        </span>
                      )}
                    </div>
                    <span className="rounded-[8px] bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-800 shadow-sm transition-transform group-active:scale-95">
                      Voir &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
