import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const outilsBureau = [
  {
    icon: "👥",
    color: "bg-blue-100 dark:bg-blue-500/20",
    title: "Membres",
    subtitle: "Gestion des adhérents",
    href: "/bureau/membres",
  },
  {
    icon: "💬",
    color: "bg-green-100 dark:bg-green-500/20",
    title: "Messagerie",
    subtitle: "Communication interne",
    href: "/bureau/messagerie",
  },
  {
    icon: "💰",
    color: "bg-amber-100 dark:bg-amber-500/20",
    title: "Comptabilité",
    subtitle: "Finances & budgets",
    href: "/bureau/comptabilite",
  },
  {
    icon: "📅",
    color: "bg-purple-100 dark:bg-purple-500/20",
    title: "Événements",
    subtitle: "Agenda & inscriptions",
    href: "/bureau/evenements",
  },
  {
    icon: "📋",
    color: "bg-rose-100 dark:bg-rose-500/20",
    title: "Commissions",
    subtitle: "Organisation interne",
    href: "/bureau/commissions",
  },
  {
    icon: "🏠",
    color: "bg-teal-100 dark:bg-teal-500/20",
    title: "Locations",
    subtitle: "Biens & réservations",
    href: "/bureau/locations",
  },
  {
    icon: "✈️",
    color: "bg-blue-100 dark:bg-blue-500/20",
    title: "Voyages",
    subtitle: "Sorties & séjours",
    href: "/bureau/voyages",
  },
  {
    icon: "📝",
    color: "bg-indigo-100 dark:bg-indigo-500/20",
    title: "Réunions",
    subtitle: "Comptes-rendus",
    href: "/bureau/reunions",
  },
  {
    icon: "📰",
    color: "bg-rose-100 dark:bg-rose-500/20",
    title: "Journal",
    subtitle: "Actualités",
    href: "/bureau/journal",
  },
  {
    icon: "📷",
    color: "bg-cyan-100 dark:bg-cyan-500/20",
    title: "Galerie",
    subtitle: "Photos événements",
    href: "/bureau/galerie",
  },
  {
    icon: "📑",
    color: "bg-violet-100 dark:bg-violet-500/20",
    title: "Modèles",
    subtitle: "Documents types",
    href: "/bureau/modeles",
  },
  {
    icon: "🎨",
    color: "bg-fuchsia-100 dark:bg-fuchsia-500/20",
    title: "Personnaliser",
    subtitle: "Apparence & identité",
    href: "/bureau/parametres",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const [membersRes, commissionsRes, entriesRes, eventsRes, reunionsRes] =
    await Promise.all([
      supabase.from("members").select("id, status, role, created_at"),
      supabase.from("commissions").select("id, name, icon, color, budget").eq("active", true),
      supabase
        .from("accounting_entries")
        .select("type, amount, status, label, created_at, commissions:commission_id(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("events")
        .select("id, title, date, location, event_registrations(count)")
        .gte("date", new Date().toISOString())
        .order("date")
        .limit(5),
      supabase
        .from("notifications")
        .select("id, title, message, sent_at")
        .eq("type", "reunion")
        .gte("sent_at", new Date().toISOString())
        .order("sent_at")
        .limit(3),
    ]);

  const members = membersRes.data ?? [];
  const commissions = commissionsRes.data ?? [];
  const recentEntries = entriesRes.data ?? [];
  const upcomingEvents = eventsRes.data ?? [];
  const prochReunions = reunionsRes.data ?? [];

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "actif").length;
  const retraites = members.filter((m) => m.role === "retraite").length;
  const totalCommissions = commissions.length;

  const recettes = recentEntries
    .filter((e) => e.type === "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = recentEntries
    .filter((e) => e.type !== "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const solde = recettes - depenses;

  return (
    <div className="flex flex-col gap-4">
      {/* Gradient hero header */}
      <div className="relative -mx-4 -mt-6 flex flex-col bg-accent-gradient pt-[env(safe-area-inset-top)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-4 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -right-12 top-32 h-32 w-32 rounded-full bg-white/[0.06]" />
          <div className="absolute bottom-24 left-1/3 h-20 w-20 rounded-full bg-white/[0.06]" />
        </div>

        <div className="relative z-10 px-4 pb-6 pt-4">
          {/* User info row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                <span className="text-2xl">🚒</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Bonjour <span className="inline-block">👋</span>
                </h1>
                <p className="text-[12px] text-white/70">
                  Bureau &middot; Amicale SP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/bureau/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-white" />
              </Link>
              <Link
                href="/bureau/messagerie"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <svg
          className="relative z-10 -mb-px mt-auto block w-full"
          viewBox="0 0 1440 50"
          fill="none"
          preserveAspectRatio="none"
          style={{ height: "30px" }}
        >
          <path
            d="M0 50V25C200 5 400 0 720 15C1040 30 1240 10 1440 0V50H0Z"
            fill="var(--color-surface-secondary)"
          />
        </svg>
      </div>

      {/* Centre de pilotage card */}
      <div className="-mt-6 rounded-[20px] bg-surface-elevated p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-[15px] font-bold text-content-primary">
            Centre de pilotage
          </h2>
          <p className="text-[12px] text-content-muted">
            Votre amicale en un coup d&apos;oeil
          </p>
        </div>

        {/* Mini stats row */}
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-[12px] bg-surface-secondary p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
              <span className="text-sm">📋</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-content-muted">Commissions</p>
              <p className="text-[14px] font-bold tabular-nums text-content-primary">{totalCommissions}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-[12px] bg-surface-secondary p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
              <span className="text-sm">💰</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-content-muted">Trésorerie</p>
              <p className={cn(
                "text-[14px] font-bold tabular-nums",
                solde >= 0 ? "text-emerald-600" : "text-content-primary"
              )}>
                {solde >= 0 ? "OK" : fmt(solde)}
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-[12px] bg-surface-secondary p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <span className="text-sm">📅</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-content-muted">Événements</p>
              <p className="text-[14px] font-bold tabular-nums text-content-primary">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Big stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
            <span className="text-lg">👥</span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-content-muted">
            Membres actifs
          </p>
          <p className="text-2xl font-bold tabular-nums text-content-primary">
            {activeMembers}
          </p>
          {retraites > 0 && (
            <p className="text-[11px] text-content-muted">
              dont {retraites} retraité{retraites > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
            <span className="text-lg">💶</span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-content-muted">
            Solde amicale
          </p>
          <p className={cn(
            "text-2xl font-bold tabular-nums",
            solde >= 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {fmt(solde)}
          </p>
        </div>
      </div>

      {/* Prochains événements */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-content-primary">
            Prochains événements
          </h3>
          <Link
            href="/bureau/evenements"
            className="text-[12px] font-semibold text-brand-500"
          >
            Voir tout
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-content-muted">
            Aucun événement à venir
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingEvents.map((ev) => {
              const d = new Date(ev.date);
              return (
                <Link
                  key={ev.id}
                  href={`/bureau/evenements/${ev.id}`}
                  className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 transition-colors active:bg-surface-secondary/80"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-brand-100 dark:bg-brand-500/20">
                    <span className="text-[9px] font-bold uppercase text-brand-600 dark:text-brand-400">
                      {d.toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-[14px] font-bold leading-none text-brand-700 dark:text-brand-300">
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-content-primary">
                      {ev.title}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      {ev.location && ` · ${ev.location}`}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Prochaines reunions */}
      {prochReunions.length > 0 && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-content-primary">
              Prochaines reunions
            </h3>
            <Link
              href="/bureau/reunions"
              className="text-[12px] font-semibold text-brand-500"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {prochReunions.map((r) => {
              const d = new Date(r.sent_at);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-indigo-100 dark:bg-indigo-500/20">
                    <span className="text-[9px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {d.toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-[14px] font-bold leading-none text-indigo-700 dark:text-indigo-300">
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-content-primary">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Commissions actives */}
      {commissions.length > 0 && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-content-primary">
              Commissions
            </h3>
            <Link
              href="/bureau/commissions"
              className="text-[12px] font-semibold text-brand-500"
            >
              Gerer
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {commissions.map((c) => (
              <Link
                key={c.id}
                href={`/bureau/commissions/${c.id}`}
                className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 transition-colors active:bg-surface-secondary/80"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
                  style={{
                    backgroundColor: c.color ? `${c.color}20` : undefined,
                  }}
                >
                  {c.icon || "📋"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-content-primary">
                    {c.name}
                  </p>
                  {c.budget > 0 && (
                    <p className="text-[11px] text-content-muted">
                      Budget : {fmt(c.budget)}
                    </p>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Outils du bureau */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Outils du bureau
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {outilsBureau.map((outil) => (
            <Link
              key={outil.href}
              href={outil.href}
              className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                outil.color
              )}>
                <span className="text-lg">{outil.icon}</span>
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[13px] font-semibold text-content-primary">
                  {outil.title}
                </p>
                <p className="text-[11px] text-content-muted">
                  {outil.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
