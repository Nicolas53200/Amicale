import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { BUREAU_ROLE_CONFIG, getToolAccess, type BureauRole } from "@/lib/auth";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

interface OutilBureau {
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  href: string;
  badgeKey?: string;
  toolKey?: string;
}

const roleLabels: Record<string, string> = {
  president: "President",
  vice_president: "Vice-President",
  tresorier: "Tresorier / Comptable",
  secretaire: "Secretaire",
  responsable_communication: "Responsable communication",
  responsable_commission: "Responsable commission",
  membre_commission: "Membre de commission",
  lecture: "Lecture seule",
};

const outilsBureau: OutilBureau[] = [
  {
    icon: "👥",
    color: "bg-blue-100 dark:bg-blue-500/20",
    title: "Membres",
    subtitle: "Liste complete",
    href: "/bureau/membres",
    badgeKey: "membres",
    toolKey: "membres",
  },
  {
    icon: "💬",
    color: "bg-green-100 dark:bg-green-500/20",
    title: "Messagerie",
    subtitle: "Interne bureau",
    href: "/bureau/messagerie",
    toolKey: "messagerie",
  },
  {
    icon: "💰",
    color: "bg-purple-100 dark:bg-purple-500/20",
    title: "Comptabilite",
    subtitle: "Bilan general",
    href: "/bureau/comptabilite",
    badgeKey: "compta",
    toolKey: "compta",
  },
  {
    icon: "📅",
    color: "bg-amber-100 dark:bg-amber-500/20",
    title: "Reunions & CR",
    subtitle: "Comptes rendus, PV d'AG",
    href: "/bureau/reunions",
    toolKey: "reunions",
  },
  {
    icon: "📰",
    color: "bg-blue-100 dark:bg-blue-500/20",
    title: "Journal de l'Amicale",
    subtitle: "Livre souvenir annuel",
    href: "/bureau/journal",
    toolKey: "journal",
  },
  {
    icon: "📑",
    color: "bg-green-100 dark:bg-green-500/20",
    title: "Modeles",
    subtitle: "PV, budgets, affiches",
    href: "/bureau/modeles",
    toolKey: "modeles",
  },
  {
    icon: "📋",
    color: "bg-rose-100 dark:bg-rose-500/20",
    title: "Commissions",
    subtitle: "Organisation interne",
    href: "/bureau/commissions",
    badgeKey: "commissions",
    toolKey: "gestion_commissions",
  },
  {
    icon: "📅",
    color: "bg-red-100 dark:bg-red-500/20",
    title: "Evenements",
    subtitle: "Agenda & inscriptions",
    href: "/bureau/evenements",
    badgeKey: "events",
    toolKey: "evenements",
  },
  {
    icon: "🏠",
    color: "bg-teal-100 dark:bg-teal-500/20",
    title: "Locations",
    subtitle: "Biens & reservations",
    href: "/bureau/locations",
    badgeKey: "locations",
    toolKey: "locations",
  },
  {
    icon: "✈️",
    color: "bg-blue-100 dark:bg-blue-500/20",
    title: "Voyages",
    subtitle: "Sorties & sejours",
    href: "/bureau/voyages",
    badgeKey: "voyages",
    toolKey: "voyages",
  },
  {
    icon: "📷",
    color: "bg-cyan-100 dark:bg-cyan-500/20",
    title: "Galerie",
    subtitle: "Photos evenements",
    href: "/bureau/galerie",
    toolKey: "photos",
  },
  {
    icon: "🎨",
    color: "bg-fuchsia-100 dark:bg-fuchsia-500/20",
    title: "Personnaliser",
    subtitle: "Logo, couleurs, nom...",
    href: "/bureau/parametres",
    toolKey: "personnaliser",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const nowISO = new Date().toISOString();

  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, membersRes, commissionsRes, entriesRes, eventsRes, reunionsRes, tripsRes, locationsRes, pendingComptaRes] =
    await Promise.all([
      user ? supabase.from("members").select("first_name, last_name, bureau_role, avatar_url").eq("user_id", user.id).single() : Promise.resolve({ data: null }),
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
        .gte("date", nowISO)
        .order("date")
        .limit(5),
      supabase
        .from("notifications")
        .select("id, title, message, sent_at")
        .eq("type", "reunion")
        .gte("sent_at", nowISO)
        .order("sent_at")
        .limit(3),
      supabase
        .from("trips")
        .select("id")
        .gte("start_date", nowISO),
      supabase
        .from("assets")
        .select("id"),
      supabase
        .from("accounting_entries")
        .select("id")
        .eq("status", "attente"),
    ]);

  const profile = profileRes.data as { first_name: string; last_name: string; bureau_role: string | null; avatar_url: string | null } | null;
  const userName = profile ? `${profile.first_name} ${profile.last_name}` : "Bureau";
  const bureauRole = profile?.bureau_role || "president";
  const userRole = roleLabels[bureauRole] || bureauRole;
  const userInitials = profile ? `${profile.first_name[0]}${profile.last_name[0]}` : "B";
  const allowedTools = getToolAccess(bureauRole);
  const members = membersRes.data ?? [];
  const commissions = commissionsRes.data ?? [];
  const recentEntries = entriesRes.data ?? [];
  const upcomingEvents = eventsRes.data ?? [];
  const prochReunions = reunionsRes.data ?? [];
  const upcomingTrips = tripsRes.data ?? [];
  const locationCount = locationsRes.data?.length ?? 0;
  const pendingCompta = pendingComptaRes.data?.length ?? 0;

  const badges: Record<string, string> = {};
  if (members.length > 0) badges.membres = `${members.length}`;
  if (pendingCompta > 0) badges.compta = `${pendingCompta} en att.`;
  if (upcomingEvents.length > 0) badges.events = `${upcomingEvents.length}`;
  if (commissions.length > 0) badges.commissions = `${commissions.length}`;
  if (locationCount > 0) badges.locations = `${locationCount}`;
  if (upcomingTrips.length > 0) badges.voyages = `${upcomingTrips.length}`;

  const nowMs = new Date(nowISO).getTime();
  const missions: { icon: string; text: string; href: string }[] = [];
  if (pendingCompta > 0)
    missions.push({ icon: "\u{1F4B0}", text: `${pendingCompta} operation${pendingCompta > 1 ? "s" : ""} en attente de validation`, href: "/bureau/comptabilite" });
  const nextEv = upcomingEvents[0];
  if (nextEv) {
    const daysUntil = Math.ceil((new Date(nextEv.date).getTime() - nowMs) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7 && daysUntil >= 0)
      missions.push({ icon: "\u{1F4C5}", text: `"${nextEv.title}" dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`, href: `/bureau/evenements/${nextEv.id}` });
  }
  const nextReunion = prochReunions[0];
  if (nextReunion)
    missions.push({ icon: "\u{1F4DD}", text: `Reunion : ${nextReunion.title}`, href: "/bureau/reunions" });

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
          {/* User info row — matches prototype .bh-top */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] border-[1.5px] border-white/30 bg-white/[.18]">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-white">{userName}</div>
                <div className="mt-px text-[11px] text-white/[.72]">{userRole}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/bureau/aide"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[.15]"
                aria-label="Aide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                </svg>
              </Link>
              <Link
                href="/bureau/messagerie"
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/[.15]"
                aria-label="Messagerie"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="absolute right-[6px] top-[6px] h-[7px] w-[7px] rounded-full border-[1.5px] border-brand-500 bg-amber-400" />
              </Link>
              <Link
                href="/login"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[.15]"
                aria-label="Déconnexion"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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

      {/* Missions du jour */}
      {missions.length > 0 && (
        <div className="rounded-[16px] bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm dark:from-amber-500/10 dark:to-orange-500/10">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">🎯</span>
            <h3 className="text-[14px] font-bold text-content-primary">Missions du jour</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {missions.map((m, i) => (
              <Link
                key={i}
                href={m.href}
                className="flex items-center gap-2.5 rounded-[10px] bg-white/60 px-3 py-2 transition-colors active:bg-white/40 dark:bg-white/5 dark:active:bg-white/10"
              >
                <span className="text-[14px]">{m.icon}</span>
                <span className="flex-1 text-[12px] font-medium text-content-primary">{m.text}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

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
          {outilsBureau.filter((outil) => {
            if (!outil.toolKey) return true;
            if (allowedTools.includes("*")) return true;
            return allowedTools.includes(outil.toolKey);
          }).map((outil) => {
            const badge = outil.badgeKey ? badges[outil.badgeKey] : undefined;
            return (
              <Link
                key={outil.href}
                href={outil.href}
                className="relative flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
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
                {badge && (
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
