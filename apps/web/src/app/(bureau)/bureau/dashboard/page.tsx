import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

export default async function DashboardPage() {
  const supabase = await createClient();

  const [membersRes, commissionsRes, entriesRes, eventsRes, tripsRes, assetsRes, bookingsRes] =
    await Promise.all([
      supabase.from("members").select("id, status, role, created_at"),
      supabase.from("commissions").select("id, budget").eq("active", true),
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
        .from("trips")
        .select("id, destination, start_date, trip_registrations(count)")
        .gte("start_date", new Date().toISOString())
        .order("start_date")
        .limit(3),
      supabase.from("assets").select("id"),
      supabase
        .from("asset_bookings")
        .select("id, status, start_date, asset_id, assets:asset_id(name), members:member_id(first_name, last_name)")
        .eq("status", "en_attente")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const members = membersRes.data ?? [];
  const commissions = commissionsRes.data ?? [];
  const recentEntries = entriesRes.data ?? [];
  const upcomingEvents = eventsRes.data ?? [];
  const upcomingTrips = tripsRes.data ?? [];
  const assets = assetsRes.data ?? [];
  const pendingBookings = bookingsRes.data ?? [];

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "actif").length;
  const totalCommissions = commissions.length;
  const budgetTotal = commissions.reduce(
    (s, c) => s + parseFloat(c.budget || "0"),
    0
  );

  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const newMembers = members.filter((m) => new Date(m.created_at) >= monthAgo).length;

  const totalRecettes = recentEntries
    .filter((e) => e.type === "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const totalDepenses = recentEntries
    .filter((e) => e.type === "facture")
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Tableau de bord
        </h1>
        <p className="text-sm text-content-secondary">
          Vue d&apos;ensemble de votre amicale
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Membres actifs"
          value={`${activeMembers}/${totalMembers}`}
          icon="👥"
          trend={newMembers > 0 ? { value: `${newMembers} ce mois`, positive: true } : undefined}
        />
        <StatCard label="Commissions" value={String(totalCommissions)} icon="📋" />
        <StatCard label="Budget total" value={fmt(budgetTotal)} icon="💰" />
        <StatCard
          label="Événements à venir"
          value={String(upcomingEvents.length)}
          icon="📅"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prochains événements</CardTitle>
              <Link href="/bureau/evenements" className="text-xs text-brand-500 hover:underline">
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-content-muted">Aucun événement à venir</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingEvents.map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/bureau/evenements/${ev.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-surface-secondary"
                  >
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                      <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">
                        {new Date(ev.date).toLocaleDateString("fr-FR", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold leading-none text-brand-700 dark:text-brand-300">
                        {new Date(ev.date).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-content-primary">{ev.title}</p>
                      <p className="text-xs text-content-muted">
                        {(ev.event_registrations as { count: number }[])?.[0]?.count ?? 0} inscrit(s)
                        {ev.location && ` · ${ev.location}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dernières opérations</CardTitle>
              <Link href="/bureau/comptabilite" className="text-xs text-brand-500 hover:underline">
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <p className="text-sm text-content-muted">Aucune opération récente</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentEntries.map((entry) => (
                  <div
                    key={entry.created_at}
                    className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-content-primary">
                        {entry.label}
                      </p>
                      <p className="text-xs text-content-muted">
                        {(entry.commissions as unknown as { name: string } | null)?.name} ·{" "}
                        {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        entry.type === "recette"
                          ? "text-emerald-600"
                          : "text-content-primary"
                      )}
                    >
                      {entry.type === "recette" ? "+" : "-"}
                      {fmt(parseFloat(entry.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Statut des membres</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-sm text-content-muted">Aucun membre</p>
            ) : (
              <div className="flex flex-col gap-3">
                {["actif", "onboarding", "invite", "inactif"].map((status) => {
                  const count = members.filter((m) => m.status === status).length;
                  if (count === 0) return null;
                  const pct = Math.round((count / totalMembers) * 100);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <Badge
                        variant={
                          status === "actif"
                            ? "success"
                            : status === "invite"
                              ? "warning"
                              : "neutral"
                        }
                        className="w-24 justify-center capitalize"
                      >
                        {status}
                      </Badge>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-10 text-right text-sm font-medium tabular-nums text-content-secondary">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Voyages à venir</CardTitle>
              <Link href="/bureau/voyages" className="text-xs text-brand-500 hover:underline">
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTrips.length === 0 ? (
              <p className="text-sm text-content-muted">Aucun voyage à venir</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingTrips.map((t) => (
                  <Link
                    key={t.id}
                    href={`/bureau/voyages/${t.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-surface-secondary"
                  >
                    <span className="text-lg">✈️</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-content-primary">
                        {t.destination}
                      </p>
                      <p className="text-xs text-content-muted">
                        {new Date(t.start_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                        {" · "}
                        {(t.trip_registrations as { count: number }[])?.[0]?.count ?? 0} inscrit(s)
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Demandes de location</CardTitle>
              <Link href="/bureau/locations" className="text-xs text-brand-500 hover:underline">
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-sm text-content-muted">Aucune demande en attente</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-lg">🏠</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-content-primary">
                        {(b.assets as unknown as { name: string } | null)?.name}
                      </p>
                      <p className="text-xs text-content-muted">
                        {(b.members as unknown as { first_name: string; last_name: string } | null)?.first_name}{" "}
                        {(b.members as unknown as { first_name: string; last_name: string } | null)?.last_name}
                        {" · "}
                        {new Date(b.start_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge variant="warning">En attente</Badge>
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
