import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/accueil/hero-carousel";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AccueilPage() {
  const supabase = await createClient();
  const nowISO = new Date().toISOString();

  const { data: { user } } = await supabase.auth.getUser();
  let memberName: string | undefined;
  let unreadMessages = 0;

  if (user) {
    const { data: member } = await supabase
      .from("members")
      .select("id, first_name")
      .eq("user_id", user.id)
      .single();

    if (member) {
      memberName = member.first_name;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("to_id", member.id)
        .is("read_at", null);
      unreadMessages = count ?? 0;
    }
  }

  const [eventsRes, tripsRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, date, location")
      .gte("date", nowISO)
      .order("date")
      .limit(6),
    supabase
      .from("trips")
      .select("id, destination, start_date, end_date, location:destination")
      .gte("start_date", nowISO)
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
      <HeroCarousel items={carouselItems} unreadMessages={unreadMessages} memberName={memberName} />

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

      {/* Mot du président */}
      <div className="pt-4">
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <span className="text-lg">📢</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-content-primary">
                  Mot du president
                </p>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  Nouveau
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-content-secondary">
                Chers amicalistes, je vous souhaite une excellente saison.
                N&apos;hesitez pas a consulter les evenements a venir et a vous
                inscrire aux activites proposees. Votre participation fait vivre
                notre amicale !
              </p>
              <p className="mt-2 text-[11px] font-medium text-content-muted">
                — Le bureau de l&apos;amicale
              </p>
            </div>
          </div>
        </div>
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
      {/* Raccourcis - quick access horizontal scroll */}
      <div className="pt-6">
        <h2 className="mb-3 text-[17px] font-bold text-content-primary">
          Raccourcis
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {[
            { href: "/amicaliste/calendrier", icon: "📅", label: "Calendrier", bg: "bg-purple-100 dark:bg-purple-500/20" },
            { href: "/amicaliste/locations", icon: "🏠", label: "Locations", bg: "bg-teal-100 dark:bg-teal-500/20" },
            { href: "/amicaliste/commissions", icon: "📋", label: "Commissions", bg: "bg-rose-100 dark:bg-rose-500/20" },
            { href: "/amicaliste/galerie", icon: "📷", label: "Galerie", bg: "bg-cyan-100 dark:bg-cyan-500/20" },
            { href: "/amicaliste/journal", icon: "📰", label: "Journal", bg: "bg-rose-100 dark:bg-rose-500/20" },
            { href: "/amicaliste/profil", icon: "👤", label: "Profil", bg: "bg-blue-100 dark:bg-blue-500/20" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-[16px] ${item.bg} shadow-sm transition-shadow active:shadow-none`}>
                <span className="text-[22px]">{item.icon}</span>
              </div>
              <span className="text-[11px] font-medium text-content-secondary">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="pt-4 pb-4">
        <h2 className="mb-3 text-[17px] font-bold text-content-primary">
          Services
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/amicaliste/evenements"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
              <span className="text-lg">📅</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Evenements
              </p>
              <p className="text-[11px] text-content-muted">
                Inscriptions & details
              </p>
            </div>
          </Link>
          <Link
            href="/amicaliste/voyages"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
              <span className="text-lg">✈️</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Voyages
              </p>
              <p className="text-[11px] text-content-muted">
                Sorties & sejours
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
            href="/amicaliste/messagerie"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
              <span className="text-lg">💬</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Messagerie
              </p>
              <p className="text-[11px] text-content-muted">
                Communication
              </p>
            </div>
          </Link>
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
            href="/amicaliste/notifications"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
              <span className="text-lg">🔔</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">
                Notifications
              </p>
              <p className="text-[11px] text-content-muted">
                Alertes & rappels
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
