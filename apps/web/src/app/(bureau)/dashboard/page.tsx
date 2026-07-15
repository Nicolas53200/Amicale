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

  const [membersRes, commissionsRes, entriesRes, eventsRes] = await Promise.all([
    supabase.from("members").select("id, status"),
    supabase.from("commissions").select("id, budget").eq("active", true),
    supabase
      .from("accounting_entries")
      .select("type, amount, status, label, created_at, commissions:commission_id(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("id")
      .gte("date", new Date().toISOString()),
  ]);

  const members = membersRes.data ?? [];
  const commissions = commissionsRes.data ?? [];
  const recentEntries = entriesRes.data ?? [];
  const upcomingEvents = eventsRes.data ?? [];

  const totalMembers = members.length;
  const totalCommissions = commissions.length;
  const budgetTotal = commissions.reduce(
    (s, c) => s + parseFloat(c.budget || "0"),
    0
  );
  const pendingEntries = recentEntries.filter((e) => e.status === "attente").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Tableau de bord
        </h1>
        <p className="text-sm text-content-secondary">
          Vue d&apos;ensemble de votre amicale
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Membres" value={String(totalMembers)} icon="👥" />
        <StatCard label="Commissions" value={String(totalCommissions)} icon="📋" />
        <StatCard label="Budget total" value={fmt(budgetTotal)} icon="💰" />
        <StatCard label="Événements à venir" value={String(upcomingEvents.length)} icon="📅" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dernières opérations comptables</CardTitle>
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
                        {(entry.commissions as { name: string } | null)?.name} ·{" "}
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
      </div>
    </div>
  );
}
